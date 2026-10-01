-- RouteyAI — Row Level Security fixes (found while testing the mobile apps against a local database, 2026-10-01)
--
-- 1. Infinite recursion. "parent: read child's bus" (buses) queried students, and
--    "driver: read students on own bus" (students) queried buses, so Postgres stopped every query on
--    students, buses, routes, attendance and announcements made by a parent or driver with
--    "infinite recursion detected in policy". The parent and driver apps could not load anything.
--    Fix: SECURITY DEFINER helpers return the caller's bus and student ids without going through RLS.
--
-- 2. Missing role checks. Every "school_admin: ..." policy only compared school_id with
--    get_user_school_id(), which parents and drivers also have. A parent could read every user_role in
--    the school (including push tokens), create a school_admin invite for themselves, and (once 1 is
--    fixed) manage the school's buses, students, routes and announcements. All now check the role.
--
-- 3. Invite enumeration. "public: read invite by code" let anyone, signed in or not, list every unused
--    invite (including school_admin invites) without knowing a code. Replaced by get_invite(code).
--
-- 4. Drivers set their bus to active when a route starts; that only worked through the hole in 2.
--    set_bus_active() updates just the caller's bus.

-- ─────────────────────────────────────────────
-- HELPERS (SECURITY DEFINER: read without RLS, so policies can use them without recursion)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION auth_driver_bus_ids()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT id FROM buses WHERE driver_id = auth.uid(); $$;

CREATE OR REPLACE FUNCTION auth_parent_student_ids()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT id FROM students WHERE parent_id = auth.uid(); $$;

CREATE OR REPLACE FUNCTION auth_parent_bus_ids()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT DISTINCT bus_id FROM students WHERE parent_id = auth.uid() AND bus_id IS NOT NULL; $$;

CREATE OR REPLACE FUNCTION auth_driver_student_ids()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT s.id FROM students s JOIN buses b ON b.id = s.bus_id WHERE b.driver_id = auth.uid(); $$;

-- ─────────────────────────────────────────────
-- SCHOOLS: every member may read their own school (parents and drivers need its name)
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "school_admin: read own school" ON schools;
CREATE POLICY "member: read own school" ON schools FOR SELECT
  USING (id = get_user_school_id());

-- ─────────────────────────────────────────────
-- USER_ROLES
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "school_admin: read roles in own school" ON user_roles;
CREATE POLICY "school_admin: read roles in own school" ON user_roles FOR SELECT
  USING (get_user_role() = 'school_admin' AND school_id = get_user_school_id());

-- ─────────────────────────────────────────────
-- BUSES
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "school_admin: manage own buses" ON buses;
CREATE POLICY "school_admin: manage own buses" ON buses FOR ALL
  USING (get_user_role() = 'school_admin' AND school_id = get_user_school_id())
  WITH CHECK (get_user_role() = 'school_admin' AND school_id = get_user_school_id());

DROP POLICY IF EXISTS "parent: read child's bus" ON buses;
CREATE POLICY "parent: read child's bus" ON buses FOR SELECT
  USING (id IN (SELECT auth_parent_bus_ids()));

-- ─────────────────────────────────────────────
-- STUDENTS
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "school_admin: manage own students" ON students;
CREATE POLICY "school_admin: manage own students" ON students FOR ALL
  USING (get_user_role() = 'school_admin' AND school_id = get_user_school_id())
  WITH CHECK (get_user_role() = 'school_admin' AND school_id = get_user_school_id());

DROP POLICY IF EXISTS "driver: read students on own bus" ON students;
CREATE POLICY "driver: read students on own bus" ON students FOR SELECT
  USING (bus_id IN (SELECT auth_driver_bus_ids()));

-- ─────────────────────────────────────────────
-- ROUTES
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "school_admin: manage own routes" ON routes;
CREATE POLICY "school_admin: manage own routes" ON routes FOR ALL
  USING (get_user_role() = 'school_admin' AND school_id = get_user_school_id())
  WITH CHECK (get_user_role() = 'school_admin' AND school_id = get_user_school_id());

DROP POLICY IF EXISTS "driver: read own bus route" ON routes;
CREATE POLICY "driver: read own bus route" ON routes FOR SELECT
  USING (bus_id IN (SELECT auth_driver_bus_ids()));

DROP POLICY IF EXISTS "parent: read child's bus route" ON routes;
CREATE POLICY "parent: read child's bus route" ON routes FOR SELECT
  USING (bus_id IN (SELECT auth_parent_bus_ids()));

-- ─────────────────────────────────────────────
-- BUS LOCATIONS
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "driver: insert own bus location" ON bus_locations;
CREATE POLICY "driver: insert own bus location" ON bus_locations FOR INSERT
  WITH CHECK (bus_id IN (SELECT auth_driver_bus_ids()));

DROP POLICY IF EXISTS "school_admin: read fleet locations" ON bus_locations;
CREATE POLICY "school_admin: read fleet locations" ON bus_locations FOR SELECT
  USING (get_user_role() = 'school_admin' AND bus_id IN (SELECT id FROM buses WHERE school_id = get_user_school_id()));

DROP POLICY IF EXISTS "parent: read child's bus location" ON bus_locations;
CREATE POLICY "parent: read child's bus location" ON bus_locations FOR SELECT
  USING (bus_id IN (SELECT auth_parent_bus_ids()));

-- ─────────────────────────────────────────────
-- ANNOUNCEMENTS: school-wide ones (bus_id NULL) plus those for your own bus
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "school_admin: manage own announcements" ON announcements;
CREATE POLICY "school_admin: manage own announcements" ON announcements FOR ALL
  USING (get_user_role() = 'school_admin' AND school_id = get_user_school_id())
  WITH CHECK (get_user_role() = 'school_admin' AND school_id = get_user_school_id());

DROP POLICY IF EXISTS "driver: insert announcement for own bus" ON announcements;
CREATE POLICY "driver: insert announcement for own bus" ON announcements FOR INSERT
  WITH CHECK (bus_id IN (SELECT auth_driver_bus_ids()) AND school_id = get_user_school_id());

DROP POLICY IF EXISTS "driver: read own bus announcements" ON announcements;
CREATE POLICY "driver: read own bus announcements" ON announcements FOR SELECT
  USING (
    get_user_role() = 'driver'
    AND ((bus_id IS NULL AND school_id = get_user_school_id()) OR bus_id IN (SELECT auth_driver_bus_ids()))
  );

DROP POLICY IF EXISTS "parent: read announcements for child's bus" ON announcements;
CREATE POLICY "parent: read announcements for child's bus" ON announcements FOR SELECT
  USING (
    get_user_role() = 'parent'
    AND ((bus_id IS NULL AND school_id = get_user_school_id()) OR bus_id IN (SELECT auth_parent_bus_ids()))
  );

-- ─────────────────────────────────────────────
-- ATTENDANCE
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "driver: manage attendance for own bus" ON attendance;
CREATE POLICY "driver: manage attendance for own bus" ON attendance FOR ALL
  USING (bus_id IN (SELECT auth_driver_bus_ids()))
  WITH CHECK (bus_id IN (SELECT auth_driver_bus_ids()) AND student_id IN (SELECT auth_driver_student_ids()));

DROP POLICY IF EXISTS "school_admin: read own school attendance" ON attendance;
CREATE POLICY "school_admin: read own school attendance" ON attendance FOR SELECT
  USING (get_user_role() = 'school_admin' AND bus_id IN (SELECT id FROM buses WHERE school_id = get_user_school_id()));

DROP POLICY IF EXISTS "parent: read own child's attendance" ON attendance;
CREATE POLICY "parent: read own child's attendance" ON attendance FOR SELECT
  USING (student_id IN (SELECT auth_parent_student_ids()));

-- ─────────────────────────────────────────────
-- INVITES
-- ─────────────────────────────────────────────
DROP POLICY IF EXISTS "school_admin: manage own invites" ON invites;
CREATE POLICY "school_admin: manage own invites" ON invites FOR ALL
  USING (get_user_role() = 'school_admin' AND school_id = get_user_school_id())
  WITH CHECK (get_user_role() = 'school_admin' AND school_id = get_user_school_id());

DROP POLICY IF EXISTS "public: read invite by code" ON invites;

-- The invite page looks up one code; nobody can list invites any more.
CREATE OR REPLACE FUNCTION get_invite(p_code TEXT)
RETURNS TABLE (code TEXT, role TEXT, school_id UUID, expires_at TIMESTAMPTZ, used_at TIMESTAMPTZ)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT i.code, i.role, i.school_id, i.expires_at, i.used_at FROM invites i WHERE i.code = p_code; $$;

REVOKE ALL ON FUNCTION get_invite(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_invite(TEXT) TO anon, authenticated;

-- ─────────────────────────────────────────────
-- DRIVER: start and end the route
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_bus_active(p_active BOOLEAN)
RETURNS VOID
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$ UPDATE buses SET is_active = p_active WHERE driver_id = auth.uid(); $$;

REVOKE ALL ON FUNCTION set_bus_active(BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION set_bus_active(BOOLEAN) TO authenticated;
