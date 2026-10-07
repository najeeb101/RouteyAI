-- Checks for 0022_redeem_invite_caller.sql against the local database. One transaction, rolled back. From the repo root:
--
--   docker exec -i supabase_db_RouteyAI psql -U postgres -v ON_ERROR_STOP=1 -q < supabase/tests/0022_redeem_invite_caller.sql

BEGIN;

INSERT INTO auth.users (id, instance_id, aud, role, email, created_at)
VALUES ('99999999-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'new-parent@test.local', NOW()),
       ('99999999-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'old-account@test.local', NOW() - INTERVAL '2 days');

INSERT INTO invites (code, role, school_id)
SELECT c, 'parent', (SELECT id FROM schools LIMIT 1) FROM unnest(ARRAY['T-OLD', 'T-NEW', 'T-HAS-ROLE']) AS c;

DO $$
DECLARE r JSONB;
BEGIN
  r := redeem_invite('T-OLD', '99999999-0000-0000-0000-000000000002');
  IF r->>'error' IS DISTINCT FROM 'invalid_user' THEN RAISE EXCEPTION 'an old account was accepted: %', r; END IF;
  RAISE NOTICE 'ok: an account older than 15 minutes is refused';

  r := redeem_invite('T-NEW', '99999999-0000-0000-0000-0000000000ff');
  IF r->>'error' IS DISTINCT FROM 'invalid_user' THEN RAISE EXCEPTION 'an unknown user id was accepted: %', r; END IF;
  RAISE NOTICE 'ok: an unknown user id is refused';

  r := redeem_invite('T-NEW', '99999999-0000-0000-0000-000000000001');
  IF r->>'role' IS DISTINCT FROM 'parent' THEN RAISE EXCEPTION 'a new account was refused: %', r; END IF;
  RAISE NOTICE 'ok: a brand-new account redeems its invite';

  r := redeem_invite('T-HAS-ROLE', '99999999-0000-0000-0000-000000000001');
  IF r->>'error' IS DISTINCT FROM 'invalid_user' THEN RAISE EXCEPTION 'an account with a role was accepted: %', r; END IF;
  RAISE NOTICE 'ok: an account that already has a role is refused';
END $$;

ROLLBACK;
