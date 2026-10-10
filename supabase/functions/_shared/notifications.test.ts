// Tests for what parents are told, row by row against the notifications table in Docs/Claude.md §1.2.
// Run from the repo root: pnpm test:logic
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { attendanceText, etaRun, etaText, qatarDate, qatarTime, type EtaState } from './notifications.ts'

// 04:25 UTC is 7:25 AM in Qatar; 10:35 UTC is 1:35 PM; 11:05 UTC is 2:05 PM.
const AM_725 = '2026-10-06T04:25:00Z'
const PM_135 = '2026-10-06T10:35:00Z'
const PM_205 = '2026-10-06T11:05:00Z'

test('times and dates are Qatar time', () => {
  assert.equal(qatarTime(AM_725), '7:25 AM')
  assert.equal(qatarTime(PM_135), '1:35 PM')
  assert.equal(qatarTime('2026-10-06T21:00:00Z'), '12:00 AM')
  assert.equal(qatarTime('2026-10-06T09:00:00Z'), '12:00 PM')
  assert.equal(qatarTime(null, new Date(PM_205)), '2:05 PM', 'no time given: now')
  assert.equal(qatarDate(new Date('2026-10-06T21:30:00Z')), '2026-10-07', 'after 9 PM UTC it is tomorrow in Qatar')
})

test('morning, bus about 5 minutes away (unchanged)', () => {
  assert.deepEqual(etaText('Lina', 'morning'), { title: 'Bus arriving in ~5 minutes', body: 'Get Lina ready - the bus is almost at your stop.' })
})

test('morning, boarded (unchanged)', () => {
  assert.deepEqual(attendanceText({ name: 'Lina', run: 'morning', status: 'boarded', at: AM_725 }), {
    title: 'Lina has boarded',
    body: 'Lina is on the bus and on the way to school.',
  })
})

test('morning run ended: arrived at school, with the school\'s name', () => {
  assert.deepEqual(
    attendanceText({ name: 'Lina', run: 'morning', status: 'dropped_off', previousStatus: 'boarded', at: AM_725, schoolName: 'Doha International Academy' }),
    { title: 'Lina arrived at school', body: 'The bus reached Doha International Academy at 7:25 AM.' },
  )
  assert.equal(attendanceText({ name: 'Lina', run: 'morning', status: 'dropped_off', at: AM_725 })?.body, 'The bus reached the school at 7:25 AM.')
})

test('morning, absent', () => {
  assert.deepEqual(attendanceText({ name: 'Lina', run: 'morning', status: 'absent' }), {
    title: 'Lina marked absent',
    body: 'Lina was not on the bus this morning.',
  })
})

test('afternoon, boarded at school', () => {
  assert.deepEqual(attendanceText({ name: 'Lina', run: 'afternoon', status: 'boarded', at: PM_135 }), {
    title: 'Lina is on the bus home',
    body: 'Lina boarded at school at 1:35 PM.',
  })
})

test('afternoon, absent at school', () => {
  assert.deepEqual(attendanceText({ name: 'Lina', run: 'afternoon', status: 'absent' }), {
    title: 'Lina isn\'t on the bus home',
    body: 'The driver marked Lina absent at school. Contact the school if you didn\'t expect this.',
  })
})

test('afternoon, bus about 5 minutes from home', () => {
  assert.deepEqual(etaText('Lina', 'afternoon'), { title: 'Lina is almost home', body: 'The bus is about 5 minutes from your stop.' })
})

test('afternoon, dropped off, with the child\'s address', () => {
  assert.deepEqual(
    attendanceText({ name: 'Lina', run: 'afternoon', status: 'dropped_off', previousStatus: 'boarded', at: PM_205, address: 'Al Waab, Doha' }),
    { title: 'Lina was dropped off', body: 'Lina got off at Al Waab, Doha at 2:05 PM.' },
  )
})

test('messages from before two runs a day are the morning', () => {
  assert.equal(attendanceText({ name: 'Lina', status: 'boarded' })?.title, 'Lina has boarded')
  assert.equal(attendanceText({ name: 'Lina', status: 'absent' })?.body, 'Lina was not on the bus this morning.')
})

test('no alert for the same status again or for undoing a drop-off', () => {
  assert.equal(attendanceText({ name: 'Lina', run: 'afternoon', status: 'boarded', previousStatus: 'boarded' }), null)
  assert.equal(attendanceText({ name: 'Lina', run: 'afternoon', status: 'boarded', previousStatus: 'dropped_off' }), null)
  assert.ok(attendanceText({ name: 'Lina', run: 'morning', status: 'boarded', previousStatus: 'absent' }), 'a correction is real news')
})

const state = (s: Partial<EtaState>): EtaState => ({
  runningRun: null, morningStatus: null, afternoonStatus: null, reportedRuns: null, ...s,
})

test('the morning alert goes out only while the child is still waiting', () => {
  assert.equal(etaRun(state({ runningRun: 'morning' })), 'morning')
  assert.equal(etaRun(state({ runningRun: 'morning', morningStatus: 'boarded' })), null)
  assert.equal(etaRun(state({ runningRun: 'morning', morningStatus: 'absent' })), null)
  assert.equal(etaRun(state({ runningRun: 'morning', reportedRuns: 'both' })), null)
  assert.equal(etaRun(state({ runningRun: 'morning', reportedRuns: 'morning' })), null)
  assert.equal(etaRun(state({ runningRun: 'morning', reportedRuns: 'afternoon' })), 'morning')
})

test('the afternoon alert goes out only while the child is on the bus', () => {
  assert.equal(etaRun(state({ runningRun: 'afternoon', afternoonStatus: 'boarded' })), 'afternoon')
  assert.equal(etaRun(state({ runningRun: 'afternoon' })), null)
  assert.equal(etaRun(state({ runningRun: 'afternoon', afternoonStatus: 'dropped_off' })), null)
  assert.equal(etaRun(state({ runningRun: 'afternoon', afternoonStatus: 'absent' })), null)
})

test('no run going, no alert', () => {
  assert.equal(etaRun(state({})), null)
  assert.equal(etaRun(state({ morningStatus: 'boarded' })), null)
})
