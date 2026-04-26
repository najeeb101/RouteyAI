-- RouteyAI — Invite Code System
-- Admins generate invite links; drivers/parents redeem them to create accounts.

CREATE TABLE IF NOT EXISTS invites (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  code        TEXT    UNIQUE NOT NULL,   -- e.g. "RTY-A3K9F2"
  role        TEXT    NOT NULL CHECK (role IN ('school_admin','driver','parent')),
  school_id   UUID    REFERENCES schools(id) ON DELETE CASCADE,
  -- optional pre-assignment:
  bus_id      UUID    REFERENCES buses(id) ON DELETE SET NULL,    -- pre-assign driver to bus
  student_ids UUID[]  DEFAULT '{}',                               -- pre-link parent to children
  created_by  UUID    REFERENCES auth.users(id),
  expires_at  TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  used_at     TIMESTAMPTZ,
  used_by     UUID    REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invites_code ON invites(code);

-- ─────────────────────────────────────────────
-- redeem_invite(code, new_user_id)
-- Called by the /invite/[code] page after the user signs up.
-- Sets user_roles, optionally assigns driver→bus and parent→students.
-- Runs as SECURITY DEFINER so the new user (who has no role yet) can execute it.
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION redeem_invite(p_code TEXT, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite invites%ROWTYPE;
BEGIN
  -- Fetch and lock
  SELECT * INTO v_invite FROM invites WHERE code = p_code FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'invite_not_found');
  END IF;
  IF v_invite.used_at IS NOT NULL THEN
    RETURN jsonb_build_object('error', 'invite_already_used');
  END IF;
  IF v_invite.expires_at < NOW() THEN
    RETURN jsonb_build_object('error', 'invite_expired');
  END IF;

  -- Create user_role
  INSERT INTO user_roles(user_id, role, school_id)
  VALUES (p_user_id, v_invite.role, v_invite.school_id)
  ON CONFLICT DO NOTHING;

  -- Pre-assign driver to bus
  IF v_invite.role = 'driver' AND v_invite.bus_id IS NOT NULL THEN
    UPDATE buses SET driver_id = p_user_id WHERE id = v_invite.bus_id;
  END IF;

  -- Link parent to students
  IF v_invite.role = 'parent' AND array_length(v_invite.student_ids, 1) > 0 THEN
    UPDATE students SET parent_id = p_user_id
    WHERE id = ANY(v_invite.student_ids);
  END IF;

  -- Mark invite as used
  UPDATE invites SET used_at = NOW(), used_by = p_user_id WHERE id = v_invite.id;

  RETURN jsonb_build_object(
    'role',      v_invite.role,
    'school_id', v_invite.school_id,
    'bus_id',    v_invite.bus_id
  );
END;
$$;
