// Tests for the map line helpers and the Mapbox Directions requests. Run from the repo root: pnpm test:logic
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { chunkPath, decodePolyline, dedupeConsecutive, encodePolyline, expandLegs, joinLines } from './routeGeometry.ts'
import { mapboxDirections, straightLine } from './directions.ts'
import { haversineKm, type LatLng } from './routePlan.ts'

const near = (a: LatLng, b: LatLng) => haversineKm(a, b) < 0.001

test('polyline encoding matches the published example and decodes back', () => {
  // Google's documented example.
  const points = [{ lat: 38.5, lng: -120.2 }, { lat: 40.7, lng: -120.95 }, { lat: 43.252, lng: -126.453 }]
  assert.equal(encodePolyline(points), '_p~iF~ps|U_ulLnnqC_mqNvxq`@')
  assert.deepEqual(decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@'), points)
})

test('Doha coordinates survive a round trip at 5 decimals', () => {
  const points = [{ lat: 25.28541, lng: 51.53104 }, { lat: 25.31122, lng: 51.48877 }, { lat: 25.26, lng: 51.45 }]
  assert.deepEqual(decodePolyline(encodePolyline(points)), points)
})

test('joined lines keep one copy of each meeting point', () => {
  const a = [{ lat: 25, lng: 51 }, { lat: 25.1, lng: 51.1 }]
  const b = [{ lat: 25.1, lng: 51.1 }, { lat: 25.2, lng: 51.2 }]
  assert.deepEqual(joinLines([a, b]), [a[0], a[1], b[1]])
})

test('a long path is split into overlapping pieces of at most 25 points', () => {
  const path = Array.from({ length: 30 }, (_, i) => i)
  const chunks = chunkPath(path)
  assert.deepEqual(chunks.map((c) => [c[0], c.at(-1), c.length]), [[0, 24, 25], [24, 29, 6]])
  assert.equal(chunks.reduce((legs, c) => legs + c.length - 1, 0), 29, 'the pieces have exactly the path\'s legs')
  assert.deepEqual(chunkPath([1, 2, 3]), [[1, 2, 3]])
  const exact = chunkPath(Array.from({ length: 49 }, (_, i) => i))
  assert.deepEqual(exact.map((c) => c.length), [25, 25])
})

test('points at the same spot are sent once and their legs come back as 0', () => {
  const a = { lat: 25.3, lng: 51.5 }
  const sibling = { lat: 25.30001, lng: 51.50001 } // about 1.5 m away
  const b = { lat: 25.31, lng: 51.5 }
  const { points, index } = dedupeConsecutive([a, sibling, b])
  assert.equal(points.length, 2)
  assert.deepEqual(index, [0, 0, 1])
  assert.deepEqual(expandLegs(index, [120]), [0, 120])
})

// A fake Mapbox: answers with a straight route through the requested points, 60 seconds and 500 m per leg.
function fakeMapbox() {
  const calls: string[] = []
  const fetchFn = async (url: string) => {
    calls.push(url)
    const coords = url.split('/driving/')[1]!.split('?')[0]!.split(';').map((c) => {
      const [lng, lat] = c.split(',').map(Number)
      return { lat: lat!, lng: lng! }
    })
    const legs = coords.slice(1).map(() => ({ duration: 60 }))
    return {
      ok: true,
      status: 200,
      json: async () => ({ routes: [{ distance: 500 * legs.length, duration: 60 * legs.length, geometry: encodePolyline(coords), legs }] }),
    }
  }
  return { calls, fetchFn }
}

test('Mapbox times and line for a run, with siblings sent once', async () => {
  const { calls, fetchFn } = fakeMapbox()
  const school = { lat: 25.3, lng: 51.5 }
  const a = { lat: 25.32, lng: 51.52 }
  const path = [a, { ...a }, { lat: 25.31, lng: 51.51 }, school]
  const geo = await mapboxDirections('pk.test', fetchFn)(path)
  assert.equal(calls.length, 1)
  assert.equal(calls[0]!.split('/driving/')[1]!.split('?')[0]!.split(';').length, 3, 'the sibling is not sent twice')
  assert.equal(geo.source, 'mapbox')
  assert.deepEqual(geo.legSeconds, [0, 60, 60])
  assert.equal(geo.durationMin, 2)
  assert.equal(geo.distanceKm, 1)
  assert.ok(near(decodePolyline(geo.encodedPolyline!)[0]!, a))
})

test('a bus with more than 24 stops is asked for in pieces and the line is joined', async () => {
  const { calls, fetchFn } = fakeMapbox()
  const path = Array.from({ length: 30 }, (_, i) => ({ lat: 25.2 + i * 0.01, lng: 51.5 }))
  const geo = await mapboxDirections('pk.test', fetchFn)(path)
  assert.equal(calls.length, 2)
  assert.equal(geo.legSeconds.length, 29)
  assert.equal(geo.durationMin, 29)
  const line = decodePolyline(geo.encodedPolyline!)
  assert.equal(line.length, 30, 'the meeting point appears once')
  assert.ok(near(line[0]!, path[0]!) && near(line.at(-1)!, path.at(-1)!))
})

test('without a token, or when Mapbox fails, straight lines at 30 km/h', async () => {
  const path = [{ lat: 25.3, lng: 51.5 + 3 * 0.0099 }, { lat: 25.3, lng: 51.5 }] // about 3 km
  const noToken = await mapboxDirections(null)(path)
  assert.equal(noToken.source, 'straight')
  assert.equal(noToken.encodedPolyline, null)
  assert.equal(noToken.durationMin, 6)

  const failing = async () => ({ ok: false, status: 422, json: async () => ({}) })
  const failed = await mapboxDirections('pk.test', failing)(path)
  assert.deepEqual(failed, straightLine(path))
})
