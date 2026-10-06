-- Checks for 0017_two_runs.sql against the local database with the seed data. Everything runs in one transaction
-- that is rolled back, so the local data is left as it was. Run from the repo root:
--
--   docker exec -i supabase_db_RouteyAI psql -U postgres -v ON_ERROR_STOP=1 -q < supabase/tests/0017_two_runs.sql
--
-- Each check prints "ok: …"; the first failure stops the script with an error.

BEGIN;

-- ── Seed ids (read as postgres, stored as settings so every role can read them) ──
SELECT set_config('t.bus1', 'bbbbbbbb-0000-0000-0000-000000000001', true);
SELECT set_config('t.bus2', 'bbbbbbbb-0000-0000-0000-000000000002', true);
SELECT set_config('t.driver1', '00000000-0000-0000-0000-000000000003', true);
SELECT set_config('t.driver2', '00000000-0000-0000-0000-000000000004', true);
SELECT set_config('t.school_admin', '00000000-0000-0000-0000-000000000002', true);
SELECT set_config('t.platform_admin', '00000000-0000-0000-0000-000000000001', true);
SELECT set_config('t.first', (SELECT id::text FROM students WHERE bus_id = 'bbbbbbbb-0000-0000-0000-000000000001' ORDER BY stop_order LIMIT 1), true);
SELECT set_config('t.second', (SELECT id::text FROM students WHERE bus_id = 'bbbbbbbb-0000-0000-0000-000000000001' ORDER BY stop_order OFFSET 1 LIMIT 1), true);
SELECT set_config('t.last', (SELECT id::text FROM students WHERE bus_id = 'bbbbbbbb-0000-0000-0000-000000000001' ORDER BY stop_order DESC LIMIT 1), true);
SELECT set_config('t.other_bus_student', (SELECT id::text FROM students WHERE bus_id = 'bbbbbbbb-0000-0000-0000-000000000002' LIMIT 1), true);
-- A parent with a child on bus 1 and none on bus 2.
SELECT set_config('t.parent1', (
  SELECT parent_id::text FROM students WHERE parent_id IS NOT NULL
  GROUP BY parent_id
  HAVING bool_or(bus_id = 'bbbbbbbb-0000-0000-0000-000000000001') AND NOT bool_or(bus_id = 'bbbbbbbb-0000-0000-0000-000000000002')
  LIMIT 1
), true);
-- Clean slate for today on the seed buses (rolled back at the end).
DELETE FROM attendance WHERE bus_id IN ('bbbbbbbb-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002');

CREATE SCHEMA check_0017;
GRANT USAGE ON SCHEMA check_0017 TO authenticated, anon, service_role;
CREATE FUNCTION check_0017.expect_error(p_sql TEXT, p_like TEXT, p_label TEXT) RETURNS VOID LANGUAGE plpgsql AS $$
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
GRANT EXECUTE ON FUNCTION check_0017.expect_error(TEXT, TEXT, TEXT) TO authenticated, anon, service_role;

-- ── Structure ──
DO $$
BEGIN
  ASSERT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'routes_bus_id_run_key'), 'routes unique (bus_id, run)';
  ASSERT NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'routes_bus_id_key'), 'old routes unique gone';
  ASSERT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendance_student_id_date_run_key'), 'attendance unique per run';
  -- Rows from before 0017 become the morning run and cover both rides (checked on the defaults, so this also holds
  -- after routes have been re-planned with both runs).
  ASSERT (SELECT column_default FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'run') LIKE '''morning''%', 'existing routes are the morning run';
  ASSERT (SELECT column_default FROM information_schema.columns WHERE table_name = 'absence_reports' AND column_name = 'runs') LIKE '''both''%', 'existing absence reports cover both rides';
  ASSERT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'bus_runs'), 'bus_runs in realtime';
  RAISE NOTICE 'ok: structure';
END;
$$;

-- ── Who may call each function ──
-- Checked in the catalog rather than by calling: the local Postgres image crashes (signal 11) when a superuser session
-- switches to anon or authenticated and hits "permission denied" on a function. Through the API the same call is a
-- clean 401 ("permission denied for function start_run").
DO $$
BEGIN
  ASSERT NOT has_function_privilege('anon', 'start_run(text)', 'EXECUTE'), 'anon cannot start a run';
  ASSERT NOT has_function_privilege('anon', 'end_run()', 'EXECUTE'), 'anon cannot end a run';
  ASSERT NOT has_function_privilege('anon', 'mark_attendance(uuid,text)', 'EXECUTE'), 'anon cannot check students in';
  ASSERT has_function_privilege('authenticated', 'start_run(text)', 'EXECUTE'), 'signed-in users may call start_run (it checks the bus)';
  ASSERT has_function_privilege('authenticated', 'end_run()', 'EXECUTE'), 'end_run for signed-in users';
  ASSERT has_function_privilege('authenticated', 'mark_attendance(uuid,text)', 'EXECUTE'), 'mark_attendance for signed-in users';
  ASSERT NOT has_function_privilege('anon', 'run_stops(uuid,text)', 'EXECUTE'), 'run_stops is internal (anon)';
  ASSERT NOT has_function_privilege('authenticated', 'run_stops(uuid,text)', 'EXECUTE'), 'run_stops is internal (signed in)';
  ASSERT NOT has_function_privilege('anon', 'get_route_plan_payload(uuid,uuid)', 'EXECUTE'), 'planner payload: not anon';
  ASSERT NOT has_function_privilege('authenticated', 'get_route_plan_payload(uuid,uuid)', 'EXECUTE'), 'planner payload: not signed-in users';
  ASSERT has_function_privilege('service_role', 'get_route_plan_payload(uuid,uuid)', 'EXECUTE'), 'planner payload: service role';
  ASSERT NOT has_function_privilege('anon', 'save_route_plan(uuid,uuid[],jsonb,jsonb,jsonb)', 'EXECUTE'), 'save_route_plan: not anon';
  ASSERT NOT has_function_privilege('authenticated', 'save_route_plan(uuid,uuid[],jsonb,jsonb,jsonb)', 'EXECUTE'), 'save_route_plan: not signed-in users';
  ASSERT has_function_privilege('service_role', 'save_route_plan(uuid,uuid[],jsonb,jsonb,jsonb)', 'EXECUTE'), 'save_route_plan: service role';
  ASSERT NOT has_function_privilege('authenticated', 'save_optimized_route(uuid,jsonb,numeric,numeric,text)', 'EXECUTE'), 'old save stays service-role only';
  RAISE NOTICE 'ok: function access';
END;
$$;

SET LOCAL ROLE anon;
DO $$ BEGIN ASSERT (SELECT COUNT(*) FROM bus_runs) = 0, 'anon reads no runs'; RAISE NOTICE 'ok: anon reads no runs'; END $$;
RESET ROLE;

-- ── Driver 1, morning run ──
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.driver1'), 'role', 'authenticated')::text, true);

SELECT check_0017.expect_error(format($q$SELECT mark_attendance(%L, 'boarded')$q$, current_setting('t.first')), '%Start the run%', 'no check-ins before the run starts');
SELECT check_0017.expect_error($q$SELECT start_run('evening')$q$, '%Unknown run%', 'only morning and afternoon runs');
SELECT check_0017.expect_error($q$INSERT INTO bus_runs (bus_id, school_id, date, run) SELECT id, school_id, CURRENT_DATE, 'morning' FROM buses LIMIT 1$q$, '%row-level security%', 'drivers cannot write runs directly');

DO $$
DECLARE
  r bus_runs;
  first_pos UUID;
  last_pos UUID;
BEGIN
  r := start_run('morning');
  ASSERT r.run = 'morning' AND r.date = qatar_today() AND r.ended_at IS NULL, 'morning run started today';
  ASSERT r.bus_id = current_setting('t.bus1')::UUID, 'on the driver''s own bus';
  ASSERT jsonb_array_length(r.stops) = 14, 'snapshot has every student on the bus';
  first_pos := (r.stops->0->>'student_id')::UUID;
  last_pos := (r.stops->13->>'student_id')::UUID;
  ASSERT first_pos = current_setting('t.first')::UUID AND last_pos = current_setting('t.last')::UUID, 'morning follows the chain';
  ASSERT r.plan_version = COALESCE((SELECT MAX(plan_version) FROM routes WHERE bus_id = r.bus_id), 0), 'remembers the route version';
  RAISE NOTICE 'ok: driver starts the morning run with the chain in morning order';
END;
$$;

SELECT check_0017.expect_error(format($q$SELECT mark_attendance(%L, 'boarded')$q$, current_setting('t.other_bus_student')), '%not on your bus%', 'cannot check in another bus''s student');

DO $$
DECLARE
  a attendance;
BEGIN
  a := mark_attendance(current_setting('t.first')::UUID, 'boarded');
  ASSERT a.status = 'boarded' AND a.run = 'morning' AND a.date = qatar_today(), 'boarded on the morning run';
  a := mark_attendance(current_setting('t.second')::UUID, 'absent');
  ASSERT a.status = 'absent', 'absent';
  PERFORM mark_attendance(current_setting('t.second')::UUID, NULL);
  ASSERT NOT EXISTS (SELECT 1 FROM attendance WHERE student_id = current_setting('t.second')::UUID AND date = qatar_today()), 'undo removes the record';
  RAISE NOTICE 'ok: board, absent and undo on the morning run';
END;
$$;

SELECT check_0017.expect_error(format($q$SELECT mark_attendance(%L, 'dropped_off')$q$, current_setting('t.first')), '%afternoon run%', 'no drop-offs in the morning');

DO $$
DECLARE
  r bus_runs;
  a attendance;
BEGIN
  r := end_run();
  ASSERT r.run = 'morning' AND r.ended_at IS NOT NULL, 'morning run ended';
  SELECT * INTO a FROM attendance WHERE student_id = current_setting('t.first')::UUID AND date = qatar_today() AND run = 'morning';
  ASSERT a.status = 'dropped_off' AND a.dropped_off_at = r.ended_at, 'everyone on board arrives at school when the morning ends';
  ASSERT a.created_at < a.dropped_off_at OR a.created_at = a.dropped_off_at, 'boarding time kept';
  RAISE NOTICE 'ok: ending the morning drops everyone off at school';
END;
$$;

SELECT check_0017.expect_error(format($q$SELECT mark_attendance(%L, 'boarded')$q$, current_setting('t.first')), '%Start the run%', 'no check-ins after the run ends');

-- ── Driver 1, afternoon run ──
DO $$
DECLARE
  r bus_runs;
  a attendance;
  boarded_at TIMESTAMPTZ;
BEGIN
  r := start_run('afternoon');
  ASSERT r.run = 'afternoon', 'afternoon run started';
  ASSERT (r.stops->0->>'student_id')::UUID = current_setting('t.last')::UUID, 'afternoon starts with the last morning stop';
  ASSERT (r.stops->13->>'student_id')::UUID = current_setting('t.first')::UUID, 'afternoon ends with the first morning stop';

  a := mark_attendance(current_setting('t.first')::UUID, 'boarded');
  ASSERT a.run = 'afternoon' AND a.status = 'boarded', 'boarded at school';
  boarded_at := a.created_at;
  ASSERT (SELECT COUNT(*) FROM attendance WHERE student_id = current_setting('t.first')::UUID AND date = qatar_today()) = 2, 'morning record kept';

  a := mark_attendance(current_setting('t.first')::UUID, 'dropped_off');
  ASSERT a.status = 'dropped_off' AND a.dropped_off_at IS NOT NULL, 'dropped off';
  a := mark_attendance(current_setting('t.first')::UUID, 'boarded');
  ASSERT a.status = 'boarded' AND a.dropped_off_at IS NULL AND a.created_at = boarded_at, 'undoing a drop-off keeps the boarding time';
  PERFORM mark_attendance(current_setting('t.first')::UUID, 'dropped_off');
  RAISE NOTICE 'ok: afternoon run reverses the order and checks students out';
END;
$$;

SELECT check_0017.expect_error(format($q$SELECT mark_attendance(%L, 'dropped_off')$q$, current_setting('t.second')), '%Only a student on the bus%', 'cannot drop off a student who never boarded');
SELECT check_0017.expect_error(format($q$SELECT mark_attendance(%L, 'absent')$q$, current_setting('t.first')), '%Undo the drop-off%', 'cannot mark a dropped-off student absent');
SELECT check_0017.expect_error(format($q$SELECT mark_attendance(%L, NULL)$q$, current_setting('t.first')), '%Undo the drop-off%', 'cannot clear a drop-off in one step');

DO $$
DECLARE
  r bus_runs;
BEGIN
  r := start_run('afternoon');
  ASSERT (SELECT COUNT(*) FROM bus_runs WHERE bus_id = current_setting('t.bus1')::UUID AND date = qatar_today()) = 2, 'starting again reuses the run';
  ASSERT (SELECT is_active FROM buses WHERE id = current_setting('t.bus1')::UUID), 'bus shows as on the road';
  RAISE NOTICE 'ok: starting a run again reopens it';
END;
$$;
RESET ROLE;

-- ── Driver 2 starts a morning run: separate bus, separate run ──
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.driver2'), 'role', 'authenticated')::text, true);
DO $$
BEGIN
  PERFORM start_run('morning');
  ASSERT (SELECT COUNT(*) FROM bus_runs) = 1, 'driver 2 sees only their own bus''s run';
  ASSERT NOT EXISTS (SELECT 1 FROM bus_runs WHERE bus_id = current_setting('t.bus1')::UUID), 'cannot see bus 1';
  RAISE NOTICE 'ok: drivers only see their own bus''s runs';
END;
$$;
RESET ROLE;

-- ── Driver 1: starting the morning while the afternoon is open ends the afternoon (one run at a time) ──
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.driver1'), 'role', 'authenticated')::text, true);
DO $$
BEGIN
  PERFORM start_run('morning');
  ASSERT (SELECT COUNT(*) FROM bus_runs WHERE bus_id = current_setting('t.bus1')::UUID AND ended_at IS NULL) = 1, 'one run at a time';
  ASSERT (SELECT ended_at IS NOT NULL FROM bus_runs WHERE bus_id = current_setting('t.bus1')::UUID AND run = 'afternoon'), 'the afternoon was ended';
  PERFORM start_run('afternoon');
  RAISE NOTICE 'ok: only one run is open at a time';
END;
$$;
RESET ROLE;

-- ── Parent of a bus 1 child ──
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.parent1'), 'role', 'authenticated')::text, true);
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM bus_runs WHERE bus_id = current_setting('t.bus1')::UUID) = 2, 'parent sees their child''s bus runs';
  ASSERT NOT EXISTS (SELECT 1 FROM bus_runs WHERE bus_id = current_setting('t.bus2')::UUID), 'parent cannot see another bus';
  RAISE NOTICE 'ok: parents see only their children''s bus runs';
END;
$$;
SELECT check_0017.expect_error($q$SELECT start_run('morning')$q$, '%No bus is assigned%', 'parents cannot start a run');
SELECT check_0017.expect_error(format($q$SELECT mark_attendance(%L, 'boarded')$q$, current_setting('t.first')), '%Start the run%', 'parents cannot check students in');
DO $$
DECLARE
  changed INTEGER;
BEGIN
  -- No update policy: the update finds no rows it may change.
  UPDATE bus_runs SET ended_at = NOW() WHERE ended_at IS NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  ASSERT changed = 0, 'parents cannot end runs';
  RAISE NOTICE 'ok: parents cannot end runs';
END;
$$;
RESET ROLE;

-- ── School admin and platform admin ──
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.school_admin'), 'role', 'authenticated')::text, true);
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM bus_runs) = 3, 'school admin sees every run in the school';
  RAISE NOTICE 'ok: school admin sees the school''s runs';
END;
$$;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.platform_admin'), 'role', 'authenticated')::text, true);
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM bus_runs) = 3, 'platform admin sees every run';
  RAISE NOTICE 'ok: platform admin sees every run';
END;
$$;
RESET ROLE;

-- ── Route planner (service role) ──
SET LOCAL ROLE service_role;
DO $$
DECLARE
  chain UUID[];
  reversed UUID[];
  v INTEGER;
  plan JSONB := '{"waypoints": [], "total_distance_km": 10, "total_duration_min": 20, "encoded_polyline": null}';
BEGIN
  ASSERT (SELECT COUNT(*) FROM get_route_plan_payload(current_setting('t.bus1')::UUID)) = 14, 'payload lists the bus''s students';
  SELECT array_agg(student_id ORDER BY stop_order) INTO chain FROM get_route_plan_payload(current_setting('t.bus1')::UUID);

  v := save_route_plan(current_setting('t.bus1')::UUID, chain, plan, plan || '{"total_duration_min": 22}');
  ASSERT v = 1, 'same order keeps the version';
  ASSERT (SELECT COUNT(*) FROM routes WHERE bus_id = current_setting('t.bus1')::UUID) = 2, 'a morning and an afternoon row';
  ASSERT (SELECT total_duration_min FROM routes WHERE bus_id = current_setting('t.bus1')::UUID AND run = 'afternoon') = 22, 'each run keeps its own numbers';

  SELECT array_agg(x ORDER BY n DESC) INTO reversed FROM unnest(chain) WITH ORDINALITY AS u(x, n);
  v := save_route_plan(current_setting('t.bus1')::UUID, reversed, plan, plan);
  ASSERT v = 2, 'a new order is a new version';
  ASSERT (SELECT stop_order FROM students WHERE id = current_setting('t.last')::UUID) = 1, 'the chain was saved';
  ASSERT (SELECT bool_and(plan_version = 2) FROM routes WHERE bus_id = current_setting('t.bus1')::UUID), 'both runs carry the version';

  v := save_route_plan(current_setting('t.bus1')::UUID, reversed[1:13], plan, plan);
  ASSERT (SELECT stop_order FROM students WHERE id = current_setting('t.first')::UUID) IS NULL, 'a student left out loses their place';
  RAISE NOTICE 'ok: route plans save both runs together and version the order';

  -- Today's optimize-route still works through the old function, as the morning row.
  PERFORM save_optimized_route(current_setting('t.bus1')::UUID, '[]'::JSONB);
  ASSERT (SELECT COUNT(*) FROM routes WHERE bus_id = current_setting('t.bus1')::UUID) = 2, 'old save updates the morning row';
  RAISE NOTICE 'ok: the old save_optimized_route keeps working';
END;
$$;
SELECT check_0017.expect_error(format($q$SELECT save_route_plan(%L, ARRAY[%L, %L]::UUID[], '{}', '{}')$q$, current_setting('t.bus1'), current_setting('t.second'), current_setting('t.other_bus_student')), '%not on this bus%', 'cannot put another bus''s student on the route');
SELECT check_0017.expect_error(format($q$SELECT save_route_plan(%L, ARRAY[%L, %L]::UUID[], '{}', '{}')$q$, current_setting('t.bus1'), current_setting('t.second'), current_setting('t.second')), '%twice%', 'cannot list a student twice');
RESET ROLE;

-- ── The current driver app (direct writes, no run) keeps working until 0018 ──
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.driver1'), 'role', 'authenticated')::text, true);
DO $$
BEGIN
  DELETE FROM attendance WHERE student_id = current_setting('t.second')::UUID AND bus_id = current_setting('t.bus1')::UUID AND date = CURRENT_DATE;
  INSERT INTO attendance (student_id, bus_id, status, date) VALUES (current_setting('t.second')::UUID, current_setting('t.bus1')::UUID, 'boarded', CURRENT_DATE);
  ASSERT (SELECT run FROM attendance WHERE student_id = current_setting('t.second')::UUID AND date = CURRENT_DATE) = 'morning', 'old writes are the morning run';
  PERFORM set_bus_active(false);
  RAISE NOTICE 'ok: the current driver app still works';
END;
$$;
RESET ROLE;

ROLLBACK;
