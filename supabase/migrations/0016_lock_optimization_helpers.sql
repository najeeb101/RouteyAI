-- The route optimization helpers from 0009 are SECURITY DEFINER with no caller checks, and Supabase lets anon and
-- authenticated execute new functions by default. So anyone with the public anon key could read every student's home
-- location in every school (get_route_optimization_payload, get_school_optimization_payload) and overwrite any school's
-- bus assignments and routes (save_student_bus_assignments, save_optimized_route).
-- Only the optimize-route Edge Function uses them, and it runs as service_role, which checks the caller first.

REVOKE ALL ON FUNCTION get_route_optimization_payload(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION get_school_optimization_payload(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION save_student_bus_assignments(JSONB) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION save_optimized_route(UUID, JSONB, DECIMAL, DECIMAL, TEXT) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION get_route_optimization_payload(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION get_school_optimization_payload(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION save_student_bus_assignments(JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION save_optimized_route(UUID, JSONB, DECIMAL, DECIMAL, TEXT) TO service_role;
