/**
 * The two runs a day as the website sees them (Docs/plans/two-runs-a-day.md). The rules shared with the apps are copied
 * from mobile/src/lib/runs.ts; the dashboard's own (a bus's day, the school's day) are below them. Plain functions with
 * no imports, so Node's test runner checks them (runs.test.ts; `pnpm test:logic`).
 */

export type Run = 'morning' | 'afternoon'
export type Mark = 'boarded' | 'absent' | 'dropped_off'
export type ReportRuns = 'both' | 'morning' | 'afternoon'

export type RunTimes = { startedAt: string; endedAt: string | null }
/** A bus's runs today (bus_runs), by run. */
export type BusRunsToday = Partial<Record<Run, RunTimes>>

/** The afternoon takes over at 11:00 Qatar time when the morning run never happened. */
export const AFTERNOON_FROM_HOUR = 11

export const RUN_LABEL: Record<Run, string> = { morning: 'Morning run', afternoon: 'Afternoon run' }
export const RIDES_LABEL: Record<ReportRuns, string> = { both: 'Both rides', morning: 'Morning only', afternoon: 'Afternoon only' }

/** Qatar is UTC+3 all year. */
const QATAR_OFFSET_MS = 3 * 60 * 60 * 1000

/** Today's school day in Qatar, YYYY-MM-DD, as the database dates runs and check-ins (qatar_today()). */
export function qatarDateKey(now: Date = new Date()): string {
  return new Date(now.getTime() + QATAR_OFFSET_MS).toISOString().slice(0, 10)
}

export function qatarHour(now: Date = new Date()): number {
  return new Date(now.getTime() + QATAR_OFFSET_MS).getUTCHours()
}

export function reportCovers(runs: ReportRuns | null | undefined, run: Run): boolean {
  return runs === 'both' || runs === run
}

export type DriverRunState = { run: Run; phase: 'ready' | 'running' | 'ended' }

/**
 * The run the driver is on: the one that is running; otherwise the morning until it has been driven, then the
 * afternoon (also from 11:00 if the morning never happened); once the afternoon has ended, done for today.
 */
export function driverRun(runs: BusRunsToday, now: Date = new Date()): DriverRunState {
  if (runs.afternoon && !runs.afternoon.endedAt) return { run: 'afternoon', phase: 'running' }
  if (runs.morning && !runs.morning.endedAt) return { run: 'morning', phase: 'running' }
  if (runs.afternoon) return { run: 'afternoon', phase: 'ended' }
  if (runs.morning || qatarHour(now) >= AFTERNOON_FROM_HOUR) return { run: 'afternoon', phase: 'ready' }
  return { run: 'morning', phase: 'ready' }
}

/**
 * A run's students in driving order, like run_stops in the database: the chain (stop_order) for the morning, reversed
 * for the afternoon, students without a place last in the order they came.
 */
export function runOrder<T extends { stopOrder: number | null }>(students: readonly T[], run: Run): T[] {
  return students
    .map((s, i) => ({ s, i }))
    .sort((a, b) => {
      if (a.s.stopOrder === null || b.s.stopOrder === null) {
        if (a.s.stopOrder === b.s.stopOrder) return a.i - b.i
        return a.s.stopOrder === null ? 1 : -1
      }
      return run === 'morning' ? a.s.stopOrder - b.s.stopOrder : b.s.stopOrder - a.s.stopOrder
    })
    .map(({ s }) => s)
}

/**
 * The students in the order a running run saved when it started (bus_runs.stops), so a route changed mid-drive
 * doesn't move the driver's list. Students who joined since come last.
 */
export function savedRunOrder<T extends { id: string; stopOrder: number | null }>(students: readonly T[], saved: readonly string[], run: Run): T[] {
  const position = new Map(saved.map((id, i) => [id, i]))
  const listed = students.filter((s) => position.has(s.id)).sort((a, b) => position.get(a.id)! - position.get(b.id)!)
  return [...listed, ...runOrder(students.filter((s) => !position.has(s.id)), run)]
}

/** Students in driving order grouped into stops: everyone at the same address is one stop, where the first of them is. */
export function groupStops<T extends { address: string }>(ordered: readonly T[]): { name: string; students: T[] }[] {
  const stops = new Map<string, T[]>()
  for (const s of ordered) {
    const name = s.address.trim() || 'Stop'
    stops.set(name, [...(stops.get(name) ?? []), s])
  }
  return [...stops.entries()].map(([name, students]) => ({ name, students }))
}

// ── School dashboard ──────────────────────────────────────────────────────

export type Tone = 'live' | 'success' | 'warning' | 'danger' | 'neutral'

/** Where a bus is in its day, as one short status for the fleet lists. */
export function busDayStatus(runs: BusRunsToday, now: Date = new Date()): { label: string; tone: Tone } {
  const state = driverRun(runs, now)
  if (state.phase === 'running') return { label: RUN_LABEL[state.run], tone: 'live' }
  if (state.phase === 'ended') return { label: 'Done for today', tone: 'success' }
  if (state.run === 'afternoon' && runs.morning) return { label: 'Morning run done', tone: 'neutral' }
  return { label: 'Not started', tone: 'neutral' }
}

/**
 * The run the school's day is on: the afternoon once any bus has started it, or from 11:00 when no morning run is still
 * going; otherwise the morning.
 */
export function schoolRun(buses: readonly BusRunsToday[], now: Date = new Date()): Run {
  if (buses.some((b) => b.afternoon)) return 'afternoon'
  if (buses.some((b) => b.morning && !b.morning.endedAt)) return 'morning'
  return qatarHour(now) >= AFTERNOON_FROM_HOUR ? 'afternoon' : 'morning'
}

/** How many buses are on a run, have finished it, or haven't started it. */
export function runProgress(buses: readonly BusRunsToday[], run: Run): { running: number; done: number; waiting: number } {
  let running = 0
  let done = 0
  for (const b of buses) {
    const times = b[run]
    if (times && !times.endedAt) running++
    else if (times) done++
  }
  return { running, done, waiting: buses.length - running - done }
}

/** One student's check-in on one run today (attendance). */
export type DayMark = { studentId: string; busId: string | null; run: Run; status: Mark }

/**
 * Students who boarded the afternoon run but were never marked dropped off, on a bus whose afternoon run has ended:
 * the driver chose "End anyway". The school has to follow these up; their parents see "Not confirmed".
 */
export function unconfirmedDropOffs(marks: readonly DayMark[], runsByBus: ReadonlyMap<string, BusRunsToday>): DayMark[] {
  return marks.filter((m) => m.run === 'afternoon' && m.status === 'boarded' && m.busId !== null && Boolean(runsByBus.get(m.busId)?.afternoon?.endedAt))
}

/** Who rode a run: boarded or dropped off counts as on the bus, absent doesn't. */
export function rodeCount(marks: readonly DayMark[], run: Run): number {
  return marks.filter((m) => m.run === run && (m.status === 'boarded' || m.status === 'dropped_off')).length
}
