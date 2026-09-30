-- RouteyAI — Absence reports and push token saving
--
-- 1. absence_reports: a parent tells the school ahead of time that a child won't ride on a given day.
--    The driver sees it on the route (the stop can be skipped); the school admin can read it.
--    This is separate from `attendance`, which is what the driver actually recorded at the stop.
-- 2. set_push_token(): parents and drivers could not save their Expo push token, because user_roles
--    has no UPDATE policy for them (and one would let a user change their own role). This function
--    updates only the caller's push_token.

-- ─────────────────────────────────────────────
-- ABSENCE REPORTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS absence_reports (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id  UUID        REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  school_id   UUID        REFERENCES schools(id) ON DELETE CASCADE NOT NULL,  -- set by trigger from the student
  date        DATE        NOT NULL,
  reason      TEXT        NOT NULL DEFAULT 'other' CHECK (reason IN ('sick','appointment','travel','other')),
  note        TEXT        CHECK (char_length(note) <= 200),
  reported_by UUID        REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, date)   -- one report per child per day
);

CREATE INDEX IF NOT EXISTS idx_absence_reports_date ON absence_reports(date, student_id);

-- The client only sends student_id, date, reason and note; school and reporter come from the database.
CREATE OR REPLACE FUNCTION set_absence_report_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.school_id   := (SELECT school_id FROM students WHERE id = NEW.student_id);
  NEW.reported_by := auth.uid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS absence_reports_defaults ON absence_reports;
CREATE TRIGGER absence_reports_defaults
  BEFORE INSERT ON absence_reports
  FOR EACH ROW
  EXECUTE FUNCTION set_absence_report_defaults();

ALTER TABLE absence_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform_admin: full access on absence_reports" ON absence_reports FOR ALL
  USING (get_user_role() = 'platform_admin')
  WITH CHECK (get_user_role() = 'platform_admin');

CREATE POLICY "school_admin: read own school absence reports" ON absence_reports FOR SELECT
  USING (school_id = get_user_school_id());

CREATE POLICY "driver: read absence reports for own bus" ON absence_reports FOR SELECT
  USING (student_id IN (
    SELECT id FROM students WHERE bus_id IN (SELECT id FROM buses WHERE driver_id = auth.uid())
  ));

CREATE POLICY "parent: read own child's absence reports" ON absence_reports FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE parent_id = auth.uid()));

-- Parents can report today or a later day, and take back a report that hasn't passed yet.
-- CURRENT_DATE is UTC, which is never ahead of the date in Qatar (UTC+3).
CREATE POLICY "parent: report own child absent" ON absence_reports FOR INSERT
  WITH CHECK (
    student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
    AND date >= CURRENT_DATE
  );

CREATE POLICY "parent: cancel own child's upcoming absence" ON absence_reports FOR DELETE
  USING (
    student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
    AND date >= CURRENT_DATE
  );

-- Drivers see new reports on the route without refreshing.
ALTER PUBLICATION supabase_realtime ADD TABLE absence_reports;

-- ─────────────────────────────────────────────
-- PUSH TOKENS
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_push_token(p_token TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE user_roles SET push_token = p_token WHERE user_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION set_push_token(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION set_push_token(TEXT) TO authenticated;
