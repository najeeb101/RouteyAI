-- RouteyAI — Delete your own account
--
-- Apple (App Store guideline 5.1.1(v)) and Google Play require apps with sign-in to let people delete their account
-- from inside the app. delete_my_account() removes the caller's auth user; user_roles (with the push token) goes with
-- it through its existing ON DELETE CASCADE.
--
-- Everything else that points at a user is school data, and stays: the student, the bus, past announcements, invites
-- and absence reports. Their link to the deleted user is cleared instead. Until now those foreign keys had no
-- ON DELETE rule, so deleting any user who was a parent, driver, sender or inviter failed:
--   schools.created_by, buses.driver_id, students.parent_id, announcements.sender_id,
--   invites.created_by, invites.used_by, absence_reports.reported_by

-- Re-create every public foreign key to auth.users that blocks deletion as ON DELETE SET NULL, keeping its name.
-- Looked up rather than named, so it also matches a database whose constraints were named differently.
DO $$
DECLARE
  fk RECORD;
BEGIN
  FOR fk IN
    SELECT c.conrelid::regclass AS tbl, c.conname, a.attname AS col
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = c.conkey[1]
    WHERE c.contype = 'f'
      AND c.confrelid = 'auth.users'::regclass
      AND c.connamespace = 'public'::regnamespace
      AND c.confdeltype IN ('a', 'r')   -- NO ACTION, RESTRICT
      AND cardinality(c.conkey) = 1
  LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', fk.tbl, fk.conname);
    EXECUTE format(
      'ALTER TABLE %s ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES auth.users(id) ON DELETE SET NULL',
      fk.tbl, fk.conname, fk.col
    );
  END LOOP;
END $$;

-- Platform admins are kept out so the last one can't lock everyone out of the admin dashboard by accident.
CREATE OR REPLACE FUNCTION delete_my_account()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'platform_admin') THEN
    RAISE EXCEPTION 'Platform admin accounts cannot be deleted from the app';
  END IF;

  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION delete_my_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION delete_my_account() TO authenticated;
