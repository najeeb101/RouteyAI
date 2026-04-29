import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { RouteWaypoint } from '@/types/database'
import DriverClient from './DriverClient'

export type DriverBusData = {
  id: string
  name: string
  color: string
  school_id: string
}

export type DriverStudentData = {
  id: string
  name: string
  home_address: string
}

export type DriverStopData = {
  stop_order: number
  home_address: string
  eta_offset_min: number
  students: DriverStudentData[]
}

export type DriverAnnouncementData = {
  id: string
  message: string
  created_at: string
}

export default async function DriverPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: bus } = await supabase
    .from('buses')
    .select('id, name, color, school_id')
    .eq('driver_id', user.id)
    .maybeSingle()

  if (!bus) {
    return <DriverClient bus={null} stops={[]} attendedIds={[]} announcements={[]} schoolName={null} />
  }

  // Latest optimized route
  const { data: route } = await supabase
    .from('routes')
    .select('waypoints')
    .eq('bus_id', bus.id)
    .order('optimized_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const waypoints = (route?.waypoints as RouteWaypoint[]) ?? []

  // Students on this bus, ordered by stop
  const { data: studentsData } = await supabase
    .from('students')
    .select('id, name, home_address, stop_order')
    .eq('bus_id', bus.id)
    .order('stop_order', { ascending: true })
  const students = (studentsData ?? []) as Array<DriverStudentData & { stop_order: number | null }>

  // Build stops from waypoints
  const stopsMap = new Map<number, DriverStopData>()
  for (const wp of waypoints) {
    const student = students.find(s => s.id === wp.student_id)
    if (!student) continue
    if (!stopsMap.has(wp.stop_order)) {
      stopsMap.set(wp.stop_order, {
        stop_order: wp.stop_order,
        home_address: student.home_address,
        eta_offset_min: wp.eta_offset_min,
        students: [],
      })
    }
    stopsMap.get(wp.stop_order)!.students.push({ id: student.id, name: student.name, home_address: student.home_address })
  }

  // Fallback: no route yet, build stops from students directly
  let stops: DriverStopData[]
  if (stopsMap.size > 0) {
    stops = Array.from(stopsMap.values()).sort((a, b) => a.stop_order - b.stop_order)
  } else {
    stops = students
      .filter(s => s.stop_order !== null)
      .map(s => ({
        stop_order: s.stop_order as number,
        home_address: s.home_address,
        eta_offset_min: (s.stop_order as number) * 5,
        students: [{ id: s.id, name: s.name, home_address: s.home_address }],
      }))
  }

  // Today's boarded students
  const today = new Date().toISOString().split('T')[0]
  const { data: attData } = await supabase
    .from('attendance')
    .select('student_id')
    .eq('bus_id', bus.id)
    .eq('date', today)
    .eq('status', 'boarded')
  const attendedIds = (attData ?? []).map(a => a.student_id as string)

  // Announcements for this bus/school
  const { data: annData } = await supabase
    .from('announcements')
    .select('id, message, created_at')
    .eq('school_id', bus.school_id)
    .or(`bus_id.eq.${bus.id},bus_id.is.null`)
    .order('created_at', { ascending: false })
    .limit(10)
  const announcements = (annData ?? []) as DriverAnnouncementData[]

  // School name for display
  const { data: school } = await supabase
    .from('schools')
    .select('name')
    .eq('id', bus.school_id)
    .maybeSingle()

  return (
    <DriverClient
      bus={bus}
      stops={stops}
      attendedIds={attendedIds}
      announcements={announcements}
      schoolName={school?.name ?? null}
    />
  )
}
