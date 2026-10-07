-- 0021: drop three database functions nothing uses any more.
--
-- recalculate_route: a placeholder from early development that nudged a route's distance and time by a random
--   amount and could be called by any school admin. Re-planning is now the optimize-route Edge Function.
-- get_routes_with_buses, get_school_stats: replaced by direct queries in the dashboards.

DROP FUNCTION IF EXISTS recalculate_route(UUID);
DROP FUNCTION IF EXISTS get_routes_with_buses();
DROP FUNCTION IF EXISTS get_school_stats();
