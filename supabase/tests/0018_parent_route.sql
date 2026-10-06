-- Checks for 0018_parent_route.sql against the local database with the seed data. Everything runs in one transaction
-- that is rolled back, so the local data is left as it was. Run from the repo root:
--
--   docker exec -i supabase_db_RouteyAI psql -U postgres -v ON_ERROR_STOP=1 -q < supabase/tests/0018_parent_route.sql
--
-- Each check prints "ok: …"; the first failure stops the script with an error.

BEGIN;

-- ── Seed ids ──
SELECT set_config('t.bus1', 'bbbbbbbb-0000-0000-0000-000000000001', true);
SELECT set_config('t.driver1', '00000000-0000-0000-0000-000000000003', true);
-- A child on bus 1 who is not first in the morning order, and their parent.
SELECT set_config('t.child', (SELECT id::text FROM students WHERE bus_id = 'bbbbbbbb-0000-0000-0000-000000000001' AND parent_id IS NOT NULL ORDER BY stop_order OFFSET 3 LIMIT 1), true);
SELECT set_config('t.parent', (SELECT parent_id::text FROM students WHERE id = current_setting('t.child')::UUID), true);
-- A child of another parent.
SELECT set_config('t.other_child', (SELECT id::text FROM students WHERE parent_id IS NOT NULL AND parent_id <> current_setting('t.parent')::UUID LIMIT 1), true);

-- Both runs of bus 1, as optimize-route saves them: the morning in stop_order, the afternoon reversed.
DELETE FROM routes WHERE bus_id = current_setting('t.bus1')::UUID;
INSERT INTO routes (school_id, bus_id, run, waypoints, encoded_polyline, plan_version)
SELECT s.school_id, s.bus_id, r.run,
  jsonb_agg(jsonb_build_object(
    'student_id', s.id, 'lat', ST_Y(s.home_location::geometry), 'lng', ST_X(s.home_location::geometry),
    'stop_order', CASE WHEN r.run = 'morning' THEN s.stop_order ELSE 100 - s.stop_order END, 'eta_offset_min', s.stop_order * 2
  )),
  '_p~iF~ps|U_ulLnnqC', 3
FROM students s CROSS JOIN (VALUES ('morning'), ('afternoon')) AS r(run)
WHERE s.bus_id = current_setting('t.bus1')::UUID
GROUP BY s.school_id, s.bus_id, r.run;
DELETE FROM bus_runs WHERE bus_id = current_setting('t.bus1')::UUID;
DELETE FROM bus_locations WHERE bus_id = current_setting('t.bus1')::UUID;

CREATE SCHEMA check_0018;
GRANT USAGE ON SCHEMA check_0018 TO authenticated, anon;
CREATE FUNCTION check_0018.expect_error(p_sql TEXT, p_like TEXT, p_label TEXT) RETURNS VOID LANGUAGE plpgsql AS $$
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
GRANT EXECUTE ON FUNCTION check_0018.expect_error(TEXT, TEXT, TEXT) TO authenticated, anon;

-- ── Who may call (read from the catalog: the local image crashes on a denied call after SET ROLE) ──
DO $$
BEGIN
  ASSERT NOT has_function_privilege('anon', 'get_parent_route(uuid, text)', 'EXECUTE'), 'anon cannot read routes';
  ASSERT NOT has_function_privilege('anon', 'get_parent_bus_progress(uuid)', 'EXECUTE'), 'anon cannot read progress';
  ASSERT has_function_privilege('authenticated', 'get_parent_route(uuid, text)', 'EXECUTE'), 'signed-in users can call it';
  ASSERT NOT has_function_privilege('authenticated', 'parent_route_child(uuid)', 'EXECUTE'), 'the helper is internal';
  RAISE NOTICE 'ok: execute rights';
END;
$$;

-- ── The parent's view of a route ──
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.parent'), 'role', 'authenticated')::text, true);
DO $$
DECLARE
  v_route JSONB := get_parent_route(current_setting('t.child')::UUID, 'morning');
  v_afternoon JSONB := get_parent_route(current_setting('t.child')::UUID, 'afternoon');
BEGIN
  ASSERT v_route->>'encoded_polyline' = '_p~iF~ps|U_ulLnnqC', 'the road line';
  ASSERT (v_route->'stop'->>'lat') IS NOT NULL AND (v_route->'stop'->>'eta_offset_min') IS NOT NULL, 'the child''s own stop';
  ASSERT (v_route->>'stops_before')::INTEGER >= 1, 'stops before the child''s in the morning';
  ASSERT (v_route->>'stops_total')::INTEGER >= (v_route->>'stops_before')::INTEGER + 1, 'stops in total';
  ASSERT v_route->'school'->>'lat' IS NOT NULL, 'the school';
  ASSERT (v_route->>'plan_version')::INTEGER = 3, 'plan version';
  ASSERT NOT (v_route ? 'waypoints'), 'no waypoints';
  PERFORM set_config('t.route', v_route::TEXT, true);
  ASSERT (v_afternoon->>'stops_before')::INTEGER = (v_route->>'stops_total')::INTEGER - (v_route->>'stops_before')::INTEGER - 1,
    'the afternoon counts the stops from the other end';
  RAISE NOTICE 'ok: the parent gets the line, their own stop and counts only';
END;
$$;
SELECT check_0018.expect_error(format($q$SELECT get_parent_route(%L, 'morning')$q$, current_setting('t.other_child')), '%not your child%', 'another parent''s child is refused');
SELECT check_0018.expect_error(format($q$SELECT get_parent_route(%L, 'evening')$q$, current_setting('t.child')), '%unknown run%', 'only the two runs');
RESET ROLE;

-- No other child's id or home is in the parent's answer (checked as postgres, who can see every child).
DO $$
DECLARE
  v_others INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_others FROM students s
  WHERE s.bus_id = current_setting('t.bus1')::UUID AND s.id <> current_setting('t.child')::UUID
    AND NOT ST_Equals(s.home_location::geometry, (SELECT home_location::geometry FROM students WHERE id = current_setting('t.child')::UUID))
    AND (strpos(current_setting('t.route'), s.id::TEXT) > 0
      OR strpos(current_setting('t.route'), round(ST_Y(s.home_location::geometry)::NUMERIC, 5)::TEXT) > 0);
  ASSERT v_others = 0, 'nothing about other children';
  RAISE NOTICE 'ok: no other child''s id or home in the answer';
  -- Stops are counted by address, as the driver app groups them.
  ASSERT (current_setting('t.route')::JSONB->>'stops_before')::INTEGER = (
    SELECT COUNT(DISTINCT lower(trim(s.home_address))) FROM students s, students c
    WHERE c.id = current_setting('t.child')::UUID AND s.bus_id = c.bus_id AND s.stop_order < c.stop_order
      AND lower(trim(s.home_address)) <> lower(trim(c.home_address))
  ), 'stops before = addresses before';
  RAISE NOTICE 'ok: stops counted by address';
END;
$$;

-- A driver is not a parent.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.driver1'), 'role', 'authenticated')::text, true);
SELECT check_0018.expect_error(format($q$SELECT get_parent_route(%L, 'morning')$q$, current_setting('t.child')), '%not your child%', 'a driver is refused');
-- The driver starts the morning run (0017).
SELECT start_run('morning');
RESET ROLE;

-- ── Progress on the running run ──
-- An old GPS point doesn't count as live.
INSERT INTO bus_locations (bus_id, location, timestamp)
SELECT current_setting('t.bus1')::UUID, home_location, NOW() - INTERVAL '10 minutes'
FROM students WHERE bus_id = current_setting('t.bus1')::UUID ORDER BY stop_order LIMIT 1;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.parent'), 'role', 'authenticated')::text, true);
DO $$
DECLARE
  v JSONB := get_parent_bus_progress(current_setting('t.child')::UUID);
BEGIN
  ASSERT v->>'run' = 'morning' AND (v->>'live')::BOOLEAN = FALSE, 'stale GPS is not live';
  RAISE NOTICE 'ok: a 10-minute-old point is not live';
END;
$$;
RESET ROLE;

-- The bus at the first stop of the morning, now.
INSERT INTO bus_locations (bus_id, location, timestamp)
SELECT current_setting('t.bus1')::UUID, home_location, NOW()
FROM students WHERE bus_id = current_setting('t.bus1')::UUID ORDER BY stop_order LIMIT 1;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.parent'), 'role', 'authenticated')::text, true);
DO $$
DECLARE
  v JSONB := get_parent_bus_progress(current_setting('t.child')::UUID);
  v_route JSONB := get_parent_route(current_setting('t.child')::UUID, 'morning');
BEGIN
  ASSERT (v->>'live')::BOOLEAN, 'live';
  ASSERT (v->>'stops_before')::INTEGER = (v_route->>'stops_before')::INTEGER, 'at the first stop, every earlier stop is still ahead';
  ASSERT (v->>'minutes_to_stop')::INTEGER >= 1, 'minutes to the stop';
  ASSERT (v->>'minutes_to_school')::INTEGER > (v->>'minutes_to_stop')::INTEGER, 'school is after the child''s stop';
  RAISE NOTICE 'ok: progress from the bus''s position (% stops before, % min, % min to school)', v->>'stops_before', v->>'minutes_to_stop', v->>'minutes_to_school';
END;
$$;
SELECT check_0018.expect_error(format($q$SELECT get_parent_bus_progress(%L)$q$, current_setting('t.other_child')), '%not your child%', 'progress for another parent''s child is refused');
RESET ROLE;

-- After the run ends there is no progress.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.driver1'), 'role', 'authenticated')::text, true);
SELECT end_run();
SELECT set_config('request.jwt.claims', json_build_object('sub', current_setting('t.parent'), 'role', 'authenticated')::text, true);
DO $$
BEGIN
  ASSERT get_parent_bus_progress(current_setting('t.child')::UUID) IS NULL, 'no run, no progress';
  RAISE NOTICE 'ok: no progress without a running run';
END;
$$;
RESET ROLE;

ROLLBACK;
