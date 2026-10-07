-- Parents read their child's route without seeing other children's homes (Docs/plans/two-runs-a-day.md, "Older problems fixed along the way", fix 3; the new parent
-- app in Docs/plans/two-runs-a-day.md, step 4). A route's waypoints hold every child's home, and the parent policy on
-- routes lets a parent read them all; these functions return only what the parent app shows. The policy itself is
-- dropped in 0019, once nothing reads routes directly as a parent.
--
-- Add-only: today's parent app keeps working until then.

-- Which stop a waypoint belongs to: the child's address, as the driver app groups stops (children at one address are
-- one stop); the point rounded to about 10 m when there is no address.
CREATE OR REPLACE FUNCTION parent_route_place(p_waypoint JSONB)
RETURNS TEXT
LANGUAGE sql STABLE SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT NULLIF(lower(regexp_replace(trim(home_address), '\s+', ' ', 'g')), '') FROM students WHERE id = (p_waypoint->>'student_id')::UUID),
    round((p_waypoint->>'lat')::NUMERIC, 4)::TEXT || ',' || round((p_waypoint->>'lng')::NUMERIC, 4)::TEXT
  );
$$;

-- The caller's child, or an error. Shared by both functions below.
CREATE OR REPLACE FUNCTION parent_route_child(p_student_id UUID)
RETURNS students
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_student students%ROWTYPE;
BEGIN
  SELECT * INTO v_student FROM students WHERE id = p_student_id AND parent_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'This is not your child' USING ERRCODE = '42501';
  END IF;
  RETURN v_student;
END;
$$;

-- One run of the child's bus, for drawing it: the road line (NULL when the route has no road line from Mapbox, because
-- straight lines would be drawn through every home), the child's own stop, how many stops come before it, and the
-- school. NULL when the child has no bus.
CREATE OR REPLACE FUNCTION get_parent_route(p_student_id UUID, p_run TEXT)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_student students%ROWTYPE;
  v_route   routes%ROWTYPE;
  v_stop    JSONB;
  v_school  JSONB;
BEGIN
  IF p_run IS NULL OR p_run NOT IN ('morning', 'afternoon') THEN
    RAISE EXCEPTION 'Unknown run: %', p_run USING ERRCODE = '22023';
  END IF;
  v_student := parent_route_child(p_student_id);
  IF v_student.bus_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object('lat', ST_Y(starting_point::geometry), 'lng', ST_X(starting_point::geometry))
  INTO v_school FROM schools WHERE id = v_student.school_id;

  SELECT * INTO v_route FROM routes WHERE bus_id = v_student.bus_id AND run = p_run;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('run', p_run, 'encoded_polyline', NULL, 'stop', NULL, 'stops_before', NULL, 'stops_total', 0, 'school', v_school, 'plan_version', 0);
  END IF;

  SELECT wp INTO v_stop FROM jsonb_array_elements(v_route.waypoints) AS wp WHERE wp->>'student_id' = p_student_id::TEXT LIMIT 1;

  RETURN jsonb_build_object(
    'run', p_run,
    'encoded_polyline', v_route.encoded_polyline,
    'stop', CASE WHEN v_stop IS NULL THEN NULL ELSE jsonb_build_object(
      'lat', (v_stop->>'lat')::DOUBLE PRECISION,
      'lng', (v_stop->>'lng')::DOUBLE PRECISION,
      'eta_offset_min', (v_stop->>'eta_offset_min')::INTEGER
    ) END,
    'stops_before', CASE WHEN v_stop IS NULL THEN NULL ELSE (
      SELECT COUNT(DISTINCT parent_route_place(wp))
      FROM jsonb_array_elements(v_route.waypoints) AS wp
      WHERE (wp->>'stop_order')::INTEGER < (v_stop->>'stop_order')::INTEGER
        AND parent_route_place(wp) <> parent_route_place(v_stop)
    ) END,
    'stops_total', (SELECT COUNT(DISTINCT parent_route_place(wp)) FROM jsonb_array_elements(v_route.waypoints) AS wp),
    'school', v_school,
    'plan_version', v_route.plan_version
  );
END;
$$;

-- Where the bus is on the run that is running now, from its latest GPS point (if under 3 minutes old): stops before the
-- child's, minutes to the child's stop, and in the morning minutes to school. Worked out here from all the stops, so
-- the parent app never needs them. Minutes follow the stops in order at 25 km/h, as the app did before. NULL when no
-- run is going.
CREATE OR REPLACE FUNCTION get_parent_bus_progress(p_student_id UUID)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_student  students%ROWTYPE;
  v_run      bus_runs%ROWTYPE;
  v_route    routes%ROWTYPE;
  v_loc      GEOMETRY;
  v_at       TIMESTAMPTZ;
  v_school   GEOMETRY;
  v_points   GEOMETRY[];
  v_places   TEXT[];
  v_ids      TEXT[];
  v_child    INTEGER;
  v_nearest  INTEGER := 1;
  v_best     DOUBLE PRECISION := 'Infinity';
  v_d        DOUBLE PRECISION;
  v_to_stop  DOUBLE PRECISION;
  v_to_school DOUBLE PRECISION;
  v_before   INTEGER;
  i          INTEGER;
BEGIN
  v_student := parent_route_child(p_student_id);
  IF v_student.bus_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_run FROM bus_runs
  WHERE bus_id = v_student.bus_id AND date = qatar_today() AND ended_at IS NULL
  ORDER BY started_at DESC LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT location::geometry, timestamp INTO v_loc, v_at FROM bus_locations
  WHERE bus_id = v_student.bus_id ORDER BY timestamp DESC LIMIT 1;
  IF v_loc IS NULL OR v_at < NOW() - INTERVAL '3 minutes' THEN
    RETURN jsonb_build_object('run', v_run.run, 'live', FALSE);
  END IF;

  SELECT starting_point::geometry INTO v_school FROM schools WHERE id = v_student.school_id;
  SELECT * INTO v_route FROM routes WHERE bus_id = v_student.bus_id AND run = v_run.run;

  SELECT
    COALESCE(array_agg(ST_SetSRID(ST_MakePoint((wp->>'lng')::DOUBLE PRECISION, (wp->>'lat')::DOUBLE PRECISION), 4326) ORDER BY (wp->>'stop_order')::INTEGER), '{}'),
    COALESCE(array_agg(parent_route_place(wp) ORDER BY (wp->>'stop_order')::INTEGER), '{}'),
    COALESCE(array_agg(wp->>'student_id' ORDER BY (wp->>'stop_order')::INTEGER), '{}')
  INTO v_points, v_places, v_ids
  FROM jsonb_array_elements(COALESCE(v_route.waypoints, '[]'::JSONB)) AS wp;

  v_child := array_position(v_ids, p_student_id::TEXT);

  -- The stop nearest the bus stands for where it is on the run.
  FOR i IN 1 .. COALESCE(array_length(v_points, 1), 0) LOOP
    v_d := ST_DistanceSphere(v_loc, v_points[i]);
    IF v_d < v_best THEN
      v_best := v_d;
      v_nearest := i;
    END IF;
  END LOOP;

  IF v_child IS NOT NULL THEN
    IF v_child <= v_nearest THEN
      v_to_stop := ST_DistanceSphere(v_loc, v_points[v_child]);
      v_before := 0;
    ELSE
      v_to_stop := ST_DistanceSphere(v_loc, v_points[v_nearest]);
      FOR i IN v_nearest .. v_child - 1 LOOP
        v_to_stop := v_to_stop + ST_DistanceSphere(v_points[i], v_points[i + 1]);
      END LOOP;
      SELECT COUNT(DISTINCT p) INTO v_before
      FROM unnest(v_places[v_nearest : v_child - 1]) AS p
      WHERE p <> v_places[v_child];
    END IF;
  END IF;

  IF v_run.run = 'morning' AND v_school IS NOT NULL THEN
    IF COALESCE(array_length(v_points, 1), 0) = 0 THEN
      v_to_school := ST_DistanceSphere(v_loc, v_school);
    ELSE
      v_to_school := ST_DistanceSphere(v_loc, v_points[v_nearest]);
      FOR i IN v_nearest .. array_length(v_points, 1) - 1 LOOP
        v_to_school := v_to_school + ST_DistanceSphere(v_points[i], v_points[i + 1]);
      END LOOP;
      v_to_school := v_to_school + ST_DistanceSphere(v_points[array_length(v_points, 1)], v_school);
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'run', v_run.run,
    'live', TRUE,
    'located_at', v_at,
    'stops_before', v_before,
    'minutes_to_stop', CASE WHEN v_to_stop IS NULL THEN NULL ELSE GREATEST(1, round(v_to_stop / 1000 / 25 * 60))::INTEGER END,
    'minutes_to_school', CASE WHEN v_to_school IS NULL THEN NULL ELSE GREATEST(1, round(v_to_school / 1000 / 25 * 60))::INTEGER END
  );
END;
$$;

-- Supabase lets anon and authenticated execute new functions by default (see 0016). The two parent functions check
-- the caller themselves; the helpers are only for them.
REVOKE ALL ON FUNCTION parent_route_child(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION parent_route_place(JSONB) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION get_parent_route(UUID, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION get_parent_bus_progress(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION get_parent_route(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_parent_bus_progress(UUID) TO authenticated;
