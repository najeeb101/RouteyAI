/**
 * Driving times and the map line for one run's path, from Mapbox Directions, with straight lines at FALLBACK_KMH when
 * Mapbox isn't available. Each direction is asked for separately because Doha's one-way streets and divided roads
 * mean the way back isn't the way out drawn backwards. The fetch is passed in so tests can use a fake Mapbox.
 */
import { fallbackMinutes, haversineKm, type LatLng } from './routePlan.ts'
import { chunkPath, decodePolyline, dedupeConsecutive, encodePolyline, expandLegs, joinLines } from './routeGeometry.ts'

export type RunGeometry = {
  distanceKm: number
  durationMin: number
  /** Seconds for each leg of the path (one fewer than its points). */
  legSeconds: number[]
  /** The road line, or null for straight lines (the apps then draw stop to stop). */
  encodedPolyline: string | null
  source: 'mapbox' | 'straight'
}

/** Works out a run's geometry for a path of points in driving order. */
export type Directions = (path: readonly LatLng[]) => Promise<RunGeometry>

type Fetch = (url: string) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>

type MapboxRoute = { distance?: number; duration?: number; geometry?: unknown; legs?: { duration?: number }[] }

const round2 = (n: number) => Math.round(n * 100) / 100

export function straightLine(path: readonly LatLng[]): RunGeometry {
  const legKm = path.slice(1).map((p, i) => haversineKm(path[i]!, p))
  const km = legKm.reduce((sum, k) => sum + k, 0)
  return {
    distanceKm: round2(km),
    durationMin: Math.round(fallbackMinutes(km)),
    legSeconds: legKm.map((k) => fallbackMinutes(k) * 60),
    encodedPolyline: null,
    source: 'straight',
  }
}

export function mapboxDirections(token: string | null, fetchFn: Fetch = fetch): Directions {
  return async (path) => {
    if (!token) return straightLine(path)
    const { points, index } = dedupeConsecutive(path)
    if (points.length < 2) return straightLine(path)

    let distanceM = 0
    let durationS = 0
    const legs: number[] = []
    const lines: LatLng[][] = []
    for (const chunk of chunkPath(points)) {
      const coords = chunk.map((p) => `${p.lng},${p.lat}`).join(';')
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?overview=full&geometries=polyline&steps=false&access_token=${token}`
      try {
        const res = await fetchFn(url)
        if (!res.ok) throw new Error(`Mapbox Directions ${res.status}`)
        const route = ((await res.json()) as { routes?: MapboxRoute[] })?.routes?.[0]
        const chunkLegs = route?.legs?.map((l) => l.duration)
        if (
          route?.distance == null || route.duration == null || typeof route.geometry !== 'string' ||
          !chunkLegs || chunkLegs.length !== chunk.length - 1 || chunkLegs.some((d) => typeof d !== 'number')
        ) {
          throw new Error('Mapbox Directions returned no usable route')
        }
        distanceM += route.distance
        durationS += route.duration
        legs.push(...(chunkLegs as number[]))
        lines.push(decodePolyline(route.geometry))
      } catch (err) {
        // One failed piece would leave a gap in the line, so the whole run falls back to straight lines.
        console.warn('optimize-route: straight lines instead of Mapbox:', err instanceof Error ? err.message : err)
        return straightLine(path)
      }
    }

    return {
      distanceKm: round2(distanceM / 1000),
      durationMin: Math.round(durationS / 60),
      legSeconds: expandLegs(index, legs),
      encodedPolyline: encodePolyline(joinLines(lines)),
      source: 'mapbox',
    }
  }
}
