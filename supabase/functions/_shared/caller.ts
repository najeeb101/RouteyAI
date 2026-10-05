import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export type CallerRole = { role: string; school_id: string | null }

export type Caller = { kind: 'service' } | { kind: 'user'; id: string; roles: CallerRole[] }

/** The JWT's claims, unverified. Only used to decide which check to run. */
function claims(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

/**
 * Works out who called an Edge Function. The gateway's verify_jwt only checks that the bearer token is a signed JWT,
 * and the public anon key is one, so every function has to check the caller itself.
 * - This project's service role key (database triggers, admin scripts) → `service`, trusted. The key the runtime
 *   injects as SUPABASE_SERVICE_ROLE_KEY isn't always the same string as the legacy service key the triggers send, so a
 *   token claiming the service role is confirmed by calling an admin-only Auth endpoint with it.
 * - A signed-in user's access token → `user` with all of their roles.
 * - Anything else, including the anon key → null.
 */
export async function getCaller(
  req: Request,
  admin: SupabaseClient,
  { url, serviceKey }: { url: string; serviceKey: string },
): Promise<Caller | null> {
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '').trim()
  if (!token) return null
  if (token === serviceKey) return { kind: 'service' }

  if (claims(token)?.role === 'service_role') {
    const probe = createClient(url, token, { auth: { persistSession: false, autoRefreshToken: false } })
    const { error } = await probe.auth.admin.listUsers({ page: 1, perPage: 1 })
    return error ? null : { kind: 'service' }
  }

  const { data, error } = await admin.auth.getUser(token)
  if (error || !data.user) return null

  const { data: roles, error: rolesError } = await admin
    .from('user_roles')
    .select('role, school_id')
    .eq('user_id', data.user.id)
  if (rolesError) throw rolesError

  return { kind: 'user', id: data.user.id, roles: (roles ?? []) as CallerRole[] }
}
