import { createClient } from '@/lib/supabase/server'
import { qatarDateKey, type BusRunsToday } from '@/lib/runs'
import BusesTable, { type BusRow } from './BusesTable'

export default async function BusesPage() {
  const supabase = createClient()
  const [busesRes, runsRes] = await Promise.all([
    supabase.rpc('get_buses_with_drivers'),
    supabase.from('bus_runs').select('bus_id, run, started_at, ended_at').eq('date', qatarDateKey()),
  ])
  for (const { error } of [busesRes, runsRes]) {
    if (error) console.error('Fleet page:', error.message)
  }
  const runsByBus: Record<string, BusRunsToday> = {}
  for (const r of runsRes.data ?? []) {
    runsByBus[r.bus_id] = { ...runsByBus[r.bus_id], [r.run]: { startedAt: r.started_at, endedAt: r.ended_at } }
  }
  return <BusesTable initialBuses={(busesRes.data ?? []) as BusRow[]} runsByBus={runsByBus} />
}
