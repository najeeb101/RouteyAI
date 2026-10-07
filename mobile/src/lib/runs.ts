/**
 * The two runs a day as the apps see them (Docs/plans/two-runs-a-day.md): which run the driver is on, the order of
 * stops on each run, and what the parent's card says at any moment of the day. Plain functions with no imports, so
 * Node's test runner checks them (runs.test.ts; run `pnpm test:logic` from the repo root).
 */

export type Run = 'morning' | 'afternoon'
/** What the driver recorded for a child on a run. */
export type Mark = 'boarded' | 'absent' | 'dropped_off'
/** Which rides a parent's absence report covers. */
export type ReportRuns = 'both' | 'morning' | 'afternoon'

export type RunTimes = { startedAt: string; endedAt: string | null }
/** A bus's runs today (bus_runs), by run. */
export type BusRunsToday = Partial<Record<Run, RunTimes>>

/** The afternoon takes over at 11:00 Qatar time when the morning run never happened (decision 3). */
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
 * The run the driver app shows: the one that is running; otherwise the morning until it has been driven, then the
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

// ── Parent ────────────────────────────────────────────────────────────────

export type DayMark = { status: Mark; at: string; droppedAt: string | null }

export type ChildDay = {
  hasBus: boolean
  marks: Partial<Record<Run, DayMark>>
  /** Today's absence report, if any. */
  report: ReportRuns | null
  /** The child's bus's runs today. */
  busRuns: BusRunsToday
}

export type CardKind =
  | 'no-bus'
  | 'not-started'
  | 'waiting'
  | 'on-bus'
  | 'at-school'
  | 'boarding-at-school'
  | 'on-way-home'
  | 'home'
  /** Boarded at school, but the afternoon run ended without a drop-off. */
  | 'unconfirmed'
  | 'absent'
  | 'reported'
  | 'not-checked'

export type ParentCard = {
  run: Run
  kind: CardKind
  /** What the arrival time counts to while the bus is coming or the child is on it. */
  target: 'stop' | 'school' | null
}

/**
 * The run a parent's card follows: the afternoon once its run has started, the morning once its run has started (so
 * "At school" stays up until the afternoon run begins), otherwise by the time of day.
 */
export function parentRun(busRuns: BusRunsToday, now: Date = new Date()): Run {
  if (busRuns.afternoon) return 'afternoon'
  if (busRuns.morning) return 'morning'
  return qatarHour(now) >= AFTERNOON_FROM_HOUR ? 'afternoon' : 'morning'
}

/** Where the child is in the day (the parent's card in the plan). */
export function parentCard(day: ChildDay, now: Date = new Date()): ParentCard {
  const run = parentRun(day.busRuns, now)
  if (!day.hasBus) return { run, kind: 'no-bus', target: null }
  const mark = day.marks[run]?.status
  const times = day.busRuns[run]
  const running = Boolean(times && !times.endedAt)
  const ended = Boolean(times?.endedAt)

  if (run === 'morning') {
    if (mark === 'boarded') return { run, kind: 'on-bus', target: running ? 'school' : null }
    if (mark === 'dropped_off') return { run, kind: 'at-school', target: null }
    if (mark === 'absent') return { run, kind: 'absent', target: null }
    if (reportCovers(day.report, 'morning')) return { run, kind: 'reported', target: null }
    if (running) return { run, kind: 'waiting', target: 'stop' }
    return { run, kind: ended ? 'not-checked' : 'not-started', target: null }
  }

  if (mark === 'dropped_off') return { run, kind: 'home', target: null }
  if (mark === 'boarded') return ended ? { run, kind: 'unconfirmed', target: null } : { run, kind: 'on-way-home', target: running ? 'stop' : null }
  if (mark === 'absent') return { run, kind: 'absent', target: null }
  if (reportCovers(day.report, 'afternoon')) return { run, kind: 'reported', target: null }
  if (running) return { run, kind: 'boarding-at-school', target: null }
  if (ended) return { run, kind: 'not-checked', target: null }
  return { run, kind: day.marks.morning?.status === 'dropped_off' ? 'at-school' : 'not-started', target: null }
}

export type CardTone = 'success' | 'warning' | 'danger' | 'neutral'

/** The short status word for each card (the dot in the child switcher, the label on the map card). */
export const CARD_STATUS: Record<CardKind, { label: string; tone: CardTone }> = {
  'no-bus': { label: 'No bus yet', tone: 'neutral' },
  'not-started': { label: 'Not started', tone: 'neutral' },
  waiting: { label: 'Waiting', tone: 'neutral' },
  'on-bus': { label: 'On the bus', tone: 'success' },
  'at-school': { label: 'At school', tone: 'success' },
  'boarding-at-school': { label: 'At school', tone: 'neutral' },
  'on-way-home': { label: 'On the bus', tone: 'success' },
  home: { label: 'Home', tone: 'success' },
  unconfirmed: { label: 'Not confirmed', tone: 'warning' },
  absent: { label: 'Absent', tone: 'danger' },
  reported: { label: 'Staying home', tone: 'warning' },
  'not-checked': { label: 'Not checked in', tone: 'warning' },
}

export type CardInput = {
  first: string
  busName: string | null
  /** Arrival time to the card's target from the bus's live position, if there is one. */
  eta: { minutes: number; stopsBefore: number | null } | null
  /** The bus sent a GPS point in the last few minutes. */
  live: boolean
  /** Already formatted ("6:52 AM"). */
  boardedAt?: string
  droppedAt?: string
  markedAt?: string
  reportReason?: string
}

const stopsText = (n: number | null) => (n === null ? null : n === 0 ? 'Your stop is next.' : `${n} stop${n === 1 ? '' : 's'} before yours.`)

/** The words on the parent's card: a small line above, the big line, and the sentence under it. */
export function cardText(card: ParentCard, i: CardInput): { context: string; big: string; sub: string } {
  const bus = i.busName ?? 'The bus'
  const when = card.run === 'morning' ? 'this morning' : 'this afternoon'
  switch (card.kind) {
    case 'no-bus':
      return { context: 'Today', big: 'No bus yet', sub: `Your school hasn't put ${i.first} on a bus yet.` }
    case 'not-started':
      return { context: RUN_LABEL[card.run], big: 'Not started', sub: `${bus} hasn't started the ${card.run} run yet.` }
    case 'waiting':
      if (i.eta) return { context: 'Arriving at your stop', big: i.eta.minutes <= 1 ? 'Arriving' : `${i.eta.minutes} min`, sub: stopsText(i.eta.stopsBefore) ?? 'On the way to your stop.' }
      return { context: 'Arriving at your stop', big: 'On the way', sub: i.live ? 'Waiting for the next GPS update.' : `${bus} has started the morning run.` }
    case 'on-bus':
      return {
        context: RUN_LABEL.morning,
        big: 'On the bus',
        sub: `${i.first} boarded${i.boardedAt ? ` at ${i.boardedAt}` : ''}.${i.eta ? ` About ${i.eta.minutes} min to school.` : ''}`,
      }
    case 'at-school':
      return { context: 'Today', big: 'At school', sub: i.droppedAt ? `${i.first} arrived at ${i.droppedAt}.` : `${i.first} is at school.` }
    case 'boarding-at-school':
      return { context: RUN_LABEL.afternoon, big: 'Boarding at school', sub: `The bus is at school. ${i.first} isn't on board yet.` }
    case 'on-way-home':
      if (i.eta) return { context: 'Arriving at your stop', big: i.eta.minutes <= 1 ? 'Arriving' : `${i.eta.minutes} min`, sub: `On the way home. ${stopsText(i.eta.stopsBefore) ?? ''}`.trim() }
      return { context: RUN_LABEL.afternoon, big: 'On the way home', sub: `${i.first} boarded${i.boardedAt ? ` at school at ${i.boardedAt}` : ''}.` }
    case 'home':
      return { context: 'Today', big: 'Home', sub: `${i.first} was dropped off${i.droppedAt ? ` at ${i.droppedAt}` : ''}.` }
    case 'unconfirmed':
      return { context: RUN_LABEL.afternoon, big: 'Not confirmed', sub: `The run has ended, but the driver didn't mark ${i.first} dropped off. Contact the school if you're not sure where ${i.first} is.` }
    case 'absent':
      return card.run === 'morning'
        ? { context: RUN_LABEL.morning, big: 'Absent', sub: `The driver marked ${i.first} absent${i.markedAt ? ` at ${i.markedAt}` : ''}.` }
        : { context: RUN_LABEL.afternoon, big: 'Not on the bus home', sub: `The driver marked ${i.first} absent at school${i.markedAt ? ` at ${i.markedAt}` : ''}.` }
    case 'reported':
      return { context: 'Today', big: 'Staying home', sub: `You told the driver ${i.first} won't ride ${when}${i.reportReason ? ` (${i.reportReason.toLowerCase()})` : ''}.` }
    case 'not-checked':
      return { context: RUN_LABEL[card.run], big: 'Not checked in', sub: `The driver didn't check ${i.first} in ${when}. Ask the school if you're not sure.` }
  }
}

/** One past day in the parent's history: both rides in a line. `time` formats an ISO time ("6:52 AM"). */
export function historyLine(
  marks: Partial<Record<Run, DayMark>>,
  report: ReportRuns | null,
  time: (iso: string) => string,
): { title: string; detail: string; tone: CardTone | 'none' } {
  const rode = (run: Run) => marks[run]?.status === 'boarded' || marks[run]?.status === 'dropped_off'
  const parts: string[] = []
  const m = marks.morning
  const a = marks.afternoon
  if (m && rode('morning')) parts.push(`Picked up ${time(m.at)}`)
  if (m?.status === 'absent') parts.push('Absent in the morning')
  if (a && rode('afternoon')) parts.push(a.droppedAt ? `dropped off ${time(a.droppedAt)}` : `boarded at school ${time(a.at)}`)
  if (a?.status === 'absent') parts.push('absent in the afternoon')
  const detail = parts.join(' · ').replace(/^./, (c) => c.toUpperCase())

  if (rode('morning') && rode('afternoon')) return { title: 'Rode both ways', detail, tone: 'success' }
  if (report) return { title: 'Stayed home', detail: `You reported it · ${RIDES_LABEL[report]}${detail ? ` · ${detail}` : ''}`, tone: 'warning' }
  if (rode('morning')) return { title: 'Morning ride only', detail, tone: 'success' }
  if (rode('afternoon')) return { title: 'Afternoon ride only', detail, tone: 'success' }
  if (m?.status === 'absent' || a?.status === 'absent') return { title: 'Absent', detail, tone: 'danger' }
  return { title: 'No record', detail: '', tone: 'none' }
}
