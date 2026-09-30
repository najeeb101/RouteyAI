/**
 * Deterministic sample data for the landing-page optimize demo: seeded "home addresses",
 * a real K-Means run (Lloyd's algorithm) with its per-iteration history, and nearest-neighbor
 * stop ordering per cluster. Computed once at module load, identical on server and client.
 */

export interface Point {
  x: number
  y: number
}

export const SCHOOL: Point = { x: 290, y: 205 }
export const CLUSTER_COUNT = 3

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const round = (n: number) => Math.round(n * 10) / 10
const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)

function makeHomes(): Point[] {
  const rand = mulberry32(11)
  const areas = [
    { x: 110, y: 95 },
    { x: 440, y: 105 },
    { x: 400, y: 315 },
  ] as const
  const homes: Point[] = []
  for (let i = 0; i < 27; i++) {
    const area = areas[i % areas.length] ?? areas[0]
    // Sum of two uniforms ≈ a soft bell curve around each neighborhood.
    homes.push({
      x: round(area.x + (rand() + rand() - 1) * 85),
      y: round(area.y + (rand() + rand() - 1) * 65),
    })
  }
  return homes
}

function kMeans(points: Point[], initial: Point[], maxIterations = 6) {
  const history: { centroids: Point[]; assignment: number[] }[] = []
  let centroids = initial
  for (let iter = 0; iter < maxIterations; iter++) {
    const assignment = points.map(p => {
      const distances = centroids.map(c => dist(p, c))
      return distances.indexOf(Math.min(...distances))
    })
    history.push({ centroids, assignment })
    const next = centroids.map((c, k) => {
      const members = points.filter((_, i) => assignment[i] === k)
      if (members.length === 0) return c
      return {
        x: round(members.reduce((s, p) => s + p.x, 0) / members.length),
        y: round(members.reduce((s, p) => s + p.y, 0) / members.length),
      }
    })
    const previous = centroids
    const settled = next.every((c, k) => {
      const prev = previous[k]
      return prev !== undefined && dist(c, prev) < 0.5
    })
    centroids = next
    if (settled) break
  }
  const final = history[history.length - 1]
  if (!final) throw new Error('kMeans needs at least one iteration')
  return { history, final }
}

/** Nearest-neighbor tour: start at the home farthest from school, always hop to the closest unvisited home. */
function orderStops(points: Point[]): Point[] {
  const remaining = [...points].sort((a, b) => dist(b, SCHOOL) - dist(a, SCHOOL))
  const tour: Point[] = []
  let current = remaining.shift()
  while (current) {
    tour.push(current)
    const from = current
    remaining.sort((a, b) => dist(from, a) - dist(from, b))
    current = remaining.shift()
  }
  return tour
}

export const HOMES = makeHomes()

// Deliberately poor starting centroids, so the demo shows them moving into place.
const run = kMeans(HOMES, [
  { x: 250, y: 60 },
  { x: 270, y: 190 },
  { x: 250, y: 330 },
])

export const KMEANS_HISTORY = run.history
export const FINAL_SNAPSHOT = run.final
export const FINAL_ASSIGNMENT = run.final.assignment

export const ROUTE_PATHS = Array.from({ length: CLUSTER_COUNT }, (_, k) => {
  const stops = orderStops(HOMES.filter((_, i) => FINAL_ASSIGNMENT[i] === k))
  return [...stops, SCHOOL].map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
})
