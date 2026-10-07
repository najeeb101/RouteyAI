-- Checks for 0020_two_runs_cleanup.sql against the local database with the seed data. Everything runs in one
-- transaction that is rolled back. Run from the repo root:
--
--   docker exec -i supabase_db_RouteyAI psql -U postgres -v ON_ERROR_STOP=1 -q < supabase/tests/0020_two_runs_cleanup.sql
--
-- Each check prints "ok: …"; the first failure stops the script with an error.

BEGIN;

SELECT set_config('t.bus1', 'bbbbbbbb-0000-0000-0000-000000000001', true);
SELECT set_config('t.driver1', '00000000-0000-0000-0000-000000000003', true);
SELECT set_config('t.school_admin', '00000000-0000-0000-0000-000000000002', true);
SELECT set_config('t.student', (SELECT id::text FROM students WHERE bus_id = 'bbbbbbbb-0000-0000-0000-000000000001' ORDER BY stop_order LIMIT 1), true);
SELECT set_config('t.parent', (SELECT parent_id::text FROM students WHERE bus_id = 'bbbbbbbb-0000-0000-0000-000000000001' AND parent_id IS NOT NULL LIMIT 1), true);
DELETE FROM attendance WHERE bus_id = 'bbbbbbbb-0000-0000-0000-000000000001';
INSERT INTO routes (school_id, bus_id, run, waypoints)
  SELECT school_id, id, 'morning', '[]'::JSONB FROM buses WHERE id = 'bbbbbbbb-0000-0000-0000-000000000001'
  ON CONFLICT (bus_id, run) DO NOTHING;

CREATE SCHEMA check_0020;
GRANT USAGE ON SCHEMA check_0020 TO authenticated, anon, service_role;
CREATE FUNCTION check_0020.expect_error(p_sql TEXT, p_like TEXT, p_label TEXT) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  BEGIN
    EXECUTE p_sql;
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM ILIKE p_like THEN
      RAISE NOTICE 'ok: %', p_label;
      RETURN;
    END IF;
    RAISE EXCEPTION 'FAIL %: expected error like "%", got "%"', p_label, p_like, SQLERRM;
  END;
  RAISE EXCEPTION 'FAIL %: expected an error, got none', p_label;
END;
$$;
GRANT EXECUTE ON FUNCTION check_0020.expect_error(TEXT, TEXT, TEXT) TO authenticated, anon, service_role;

-- ── The old pieces are gone, the new ones are not ──
DO $$
BEGIN
  ASSERT NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname IN ('set_bus_active', 'save_optimized_route')), 'old functions removed';
  ASSERT EXISTS (SELECT 1 FROM pg_proc WHERE proname IN ('start_run', 'end_run', 'mark_attendance', 'save_route_plan', 'get_parent_route')) , 'new functions stay';
  ASSERT NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'attendance' AND policyname = 'driver: manage attendance for own bus'), 'driver write policy removed';
  ASSERT NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'routes' AND policyname = 'parent: read child''s bus route'), 'parent route policy removed';
  RAISE NOTICE 'ok: old pieces removed';
END;
$$;

-- ── Driver: reads own marks, no longer writes them directly ──
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.driver1'), 'role', 'authenticated')::text, true);
DO $$
DECLARE
  r bus_runs;
BEGIN
  r := start_run('morning');
  PERFORM mark_attendance(current_setting('t.student')::UUID, 'boarded');
  ASSERT (SELECT COUNT(*) FROM attendance WHERE student_id = current_setting('t.student')::UUID) = 1, 'driver reads the mark mark_attendance wrote';
  ASSERT (SELECT COUNT(*) FROM routes WHERE bus_id = current_setting('t.bus1')::UUID) >= 1, 'driver still reads own route';
  RAISE NOTICE 'ok: driver reads own marks and route, marks through mark_attendance';
END;
$$;
SELECT check_0020.expect_error(
  format($q$INSERT INTO attendance (student_id, bus_id, status, date, run) VALUES (%L, %L, 'absent', CURRENT_DATE, 'afternoon')$q$, current_setting('t.student'), current_setting('t.bus1')),
  '%row-level security%', 'driver cannot write attendance directly');
DO $$
BEGIN
  UPDATE attendance SET status = 'absent' WHERE student_id = current_setting('t.student')::UUID;
  ASSERT (SELECT status FROM attendance WHERE student_id = current_setting('t.student')::UUID AND run = 'morning') = 'boarded', 'direct update changes nothing';
  DELETE FROM attendance WHERE student_id = current_setting('t.student')::UUID;
  ASSERT (SELECT COUNT(*) FROM attendance WHERE student_id = current_setting('t.student')::UUID) = 1, 'direct delete removes nothing';
  RAISE NOTICE 'ok: driver cannot update or delete attendance directly';
END;
$$;
RESET ROLE;

-- ── Parent: no direct read of routes, still reads the route through the function ──
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.parent'), 'role', 'authenticated')::text, true);
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM routes) = 0, 'parent reads no routes directly';
  ASSERT get_parent_route((SELECT id FROM students WHERE parent_id = current_setting('t.parent')::UUID AND bus_id = current_setting('t.bus1')::UUID LIMIT 1), 'morning') IS NOT NULL, 'parent route function still works';
  RAISE NOTICE 'ok: parent reads the route only through get_parent_route';
END;
$$;
RESET ROLE;

-- ── School admin: still reads attendance and manages routes ──
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.school_admin'), 'role', 'authenticated')::text, true);
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM attendance) >= 1, 'school admin reads attendance';
  ASSERT (SELECT COUNT(*) FROM routes) >= 1, 'school admin reads routes';
  RAISE NOTICE 'ok: school admin reads attendance and routes';
END;
$$;
RESET ROLE;

ROLLBACK;
