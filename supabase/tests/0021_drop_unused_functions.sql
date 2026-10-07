-- Check for 0021_drop_unused_functions.sql against the local database. Run from the repo root:
--
--   docker exec -i supabase_db_RouteyAI psql -U postgres -v ON_ERROR_STOP=1 -q < supabase/tests/0021_drop_unused_functions.sql

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname IN ('recalculate_route', 'get_routes_with_buses', 'get_school_stats')
  ) THEN
    RAISE EXCEPTION 'an unused function still exists';
  END IF;
  RAISE NOTICE 'ok: recalculate_route, get_routes_with_buses and get_school_stats are gone';
END $$;
