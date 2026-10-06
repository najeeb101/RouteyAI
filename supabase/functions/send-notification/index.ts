import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.117.2'
import { getCaller } from '../_shared/caller.ts'
import {
  attendanceText,
  etaRun,
  etaText,
  qatarDate,
  type AttendanceStatus,
  type PushText,
  type Run,
} from '../_shared/notifications.ts'

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

/**
 * attendance and drop_off come from the attendance trigger (0017 adds run, previous_status and at; messages from before
 * it have no run and are the morning), announcement from the announcements trigger, eta_alert from the parent app.
 * dry_run (service role only) returns the messages instead of sending them.
 */
type NotifRequest = { dry_run?: boolean } & (
  | { type: 'attendance' | 'drop_off'; student_id: string; status: AttendanceStatus; run?: Run | null; previous_status?: AttendanceStatus | null; at?: string | null }
  | { type: 'announcement'; school_id: string; bus_id: string | null; message: string }
  | { type: 'eta_alert'; student_id: string }
)

/** A message to send, before we know whether the parent has a phone to send it to. */
type Draft = PushText & { parentId: string; data: Record<string, unknown> }

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

type StudentRow = { name: string; parent_id: string | null; bus_id: string | null; school_id: string; home_address: string | null }

async function loadStudent(supabase: SupabaseClient, studentId: string): Promise<StudentRow | null> {
  const { data, error } = await supabase
    .from('students')
    .select('name, parent_id, bus_id, school_id, home_address')
    .eq('id', studentId)
    .maybeSingle()
  if (error) throw error
  return data as StudentRow | null
}

/** Which run the "bus almost there" alert is for right now, or null if it shouldn't go out. */
async function etaRunFor(supabase: SupabaseClient, studentId: string, busId: string | null): Promise<Run | null> {
  if (!busId) return null
  const today = qatarDate()
  const [runs, bus, attendance, report] = await Promise.all([
    supabase.from('bus_runs').select('run, ended_at').eq('bus_id', busId).eq('date', today),
    supabase.from('buses').select('is_active').eq('id', busId).maybeSingle(),
    supabase.from('attendance').select('run, status').eq('student_id', studentId).eq('date', today),
    supabase.from('absence_reports').select('runs').eq('student_id', studentId).eq('date', today).maybeSingle(),
  ])
  for (const r of [runs, bus, attendance, report]) if (r.error) throw r.error

  const todaysRuns = (runs.data ?? []) as { run: Run; ended_at: string | null }[]
  const marks = (attendance.data ?? []) as { run: Run; status: AttendanceStatus }[]
  return etaRun({
    runningRun: todaysRuns.find((r) => r.ended_at === null)?.run ?? null,
    // Today's driver app sets the bus active instead of starting a run (until 0018).
    legacyActive: todaysRuns.length === 0 && Boolean((bus.data as { is_active?: boolean } | null)?.is_active),
    morningStatus: marks.find((m) => m.run === 'morning')?.status ?? null,
    afternoonStatus: marks.find((m) => m.run === 'afternoon')?.status ?? null,
    reportedRuns: (report.data as { runs?: 'both' | 'morning' | 'afternoon' } | null)?.runs ?? null,
  })
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
    // Attendance and announcement pushes come from the database triggers, which call with the service role. The only
    // thing an app may ask for is the "bus almost there" alert for the caller's own child (checked below).
    if (caller.kind === 'user' && (body.type !== 'eta_alert' || body.dry_run)) return reply({ ok: false, error: 'Not allowed' }, 403)

    const drafts: Draft[] = []
    let skipped: string | null = null

    if (body.type === 'attendance' || body.type === 'drop_off') {
      const student = await loadStudent(supabase, body.student_id)
      const run = body.run ?? 'morning'
      let schoolName: string | null = null
      if (body.status === 'dropped_off' && run === 'morning' && student) {
        const { data: school, error } = await supabase.from('schools').select('name').eq('id', student.school_id).maybeSingle()
        if (error) throw error
        schoolName = (school as { name?: string } | null)?.name ?? null
      }
      const text = student && attendanceText({
        name: student.name,
        run,
        status: body.status,
        previousStatus: body.previous_status ?? null,
        at: body.at ?? null,
        schoolName,
        address: student.home_address,
      })
      if (!text) skipped = student ? 'nothing new to tell' : 'student not found'
      else if (!student?.parent_id) skipped = 'no parent linked'
      else drafts.push({ ...text, parentId: student.parent_id, data: { type: body.type, run, status: body.status, student_id: body.student_id } })
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
      for (const parentId of parentIds) {
        drafts.push({
          parentId,
          title: `${busLabel} update`,
          body: body.message,
          data: { type: 'announcement', school_id: body.school_id, bus_id: body.bus_id },
        })
      }
    } else if (body.type === 'eta_alert') {
      const student = await loadStudent(supabase, body.student_id)
      if (caller.kind === 'user' && (!student || student.parent_id !== caller.id)) {
        return reply({ ok: false, error: 'Not allowed' }, 403)
      }
      const run = student ? await etaRunFor(supabase, body.student_id, student.bus_id) : null
      if (!student?.parent_id) skipped = 'no parent linked'
      else if (!run) skipped = 'no run on which the child is waiting or on board'
      else drafts.push({ ...etaText(student.name, run), parentId: student.parent_id, data: { type: 'eta_alert', run, student_id: body.student_id } })
    }

    const parentIds = [...new Set(drafts.map((d) => d.parentId))]
    const tokens = new Map<string, string>()
    if (parentIds.length > 0) {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('user_id, push_token')
        .eq('role', 'parent')
        .in('user_id', parentIds)
      if (error) throw error
      for (const role of (roles ?? []) as { user_id: string; push_token: string | null }[]) {
        if (role.push_token) tokens.set(role.user_id, role.push_token)
      }
    }

    if (body.dry_run) {
      return reply({
        ok: true,
        dry_run: true,
        skipped,
        messages: drafts.map((d) => ({ title: d.title, body: d.body, data: d.data, has_push_token: tokens.has(d.parentId) })),
      }, 200)
    }

    const messages: PushMessage[] = drafts.flatMap((d) => {
      const to = tokens.get(d.parentId)
      return to ? [{ to, title: d.title, body: d.body, data: d.data, sound: 'default' as const, priority: 'high' as const }] : []
    })
    const { sent, invalidTokens } = await sendToExpo(messages)

    // Remove invalid tokens so stale devices don't block future sends
    if (invalidTokens.length > 0) {
      await supabase
        .from('user_roles')
        .update({ push_token: null })
        .in('push_token', invalidTokens)
    }

    return reply({ ok: true, sent, cleaned: invalidTokens.length, skipped }, 200)
  } catch (err) {
    const message = err instanceof Error ? err.message : (err as { message?: string })?.message ?? 'Unknown error'
    return reply({ ok: false, error: message }, 500)
  }
})
