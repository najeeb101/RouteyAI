-- Phase 6: Route optimization helper RPCs

-- Fetch optimization input with explicit coordinates from PostGIS geography fields.
CREATE OR REPLACE FUNCTION get_route_optimization_payload(p_bus_id UUID DEFAULT NULL)
RETURNS TABLE (
  bus_id UUID,
  school_id UUID,
  school_lat DOUBLE PRECISION,
  school_lng DOUBLE PRECISION,
  student_id UUID,
  student_lat DOUBLE PRECISION,
  student_lng DOUBLE PRECISION
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    b.id AS bus_id,
    b.school_id,
    ST_Y(sch.starting_point::geometry) AS school_lat,
    ST_X(sch.starting_point::geometry) AS school_lng,
    st.id AS student_id,
    ST_Y(st.home_location::geometry) AS student_lat,
    ST_X(st.home_location::geometry) AS student_lng
  FROM buses b
  JOIN schools sch ON sch.id = b.school_id
  LEFT JOIN students st ON st.bus_id = b.id
  WHERE (p_bus_id IS NULL OR b.id = p_bus_id)
  ORDER BY b.id, st.created_at;
$$;

-- Persist optimized waypoints and stop ordering for a bus route.
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
AS $$
DECLARE
  route_id UUID;
  route_school_id UUID;
BEGIN
  SELECT school_id INTO route_school_id
  FROM buses
  WHERE id = p_bus_id;

  IF route_school_id IS NULL THEN
    RAISE EXCEPTION 'Bus not found';
  END IF;

  -- Reset stop order for this bus before writing new ordering.
  UPDATE students
  SET stop_order = NULL
  WHERE bus_id = p_bus_id;

  -- Update stop order based on optimized waypoints.
  WITH wp AS (
    SELECT
      (item->>'student_id')::UUID AS student_id,
      (item->>'stop_order')::INT AS stop_order
    FROM jsonb_array_elements(p_waypoints) AS item
    WHERE item ? 'student_id'
  )
  UPDATE students s
  SET stop_order = wp.stop_order
  FROM wp
  WHERE s.id = wp.student_id
    AND s.bus_id = p_bus_id;

  INSERT INTO routes (school_id, bus_id, waypoints, total_distance_km, total_duration_min, encoded_polyline, optimized_at)
  VALUES (route_school_id, p_bus_id, p_waypoints, p_total_distance_km, p_total_duration_min, p_encoded_polyline, NOW())
  ON CONFLICT (bus_id)
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

-- Fetch all buses and students in a school for full-school optimization (K-means + capacity assignment).
CREATE OR REPLACE FUNCTION get_school_optimization_payload(p_school_id UUID)
RETURNS TABLE (
  school_id UUID,
  school_lat DOUBLE PRECISION,
  school_lng DOUBLE PRECISION,
  bus_id UUID,
  bus_capacity INTEGER,
  student_id UUID,
  student_lat DOUBLE PRECISION,
  student_lng DOUBLE PRECISION
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    sch.id AS school_id,
    ST_Y(sch.starting_point::geometry) AS school_lat,
    ST_X(sch.starting_point::geometry) AS school_lng,
    b.id AS bus_id,
    b.capacity AS bus_capacity,
    st.id AS student_id,
    ST_Y(st.home_location::geometry) AS student_lat,
    ST_X(st.home_location::geometry) AS student_lng
  FROM schools sch
  JOIN buses b ON b.school_id = sch.id
  LEFT JOIN students st ON st.school_id = sch.id
  WHERE sch.id = p_school_id
  ORDER BY b.created_at, st.created_at;
$$;

-- Bulk-assign students to buses from edge-function output.
CREATE OR REPLACE FUNCTION save_student_bus_assignments(p_assignments JSONB)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER := 0;
BEGIN
  WITH a AS (
    SELECT
      (item->>'student_id')::UUID AS student_id,
      (item->>'bus_id')::UUID AS bus_id
    FROM jsonb_array_elements(p_assignments) item
    WHERE item ? 'student_id' AND item ? 'bus_id'
  )
  UPDATE students s
  SET bus_id = a.bus_id
  FROM a
  WHERE s.id = a.student_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;
