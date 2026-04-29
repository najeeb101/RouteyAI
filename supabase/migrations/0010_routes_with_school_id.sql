-- Include school_id in route list payload so UI can trigger school-wide optimization.
DROP FUNCTION IF EXISTS get_routes_with_buses();

CREATE OR REPLACE FUNCTION get_routes_with_buses()
RETURNS TABLE (
  id                 UUID,
  school_id          UUID,
  bus_id             UUID,
  bus_name           TEXT,
  bus_color          TEXT,
  waypoints          JSONB,
  total_distance_km  DECIMAL,
  total_duration_min DECIMAL,
  optimized_at       TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  IF get_user_role() NOT IN ('school_admin', 'platform_admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT
    r.id,
    r.school_id,
    r.bus_id,
    b.name AS bus_name,
    b.color AS bus_color,
    r.waypoints,
    r.total_distance_km,
    r.total_duration_min,
    r.optimized_at
  FROM routes r
  JOIN buses b ON b.id = r.bus_id
  WHERE r.school_id = get_user_school_id()
  ORDER BY r.optimized_at DESC;
END;
$$;
