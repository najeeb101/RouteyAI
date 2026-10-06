/**
 * Route planning rules for optimize-route (Docs/plans/2026-10-06-two-runs-per-day.md). Plain functions with no imports,
 * so they run in the Edge Function (Deno) and in Node's test runner (routePlan.test.ts).
 *
 * A bus has one stop chain, kept in morning order: the morning run drives it and ends at the school, the afternoon run
 * leaves the school and drives it in reverse. A chain never changes by itself. Small changes slot in without moving
 * anyone else (insertStop, updateChain); a fresh plan (planChain) replaces it only when it is clearly better
 * (isClearlyBetter), and only when a school admin asks for one.
 */

export type LatLng = { lat: number; lng: number }
export type Stop = LatLng & { id: string; address?: string | null }
export type Run = 'morning' | 'afternoon'

export type Waypoint = { student_id: string; lat: number; lng: number; stop_order: number; eta_offset_min: number }

/** Speed for the straight-line fallback when Mapbox times aren't available (the same 30 km/h the optimizer always used). */
export const FALLBACK_KMH = 30

/** Two students closer than this share a stop, and a student who moved less than this keeps their place. */
const SAME_PLACE_KM = 0.05

/** A re-plan must save at least this much to replace the current route (see isClearlyBetter). */
export const KEEP_ROUTE_UNLESS = { minutes: 5, share: 0.1, minutesWithShare: 2 } as const

export function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

/** The run's stops in driving order: the chain as it is for the morning, reversed for the afternoon. */
export function runOrder<T>(chain: readonly T[], run: Run): T[] {
  return run === 'morning' ? [...chain] : [...chain].reverse()
}

/** Every point the bus passes on a run: the stops then the school (morning), or the school then the stops (afternoon). */
export function runPath(chain: readonly LatLng[], school: LatLng, run: Run): LatLng[] {
  const stops = runOrder(chain, run)
  return run === 'morning' ? [...stops, school] : [school, ...stops]
}

/** Straight-line length of a path in km. The same in both directions, so it compares chains fairly for either run. */
export function pathKm(points: readonly LatLng[]): number {
  let km = 0
  for (let i = 1; i < points.length; i += 1) km += haversineKm(points[i - 1]!, points[i]!)
  return km
}

/**
 * A fresh chain for a bus: nearest stop to the school first, then the nearest unvisited stop each time (the order the
 * optimizer has always built), reversed so the morning starts at the far end and finishes at the school.
 */
export function planChain(stops: readonly Stop[], school: LatLng): Stop[] {
  const remaining = [...stops]
  const fromSchool: Stop[] = []
  let at: LatLng = school
  while (remaining.length > 0) {
    let best = 0
    let bestKm = Number.POSITIVE_INFINITY
    remaining.forEach((stop, i) => {
      const km = haversineKm(at, stop)
      if (km < bestKm) {
        bestKm = km
        best = i
      }
    })
    const [next] = remaining.splice(best, 1)
    fromSchool.push(next!)
    at = next!
  }
  return fromSchool.reverse()
}

function samePlace(a: Stop, b: Stop): boolean {
  const norm = (s?: string | null) => (s ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
  return (norm(a.address) !== '' && norm(a.address) === norm(b.address)) || haversineKm(a, b) < SAME_PLACE_KM
}

/**
 * Slot one student into a chain without moving anyone else: next to students at the same place if there are any,
 * otherwise where they add the least driving to the morning path (the afternoon is the same path reversed).
 */
export function insertStop(chain: readonly Stop[], stop: Stop, school: LatLng): Stop[] {
  const lastSamePlace = chain.reduce((found, other, i) => (samePlace(other, stop) ? i : found), -1)
  if (lastSamePlace >= 0) return [...chain.slice(0, lastSamePlace + 1), stop, ...chain.slice(lastSamePlace + 1)]

  let best = chain.length
  let bestKm = Number.POSITIVE_INFINITY
  for (let i = 0; i <= chain.length; i += 1) {
    const prev = i > 0 ? chain[i - 1]! : null
    const next = i < chain.length ? chain[i]! : school
    // Before the first stop the morning path just starts earlier; anywhere else the stop is a detour between two points.
    const added = prev ? haversineKm(prev, stop) + haversineKm(stop, next) - haversineKm(prev, next) : haversineKm(stop, next)
    if (added < bestKm) {
      bestKm = added
      best = i
    }
  }
  return [...chain.slice(0, best), stop, ...chain.slice(best)]
}

export type ChainUpdate = { chain: Stop[]; added: string[]; removed: string[]; moved: string[] }

/**
 * Bring a saved chain up to date with the students on the bus now. Students who left are dropped, students who joined
 * or moved house are slotted in one by one, and everyone else keeps their order. With no changes the chain comes back
 * exactly as it was.
 *
 * @param savedOrder student ids in the saved morning order
 * @param plannedAt where each student lived when the chain was saved (the route's waypoints)
 * @param current the students on the bus now, with their current homes
 */
export function updateChain(savedOrder: readonly string[], plannedAt: ReadonlyMap<string, LatLng>, current: readonly Stop[], school: LatLng): ChainUpdate {
  const now = new Map(current.map((s) => [s.id, s]))
  const saved = new Set(savedOrder)
  const removed = savedOrder.filter((id) => !now.has(id))
  const moved = savedOrder.filter((id) => {
    const before = plannedAt.get(id)
    const after = now.get(id)
    return before !== undefined && after !== undefined && haversineKm(before, after) >= SAME_PLACE_KM
  })
  const movedSet = new Set(moved)

  let chain = savedOrder.filter((id) => now.has(id) && !movedSet.has(id)).map((id) => now.get(id)!)
  const added = current.filter((s) => !saved.has(s.id)).map((s) => s.id)
  for (const id of [...moved, ...added]) chain = insertStop(chain, now.get(id)!, school)
  return { chain, added, removed, moved }
}

/**
 * Whether a fresh plan should replace the current route. Drivers learn their route, so it changes only for a real
 * saving: at least 5 minutes a run, or at least 10% and 2 minutes.
 */
export function isClearlyBetter(currentMinutes: number, proposedMinutes: number): boolean {
  const saved = currentMinutes - proposedMinutes
  if (saved <= 0) return false
  if (saved >= KEEP_ROUTE_UNLESS.minutes) return true
  return currentMinutes > 0 && saved / currentMinutes >= KEEP_ROUTE_UNLESS.share && saved >= KEEP_ROUTE_UNLESS.minutesWithShare
}

/** How many students would be at a different place in the order, to show the admin what a re-plan changes. */
export function studentsMoved(currentOrder: readonly string[], proposedOrder: readonly string[]): number {
  const index = new Map(currentOrder.map((id, i) => [id, i]))
  return proposedOrder.filter((id, i) => index.get(id) !== i).length
}

/** Minutes for a distance at the fallback speed. */
export function fallbackMinutes(km: number): number {
  return (km / FALLBACK_KMH) * 60
}

/**
 * The saved stops of one run, in driving order, with minutes from the start of the run (the first pickup in the
 * morning, leaving school in the afternoon).
 *
 * @param legSeconds Mapbox's time for each leg of runPath (one fewer than its points). Without it, or if the count
 *   doesn't match, straight lines at FALLBACK_KMH.
 */
export function runWaypoints(chain: readonly Stop[], school: LatLng, run: Run, legSeconds?: readonly number[]): Waypoint[] {
  const path = runPath(chain, school, run)
  const legs = legSeconds && legSeconds.length === path.length - 1
    ? legSeconds.map((s) => s / 60)
    : path.slice(1).map((p, i) => fallbackMinutes(haversineKm(path[i]!, p)))

  const stops = runOrder(chain, run)
  const firstStop = run === 'morning' ? 0 : 1
  return stops.map((stop, i) => {
    const minutes = legs.slice(0, firstStop + i).reduce((sum, m) => sum + m, 0)
    return { student_id: stop.id, lat: stop.lat, lng: stop.lng, stop_order: i + 1, eta_offset_min: Math.round(minutes) }
  })
}
