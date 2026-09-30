export type LatLng = { lat: number; lng: number }

/**
 * Reads a PostGIS point as Supabase returns it. REST and Realtime send GEOGRAPHY columns as hex EWKB
 * ("0101000020E6100000…"), not text, so a WKT-only parser never finds the bus. Also accepts WKT and GeoJSON.
 */
export function parsePoint(value: unknown): LatLng | null {
  if (!value) return null
  if (typeof value === 'object') {
    const coords = (value as { coordinates?: unknown }).coordinates
    if (Array.isArray(coords) && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      return { lng: coords[0], lat: coords[1] }
    }
    return null
  }
  if (typeof value !== 'string') return null

  const wkt = value.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i)
  if (wkt?.[1] && wkt[2]) return { lng: Number(wkt[1]), lat: Number(wkt[2]) }

  if (!/^[0-9a-f]+$/i.test(value) || value.length < 42) return null
  const bytes = new Uint8Array(value.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(value.slice(i * 2, i * 2 + 2), 16)
  const view = new DataView(bytes.buffer)
  const little = view.getUint8(0) === 1
  const type = view.getUint32(1, little)
  if ((type & 0xff) !== 1) return null // not a point
  const offset = type & 0x20000000 ? 9 : 5 // skip the SRID when present
  const lng = view.getFloat64(offset, little)
  const lat = view.getFloat64(offset + 8, little)
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

/** Rough minutes for a school bus in city traffic (25 km/h), never less than 1. */
export function etaMinutesBetween(a: LatLng, b: LatLng): number {
  return Math.max(1, Math.round((haversineKm(a, b) / 25) * 60))
}

/** Google encoded polyline (precision 5) to [lng, lat] pairs for Mapbox. */
export function decodePolyline(encoded: string): Array<[number, number]> {
  let index = 0
  let lat = 0
  let lng = 0
  const coordinates: Array<[number, number]> = []
  while (index < encoded.length) {
    let shift = 0
    let result = 0
    let byte: number
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)
    lat += result & 1 ? ~(result >> 1) : result >> 1
    shift = 0
    result = 0
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)
    lng += result & 1 ? ~(result >> 1) : result >> 1
    coordinates.push([lng / 1e5, lat / 1e5])
  }
  return coordinates
}

/** South-west and north-east corners around a set of [lng, lat] pairs, for Mapbox camera bounds. */
export function boundsOf(coordinates: Array<[number, number]>): { sw: [number, number]; ne: [number, number] } | null {
  if (coordinates.length === 0) return null
  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity
  for (const [lng, lat] of coordinates) {
    minLng = Math.min(minLng, lng)
    minLat = Math.min(minLat, lat)
    maxLng = Math.max(maxLng, lng)
    maxLat = Math.max(maxLat, lat)
  }
  return { sw: [minLng, minLat], ne: [maxLng, maxLat] }
}
