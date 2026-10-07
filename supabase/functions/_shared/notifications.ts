/**
 * What parents are told, for both runs (the notifications table in Docs/plans/two-runs-a-day.md), and when the "bus
 * almost there" alert may go out. Plain functions, so they run in send-notification and in Node's test runner
 * (notifications.test.ts).
 */

export type Run = 'morning' | 'afternoon'
export type AttendanceStatus = 'boarded' | 'absent' | 'dropped_off'
export type PushText = { title: string; body: string }

/** Qatar is UTC+3 all year (no daylight saving). */
const QATAR_OFFSET_MS = 3 * 60 * 60 * 1000

/** The time in Qatar, written like the app: "7:25 AM". */
export function qatarTime(at: string | Date | null | undefined, fallback: Date = new Date()): string {
  const parsed = at ? new Date(at) : fallback
  const d = new Date((Number.isNaN(parsed.getTime()) ? fallback : parsed).getTime() + QATAR_OFFSET_MS)
  const h = d.getUTCHours()
  const m = d.getUTCMinutes()
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}

/** Today's date in Qatar, YYYY-MM-DD (the school day runs and check-ins belong to). */
export function qatarDate(now: Date = new Date()): string {
  return new Date(now.getTime() + QATAR_OFFSET_MS).toISOString().slice(0, 10)
}

export type AttendanceEvent = {
  name: string
  /** Missing on messages from before two runs a day: those are always the morning. */
  run?: Run | null
  status: AttendanceStatus
  previousStatus?: AttendanceStatus | null
  /** When it happened: boarding time, or drop-off time for dropped_off. */
  at?: string | null
  schoolName?: string | null
  address?: string | null
}

/** The alert for a driver's tap, or null when there's nothing new to tell (the same status again, or an undo). */
export function attendanceText(e: AttendanceEvent, now: Date = new Date()): PushText | null {
  if (e.previousStatus === e.status) return null
  if (e.previousStatus === 'dropped_off' && e.status === 'boarded') return null
  const time = qatarTime(e.at, now)
  const { name } = e

  if ((e.run ?? 'morning') === 'morning') {
    if (e.status === 'boarded') return { title: `${name} has boarded`, body: `${name} is on the bus and on the way to school.` }
    if (e.status === 'absent') return { title: `${name} marked absent`, body: `${name} was not on the bus this morning.` }
    return { title: `${name} arrived at school`, body: `The bus reached ${e.schoolName?.trim() || 'the school'} at ${time}.` }
  }

  if (e.status === 'boarded') return { title: `${name} is on the bus home`, body: `${name} boarded at school at ${time}.` }
  if (e.status === 'absent') {
    return {
      title: `${name} isn't on the bus home`,
      body: `The driver marked ${name} absent at school. Contact the school if you didn't expect this.`,
    }
  }
  const address = e.address?.trim()
  return { title: `${name} was dropped off`, body: address ? `${name} got off at ${address} at ${time}.` : `${name} got off the bus at ${time}.` }
}

/** The "bus almost there" alert: getting ready for pickup in the morning, almost home in the afternoon. */
export function etaText(name: string, run: Run): PushText {
  return run === 'morning'
    ? { title: 'Bus arriving in ~5 minutes', body: `Get ${name} ready - the bus is almost at your stop.` }
    : { title: `${name} is almost home`, body: 'The bus is about 5 minutes from your stop.' }
}

export type EtaState = {
  /** The bus's run that is running now, if any. */
  runningRun: Run | null
  /** Today's driver app marks the bus active instead of starting a run; until 0018 that counts as the morning run. */
  legacyActive: boolean
  /** The child's check-in status on each run today, if any. */
  morningStatus: AttendanceStatus | null
  afternoonStatus: AttendanceStatus | null
  /** Which rides the parent reported the child absent for today, if any. */
  reportedRuns: 'both' | 'morning' | 'afternoon' | null
}

/**
 * Which run the alert is for, or null when it shouldn't go out: in the morning only while the child is still waiting
 * to be picked up, in the afternoon only while the child is on the bus, and never with no run going.
 */
export function etaRun(s: EtaState): Run | null {
  const run = s.runningRun ?? (s.legacyActive ? 'morning' : null)
  if (run === 'morning') {
    const waiting = s.morningStatus === null && s.reportedRuns !== 'both' && s.reportedRuns !== 'morning'
    return waiting ? 'morning' : null
  }
  if (run === 'afternoon') return s.afternoonStatus === 'boarded' ? 'afternoon' : null
  return null
}
