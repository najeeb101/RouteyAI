import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { RouteWaypoint } from '@/types/database'
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

export type ParentBusStudent = {
  id: string
  name: string
  home_address: string
}

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

  // Route waypoints for child's bus
  let waypoints: RouteWaypoint[] = []
  if (child?.bus_id) {
    const { data: route } = await supabase
      .from('routes')
      .select('waypoints')
      .eq('bus_id', child.bus_id)
      .order('optimized_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    waypoints = (route?.waypoints as RouteWaypoint[]) ?? []
  }

  // All students on the same bus (for stop labels)
  let busStudents: ParentBusStudent[] = []
  if (child?.bus_id) {
    const { data } = await supabase
      .from('students')
      .select('id, name, home_address')
      .eq('bus_id', child.bus_id)
    busStudents = (data as ParentBusStudent[]) ?? []
  }

  // Today's attendance for this child
  let attendanceStatus: 'boarded' | 'absent' | null = null
  if (child?.id) {
    const today = new Date().toISOString().split('T')[0]
    const { data: att } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', child.id)
      .eq('date', today)
      .maybeSingle()
    attendanceStatus = (att?.status as 'boarded' | 'absent') ?? null
  }

  return (
    <ParentClient
      child={child}
      waypoints={waypoints}
      busStudents={busStudents}
      attendanceStatus={attendanceStatus}
      busId={child?.bus_id ?? null}
    />
  )
}
