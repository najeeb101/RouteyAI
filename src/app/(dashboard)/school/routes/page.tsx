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

export default async function RoutesPage() {
  const supabase = createClient()
  const { data } = await supabase.rpc('get_routes_with_buses')

  const routes: RouteRow[] = (data ?? []) as RouteRow[]

  return <RoutesClient initialRoutes={routes} />
}
