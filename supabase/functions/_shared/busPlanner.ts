/**
 * Plans one bus for optimize-route (Docs/Claude.md §1.2): what the database holds for the bus in,
 * what to save (or propose) out. No database access, and Mapbox comes in as a Directions function, so the tests
 * (busPlanner.test.ts) drive it with a fake one.
 *
 * - planUpdate keeps the bus's order: leavers drop out, newcomers and movers slot in, nothing else moves. A bus with no
 *   changes is left alone.
 * - proposeOptimize compares today's route with a fresh plan and saves nothing.
 * - checkApply decides whether the order an admin accepted may replace the route.
 */
import {
  fallbackMinutes,
  isClearlyBetter,
  pathKm,
  planChain,
  runPath,
  runWaypoints,
  studentsMoved,
  updateChain,
  type LatLng,
  type Run,
  type Stop,
  type Waypoint,
} from './routePlan.ts'
import type { Directions } from './directions.ts'

export type BusState = {
  busId: string
  school: LatLng
  /** The students on the bus now, with their current homes. */
  students: Stop[]
  /** Students with a place in the chain (students.stop_order), in morning order. */
  savedOrder: string[]
  /** The students on the saved morning route, in its order (it still lists anyone who left since). */
  routeStudents: string[]
  /** Where each student on the saved morning route lived when it was saved. */
  plannedAt: Map<string, LatLng>
  /** Both runs saved by this planner. A bus planned before two runs a day has only its old morning row. */
  hasBothRuns: boolean
}

/** One run as save_route_plan stores it. */
export type RunPlan = { waypoints: Waypoint[]; total_distance_km: number; total_duration_min: number; encoded_polyline: string | null }

export type MeasuredChain = { chain: Stop[]; morning: RunPlan; afternoon: RunPlan; minutesPerRun: number }

/** "Re-optimizing would save about N minutes a run", shown to the school admin and never applied. */
export type Suggestion = { minutes_saved: number; students_moved: number; checked_at: string }

export type UpdatePlan =
  | { save: false }
  | {
    save: true
    chain: Stop[]
    added: string[]
    removed: string[]
    moved: string[]
    /** The old order was flipped so the morning ends at the school (decision 0, once per bus). */
    reversed: boolean
    measured: MeasuredChain
    suggestion: Suggestion | null
  }

export type Proposal = {
  current: MeasuredChain
  proposed: MeasuredChain
  /** Average of the two runs; negative when the fresh plan is slower. */
  minutesSaved: number
  studentsMoved: number
  clearlyBetter: boolean
}

export type ApplyCheck = { ok: true; proposal: Proposal } | { ok: false; reason: 'stale' } | { ok: false; reason: 'not_better'; proposal: Proposal }

const ids = (stops: readonly { id: string }[]) => stops.map((s) => s.id)
const sameOrder = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((id, i) => id === b[i])

/** Both runs of a chain: each direction's geometry, and the stops in driving order with their minutes. */
export async function measureChain(chain: readonly Stop[], school: LatLng, directions: Directions): Promise<MeasuredChain> {
  const runs = {} as Record<Run, RunPlan>
  let minutes = 0
  for (const run of ['morning', 'afternoon'] as const) {
    const geo = await directions(runPath(chain, school, run))
    minutes += geo.legSeconds.reduce((sum, s) => sum + s, 0) / 60
    runs[run] = {
      waypoints: runWaypoints(chain, school, run, geo.legSeconds),
      total_distance_km: geo.distanceKm,
      total_duration_min: geo.durationMin,
      encoded_polyline: geo.encodedPolyline,
    }
  }
  return { chain: [...chain], morning: runs.morning, afternoon: runs.afternoon, minutesPerRun: minutes / 2 }
}

/** Straight-line minutes for one run of a chain (the same both ways), for estimates that shouldn't cost Mapbox calls. */
export function straightMinutesPerRun(chain: readonly LatLng[], school: LatLng): number {
  return fallbackMinutes(pathKm(runPath(chain, school, 'morning')))
}

/** A quick straight-line check of a fresh plan, for the hint. Null unless the fresh plan would be clearly better. */
export function suggestionFor(chain: readonly Stop[], school: LatLng, now: Date): Suggestion | null {
  if (chain.length < 2) return null
  const fresh = planChain(chain, school)
  // Straight lines measure the same both ways, so one run stands for both.
  const current = straightMinutesPerRun(chain, school)
  const proposed = straightMinutesPerRun(fresh, school)
  if (!isClearlyBetter(current, proposed)) return null
  return { minutes_saved: Math.round(current - proposed), students_moved: studentsMoved(ids(chain), ids(fresh)), checked_at: now.toISOString() }
}

/** The chain as it stands today: the saved order with leavers dropped and newcomers and movers slotted in. */
export function currentChain(bus: BusState, savedOrder = bus.savedOrder) {
  return updateChain(savedOrder, bus.plannedAt, bus.students, bus.school)
}

/**
 * Brings the bus's route up to date without reordering it. `reverse` flips the old order first so the morning ends at
 * the school; it only applies to a bus that has never had both runs saved, so running it twice changes nothing.
 */
export async function planUpdate(bus: BusState, directions: Directions, opts: { reverse?: boolean; now?: Date } = {}): Promise<UpdatePlan> {
  const reversed = Boolean(opts.reverse) && !bus.hasBothRuns && bus.savedOrder.length > 1
  const result = currentChain(bus, reversed ? [...bus.savedOrder].reverse() : bus.savedOrder)
  const onRoute = new Set(bus.routeStudents)
  const onBus = new Set(bus.students.map((s) => s.id))
  // A student who was on this route but lost their place had their address changed, so they moved; anyone else
  // without a place joined the bus.
  const moved = [...result.moved, ...result.added.filter((id) => onRoute.has(id))]
  const added = result.added.filter((id) => !onRoute.has(id))
  const removed = bus.routeStudents.filter((id) => !onBus.has(id))

  if (!reversed && bus.hasBothRuns && moved.length === 0 && sameOrder(bus.routeStudents, ids(result.chain))) {
    return { save: false }
  }
  const measured = await measureChain(result.chain, bus.school, directions)
  return { save: true, chain: result.chain, added, removed, moved, reversed, measured, suggestion: suggestionFor(result.chain, bus.school, opts.now ?? new Date()) }
}

async function compare(current: readonly Stop[], proposed: readonly Stop[], school: LatLng, directions: Directions): Promise<Proposal> {
  const cur = await measureChain(current, school, directions)
  const prop = sameOrder(ids(current), ids(proposed)) ? cur : await measureChain(proposed, school, directions)
  return {
    current: cur,
    proposed: prop,
    minutesSaved: cur.minutesPerRun - prop.minutesPerRun,
    studentsMoved: studentsMoved(ids(current), ids(proposed)),
    clearlyBetter: isClearlyBetter(cur.minutesPerRun, prop.minutesPerRun),
  }
}

/** Today's route against a fresh plan, with real driving times for both runs. Saves nothing. */
export function proposeOptimize(bus: BusState, directions: Directions): Promise<Proposal> {
  return compare(currentChain(bus).chain, planChain(bus.students, bus.school), bus.school, directions)
}

/**
 * Whether the order an admin accepted may replace the route: it must list exactly the students on the bus now (else
 * the proposal is out of date) and still be clearly better than today's route.
 */
export async function checkApply(bus: BusState, chainIds: readonly string[], directions: Directions): Promise<ApplyCheck> {
  const byId = new Map(bus.students.map((s) => [s.id, s]))
  if (chainIds.length !== byId.size || new Set(chainIds).size !== chainIds.length || chainIds.some((id) => !byId.has(id))) {
    return { ok: false, reason: 'stale' }
  }
  const proposal = await compare(currentChain(bus).chain, chainIds.map((id) => byId.get(id)!), bus.school, directions)
  return proposal.clearlyBetter ? { ok: true, proposal } : { ok: false, reason: 'not_better', proposal }
}

/** A bus planned from scratch, after "Optimize all" changed who rides it. */
export function planFresh(bus: BusState, directions: Directions): Promise<MeasuredChain> {
  return measureChain(planChain(bus.students, bus.school), bus.school, directions)
}
