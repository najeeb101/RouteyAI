import { createClient } from '@/lib/supabase/server'
import { loadFleetToday, loadRoutes, loadSchoolPoint } from '@/lib/dashboard/today'
import RoutesClient, { type RouteBus, type RouteStudent } from './RoutesClient'

export default async function RoutesPage() {
  const supabase = createClient()
  const [busesRes, studentsRes, school] = await Promise.all([
    supabase.rpc('get_buses_with_drivers'),
    supabase.from('students').select('id, name, home_address, bus_id, stop_order').not('bus_id', 'is', null),
    loadSchoolPoint(supabase),
  ])
  for (const { error } of [busesRes, studentsRes]) {
    if (error) console.error('Routes page:', error.message)
  }
  const buses = ((busesRes.data ?? []) as RouteBus[]).map(({ id, school_id, name, color, driver_name }) => ({ id, school_id, name, color, driver_name }))
  const [routes, today] = await Promise.all([loadRoutes(supabase, school), loadFleetToday(supabase, buses.map((b) => b.id))])

  return (
    <RoutesClient
      buses={buses}
      students={(studentsRes.data ?? []) as RouteStudent[]}
      routes={routes}
      school={school}
      runsByBus={today.runsByBus}
    />
  )
}
