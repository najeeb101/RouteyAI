// Tests for the apps' run rules. Run from the repo root: pnpm test:logic
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  cardText,
  driverRun,
  groupStops,
  historyLine,
  parentCard,
  qatarDateKey,
  runOrder,
  savedRunOrder,
  type BusRunsToday,
  type ChildDay,
} from './runs.ts'

// Qatar is UTC+3: 04:00 UTC is 7:00 AM, 08:30 UTC is 11:30 AM.
const at7 = new Date('2026-10-06T04:00:00Z')
const at1130 = new Date('2026-10-06T08:30:00Z')
const started = { startedAt: '2026-10-06T03:30:00Z', endedAt: null }
const ended = { startedAt: '2026-10-06T03:30:00Z', endedAt: '2026-10-06T04:25:00Z' }

test('the school day is the date in Qatar', () => {
  assert.equal(qatarDateKey(new Date('2026-10-06T22:00:00Z')), '2026-10-07')
  assert.equal(qatarDateKey(at7), '2026-10-06')
})

test('the driver gets the morning run first, then the afternoon', () => {
  assert.deepEqual(driverRun({}, at7), { run: 'morning', phase: 'ready' })
  assert.deepEqual(driverRun({ morning: started }, at7), { run: 'morning', phase: 'running' })
  assert.deepEqual(driverRun({ morning: ended }, at7), { run: 'afternoon', phase: 'ready' })
  assert.deepEqual(driverRun({ morning: ended, afternoon: started }, at1130), { run: 'afternoon', phase: 'running' })
  assert.deepEqual(driverRun({ morning: ended, afternoon: { ...started, endedAt: '2026-10-06T11:00:00Z' } }, at1130), { run: 'afternoon', phase: 'ended' })
})

test('from 11:00 the afternoon takes over when the morning never happened', () => {
  assert.deepEqual(driverRun({}, at1130), { run: 'afternoon', phase: 'ready' })
  assert.deepEqual(driverRun({ morning: started }, at1130), { run: 'morning', phase: 'running' }, 'a morning still running stays')
})

const kids = [
  { id: 'c', stopOrder: 3, address: 'C street' },
  { id: 'new', stopOrder: null, address: 'New street' },
  { id: 'a', stopOrder: 1, address: 'A street' },
  { id: 'b', stopOrder: 2, address: 'A street' },
]
const ids = (xs: readonly { id: string }[]) => xs.map((x) => x.id)

test('the afternoon drives the stops in reverse; children without a place come last', () => {
  assert.deepEqual(ids(runOrder(kids, 'morning')), ['a', 'b', 'c', 'new'])
  assert.deepEqual(ids(runOrder(kids, 'afternoon')), ['c', 'b', 'a', 'new'])
})

test('a running run keeps the order it started with', () => {
  assert.deepEqual(ids(savedRunOrder(kids, ['c', 'a', 'b'], 'morning')), ['c', 'a', 'b', 'new'])
})

test('children at one address are one stop', () => {
  const stops = groupStops(runOrder(kids, 'morning'))
  assert.deepEqual(stops.map((s) => [s.name, ids(s.students)]), [['A street', ['a', 'b']], ['C street', ['c']], ['New street', ['new']]])
})

const day = (d: Partial<ChildDay>): ChildDay => ({ hasBus: true, marks: {}, report: null, busRuns: {}, ...d })
const mark = (status: 'boarded' | 'absent' | 'dropped_off', droppedAt: string | null = null) => ({ status, at: '2026-10-06T03:52:00Z', droppedAt })
const runs = (r: BusRunsToday) => r

test('the parent card through a whole day', () => {
  // Morning, before the bus leaves.
  assert.deepEqual(parentCard(day({}), at7), { run: 'morning', kind: 'not-started', target: null })
  // Morning, bus coming.
  assert.deepEqual(parentCard(day({ busRuns: runs({ morning: started }) }), at7), { run: 'morning', kind: 'waiting', target: 'stop' })
  // Morning, picked up: the arrival time counts to school.
  assert.deepEqual(parentCard(day({ busRuns: runs({ morning: started }), marks: { morning: mark('boarded') } }), at7), { run: 'morning', kind: 'on-bus', target: 'school' })
  // Morning run ended: at school, all day until the afternoon run starts.
  const atSchool = day({ busRuns: runs({ morning: ended }), marks: { morning: mark('dropped_off', ended.endedAt) } })
  assert.deepEqual(parentCard(atSchool, at1130), { run: 'morning', kind: 'at-school', target: null })
  // Afternoon run started, not on board yet.
  const pm = runs({ morning: ended, afternoon: started })
  assert.deepEqual(parentCard({ ...atSchool, busRuns: pm }, at1130), { run: 'afternoon', kind: 'boarding-at-school', target: null })
  // Afternoon, boarded at school: counts to the stop.
  assert.deepEqual(parentCard(day({ busRuns: pm, marks: { morning: mark('dropped_off'), afternoon: mark('boarded') } }), at1130), { run: 'afternoon', kind: 'on-way-home', target: 'stop' })
  // Afternoon, dropped off.
  assert.deepEqual(parentCard(day({ busRuns: pm, marks: { afternoon: mark('dropped_off', '2026-10-06T11:05:00Z') } }), at1130), { run: 'afternoon', kind: 'home', target: null })
})

test('absent and reported cards are per run', () => {
  assert.equal(parentCard(day({ busRuns: runs({ morning: started }), report: 'both' }), at7).kind, 'reported')
  assert.equal(parentCard(day({ busRuns: runs({ morning: started }), report: 'afternoon' }), at7).kind, 'waiting', 'an afternoon-only report leaves the morning')
  assert.equal(parentCard(day({ busRuns: runs({ morning: ended, afternoon: started }), report: 'afternoon' }), at1130).kind, 'reported')
  assert.equal(parentCard(day({ busRuns: runs({ morning: started }), marks: { morning: mark('absent') } }), at7).kind, 'absent')
  assert.equal(parentCard(day({ busRuns: runs({ morning: ended, afternoon: started }), marks: { afternoon: mark('absent') } }), at1130).kind, 'absent')
  assert.equal(parentCard(day({ busRuns: runs({ morning: ended }) }), at7).kind, 'not-checked', 'the run ended without a check-in')
  assert.equal(parentCard(day({ hasBus: false }), at7).kind, 'no-bus')
  const pmEnded = runs({ morning: ended, afternoon: { ...started, endedAt: '2026-10-06T11:30:00Z' } })
  assert.equal(parentCard(day({ busRuns: pmEnded, marks: { afternoon: mark('boarded') } }), at1130).kind, 'unconfirmed', 'never told they are home')
})

test('the card words match the plan', () => {
  const input = { first: 'Lina', busName: 'Bus #1', live: true, boardedAt: '6:52 AM', droppedAt: '7:25 AM', markedAt: '6:50 AM' }
  assert.deepEqual(cardText({ run: 'morning', kind: 'waiting', target: 'stop' }, { ...input, eta: { minutes: 6, stopsBefore: 2 } }), {
    context: 'Arriving at your stop', big: '6 min', sub: '2 stops before yours.',
  })
  assert.equal(cardText({ run: 'morning', kind: 'on-bus', target: 'school' }, { ...input, eta: { minutes: 12, stopsBefore: null } }).sub, 'Lina boarded at 6:52 AM. About 12 min to school.')
  assert.deepEqual(cardText({ run: 'morning', kind: 'at-school', target: null }, { ...input, eta: null }), { context: 'Today', big: 'At school', sub: 'Lina arrived at 7:25 AM.' })
  assert.deepEqual(cardText({ run: 'afternoon', kind: 'on-way-home', target: 'stop' }, { ...input, eta: { minutes: 8, stopsBefore: 3 } }), {
    context: 'Arriving at your stop', big: '8 min', sub: 'On the way home. 3 stops before yours.',
  })
  assert.equal(cardText({ run: 'afternoon', kind: 'home', target: null }, { ...input, droppedAt: '2:05 PM', eta: null }).sub, 'Lina was dropped off at 2:05 PM.')
  assert.equal(cardText({ run: 'afternoon', kind: 'reported', target: null }, { ...input, eta: null, reportReason: 'Sick' }).sub, "You told the driver Lina won't ride this afternoon (sick).")
})

test('a past day in a line', () => {
  const time = (iso: string) => (iso.includes('03:52') ? '6:52 AM' : '2:05 PM')
  assert.deepEqual(historyLine({ morning: mark('dropped_off'), afternoon: mark('dropped_off', '2026-10-06T11:05:00Z') }, null, time), {
    title: 'Rode both ways', detail: 'Picked up 6:52 AM · dropped off 2:05 PM', tone: 'success',
  })
  assert.equal(historyLine({ morning: mark('dropped_off') }, 'afternoon', time).title, 'Stayed home')
  assert.match(historyLine({ morning: mark('dropped_off') }, 'afternoon', time).detail, /Afternoon only · Picked up 6:52 AM/)
  assert.equal(historyLine({ morning: mark('absent') }, null, time).title, 'Absent')
  assert.equal(historyLine({}, null, time).title, 'No record')
})
