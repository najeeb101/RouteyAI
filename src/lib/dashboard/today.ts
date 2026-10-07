import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Run } from '@/types/database'
import { decodePolyline, parsePoint, type LatLng } from '@/lib/geo'
import { qatarDateKey, type BusRunsToday, type DayMark, type ReportRuns } from '@/lib/runs'

/** Read by Server Components and by the browser alike (both clients are typed with Database). */
type Client = SupabaseClient<Database>

/** A bus's last GPS point today. */
export type BusPosition = { lat: number; lng: number; at: string }

/** Where the school's day stands: runs, check-ins, absence reports and bus positions. Plain data, so it can cross from server to client. */
export type FleetToday = {
  date: string
  runsByBus: Record<string, BusRunsToday>
  marks: DayMark[]
  reports: { studentId: string; runs: ReportRuns }[]
  positions: Record<string, BusPosition>
}

/** Today's runs, check-ins, absence reports and each bus's latest GPS point, for the school the admin belongs to (RLS). */
export async function loadFleetToday(supabase: Client, busIds: readonly string[], now: Date = new Date()): Promise<FleetToday> {
  const date = qatarDateKey(now)
  const [runsRes, marksRes, reportsRes, locRes] = await Promise.all([
    supabase.from('bus_runs').select('bus_id, run, started_at, ended_at').eq('date', date),
    supabase.from('attendance').select('student_id, bus_id, run, status').eq('date', date),
    supabase.from('absence_reports').select('student_id, runs').eq('date', date),
    busIds.length
      ? supabase
          .from('bus_locations')
          .select('bus_id, location, timestamp')
          .in('bus_id', [...busIds])
          .gte('timestamp', `${date}T00:00:00+03:00`)
          .order('timestamp', { ascending: false })
          .limit(Math.max(50, busIds.length * 10))
      : Promise.resolve({ data: [], error: null }),
  ])
  for (const { error } of [runsRes, marksRes, reportsRes, locRes]) {
    if (error) console.error('Fleet today:', error.message)
  }

  const runsByBus: Record<string, BusRunsToday> = {}
  for (const r of runsRes.data ?? []) {
    runsByBus[r.bus_id] = { ...runsByBus[r.bus_id], [r.run]: { startedAt: r.started_at, endedAt: r.ended_at } }
  }

  const positions: Record<string, BusPosition> = {}
  for (const row of (locRes.data ?? []) as { bus_id: string; location: unknown; timestamp: string }[]) {
    if (positions[row.bus_id]) continue
    const point = parsePoint(row.location)
    if (point) positions[row.bus_id] = { ...point, at: row.timestamp }
  }

  return {
    date,
    runsByBus,
    marks: (marksRes.data ?? [])
      .filter((m) => m.student_id && m.status)
      .map((m) => ({ studentId: m.student_id!, busId: m.bus_id, run: m.run, status: m.status! })),
    reports: (reportsRes.data ?? []).map((r) => ({ studentId: r.student_id, runs: r.runs })),
    positions,
  }
}

/** One run of a bus's saved route, as the dashboard draws and describes it. */
export type BusRoute = {
  busId: string
  run: Run
  planVersion: number
  stops: { studentId: string; lat: number; lng: number; order: number; etaMin: number | null }[]
  /** The road line from Mapbox, or straight lines between the stops and the school when there is none. */
  coords: Array<[number, number]>
  km: number | null
  minutes: number | null
  /** "Re-optimizing would save about N minutes a run", worked out by the planner. */
  suggestion: { minutesSaved: number; studentsMoved: number } | null
  optimizedAt: string
}

/** Every saved route of the school, both runs per bus. */
export async function loadRoutes(supabase: Client, school: LatLng | null): Promise<BusRoute[]> {
  const { data, error } = await supabase
    .from('routes')
    .select('bus_id, run, plan_version, waypoints, encoded_polyline, total_distance_km, total_duration_min, suggestion, optimized_at')
  if (error) {
    console.error('Routes:', error.message)
    return []
  }
  return (data ?? []).map((r) => {
    const stops = (Array.isArray(r.waypoints) ? r.waypoints : [])
      .filter((w) => typeof w?.lat === 'number' && typeof w?.lng === 'number' && typeof w?.student_id === 'string')
      .map((w) => ({ studentId: w.student_id, lat: w.lat, lng: w.lng, order: Number(w.stop_order) || 0, etaMin: typeof w.eta_offset_min === 'number' ? w.eta_offset_min : null }))
      .sort((a, b) => a.order - b.order)
    const straight: Array<[number, number]> = stops.map((s) => [s.lng, s.lat])
    if (school) {
      if (r.run === 'morning') straight.push([school.lng, school.lat])
      else straight.unshift([school.lng, school.lat])
    }
    const s = r.suggestion as { minutes_saved?: unknown; students_moved?: unknown } | null
    return {
      busId: r.bus_id,
      run: r.run,
      planVersion: r.plan_version,
      stops,
      coords: r.encoded_polyline ? decodePolyline(r.encoded_polyline) : straight,
      km: r.total_distance_km === null ? null : Number(r.total_distance_km),
      minutes: r.total_duration_min === null ? null : Number(r.total_duration_min),
      suggestion: s && typeof s.minutes_saved === 'number' ? { minutesSaved: s.minutes_saved, studentsMoved: Number(s.students_moved) || 0 } : null,
      optimizedAt: r.optimized_at,
    }
  })
}

/** The school's own location (its starting point), for the map. */
export async function loadSchoolPoint(supabase: Client): Promise<LatLng | null> {
  const { data, error } = await supabase.from('schools').select('starting_point').limit(1).maybeSingle()
  if (error) console.error('School point:', error.message)
  return parsePoint((data as { starting_point?: unknown } | null)?.starting_point)
}
