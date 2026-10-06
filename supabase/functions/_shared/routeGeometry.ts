/**
 * Map line helpers for optimize-route: Google's encoded polyline format (precision 5, what Mapbox Directions returns
 * and the apps decode), joining lines, and splitting a long path into the pieces Mapbox accepts. Plain functions, so
 * they run in the Edge Function and in Node's test runner (routeGeometry.test.ts).
 */
import { haversineKm, type LatLng } from './routePlan.ts'

/** Mapbox Directions takes at most 25 points per request. */
export const MAX_POINTS_PER_REQUEST = 25

/** Points closer than this are the same place on the map (siblings at one address), sent to Mapbox once. */
const SAME_SPOT_KM = 0.01

export function decodePolyline(encoded: string, precision = 5): LatLng[] {
  const factor = 10 ** precision
  const points: LatLng[] = []
  let index = 0
  let lat = 0
  let lng = 0
  while (index < encoded.length) {
    for (const axis of ['lat', 'lng'] as const) {
      let result = 0
      let shift = 0
      let byte: number
      do {
        byte = encoded.charCodeAt(index++) - 63
        result |= (byte & 0x1f) << shift
        shift += 5
      } while (byte >= 0x20)
      const delta = result & 1 ? ~(result >> 1) : result >> 1
      if (axis === 'lat') lat += delta
      else lng += delta
    }
    points.push({ lat: lat / factor, lng: lng / factor })
  }
  return points
}

export function encodePolyline(points: readonly LatLng[], precision = 5): string {
  const factor = 10 ** precision
  let out = ''
  let prevLat = 0
  let prevLng = 0
  const encodeValue = (value: number) => {
    let v = value < 0 ? ~(value << 1) : value << 1
    while (v >= 0x20) {
      out += String.fromCharCode((0x20 | (v & 0x1f)) + 63)
      v >>= 5
    }
    out += String.fromCharCode(v + 63)
  }
  for (const p of points) {
    const lat = Math.round(p.lat * factor)
    const lng = Math.round(p.lng * factor)
    encodeValue(lat - prevLat)
    encodeValue(lng - prevLng)
    prevLat = lat
    prevLng = lng
  }
  return out
}

/** Joins lines drawn one after another, dropping the point where each one starts (the previous one's last point). */
export function joinLines(lines: readonly (readonly LatLng[])[]): LatLng[] {
  const joined: LatLng[] = []
  for (const line of lines) {
    const skipFirst = joined.length > 0 && line.length > 0 && haversineKm(joined[joined.length - 1]!, line[0]!) < SAME_SPOT_KM
    joined.push(...(skipFirst ? line.slice(1) : line))
  }
  return joined
}

/**
 * Splits a path into pieces of at most `max` points that overlap by one point (each piece starts where the last one
 * ended), so the pieces' legs add up to exactly the path's legs.
 */
export function chunkPath<T>(points: readonly T[], max = MAX_POINTS_PER_REQUEST): T[][] {
  if (points.length <= max) return [[...points]]
  const chunks: T[][] = []
  for (let start = 0; start < points.length - 1; start += max - 1) {
    chunks.push(points.slice(start, start + max))
  }
  return chunks
}

/**
 * Merges points that follow each other at the same spot. Returns the remaining points and, for every original point,
 * the index of the point it became.
 */
export function dedupeConsecutive(points: readonly LatLng[]): { points: LatLng[]; index: number[] } {
  const unique: LatLng[] = []
  const index: number[] = []
  for (const p of points) {
    const last = unique[unique.length - 1]
    if (!last || haversineKm(last, p) >= SAME_SPOT_KM) unique.push(p)
    index.push(unique.length - 1)
  }
  return { points: unique, index }
}

/** Spreads the legs between merged points back over the original path: 0 between points at the same spot. */
export function expandLegs(index: readonly number[], uniqueLegs: readonly number[]): number[] {
  return index.slice(1).map((to, i) => (to === index[i] ? 0 : uniqueLegs[to - 1] ?? 0))
}
