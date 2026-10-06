import { FunctionsHttpError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { BusProposal, SchoolProposal, UpdatedBus } from './plannerText'

export type PlannerResult<T> = { ok: true; data: T } | { ok: false; status: number | null; message: string }

/** Calls the optimize-route Edge Function from the browser and reads its error message when it refuses. */
async function callPlanner<T>(body: Record<string, unknown>): Promise<PlannerResult<T>> {
  const { data, error } = await createClient().functions.invoke('optimize-route', { body })
  if (!error) return { ok: true, data: data as T }
  if (error instanceof FunctionsHttpError) {
    const res = error.context as Response
    const json = (await res.json().catch(() => null)) as { error?: string } | null
    return { ok: false, status: res.status, message: json?.error ?? error.message }
  }
  return { ok: false, status: null, message: error.message }
}

/**
 * Keeps each bus's order and slots changes in: children who joined or moved house get the stop where they add the
 * least driving, children who left drop out. Buses with nothing to change are left alone.
 */
export async function updateBuses(busIds: readonly string[]): Promise<PlannerResult<UpdatedBus[]>> {
  const buses: UpdatedBus[] = []
  for (const busId of new Set(busIds)) {
    const res = await callPlanner<{ buses: UpdatedBus[] }>({ action: 'update', bus_id: busId })
    if (!res.ok) return res
    buses.push(...res.data.buses)
  }
  return { ok: true, data: buses }
}

/** A fresh plan for one bus, compared with its route. Saves nothing. */
export function proposeBus(busId: string) {
  return callPlanner<BusProposal>({ action: 'optimize', bus_id: busId })
}

/** Saves a proposed order the admin accepted; refused if it is no longer clearly better or the bus changed. */
export function applyBus(busId: string, chain: readonly string[]) {
  return callPlanner<{ plan_version: number }>({ action: 'optimize', bus_id: busId, apply: true, chain })
}

/** Which students would change bus if the school were planned afresh. Saves nothing. */
export function proposeSchool(schoolId: string) {
  return callPlanner<SchoolProposal>({ action: 'optimize', school_id: schoolId })
}

/** Moves the proposed students and plans each bus that changed from scratch; the other buses keep their routes. */
export function applySchool(schoolId: string, assignments: SchoolProposal['assignments']) {
  return callPlanner<{ moved: number }>({ action: 'optimize', school_id: schoolId, apply: true, assignments })
}
