-- Two runs a day: the morning pickup run (homes → school) and the afternoon drop-off run (school → homes, the same
-- stops in reverse). Plan: Docs/plans/two-runs-a-day.md.
--
-- Add-only, so the apps and Edge Functions running today keep working while the rest rolls out. New columns have
-- defaults (every existing row is the morning run) and the old functions stay; save_optimized_route, which today's
-- optimize-route calls, now writes the morning row under the new (bus_id, run) rule. 0018 removes set_bus_active,
-- save_optimized_route and drivers' direct writes to attendance once nothing uses them.

-- ─────────────────────────────────────────────
-- QATAR DATE: runs and check-ins belong to the school day in Qatar (UTC+3, no daylight saving)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION qatar_today()
RETURNS DATE
LANGUAGE sql STABLE
AS $$ SELECT (NOW() AT TIME ZONE 'Asia/Qatar')::DATE; $$;

-- ─────────────────────────────────────────────
-- ROUTES: a morning row and an afternoon row per bus, both from one stop chain (students.stop_order, morning order)
-- ─────────────────────────────────────────────
ALTER TABLE routes ADD COLUMN IF NOT EXISTS run TEXT NOT NULL DEFAULT 'morning' CHECK (run IN ('morning', 'afternoon'));
-- Goes up whenever the order of stops changes, so the driver app can say "Your route changed".
ALTER TABLE routes ADD COLUMN IF NOT EXISTS plan_version INTEGER NOT NULL DEFAULT 1;
-- "Re-optimizing would save about N minutes a run", worked out by optimize-route. Shown to the school, never applied.
ALTER TABLE routes ADD COLUMN IF NOT EXISTS suggestion JSONB;

ALTER TABLE routes DROP CONSTRAINT IF EXISTS routes_bus_id_key;
ALTER TABLE routes DROP CONSTRAINT IF EXISTS routes_bus_id_run_key;
ALTER TABLE routes ADD CONSTRAINT routes_bus_id_run_key UNIQUE (bus_id, run);

-- Today's optimize-route still calls this until the new one is deployed: same behaviour, written as the morning row.
CREATE OR REPLACE FUNCTION save_optimized_route(
  p_bus_id UUID,
  p_waypoints JSONB,
  p_total_distance_km DECIMAL DEFAULT NULL,
  p_total_duration_min DECIMAL DEFAULT NULL,
  p_encoded_polyline TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  route_id UUID;
  route_school_id UUID;
BEGIN
  SELECT school_id INTO route_school_id FROM buses WHERE id = p_bus_id;
  IF route_school_id IS NULL THEN
    RAISE EXCEPTION 'Bus not found';
  END IF;

  UPDATE students SET stop_order = NULL WHERE bus_id = p_bus_id;

  WITH wp AS (
    SELECT (item->>'student_id')::UUID AS student_id, (item->>'stop_order')::INT AS stop_order
    FROM jsonb_array_elements(p_waypoints) AS item
    WHERE item ? 'student_id'
  )
  UPDATE students s SET stop_order = wp.stop_order
  FROM wp
  WHERE s.id = wp.student_id AND s.bus_id = p_bus_id;

  INSERT INTO routes (school_id, bus_id, run, waypoints, total_distance_km, total_duration_min, encoded_polyline, optimized_at)
  VALUES (route_school_id, p_bus_id, 'morning', p_waypoints, p_total_distance_km, p_total_duration_min, p_encoded_polyline, NOW())
  ON CONFLICT (bus_id, run)
  DO UPDATE SET
    waypoints = EXCLUDED.waypoints,
    total_distance_km = EXCLUDED.total_distance_km,
    total_duration_min = EXCLUDED.total_duration_min,
    encoded_polyline = EXCLUDED.encoded_polyline,
    optimized_at = NOW()
  RETURNING id INTO route_id;

  RETURN route_id;
END;
$$;

-- ─────────────────────────────────────────────
-- ATTENDANCE: one record per student, per day, per run; afternoon students go boarded → dropped_off
-- ─────────────────────────────────────────────
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS run TEXT NOT NULL DEFAULT 'morning' CHECK (run IN ('morning', 'afternoon'));
-- When the student left the bus: at home (afternoon) or at school, when the driver ends the morning run.
-- created_at stays the boarding time.
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS dropped_off_at TIMESTAMPTZ;

ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_status_check;
ALTER TABLE attendance ADD CONSTRAINT attendance_status_check CHECK (status IN ('boarded', 'absent', 'dropped_off'));
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_dropped_off_time;
ALTER TABLE attendance ADD CONSTRAINT attendance_dropped_off_time CHECK ((status = 'dropped_off') = (dropped_off_at IS NOT NULL));

ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_student_id_date_key;
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_student_id_date_run_key;
ALTER TABLE attendance ADD CONSTRAINT attendance_student_id_date_run_key UNIQUE (student_id, date, run);

CREATE INDEX IF NOT EXISTS idx_attendance_bus_date ON attendance(bus_id, date, run);

-- ─────────────────────────────────────────────
-- ABSENCE REPORTS: which rides a report covers
-- ─────────────────────────────────────────────
ALTER TABLE absence_reports ADD COLUMN IF NOT EXISTS runs TEXT NOT NULL DEFAULT 'both' CHECK (runs IN ('both', 'morning', 'afternoon'));

-- ─────────────────────────────────────────────
-- BUS RUNS: which run a bus is on, and when it started and ended
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bus_runs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id       UUID        NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  school_id    UUID        NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  date         DATE        NOT NULL,                       -- Qatar date, set by start_run
  run          TEXT        NOT NULL CHECK (run IN ('morning', 'afternoon')),
  -- The run's students in driving order when it started ([{student_id, position}]), so a route changed by the school
  -- mid-drive doesn't move the driver's list. Ids and order only: names and homes stay in students, behind RLS.
  stops        JSONB       NOT NULL DEFAULT '[]',
  plan_version INTEGER     NOT NULL DEFAULT 0,            -- routes.plan_version when the run started
  started_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at     TIMESTAMPTZ,
  UNIQUE (bus_id, date, run)
);

-- One run at a time per bus.
CREATE UNIQUE INDEX IF NOT EXISTS bus_runs_one_running ON bus_runs(bus_id) WHERE ended_at IS NULL;

ALTER TABLE bus_runs ENABLE ROW LEVEL SECURITY;

-- Read-only for everyone: runs are written only by start_run and end_run below.
DROP POLICY IF EXISTS "platform_admin: read bus runs" ON bus_runs;
CREATE POLICY "platform_admin: read bus runs" ON bus_runs FOR SELECT
  USING (get_user_role() = 'platform_admin');

DROP POLICY IF EXISTS "school_admin: read own school bus runs" ON bus_runs;
CREATE POLICY "school_admin: read own school bus runs" ON bus_runs FOR SELECT
  USING (get_user_role() = 'school_admin' AND school_id = get_user_school_id());

DROP POLICY IF EXISTS "driver: read own bus runs" ON bus_runs;
CREATE POLICY "driver: read own bus runs" ON bus_runs FOR SELECT
  USING (bus_id IN (SELECT auth_driver_bus_ids()));

DROP POLICY IF EXISTS "parent: read child's bus runs" ON bus_runs;
CREATE POLICY "parent: read child's bus runs" ON bus_runs FOR SELECT
  USING (bus_id IN (SELECT auth_parent_bus_ids()));

-- The parent app follows a run starting and ending.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'bus_runs') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE bus_runs;
  END IF;
END;
$$;

-- ─────────────────────────────────────────────
-- DRIVER: start and end a run, check students in and out
-- ─────────────────────────────────────────────

-- A run's students in driving order: the chain for the morning, reversed for the afternoon. Students without a place
-- yet come last, as in the driver app today.
CREATE OR REPLACE FUNCTION run_stops(p_bus_id UUID, p_run TEXT)
RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object('student_id', id, 'position', n) ORDER BY n), '[]'::JSONB)
  FROM (
    SELECT id, ROW_NUMBER() OVER (
      ORDER BY
        CASE WHEN p_run = 'morning' THEN stop_order END ASC NULLS LAST,
        CASE WHEN p_run = 'afternoon' THEN stop_order END DESC NULLS LAST,
        created_at, id
    ) AS n
    FROM students
    WHERE bus_id = p_bus_id
  ) ordered;
$$;

-- A driver drives one bus; like the app, these use the driver's bus.
CREATE OR REPLACE FUNCTION start_run(p_run TEXT)
RETURNS bus_runs
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_bus   buses%ROWTYPE;
  v_today DATE := qatar_today();
  v_run   bus_runs%ROWTYPE;
BEGIN
  IF p_run IS NULL OR p_run NOT IN ('morning', 'afternoon') THEN
    RAISE EXCEPTION 'Unknown run: %', p_run USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_bus FROM buses WHERE driver_id = auth.uid() ORDER BY created_at, id LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No bus is assigned to this driver' USING ERRCODE = '42501';
  END IF;

  -- One run at a time: starting the afternoon ends a morning run that was left open (or yesterday's).
  UPDATE bus_runs SET ended_at = NOW()
  WHERE bus_id = v_bus.id AND ended_at IS NULL AND NOT (date = v_today AND run = p_run);

  -- Starting the same run again (after ending it by mistake) reopens it with its first start time and stops.
  INSERT INTO bus_runs (bus_id, school_id, date, run, stops, plan_version)
  VALUES (
    v_bus.id, v_bus.school_id, v_today, p_run, run_stops(v_bus.id, p_run),
    COALESCE((SELECT MAX(plan_version) FROM routes WHERE bus_id = v_bus.id), 0)
  )
  ON CONFLICT (bus_id, date, run) DO UPDATE SET ended_at = NULL
  RETURNING * INTO v_run;

  -- The school dashboard reads is_active for "on the road".
  UPDATE buses SET is_active = TRUE WHERE id = v_bus.id;
  RETURN v_run;
END;
$$;

-- Ends the running run. Ending the morning run means the bus is at school: everyone still on board is dropped off
-- there, which sends parents the "arrived at school" alert.
CREATE OR REPLACE FUNCTION end_run()
RETURNS bus_runs
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_bus_id UUID;
  v_run    bus_runs%ROWTYPE;
BEGIN
  SELECT id INTO v_bus_id FROM buses WHERE driver_id = auth.uid() ORDER BY created_at, id LIMIT 1;
  IF v_bus_id IS NULL THEN
    RAISE EXCEPTION 'No bus is assigned to this driver' USING ERRCODE = '42501';
  END IF;

  UPDATE bus_runs SET ended_at = NOW() WHERE bus_id = v_bus_id AND ended_at IS NULL RETURNING * INTO v_run;
  UPDATE buses SET is_active = FALSE WHERE id = v_bus_id;
  IF v_run.id IS NULL THEN
    RETURN NULL;
  END IF;

  IF v_run.run = 'morning' THEN
    UPDATE attendance SET status = 'dropped_off', dropped_off_at = v_run.ended_at
    WHERE bus_id = v_bus_id AND date = v_run.date AND run = 'morning' AND status = 'boarded';
  END IF;
  RETURN v_run;
END;
$$;

-- Checks a student in or out on the running run. p_status is what the driver tapped:
--   'boarded'     on the bus (also undoes a drop-off, without a second alert)
--   'absent'      not at the stop / not on the bus at school
--   'dropped_off' left the bus at home (afternoon run only, after boarding)
--   NULL          undo Board or Absent
CREATE OR REPLACE FUNCTION mark_attendance(p_student_id UUID, p_status TEXT)
RETURNS attendance
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_run     bus_runs%ROWTYPE;
  v_current TEXT;
  v_row     attendance%ROWTYPE;
BEGIN
  IF p_status IS NOT NULL AND p_status NOT IN ('boarded', 'absent', 'dropped_off') THEN
    RAISE EXCEPTION 'Unknown status: %', p_status USING ERRCODE = '22023';
  END IF;

  SELECT r.* INTO v_run
  FROM bus_runs r JOIN buses b ON b.id = r.bus_id
  WHERE b.driver_id = auth.uid() AND r.ended_at IS NULL
  ORDER BY r.started_at DESC
  LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Start the run before checking students in' USING ERRCODE = 'P0001';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM students WHERE id = p_student_id AND bus_id = v_run.bus_id) THEN
    RAISE EXCEPTION 'This student is not on your bus' USING ERRCODE = '42501';
  END IF;

  SELECT status INTO v_current FROM attendance
  WHERE student_id = p_student_id AND date = v_run.date AND run = v_run.run;

  IF p_status IS NULL THEN
    IF v_current = 'dropped_off' THEN
      RAISE EXCEPTION 'Undo the drop-off first' USING ERRCODE = 'P0001';
    END IF;
    DELETE FROM attendance WHERE student_id = p_student_id AND date = v_run.date AND run = v_run.run;
    RETURN NULL;
  END IF;

  IF p_status = 'dropped_off' THEN
    IF v_run.run <> 'afternoon' THEN
      RAISE EXCEPTION 'Students are dropped off on the afternoon run' USING ERRCODE = 'P0001';
    END IF;
    IF v_current IS DISTINCT FROM 'boarded' THEN
      RAISE EXCEPTION 'Only a student on the bus can be dropped off' USING ERRCODE = 'P0001';
    END IF;
    UPDATE attendance SET status = 'dropped_off', dropped_off_at = NOW()
    WHERE student_id = p_student_id AND date = v_run.date AND run = v_run.run
    RETURNING * INTO v_row;
    RETURN v_row;
  END IF;

  IF p_status = 'absent' AND v_current = 'dropped_off' THEN
    RAISE EXCEPTION 'Undo the drop-off first' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO attendance (student_id, bus_id, status, date, run)
  VALUES (p_student_id, v_run.bus_id, p_status, v_run.date, v_run.run)
  ON CONFLICT (student_id, date, run) DO UPDATE SET
    status = EXCLUDED.status,
    bus_id = EXCLUDED.bus_id,
    dropped_off_at = NULL,
    -- Undoing a drop-off keeps the boarding time; any other change is a new tap.
    created_at = CASE WHEN attendance.status = 'dropped_off' THEN attendance.created_at
                      WHEN attendance.status = EXCLUDED.status THEN attendance.created_at
                      ELSE NOW() END
  RETURNING * INTO v_row;
  RETURN v_row;
END;
$$;

-- ─────────────────────────────────────────────
-- ROUTE PLANNER (optimize-route, service role only)
-- ─────────────────────────────────────────────

-- Everything the planner needs for one bus, one school or every bus: the school, the students with their homes, and
-- the saved order.
CREATE OR REPLACE FUNCTION get_route_plan_payload(p_bus_id UUID DEFAULT NULL, p_school_id UUID DEFAULT NULL)
RETURNS TABLE (
  bus_id       UUID,
  school_id    UUID,
  bus_capacity INTEGER,
  school_lat   DOUBLE PRECISION,
  school_lng   DOUBLE PRECISION,
  student_id   UUID,
  student_lat  DOUBLE PRECISION,
  student_lng  DOUBLE PRECISION,
  home_address TEXT,
  stop_order   INTEGER
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    b.id, b.school_id, b.capacity,
    ST_Y(sch.starting_point::geometry), ST_X(sch.starting_point::geometry),
    st.id, ST_Y(st.home_location::geometry), ST_X(st.home_location::geometry),
    st.home_address, st.stop_order
  FROM buses b
  JOIN schools sch ON sch.id = b.school_id
  LEFT JOIN students st ON st.bus_id = b.id
  WHERE (p_bus_id IS NULL OR b.id = p_bus_id)
    AND (p_school_id IS NULL OR b.school_id = p_school_id)
  ORDER BY b.id, st.stop_order NULLS LAST, st.created_at, st.id;
$$;

-- Saves a bus's stop chain and both runs in one transaction, so the morning and afternoon always come from the same
-- plan. The plan version goes up only when the order of students changes.
--   p_chain      the bus's students in morning order
--   p_morning    {waypoints, total_distance_km, total_duration_min, encoded_polyline}
--   p_afternoon  the same for the afternoon
--   p_suggestion the "re-optimizing would save…" hint, or NULL
CREATE OR REPLACE FUNCTION save_route_plan(
  p_bus_id UUID,
  p_chain UUID[],
  p_morning JSONB,
  p_afternoon JSONB,
  p_suggestion JSONB DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_school_id UUID;
  v_old_chain UUID[];
  v_version   INTEGER;
BEGIN
  -- Locks the bus row so two saves for the same bus can't interleave.
  SELECT school_id INTO v_school_id FROM buses WHERE id = p_bus_id FOR UPDATE;
  IF v_school_id IS NULL THEN
    RAISE EXCEPTION 'Bus not found';
  END IF;

  IF cardinality(p_chain) <> (SELECT COUNT(DISTINCT id) FROM unnest(p_chain) AS c(id)) THEN
    RAISE EXCEPTION 'The route lists a student twice';
  END IF;
  IF EXISTS (
    SELECT 1 FROM unnest(p_chain) AS c(id)
    WHERE NOT EXISTS (SELECT 1 FROM students s WHERE s.id = c.id AND s.bus_id = p_bus_id)
  ) THEN
    RAISE EXCEPTION 'The route lists a student who is not on this bus';
  END IF;

  SELECT COALESCE(array_agg(id ORDER BY stop_order), '{}') INTO v_old_chain
  FROM students WHERE bus_id = p_bus_id AND stop_order IS NOT NULL;
  SELECT COALESCE(MAX(plan_version), 0) INTO v_version FROM routes WHERE bus_id = p_bus_id;
  IF v_version = 0 OR v_old_chain IS DISTINCT FROM COALESCE(p_chain, '{}') THEN
    v_version := v_version + 1;
  END IF;

  -- Only rows whose place changes are touched.
  UPDATE students SET stop_order = NULL
  WHERE bus_id = p_bus_id AND stop_order IS NOT NULL AND NOT (id = ANY (p_chain));
  UPDATE students s SET stop_order = c.n
  FROM unnest(p_chain) WITH ORDINALITY AS c(id, n)
  WHERE s.id = c.id AND s.stop_order IS DISTINCT FROM c.n;

  INSERT INTO routes (school_id, bus_id, run, waypoints, total_distance_km, total_duration_min, encoded_polyline, plan_version, suggestion, optimized_at)
  SELECT
    v_school_id, p_bus_id, r.run,
    COALESCE(r.plan->'waypoints', '[]'::JSONB),
    (r.plan->>'total_distance_km')::DECIMAL,
    (r.plan->>'total_duration_min')::DECIMAL,
    r.plan->>'encoded_polyline',
    v_version, p_suggestion, NOW()
  FROM (VALUES ('morning', p_morning), ('afternoon', p_afternoon)) AS r(run, plan)
  ON CONFLICT (bus_id, run) DO UPDATE SET
    waypoints = EXCLUDED.waypoints,
    total_distance_km = EXCLUDED.total_distance_km,
    total_duration_min = EXCLUDED.total_duration_min,
    encoded_polyline = EXCLUDED.encoded_polyline,
    plan_version = EXCLUDED.plan_version,
    suggestion = EXCLUDED.suggestion,
    optimized_at = NOW();

  RETURN v_version;
END;
$$;

-- ─────────────────────────────────────────────
-- NOTIFICATIONS: tell send-notification which run, and skip undo taps
-- ─────────────────────────────────────────────
-- Drop-offs go out as their own type: until the new send-notification is deployed, the old one ignores types it
-- doesn't know instead of misreading 'dropped_off' as absent.
CREATE OR REPLACE FUNCTION trigger_notify_parent_attendance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url TEXT := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-notification';
  v_key TEXT := current_setting('app.settings.service_role_key', true);
BEGIN
  IF v_url IS NULL OR v_url = '/functions/v1/send-notification' OR v_key IS NULL THEN
    RETURN NEW;
  END IF;

  -- Nothing changed, or the driver undid a drop-off: no alert.
  IF TG_OP = 'UPDATE' AND (OLD.status IS NOT DISTINCT FROM NEW.status OR (OLD.status = 'dropped_off' AND NEW.status = 'boarded')) THEN
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url     := v_url,
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body    := jsonb_build_object(
      'type',            CASE WHEN NEW.status = 'dropped_off' THEN 'drop_off' ELSE 'attendance' END,
      'student_id',      NEW.student_id,
      'status',          NEW.status,
      'run',             NEW.run,
      'previous_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status END,
      'at',              COALESCE(NEW.dropped_off_at, NEW.created_at)
    )::text
  );

  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────
-- ACCESS: Supabase lets anon and authenticated execute new functions by default (see 0016), so each one is locked
-- down and granted only to the role that should call it.
-- ─────────────────────────────────────────────
REVOKE ALL ON FUNCTION run_stops(UUID, TEXT) FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION start_run(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION end_run() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION mark_attendance(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION start_run(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION end_run() TO authenticated;
GRANT EXECUTE ON FUNCTION mark_attendance(UUID, TEXT) TO authenticated;

REVOKE ALL ON FUNCTION get_route_plan_payload(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION save_route_plan(UUID, UUID[], JSONB, JSONB, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION get_route_plan_payload(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION save_route_plan(UUID, UUID[], JSONB, JSONB, JSONB) TO service_role;
