import { createClient } from '@/lib/supabase/server'
import { loadFleetToday, loadRoutes, loadSchoolPoint } from '@/lib/dashboard/today'
import SchoolOverviewClient, { type AnnouncementRow, type OverviewStudent } from './SchoolOverviewClient'
import type { BusRow } from './buses/BusesTable'

export default async function SchoolOverviewPage() {
  const supabase = createClient()

  const [busesRes, studentsRes, announcementsRes, school] = await Promise.all([
    supabase.rpc('get_buses_with_drivers'),
    supabase.from('students').select('id, name, bus_id, stop_order'),
    supabase.rpc('get_recent_announcements', { p_limit: 5 }),
    loadSchoolPoint(supabase),
  ])
  for (const { error } of [busesRes, studentsRes, announcementsRes]) {
    if (error) console.error('Overview:', error.message)
  }

  const buses = (busesRes.data ?? []) as BusRow[]
  const [routes, today] = await Promise.all([
    loadRoutes(supabase, school),
    loadFleetToday(supabase, buses.map((b) => b.id)),
  ])

  return (
    <SchoolOverviewClient
      buses={buses}
      students={(studentsRes.data ?? []) as OverviewStudent[]}
      routes={routes}
      school={school}
      initialToday={today}
      initialAnnouncements={(announcementsRes.data ?? []) as AnnouncementRow[]}
    />
  )
}
