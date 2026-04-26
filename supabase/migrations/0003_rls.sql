-- RouteyAI — Row Level Security Policies
-- All tables are RLS-enabled; access is role-gated.

-- ─────────────────────────────────────────────
-- HELPER FUNCTIONS  (SECURITY DEFINER to avoid RLS recursion)
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER
AS $$ SELECT role FROM user_roles WHERE user_id = auth.uid() LIMIT 1; $$;

CREATE OR REPLACE FUNCTION get_user_school_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
AS $$ SELECT school_id FROM user_roles WHERE user_id = auth.uid() LIMIT 1; $$;

-- ─────────────────────────────────────────────
-- ENABLE RLS ON ALL TABLES
-- ─────────────────────────────────────────────
ALTER TABLE schools       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE students      ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance    ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites       ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- SCHOOLS
-- ─────────────────────────────────────────────
CREATE POLICY "platform_admin: full access on schools" ON schools FOR ALL
  USING (get_user_role() = 'platform_admin')
  WITH CHECK (get_user_role() = 'platform_admin');

CREATE POLICY "school_admin: read own school" ON schools FOR SELECT
  USING (id = get_user_school_id());

-- ─────────────────────────────────────────────
-- USER_ROLES
-- ─────────────────────────────────────────────
CREATE POLICY "user: read own role" ON user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "platform_admin: full access on user_roles" ON user_roles FOR ALL
  USING (get_user_role() = 'platform_admin')
  WITH CHECK (get_user_role() = 'platform_admin');

CREATE POLICY "school_admin: read roles in own school" ON user_roles FOR SELECT
  USING (school_id = get_user_school_id());

-- ─────────────────────────────────────────────
-- BUSES
-- ─────────────────────────────────────────────
CREATE POLICY "platform_admin: full access on buses" ON buses FOR ALL
  USING (get_user_role() = 'platform_admin')
  WITH CHECK (get_user_role() = 'platform_admin');

CREATE POLICY "school_admin: manage own buses" ON buses FOR ALL
  USING (school_id = get_user_school_id())
  WITH CHECK (school_id = get_user_school_id());

CREATE POLICY "driver: read assigned bus" ON buses FOR SELECT
  USING (driver_id = auth.uid());

CREATE POLICY "parent: read child's bus" ON buses FOR SELECT
  USING (id IN (SELECT bus_id FROM students WHERE parent_id = auth.uid()));

-- ─────────────────────────────────────────────
-- STUDENTS
-- ─────────────────────────────────────────────
CREATE POLICY "platform_admin: full access on students" ON students FOR ALL
  USING (get_user_role() = 'platform_admin')
  WITH CHECK (get_user_role() = 'platform_admin');

CREATE POLICY "school_admin: manage own students" ON students FOR ALL
  USING (school_id = get_user_school_id())
  WITH CHECK (school_id = get_user_school_id());

CREATE POLICY "driver: read students on own bus" ON students FOR SELECT
  USING (bus_id IN (SELECT id FROM buses WHERE driver_id = auth.uid()));

CREATE POLICY "parent: read own child only" ON students FOR SELECT
  USING (parent_id = auth.uid());

-- ─────────────────────────────────────────────
-- ROUTES
-- ─────────────────────────────────────────────
CREATE POLICY "platform_admin: full access on routes" ON routes FOR ALL
  USING (get_user_role() = 'platform_admin')
  WITH CHECK (get_user_role() = 'platform_admin');

CREATE POLICY "school_admin: manage own routes" ON routes FOR ALL
  USING (school_id = get_user_school_id())
  WITH CHECK (school_id = get_user_school_id());

CREATE POLICY "driver: read own bus route" ON routes FOR SELECT
  USING (bus_id IN (SELECT id FROM buses WHERE driver_id = auth.uid()));

CREATE POLICY "parent: read child's bus route" ON routes FOR SELECT
  USING (bus_id IN (SELECT bus_id FROM students WHERE parent_id = auth.uid()));

-- ─────────────────────────────────────────────
-- BUS LOCATIONS
-- ─────────────────────────────────────────────
CREATE POLICY "driver: insert own bus location" ON bus_locations FOR INSERT
  WITH CHECK (bus_id IN (SELECT id FROM buses WHERE driver_id = auth.uid()));

CREATE POLICY "school_admin: read fleet locations" ON bus_locations FOR SELECT
  USING (bus_id IN (SELECT id FROM buses WHERE school_id = get_user_school_id()));

CREATE POLICY "parent: read child's bus location" ON bus_locations FOR SELECT
  USING (bus_id IN (SELECT bus_id FROM students WHERE parent_id = auth.uid()));

-- ─────────────────────────────────────────────
-- ANNOUNCEMENTS
-- ─────────────────────────────────────────────
CREATE POLICY "school_admin: manage own announcements" ON announcements FOR ALL
  USING (school_id = get_user_school_id())
  WITH CHECK (school_id = get_user_school_id());

CREATE POLICY "driver: insert announcement for own bus" ON announcements FOR INSERT
  WITH CHECK (bus_id IN (SELECT id FROM buses WHERE driver_id = auth.uid()));

CREATE POLICY "driver: read own bus announcements" ON announcements FOR SELECT
  USING (
    school_id = (SELECT school_id FROM user_roles WHERE user_id = auth.uid() LIMIT 1)
    OR bus_id IN (SELECT id FROM buses WHERE driver_id = auth.uid())
  );

CREATE POLICY "parent: read announcements for child's bus" ON announcements FOR SELECT
  USING (
    bus_id IN (SELECT bus_id FROM students WHERE parent_id = auth.uid())
    OR (bus_id IS NULL AND school_id IN (
      SELECT s.school_id FROM students s WHERE s.parent_id = auth.uid()
    ))
  );

-- ─────────────────────────────────────────────
-- ATTENDANCE
-- ─────────────────────────────────────────────
CREATE POLICY "driver: manage attendance for own bus" ON attendance FOR ALL
  USING (bus_id IN (SELECT id FROM buses WHERE driver_id = auth.uid()))
  WITH CHECK (bus_id IN (SELECT id FROM buses WHERE driver_id = auth.uid()));

CREATE POLICY "school_admin: read own school attendance" ON attendance FOR SELECT
  USING (bus_id IN (SELECT id FROM buses WHERE school_id = get_user_school_id()));

CREATE POLICY "parent: read own child's attendance" ON attendance FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE parent_id = auth.uid()));

-- ─────────────────────────────────────────────
-- INVITES
-- ─────────────────────────────────────────────
CREATE POLICY "platform_admin: full access on invites" ON invites FOR ALL
  USING (get_user_role() = 'platform_admin')
  WITH CHECK (get_user_role() = 'platform_admin');

CREATE POLICY "school_admin: manage own invites" ON invites FOR ALL
  USING (school_id = get_user_school_id())
  WITH CHECK (school_id = get_user_school_id());

-- Allow unauthenticated users to read an invite by code (for the /invite/[code] page preview)
CREATE POLICY "public: read invite by code" ON invites FOR SELECT
  USING (used_at IS NULL AND expires_at > NOW());

-- ─────────────────────────────────────────────
-- DEMO REQUESTS  (public INSERT, admin-only SELECT)
-- ─────────────────────────────────────────────
CREATE POLICY "public: submit demo request" ON demo_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "platform_admin: read demo requests" ON demo_requests FOR SELECT
  USING (get_user_role() = 'platform_admin');
