import { createClient } from '@/lib/supabase/server'
import RoutesClient from './RoutesClient'

export type RouteRow = {
  id: string
  school_id: string
  bus_id: string
  bus_name: string | null
  bus_color: string | null
  waypoints: { lat: number; lng: number; student_id?: string; eta?: string }[]
  total_distance_km: number | null
  total_duration_min: number | null
  optimized_at: string
}

/** A bus, and how many of its children have no stop on the saved route yet. */
export type RouteBus = {
  id: string
  school_id: string
  name: string
  color: string | null
  students: number
  notOnRoute: number
}

export default async function RoutesPage() {
  const supabase = createClient()
  const [routesRes, busesRes, studentsRes] = await Promise.all([
    supabase.rpc('get_routes_with_buses'),
    supabase.from('buses').select('id, school_id, name, color').order('name'),
    supabase.from('students').select('bus_id, stop_order').not('bus_id', 'is', null),
  ])
  for (const { error } of [routesRes, busesRes, studentsRes]) {
    if (error) console.error('Routes page:', error.message)
  }

  const routes: RouteRow[] = (routesRes.data ?? []) as RouteRow[]
  const students = studentsRes.data ?? []
  const buses: RouteBus[] = (busesRes.data ?? []).map(b => {
    const onBus = students.filter(s => s.bus_id === b.id)
    return {
      id: b.id,
      school_id: b.school_id,
      name: b.name,
      color: b.color,
      students: onBus.length,
      notOnRoute: onBus.filter(s => s.stop_order === null).length,
    }
  })

  return <RoutesClient initialRoutes={routes} buses={buses} />
}
