-- Phase 5: Smart Placement
-- Auto-assign students to the nearest viable bus cluster when bus_id is not provided.

CREATE OR REPLACE FUNCTION add_student(
  p_name         TEXT,
  p_home_address TEXT,
  p_lat          DOUBLE PRECISION DEFAULT 25.2854,
  p_lng          DOUBLE PRECISION DEFAULT 51.5310,
  p_bus_id       UUID             DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  new_id UUID;
  school_uuid UUID;
  selected_bus_id UUID;
  new_point GEOGRAPHY;
BEGIN
  IF get_user_role() NOT IN ('school_admin', 'platform_admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  school_uuid := get_user_school_id();
  new_point := ST_GeogFromText('SRID=4326;POINT(' || p_lng || ' ' || p_lat || ')');

  IF p_bus_id IS NOT NULL THEN
    -- Validate explicit assignment: bus belongs to same school and has capacity.
    IF NOT EXISTS (
      SELECT 1
      FROM buses b
      WHERE b.id = p_bus_id
        AND b.school_id = school_uuid
    ) THEN
      RAISE EXCEPTION 'Selected bus does not belong to your school';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM buses b
      LEFT JOIN students s ON s.bus_id = b.id
      WHERE b.id = p_bus_id
      GROUP BY b.id, b.capacity
      HAVING COUNT(s.id) >= b.capacity
    ) THEN
      RAISE EXCEPTION 'Selected bus is at capacity';
    END IF;

    selected_bus_id := p_bus_id;
  ELSE
    -- Smart Placement:
    -- 1) Only consider buses in the same school with remaining capacity.
    -- 2) Prefer nearest existing cluster centroid.
    -- 3) If no centroid (empty bus), fall back by lowest utilization.
    WITH bus_loads AS (
      SELECT
        b.id,
        b.capacity,
        COUNT(s.id)::INT AS student_count,
        CASE
          WHEN COUNT(s.id) > 0
            THEN ST_Centroid(ST_Collect(s.home_location::geometry))::geography
          ELSE NULL
        END AS cluster_center
      FROM buses b
      LEFT JOIN students s ON s.bus_id = b.id
      WHERE b.school_id = school_uuid
      GROUP BY b.id, b.capacity
      HAVING COUNT(s.id) < b.capacity
    )
    SELECT bl.id
    INTO selected_bus_id
    FROM bus_loads bl
    ORDER BY
      CASE WHEN bl.cluster_center IS NULL THEN 1 ELSE 0 END,
      CASE
        WHEN bl.cluster_center IS NULL THEN NULL
        ELSE ST_Distance(bl.cluster_center, new_point)
      END ASC NULLS LAST,
      (bl.student_count::DECIMAL / NULLIF(bl.capacity, 0)) ASC,
      bl.student_count ASC
    LIMIT 1;
  END IF;

  INSERT INTO students (school_id, name, home_address, home_location, bus_id)
  VALUES (
    school_uuid,
    p_name,
    p_home_address,
    new_point,
    selected_bus_id
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;
