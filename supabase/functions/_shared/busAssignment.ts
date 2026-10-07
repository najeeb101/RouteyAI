/**
 * Which bus each student of a school would ride (K-means clusters, then the nearest cluster with a free seat). Used
 * only for the "Optimize all" proposal, which the school admin confirms before anything is saved. Moved from
 * optimize-route/index.ts; each bus's cluster now starts from where its current students live, so cluster i stays bus
 * i and the proposal only moves students who would be better off on another bus.
 */

export type AssignStudent = { id: string; lat: number; lng: number }
export type AssignBus = { id: string; capacity: number }
type ClusterCenter = { lat: number; lng: number }

function euclideanSq(aLat: number, aLng: number, bLat: number, bLng: number) {
  const dLat = aLat - bLat
  const dLng = aLng - bLng
  return dLat * dLat + dLng * dLng
}

function runKMeans(students: readonly AssignStudent[], start: ClusterCenter[], maxIter = 20): ClusterCenter[] {
  const centers = [...start]
  const k = centers.length

  for (let iter = 0; iter < maxIter; iter += 1) {
    const buckets: AssignStudent[][] = Array.from({ length: k }, () => [])
    for (const s of students) {
      let best = 0
      let bestD = Number.POSITIVE_INFINITY
      for (let i = 0; i < k; i += 1) {
        const c = centers[i]!
        const d = euclideanSq(s.lat, s.lng, c.lat, c.lng)
        if (d < bestD) {
          bestD = d
          best = i
        }
      }
      buckets[best]!.push(s)
    }

    let moved = false
    for (let i = 0; i < k; i += 1) {
      const bucket = buckets[i]!
      if (bucket.length === 0) continue
      const lat = bucket.reduce((sum, s) => sum + s.lat, 0) / bucket.length
      const lng = bucket.reduce((sum, s) => sum + s.lng, 0) / bucket.length
      const prev = centers[i]!
      if (Math.abs(prev.lat - lat) > 1e-7 || Math.abs(prev.lng - lng) > 1e-7) {
        moved = true
      }
      centers[i] = { lat, lng }
    }
    if (!moved) break
  }

  return centers
}

/** Where each bus's cluster starts: the middle of its current students, or a student nobody's bus is near yet. */
function startingCenters(students: readonly AssignStudent[], buses: readonly AssignBus[], current: ReadonlyMap<string, string>): ClusterCenter[] {
  const centers: (ClusterCenter | null)[] = buses.map((b) => {
    const riders = students.filter((s) => current.get(s.id) === b.id)
    if (riders.length === 0) return null
    return { lat: riders.reduce((sum, s) => sum + s.lat, 0) / riders.length, lng: riders.reduce((sum, s) => sum + s.lng, 0) / riders.length }
  })
  // An empty bus starts at the student farthest from every other bus's centre.
  for (let i = 0; i < centers.length; i += 1) {
    if (centers[i]) continue
    const placed = centers.filter((c): c is ClusterCenter => c !== null)
    let best = students[0]!
    let bestD = -1
    for (const s of students) {
      const d = placed.length === 0 ? 0 : Math.min(...placed.map((c) => euclideanSq(s.lat, s.lng, c.lat, c.lng)))
      if (d > bestD) {
        bestD = d
        best = s
      }
    }
    centers[i] = { lat: best.lat, lng: best.lng }
  }
  return centers as ClusterCenter[]
}

/**
 * Student id → bus id for every student, keeping each bus within its capacity where the seats allow.
 * @param current each student's bus today, so clusters line up with the buses they started from
 */
export function assignBuses(students: readonly AssignStudent[], buses: readonly AssignBus[], current: ReadonlyMap<string, string> = new Map()): Map<string, string> {
  const assignments = new Map<string, string>()
  if (buses.length === 0 || students.length === 0) return assignments
  const centers = runKMeans(students, startingCenters(students, buses, current))
  const remaining = new Map<string, number>()
  for (const b of buses) remaining.set(b.id, Math.max(0, b.capacity))

  for (const s of students) {
    const ranked = buses
      .map((b, idx) => ({
        busId: b.id,
        dist: euclideanSq(s.lat, s.lng, centers[idx]!.lat, centers[idx]!.lng),
      }))
      .sort((a, b) => a.dist - b.dist)

    let picked: string | null = null
    for (const r of ranked) {
      const slots = remaining.get(r.busId) ?? 0
      if (slots > 0) {
        picked = r.busId
        break
      }
    }

    if (!picked) {
      picked = buses
        .map((b) => ({ id: b.id, slots: remaining.get(b.id) ?? 0 }))
        .sort((a, b) => b.slots - a.slots)[0]?.id ?? buses[0]!.id
    }

    assignments.set(s.id, picked)
    remaining.set(picked, (remaining.get(picked) ?? 0) - 1)
  }

  return assignments
}
