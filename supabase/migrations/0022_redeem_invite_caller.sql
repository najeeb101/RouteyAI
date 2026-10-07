-- 0022: redeem_invite no longer trusts the user id it is given.
--
-- Before, anyone holding a valid unused code could pass any user's id and attach that user to the invite's role,
-- bus or students. The invite page has to call this before email confirmation gives the new user a session, so it
-- cannot simply require auth.uid(). Instead the target must be a brand-new account: created in the last 15
-- minutes and with no role yet. If the caller is signed in, it must be that same account.

CREATE OR REPLACE FUNCTION redeem_invite(p_code TEXT, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_invite invites%ROWTYPE;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RETURN jsonb_build_object('error', 'invalid_user');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = p_user_id AND u.created_at > NOW() - INTERVAL '15 minutes'
  ) OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = p_user_id) THEN
    RETURN jsonb_build_object('error', 'invalid_user');
  END IF;

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

  INSERT INTO user_roles(user_id, role, school_id)
  VALUES (p_user_id, v_invite.role, v_invite.school_id);

  IF v_invite.role = 'driver' AND v_invite.bus_id IS NOT NULL THEN
    UPDATE buses SET driver_id = p_user_id WHERE id = v_invite.bus_id;
  END IF;

  IF v_invite.role = 'parent' AND array_length(v_invite.student_ids, 1) > 0 THEN
    UPDATE students SET parent_id = p_user_id
    WHERE id = ANY(v_invite.student_ids);
  END IF;

  UPDATE invites SET used_at = NOW(), used_by = p_user_id WHERE id = v_invite.id;

  RETURN jsonb_build_object(
    'role',      v_invite.role,
    'school_id', v_invite.school_id,
    'bus_id',    v_invite.bus_id
  );
END;
$$;
