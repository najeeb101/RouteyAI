-- The dashboard's bus and school lists failed with "structure of query does not match function result type" on the
-- local database (Postgres 17): auth.users.email is VARCHAR(255) and PL/pgSQL's RETURN QUERY needs the exact declared
-- type (TEXT). Same functions, with the email cast. The clean-up planned as 0019 moves to 0020.

CREATE OR REPLACE FUNCTION get_buses_with_drivers()
RETURNS TABLE (
  id            UUID,
  school_id     UUID,
  name          TEXT,
  capacity      INTEGER,
  driver_id     UUID,
  driver_name   TEXT,
  driver_email  TEXT,
  color         TEXT,
  is_active     BOOLEAN,
  student_count BIGINT,
  created_at    TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF get_user_role() NOT IN ('school_admin', 'platform_admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY
  SELECT
    b.id,
    b.school_id,
    b.name,
    b.capacity,
    b.driver_id,
    (u.raw_user_meta_data->>'full_name')::TEXT AS driver_name,
    u.email::TEXT                              AS driver_email,
    b.color,
    b.is_active,
    COUNT(s.id)::BIGINT                        AS student_count,
    b.created_at
  FROM buses b
  LEFT JOIN auth.users u ON u.id    = b.driver_id
  LEFT JOIN students  s  ON s.bus_id = b.id
  WHERE b.school_id = get_user_school_id()
  GROUP BY b.id, b.school_id, b.name, b.capacity, b.driver_id,
           u.raw_user_meta_data, u.email, b.color, b.is_active, b.created_at
  ORDER BY b.created_at ASC;
END;
$$;

CREATE OR REPLACE FUNCTION get_schools_with_admins()
RETURNS TABLE (
  id            UUID,
  name          TEXT,
  address       TEXT,
  created_at    TIMESTAMPTZ,
  bus_count     BIGINT,
  student_count BIGINT,
  admin_name    TEXT,
  admin_email   TEXT
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF get_user_role() != 'platform_admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT
    s.id,
    s.name,
    s.address,
    s.created_at,
    COUNT(DISTINCT b.id)::BIGINT,
    COUNT(DISTINCT st.id)::BIGINT,
    MAX(u.raw_user_meta_data->>'full_name')::TEXT,
    MAX(u.email)::TEXT
  FROM schools s
  LEFT JOIN buses b       ON b.school_id  = s.id
  LEFT JOIN students st   ON st.school_id = s.id
  LEFT JOIN user_roles ur ON ur.school_id = s.id AND ur.role = 'school_admin'
  LEFT JOIN auth.users u  ON u.id = ur.user_id
  GROUP BY s.id, s.name, s.address, s.created_at
  ORDER BY s.created_at DESC;
END;
$$;
