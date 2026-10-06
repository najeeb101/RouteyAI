// Tests for the dashboard's run rules. Run from the repo root: pnpm test:logic
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { busDayStatus, rodeCount, runProgress, schoolRun, unconfirmedDropOffs, type BusRunsToday, type DayMark } from './runs.ts'

// Qatar is UTC+3: 04:00 UTC is 7:00 AM, 08:30 UTC is 11:30 AM.
const at7 = new Date('2026-10-06T04:00:00Z')
const at1130 = new Date('2026-10-06T08:30:00Z')
const started = { startedAt: '2026-10-06T03:30:00Z', endedAt: null }
const ended = { startedAt: '2026-10-06T03:30:00Z', endedAt: '2026-10-06T04:25:00Z' }

test('a bus shows the run it is on, then what it has done', () => {
  assert.deepEqual(busDayStatus({}, at7), { label: 'Not started', tone: 'neutral' })
  assert.deepEqual(busDayStatus({ morning: started }, at7), { label: 'Morning run', tone: 'live' })
  assert.deepEqual(busDayStatus({ morning: ended }, at7), { label: 'Morning run done', tone: 'neutral' })
  assert.deepEqual(busDayStatus({ morning: ended, afternoon: started }, at1130), { label: 'Afternoon run', tone: 'live' })
  assert.deepEqual(busDayStatus({ morning: ended, afternoon: ended }, at1130), { label: 'Done for today', tone: 'success' })
  assert.deepEqual(busDayStatus({}, at1130), { label: 'Not started', tone: 'neutral' }, 'no morning run, afternoon not started')
})

test("the school's day follows the buses, then the clock", () => {
  assert.equal(schoolRun([{}, {}], at7), 'morning')
  assert.equal(schoolRun([{ morning: ended }, {}], at7), 'morning', 'before 11:00 the morning stays up')
  assert.equal(schoolRun([{ morning: ended }, { morning: ended }], at1130), 'afternoon')
  assert.equal(schoolRun([{ morning: started }, { morning: ended }], at1130), 'morning', 'a bus still on its morning run')
  assert.equal(schoolRun([{ morning: ended, afternoon: started }, { morning: started }], at7), 'afternoon', 'one bus started the afternoon')
})

test('run progress counts buses running, done and waiting', () => {
  const buses: BusRunsToday[] = [{ morning: started }, { morning: ended }, {}]
  assert.deepEqual(runProgress(buses, 'morning'), { running: 1, done: 1, waiting: 1 })
  assert.deepEqual(runProgress(buses, 'afternoon'), { running: 0, done: 0, waiting: 3 })
})

test('a child still on board after the afternoon run ended is flagged', () => {
  const marks: DayMark[] = [
    { studentId: 'lina', busId: 'b1', run: 'afternoon', status: 'boarded' },
    { studentId: 'omar', busId: 'b1', run: 'afternoon', status: 'dropped_off' },
    { studentId: 'sara', busId: 'b2', run: 'afternoon', status: 'boarded' },
    { studentId: 'adam', busId: 'b1', run: 'morning', status: 'boarded' },
  ]
  const runs = new Map<string, BusRunsToday>([
    ['b1', { morning: ended, afternoon: ended }],
    ['b2', { morning: ended, afternoon: started }],
  ])
  assert.deepEqual(unconfirmedDropOffs(marks, runs).map((m) => m.studentId), ['lina'], "sara's bus is still driving")
  assert.equal(rodeCount(marks, 'afternoon'), 3)
  assert.equal(rodeCount(marks, 'morning'), 1)
})
