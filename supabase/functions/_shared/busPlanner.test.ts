// Tests for planning one bus with a fake Mapbox. Run from the repo root: pnpm test:logic
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkApply, planUpdate, proposeOptimize, type BusState } from './busPlanner.ts'
import { straightLine, type Directions } from './directions.ts'
import type { LatLng, Stop } from './routePlan.ts'

const school: LatLng = { lat: 25.3, lng: 51.5 }
const east = (id: string, km: number): Stop => ({ id, lat: 25.3, lng: 51.5 + km * 0.0099, address: `${id} street` })
const ids = (stops: readonly { id: string }[]) => stops.map((s) => s.id)

/** A fake Mapbox (straight lines) that counts how often it was asked. */
function fakeDirections() {
  const paths: LatLng[][] = []
  const directions: Directions = async (path) => {
    paths.push([...path])
    return straightLine(path)
  }
  return { paths, directions }
}

/** A bus whose saved route (both runs) is exactly `chain`. */
function savedBus(chain: Stop[], overrides: Partial<BusState> = {}): BusState {
  return {
    busId: 'bus-1',
    school,
    students: [...chain],
    savedOrder: ids(chain),
    routeStudents: ids(chain),
    plannedAt: new Map(chain.map((s) => [s.id, { lat: s.lat, lng: s.lng }])),
    hasBothRuns: true,
    ...overrides,
  }
}

const far = east('far', 3)
const mid = east('mid', 2)
const near = east('near', 1)

test('a bus with no changes is left alone: nothing saved, Mapbox not asked', async () => {
  const { paths, directions } = fakeDirections()
  const plan = await planUpdate(savedBus([far, mid, near]), directions)
  assert.deepEqual(plan, { save: false })
  assert.equal(paths.length, 0)
})

test('a newcomer slots in and nobody else moves', async () => {
  const { paths, directions } = fakeDirections()
  const newcomer = east('new', 2.5)
  const bus = savedBus([far, mid, near], { students: [far, mid, near, newcomer] })
  const plan = await planUpdate(bus, directions)
  assert.ok(plan.save)
  assert.deepEqual(ids(plan.chain), ['far', 'new', 'mid', 'near'])
  assert.deepEqual([plan.added, plan.removed, plan.moved], [['new'], [], []])
  assert.equal(paths.length, 2, 'one Mapbox request per run')
  assert.deepEqual(paths[0]!.at(-1), school, 'the morning ends at the school')
  assert.deepEqual(paths[1]![0], school, 'the afternoon starts there')
  assert.deepEqual(ids(plan.measured.afternoon.waypoints.map((w) => ({ id: w.student_id }))), ['near', 'mid', 'new', 'far'])
})

test('a child who left drops out of both runs', async () => {
  const { directions } = fakeDirections()
  const bus = savedBus([far, mid, near], { students: [far, near], savedOrder: ['far', 'near'] })
  const plan = await planUpdate(bus, directions)
  assert.ok(plan.save)
  assert.deepEqual(ids(plan.chain), ['far', 'near'])
  assert.deepEqual(plan.removed, ['mid'])
  assert.deepEqual(plan.measured.morning.waypoints.map((w) => w.student_id), ['far', 'near'])
})

test('a child whose address was edited (place cleared) is re-slotted and reported as moved', async () => {
  const { directions } = fakeDirections()
  const midMoved = { ...mid, lng: 51.5 + 0.5 * 0.0099 }
  const bus = savedBus([far, mid, near], { students: [far, midMoved, near], savedOrder: ['far', 'near'] })
  const plan = await planUpdate(bus, directions)
  assert.ok(plan.save)
  assert.deepEqual(plan.moved, ['mid'])
  assert.deepEqual(plan.added, [])
  assert.deepEqual(ids(plan.chain), ['far', 'near', 'mid'])
})

test('a bus from before two runs gets its afternoon run saved, in the same order', async () => {
  const { directions } = fakeDirections()
  const plan = await planUpdate(savedBus([far, mid, near], { hasBothRuns: false }), directions)
  assert.ok(plan.save)
  assert.equal(plan.reversed, false)
  assert.deepEqual(ids(plan.chain), ['far', 'mid', 'near'])
})

test('decision 0: the old school-outward order is flipped once so the morning ends at the school', async () => {
  const { directions } = fakeDirections()
  // Before two runs the saved order started next to the school.
  const legacy = savedBus([near, mid, far], { hasBothRuns: false })
  const plan = await planUpdate(legacy, directions, { reverse: true })
  assert.ok(plan.save)
  assert.equal(plan.reversed, true)
  assert.deepEqual(ids(plan.chain), ['far', 'mid', 'near'])

  // Once both runs are saved, asking again changes nothing.
  const again = await planUpdate(savedBus(plan.chain), directions, { reverse: true })
  assert.deepEqual(again, { save: false })
})

test('a badly ordered route gets the "re-optimizing would save" hint, never applied', async () => {
  const { directions } = fakeDirections()
  const zigzag = [east('a', 8), east('b', 1), east('c', 7), east('d', 2), east('e', 6)]
  const newcomer = east('f', 3)
  const plan = await planUpdate(savedBus(zigzag, { students: [...zigzag, newcomer] }), directions, { now: new Date('2026-10-06T08:00:00Z') })
  assert.ok(plan.save)
  assert.ok(plan.suggestion && plan.suggestion.minutes_saved >= 5)
  assert.equal(plan.suggestion.checked_at, '2026-10-06T08:00:00.000Z')
  assert.deepEqual(ids(plan.chain).filter((id) => id !== 'f'), ['a', 'b', 'c', 'd', 'e'], 'the order is kept')

  const good = await planUpdate(savedBus([far, mid], { students: [far, mid, near] }), directions)
  assert.ok(good.save)
  assert.equal(good.suggestion, null)
})

test('a proposal compares today\'s route with a fresh plan and says whether it is clearly better', async () => {
  const { directions } = fakeDirections()
  const zigzag = [east('a', 8), east('b', 1), east('c', 7), east('d', 2), east('e', 6)]
  const proposal = await proposeOptimize(savedBus(zigzag), directions)
  assert.equal(proposal.clearlyBetter, true)
  assert.deepEqual(ids(proposal.proposed.chain), ['a', 'c', 'e', 'd', 'b'])
  assert.ok(proposal.minutesSaved >= 5)
  assert.equal(proposal.studentsMoved, 3, 'c, e and b change place')

  const already = await proposeOptimize(savedBus([far, mid, near]), directions)
  assert.equal(already.clearlyBetter, false)
  assert.equal(already.minutesSaved, 0)
})

test('applying a proposal that is not clearly better is refused', async () => {
  const { directions } = fakeDirections()
  const bus = savedBus([far, mid, near])
  const check = await checkApply(bus, ['far', 'near', 'mid'], directions)
  assert.equal(check.ok, false)
  assert.equal(!check.ok && check.reason, 'not_better')
})

test('applying a proposal made before the bus changed is refused', async () => {
  const { directions } = fakeDirections()
  const newcomer = east('new', 2.5)
  const bus = savedBus([far, mid, near], { students: [far, mid, near, newcomer] })
  assert.deepEqual(await checkApply(bus, ['far', 'mid', 'near'], directions), { ok: false, reason: 'stale' })
  assert.deepEqual(await checkApply(bus, ['far', 'mid', 'near', 'new', 'new'], directions), { ok: false, reason: 'stale' })
})

test('a clearly better proposal can be applied', async () => {
  const { directions } = fakeDirections()
  const zigzag = [east('a', 8), east('b', 1), east('c', 7), east('d', 2), east('e', 6)]
  const check = await checkApply(savedBus(zigzag), ['a', 'c', 'e', 'd', 'b'], directions)
  assert.equal(check.ok, true)
  assert.ok(check.ok && check.proposal.proposed.morning.waypoints.length === 5)
})
