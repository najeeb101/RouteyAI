// Tests for the route planning rules. Run from the repo root: pnpm test:logic
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  haversineKm,
  insertStop,
  isClearlyBetter,
  pathKm,
  planChain,
  runOrder,
  runPath,
  runWaypoints,
  studentsMoved,
  updateChain,
  type LatLng,
  type Stop,
} from './routePlan.ts'

// A school with stops due east of it, roughly 1 km apart (0.0099° of longitude ≈ 1 km in Doha).
const school: LatLng = { lat: 25.3, lng: 51.5 }
const east = (id: string, km: number, address?: string): Stop => ({ id, lat: 25.3, lng: 51.5 + km * 0.0099, address: address ?? `${id} street` })
const ids = (stops: readonly { id: string }[]) => stops.map((s) => s.id)

test('morning drives the chain, afternoon drives it in reverse', () => {
  const chain = [east('far', 3), east('mid', 2), east('near', 1)]
  assert.deepEqual(ids(runOrder(chain, 'morning')), ['far', 'mid', 'near'])
  assert.deepEqual(ids(runOrder(chain, 'afternoon')), ['near', 'mid', 'far'])
  assert.deepEqual(ids(chain), ['far', 'mid', 'near'], 'the chain itself is not changed')
})

test('the morning path ends at the school and the afternoon path starts there', () => {
  const chain = [east('far', 3), east('near', 1)]
  const morning = runPath(chain, school, 'morning')
  const afternoon = runPath(chain, school, 'afternoon')
  assert.deepEqual(morning.at(-1), school)
  assert.deepEqual(afternoon[0], school)
  assert.deepEqual(afternoon, [...morning].reverse())
  assert.ok(Math.abs(pathKm(morning) - pathKm(afternoon)) < 1e-9)
})

test('a fresh plan starts at the far end so the morning finishes at the school', () => {
  const chain = planChain([east('near', 1), east('far', 3), east('mid', 2)], school)
  assert.deepEqual(ids(chain), ['far', 'mid', 'near'])
})

test('a new student slots in where they add the least driving, nobody else moves', () => {
  const chain = [east('far', 3), east('near', 1)]
  assert.deepEqual(ids(insertStop(chain, east('mid', 2), school)), ['far', 'mid', 'near'])
  assert.deepEqual(ids(insertStop(chain, east('farthest', 4), school)), ['farthest', 'far', 'near'])
  assert.deepEqual(ids(insertStop(chain, east('by-school', 0.3), school)), ['far', 'near', 'by-school'])
})

test('a student at an existing address joins that stop', () => {
  const chain = [east('far', 3, 'Al Waab'), east('near', 1, 'Al Sadd')]
  const sibling = { id: 'sibling', lat: 25.31, lng: 51.53, address: '  al waab ' }
  assert.deepEqual(ids(insertStop(chain, sibling, school)), ['far', 'sibling', 'near'])
})

test('with nobody joining, leaving or moving, the route comes back exactly as it was', () => {
  const stops = [east('a', 4), east('b', 3), east('c', 2), east('d', 1)]
  const plannedAt = new Map(stops.map((s) => [s.id, { lat: s.lat, lng: s.lng }]))
  // Current students listed in a different order than the route: the route order must win.
  const result = updateChain(['a', 'b', 'c', 'd'], plannedAt, [stops[2]!, stops[0]!, stops[3]!, stops[1]!], school)
  assert.deepEqual(ids(result.chain), ['a', 'b', 'c', 'd'])
  assert.deepEqual([result.added, result.removed, result.moved], [[], [], []])
})

test('leavers drop out, newcomers and movers slot in, the rest keep their order', () => {
  const a = east('a', 4)
  const b = east('b', 3)
  const c = east('c', 2)
  const d = east('d', 1)
  const plannedAt = new Map([a, b, c, d].map((s) => [s.id, { lat: s.lat, lng: s.lng }]))
  const bMovedNearSchool = { ...b, lng: 51.5 + 0.5 * 0.0099 }
  const newcomer = east('e', 2.5)

  const result = updateChain(['a', 'b', 'c', 'd'], plannedAt, [a, bMovedNearSchool, d, newcomer], school)
  assert.deepEqual(result.removed, ['c'])
  assert.deepEqual(result.moved, ['b'])
  assert.deepEqual(result.added, ['e'])
  assert.deepEqual(ids(result.chain), ['a', 'e', 'd', 'b'])
  // a and d, who didn't change, are still in the same order relative to each other.
  assert.ok(ids(result.chain).indexOf('a') < ids(result.chain).indexOf('d'))
})

test('a small move within the same place does not reorder anyone', () => {
  const a = east('a', 2)
  const b = east('b', 1)
  const plannedAt = new Map([a, b].map((s) => [s.id, { lat: s.lat, lng: s.lng }]))
  const aNudged = { ...a, lat: a.lat + 0.0002 } // about 20 m
  const result = updateChain(['a', 'b'], plannedAt, [aNudged, b], school)
  assert.deepEqual(result.moved, [])
  assert.deepEqual(ids(result.chain), ['a', 'b'])
})

test('a re-plan replaces the route only when it is clearly better', () => {
  assert.equal(isClearlyBetter(60, 54.5), true, '5.5 minutes saved')
  assert.equal(isClearlyBetter(40, 36), true, '10% and 4 minutes')
  assert.equal(isClearlyBetter(40, 37), false, '7.5% and 3 minutes')
  assert.equal(isClearlyBetter(12, 10.5), false, '12.5% but only 1.5 minutes')
  assert.equal(isClearlyBetter(30, 30), false, 'no saving')
  assert.equal(isClearlyBetter(30, 35), false, 'worse')
})

test('counts students who would change place', () => {
  assert.equal(studentsMoved(['a', 'b', 'c'], ['a', 'b', 'c']), 0)
  assert.equal(studentsMoved(['a', 'b', 'c'], ['a', 'c', 'b']), 2)
  assert.equal(studentsMoved(['a', 'b', 'c'], ['c', 'b', 'a']), 2)
})

test('run waypoints are numbered in driving order with minutes from the start of the run', () => {
  const chain = [east('far', 3), east('mid', 2), east('near', 1)]

  const morning = runWaypoints(chain, school, 'morning')
  assert.deepEqual(morning.map((w) => [w.student_id, w.stop_order]), [['far', 1], ['mid', 2], ['near', 3]])
  assert.equal(morning[0]!.eta_offset_min, 0, 'the first pickup starts the morning run')
  assert.deepEqual(morning.map((w) => w.eta_offset_min), [0, 2, 4], '1 km at 30 km/h is 2 minutes')

  const afternoon = runWaypoints(chain, school, 'afternoon')
  assert.deepEqual(afternoon.map((w) => [w.student_id, w.stop_order]), [['near', 1], ['mid', 2], ['far', 3]])
  assert.deepEqual(afternoon.map((w) => w.eta_offset_min), [2, 4, 6], 'the afternoon counts from leaving school')

  const withMapbox = runWaypoints(chain, school, 'afternoon', [300, 240, 180])
  assert.deepEqual(withMapbox.map((w) => w.eta_offset_min), [5, 9, 12], 'Mapbox leg times when they are given')

  const wrongLegs = runWaypoints(chain, school, 'afternoon', [300])
  assert.deepEqual(wrongLegs.map((w) => w.eta_offset_min), [2, 4, 6], 'falls back when the legs do not match the path')
})

test('distance helper is sane', () => {
  assert.ok(Math.abs(haversineKm(school, east('x', 1)) - 1) < 0.01)
})
