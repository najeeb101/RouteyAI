-- Removes the pieces the two-runs-a-day work replaced (Docs/plans/two-runs-a-day.md, step 7). Run it once every app in
-- use is the new one: until then the old driver app would stop working, because it calls set_bus_active and writes
-- attendance directly.
--
-- 1. set_bus_active: drivers now start and end runs with start_run / end_run, which also keep buses.is_active.
-- 2. save_optimized_route: optimize-route saves through save_route_plan.
-- 3. Drivers' direct writes to attendance: they mark through mark_attendance, which knows the run. They keep reading
--    their own bus's marks.
-- 4. Parents' direct read of routes: a route's waypoints hold every child's home. Parents read their route through
--    get_parent_route (0018).

DROP FUNCTION IF EXISTS set_bus_active(BOOLEAN);
DROP FUNCTION IF EXISTS save_optimized_route(UUID, JSONB, DECIMAL, DECIMAL, TEXT);

DROP POLICY IF EXISTS "driver: manage attendance for own bus" ON attendance;
DROP POLICY IF EXISTS "driver: read own bus attendance" ON attendance;
CREATE POLICY "driver: read own bus attendance" ON attendance FOR SELECT
  USING (bus_id IN (SELECT auth_driver_bus_ids()));

DROP POLICY IF EXISTS "parent: read child's bus route" ON routes;
