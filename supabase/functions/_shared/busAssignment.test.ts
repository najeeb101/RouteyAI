// Tests for the "Optimize all" bus assignment. Run from the repo root: pnpm test:logic
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { assignBuses, type AssignStudent } from './busAssignment.ts'

// Three neighbourhoods about 10 km apart, four homes each.
const area = (prefix: string, lat: number, lng: number): AssignStudent[] =>
  [0, 1, 2, 3].map((i) => ({ id: `${prefix}${i}`, lat: lat + i * 0.002, lng: lng + (i % 2) * 0.002 }))
const north = area('n', 25.4, 51.5)
const west = area('w', 25.3, 51.4)
const south = area('s', 25.2, 51.55)
const students = [...north, ...west, ...south]
const buses = [{ id: 'bus-a', capacity: 10 }, { id: 'bus-b', capacity: 10 }, { id: 'bus-c', capacity: 10 }]
const riding = (groups: [AssignStudent[], string][]) => new Map(groups.flatMap(([g, bus]) => g.map((s) => [s.id, bus] as const)))
const changed = (now: Map<string, string>, after: Map<string, string>) => [...after].filter(([id, bus]) => now.get(id) !== bus).map(([id]) => id)

test('when every bus already serves one neighbourhood, nobody changes bus', () => {
  // Buses deliberately not in the same order as the neighbourhoods in the student list.
  const now = riding([[north, 'bus-c'], [west, 'bus-a'], [south, 'bus-b']])
  assert.deepEqual(changed(now, assignBuses(students, buses, now)), [])
})

test('only a student on the wrong side of town is moved', () => {
  const now = riding([[north, 'bus-a'], [west, 'bus-b'], [south, 'bus-c']])
  now.set('s3', 'bus-a') // a southern home on the northern bus
  assert.deepEqual(changed(now, assignBuses(students, buses, now)), ['s3'])
})

test('a full bus sends the overflow to the next nearest bus', () => {
  const now = riding([[north, 'bus-a'], [west, 'bus-b'], [south, 'bus-c']])
  const small = [{ id: 'bus-a', capacity: 3 }, { id: 'bus-b', capacity: 10 }, { id: 'bus-c', capacity: 10 }]
  const after = assignBuses(students, small, now)
  assert.equal([...after.values()].filter((b) => b === 'bus-a').length, 3)
  assert.equal(after.size, students.length)
})

test('a school with no assignments yet gets one neighbourhood per bus', () => {
  const after = assignBuses(students, buses)
  for (const group of [north, west, south]) {
    assert.equal(new Set(group.map((s) => after.get(s.id))).size, 1, 'each neighbourhood rides one bus')
  }
  assert.equal(new Set(after.values()).size, 3, 'and the three use different buses')
})
