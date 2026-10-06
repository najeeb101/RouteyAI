/** Map helpers for the web dashboard, the same as the mobile app's (mobile/src/lib/geo.ts). */

export type LatLng = { lat: number; lng: number }

/**
 * Reads a PostGIS point as Supabase returns it. REST and Realtime send GEOGRAPHY columns as hex EWKB
 * ("0101000020E6100000…"), not text. Also accepts WKT and GeoJSON.
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
