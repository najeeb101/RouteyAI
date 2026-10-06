import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { AttendanceStatus, ParentRoute, Run } from '@/types/database'
import ParentClient from './ParentClient'

export type ParentChildData = {
  id: string
  name: string
  bus_id: string | null
  bus_name: string | null
  bus_color: string
  stop_order: number | null
  home_address: string
}

/** Qatar is UTC+3 all year; runs and check-ins are dated by the school day there. */
const QATAR_OFFSET_MS = 3 * 60 * 60 * 1000
const qatarNow = () => new Date(Date.now() + QATAR_OFFSET_MS)

export default async function ParentPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Student linked to this parent (RLS ensures parent only sees their own child)
  const { data: studentRow } = await supabase
    .from('students')
    .select('id, name, bus_id, stop_order, home_address')
    .eq('parent_id', user.id)
    .maybeSingle()

  // Fetch bus details separately to avoid join type issues
  let busName: string | null = null
  let busColor = '#3B82F6'
  if (studentRow?.bus_id) {
    const { data: bus } = await supabase
      .from('buses')
      .select('name, color')
      .eq('id', studentRow.bus_id)
      .maybeSingle()
    busName = bus?.name ?? null
    busColor = bus?.color ?? '#3B82F6'
  }

  const child: ParentChildData | null = studentRow
    ? {
        id: studentRow.id,
        name: studentRow.name,
        bus_id: studentRow.bus_id,
        bus_name: busName,
        bus_color: busColor,
        stop_order: studentRow.stop_order,
        home_address: studentRow.home_address,
      }
    : null

  // The run the page follows, as the app does: the afternoon once its run has started, the morning once its run has
  // started, otherwise the afternoon from 11:00.
  const today = qatarNow().toISOString().slice(0, 10)
  let run: Run = qatarNow().getUTCHours() >= 11 ? 'afternoon' : 'morning'
  let route: ParentRoute | null = null
  let attendanceStatus: AttendanceStatus | null = null
  if (child?.bus_id) {
    const { data: runs, error: runsErr } = await supabase.from('bus_runs').select('run').eq('bus_id', child.bus_id).eq('date', today)
    if (runsErr) console.error('Parent page: bus runs', runsErr.message)
    const started = new Set((runs ?? []).map((r) => r.run))
    if (started.has('afternoon')) run = 'afternoon'
    else if (started.has('morning')) run = 'morning'

    // The route without other children's homes (0018_parent_route.sql).
    const { data: routeData, error: routeErr } = await supabase.rpc('get_parent_route', { p_student_id: child.id, p_run: run })
    if (routeErr) console.error('Parent page: route', routeErr.message)
    route = routeData ?? null

    const { data: att } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', child.id)
      .eq('date', today)
      .eq('run', run)
      .maybeSingle()
    attendanceStatus = (att?.status as AttendanceStatus | undefined) ?? null
  }

  return (
    <ParentClient
      child={child}
      route={route}
      run={run}
      attendanceStatus={attendanceStatus}
      busId={child?.bus_id ?? null}
    />
  )
}
