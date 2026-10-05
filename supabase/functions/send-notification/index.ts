/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCaller } from '../_shared/caller.ts'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const reply = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), { headers: corsHeaders, status })

type PushMessage = {
  to: string
  title: string
  body: string
  data?: Record<string, unknown>
  sound: 'default'
  priority: 'high'
}

type PushTicket = {
  status: 'ok' | 'error'
  id?: string
  details?: { error?: string }
}

type NotifRequest =
  | { type: 'attendance'; student_id: string; status: 'boarded' | 'absent' }
  | { type: 'announcement'; school_id: string; bus_id: string | null; message: string }
  | { type: 'eta_alert'; student_id: string }

async function sendToExpo(messages: PushMessage[]): Promise<{ sent: number; invalidTokens: string[] }> {
  if (messages.length === 0) return { sent: 0, invalidTokens: [] }

  const res = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(messages),
  })

  if (!res.ok) throw new Error(`Expo push API ${res.status}`)

  const json = await res.json()
  const tickets = (json.data ?? []) as PushTicket[]

  let sent = 0
  const invalidTokens: string[] = []

  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i]!
    if (ticket.status === 'ok') {
      sent++
    } else if (
      ticket.details?.error === 'DeviceNotRegistered' ||
      ticket.details?.error === 'InvalidCredentials'
    ) {
      const token = messages[i]?.to
      if (token) invalidTokens.push(token)
    }
  }

  return { sent, invalidTokens }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceKey) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')

    const supabase = createClient(supabaseUrl, serviceKey)
    const caller = await getCaller(req, supabase, { url: supabaseUrl, serviceKey })
    if (!caller) return reply({ ok: false, error: 'Sign in required' }, 401)

    const body = (await req.json()) as NotifRequest
    // Attendance and announcement pushes come from the database triggers in 0012, which call with the service role.
    // The only thing an app may ask for is the "bus arriving" alert for the caller's own child (checked below).
    if (caller.kind === 'user' && body.type !== 'eta_alert') return reply({ ok: false, error: 'Not allowed' }, 403)

    const messages: PushMessage[] = []

    if (body.type === 'attendance') {
      const { data: student } = await supabase
        .from('students')
        .select('name, parent_id')
        .eq('id', body.student_id)
        .maybeSingle()

      if (student?.parent_id) {
        const { data: role } = await supabase
          .from('user_roles')
          .select('push_token')
          .eq('user_id', student.parent_id)
          .eq('role', 'parent')
          .maybeSingle()

        if (role?.push_token) {
          const isBoarded = body.status === 'boarded'
          messages.push({
            to: role.push_token,
            title: isBoarded ? `${student.name} has boarded` : `${student.name} marked absent`,
            body: isBoarded
              ? `${student.name} is on the bus and on the way to school.`
              : `${student.name} was not on the bus today.`,
            data: { type: 'attendance', status: body.status, student_id: body.student_id },
            sound: 'default',
            priority: 'high',
          })
        }
      }
    } else if (body.type === 'announcement') {
      const busLabel = body.bus_id
        ? (await supabase.from('buses').select('name').eq('id', body.bus_id).maybeSingle()).data?.name ?? 'Bus'
        : 'School'

      const parentRows = body.bus_id
        ? (
            await supabase
              .from('students')
              .select('parent_id')
              .eq('bus_id', body.bus_id)
              .not('parent_id', 'is', null)
          ).data ?? []
        : (
            await supabase
              .from('user_roles')
              .select('user_id')
              .eq('school_id', body.school_id)
              .eq('role', 'parent')
          ).data ?? []

      const parentIds = Array.from(
        new Set(
          parentRows
            .map((row: { parent_id?: string; user_id?: string }) => row.parent_id ?? row.user_id)
            .filter((id): id is string => Boolean(id)),
        ),
      )

      if (parentIds.length > 0) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('user_id, push_token')
          .eq('role', 'parent')
          .in('user_id', parentIds)

        for (const role of roles ?? []) {
          if (!role.push_token) continue
          messages.push({
            to: role.push_token,
            title: `${busLabel} update`,
            body: body.message,
            data: { type: 'announcement', school_id: body.school_id, bus_id: body.bus_id },
            sound: 'default',
            priority: 'high',
          })
        }
      }
    } else if (body.type === 'eta_alert') {
      const { data: student } = await supabase
        .from('students')
        .select('name, parent_id')
        .eq('id', body.student_id)
        .maybeSingle()

      if (caller.kind === 'user' && (!student || student.parent_id !== caller.id)) {
        return reply({ ok: false, error: 'Not allowed' }, 403)
      }

      if (student?.parent_id) {
        const { data: role } = await supabase
          .from('user_roles')
          .select('push_token')
          .eq('user_id', student.parent_id)
          .eq('role', 'parent')
          .maybeSingle()

        if (role?.push_token) {
          messages.push({
            to: role.push_token,
            title: 'Bus arriving in ~5 minutes',
            body: `Get ${student.name} ready - the bus is almost at your stop.`,
            data: { type: 'eta_alert', student_id: body.student_id },
            sound: 'default',
            priority: 'high',
          })
        }
      }
    }

    const { sent, invalidTokens } = await sendToExpo(messages)

    // Remove invalid tokens so stale devices don't block future sends
    if (invalidTokens.length > 0) {
      await supabase
        .from('user_roles')
        .update({ push_token: null })
        .in('push_token', invalidTokens)
    }

    return new Response(
      JSON.stringify({ ok: true, sent, cleaned: invalidTokens.length }),
      { headers: corsHeaders, status: 200 },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { headers: corsHeaders, status: 500 },
    )
  }
})
