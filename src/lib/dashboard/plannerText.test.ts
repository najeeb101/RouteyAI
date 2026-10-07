// Tests for the words the dashboard uses for planner results. Run from the repo root: pnpm test:logic
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { aboutMinutes, describeUpdate, describeUpdates, runLine, type UpdatedBus } from './plannerText.ts'

const bus = (over: Partial<UpdatedBus>): UpdatedBus => ({
  bus_id: 'b1', bus_name: 'Bus 1', changed: true, plan_version: 3, added: [], removed: [], moved: [], reversed: false,
  morning: { km: 11.2, minutes: 24 }, afternoon: { km: 11.6, minutes: 25 }, suggestion: null, ...over,
})

test('an update says who joined, moved or left, and that the rest stays', () => {
  assert.equal(describeUpdate(bus({ changed: false })), "Bus 1's route is up to date. Nothing changed.")
  assert.equal(
    describeUpdate(bus({ added: [{ student_id: 'o', name: 'Omar', stop: 4 }] })),
    'Omar at stop 4 joins the route. Every other stop keeps its place.',
  )
  assert.equal(
    describeUpdate(bus({
      added: [{ student_id: 'o', name: 'Omar', stop: 4 }, { student_id: 'l', name: 'Lina', stop: 7 }],
      moved: [{ student_id: 'a', name: 'Adam', stop: 2 }],
      removed: [{ student_id: 's', name: 'Sara' }],
    })),
    'Omar at stop 4 and Lina at stop 7 join the route. Adam at stop 2 has a new stop for the new address. Sara leaves the route. Every other stop keeps its place.',
  )
  assert.equal(describeUpdate(bus({ reversed: true })), 'The morning now ends at the school. Every other stop keeps its place.')
})

test('a child moved between buses is described per bus, and a removed child keeps their name', () => {
  const from = bus({ bus_name: 'Bus 1', removed: [{ student_id: 't', name: 'A student' }] })
  const to = bus({ bus_id: 'b3', bus_name: 'Bus 3', added: [{ student_id: 't', name: 'Tariq', stop: 7 }] })
  const names = new Map([['t', 'Tariq']])
  assert.equal(describeUpdate(from, names), 'Tariq leaves the route. Every other stop keeps its place.')
  assert.equal(
    describeUpdates([from, to], names),
    'Bus 1: Tariq leaves the route. Bus 3: Tariq at stop 7 joins the route. Every other stop keeps its place.',
  )
  assert.equal(describeUpdates([bus({ changed: false })]), "Bus 1's route is up to date. Nothing changed.")
})

test('minutes and run lines read naturally', () => {
  assert.equal(aboutMinutes(6.4), 'about 6 minutes')
  assert.equal(aboutMinutes(0.6), 'about 1 minute')
  assert.equal(runLine({ km: 11.24, minutes: 23.6 }), '24 min · 11.2 km')
  assert.equal(runLine(null), 'Not planned')
})
