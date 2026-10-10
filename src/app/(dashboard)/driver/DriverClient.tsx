'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Bell, Bus, Check, LogOut, School, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  driverRun,
  groupStops,
  qatarDateKey,
  reportCovers,
  RUN_LABEL,
  runOrder,
  savedRunOrder,
  type BusRunsToday,
  type Mark,
  type ReportRuns,
  type Run,
} from '@/lib/runs'
import { RouteyLogo } from '@/components/RouteyLogo'
import { ActionButton } from '@/components/dashboard/ActionButton'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { LivePill } from '@/components/dashboard/LivePill'
import { Modal } from '@/components/dashboard/Modal'
import { SignatureCard } from '@/components/dashboard/SignatureCard'
import { Badge } from '@/components/dashboard/StatusText'
import type { DriverAnnouncementData, DriverBusData, DriverStudentData } from './page'

type RunRow = { run: Run; started_at: string; ended_at: string | null; stops: { student_id: string; position: number }[] }
type Student = DriverStudentData & { stopOrder: number | null; address: string }

const clock = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Qatar', hour: 'numeric', minute: '2-digit' })

/**
 * The web version of the driver app (Docs/Claude.md §1.1): it picks the run, starts and ends it with
 * start_run / end_run and checks children in with mark_attendance, so it follows the same rules as the phone. Live GPS
 * only comes from the phone app.
 */
export default function DriverClient({ bus, students: rawStudents, announcements, schoolName }: {
  bus: DriverBusData | null
  students: DriverStudentData[]
  announcements: DriverAnnouncementData[]
  schoolName: string | null
}) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [runRows, setRunRows] = useState<RunRow[]>([])
  const [marks, setMarks] = useState<Map<string, Partial<Record<Run, Mark>>>>(new Map())
  const [reports, setReports] = useState<Map<string, ReportRuns>>(new Map())
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [now, setNow] = useState(() => new Date())
  const [confirmEnd, setConfirmEnd] = useState(false)
  const [messagesOpen, setMessagesOpen] = useState(false)

  const students: Student[] = useMemo(() => rawStudents.map((s) => ({ ...s, stopOrder: s.stop_order, address: s.home_address })), [rawStudents])
  const studentKey = students.map((s) => s.id).join(',')

  const load = useCallback(async () => {
    if (!bus) return
    const date = qatarDateKey()
    const ids = studentKey ? studentKey.split(',') : []
    const [runsRes, marksRes, reportsRes] = await Promise.all([
      supabase.from('bus_runs').select('run, started_at, ended_at, stops').eq('bus_id', bus.id).eq('date', date),
      supabase.from('attendance').select('student_id, run, status').eq('bus_id', bus.id).eq('date', date),
      ids.length ? supabase.from('absence_reports').select('student_id, runs').in('student_id', ids).eq('date', date) : Promise.resolve({ data: [], error: null }),
    ])
    for (const { error } of [runsRes, marksRes, reportsRes]) {
      if (error) console.error('Driver page:', error.message)
    }
    setRunRows((runsRes.data ?? []) as RunRow[])
    const next = new Map<string, Partial<Record<Run, Mark>>>()
    for (const m of marksRes.data ?? []) {
      if (!m.student_id || !m.status) continue
      next.set(m.student_id, { ...next.get(m.student_id), [m.run]: m.status })
    }
    setMarks(next)
    setReports(new Map((reportsRes.data ?? []).map((r) => [r.student_id, r.runs])))
    setLoaded(true)
  }, [bus, studentKey, supabase])

  useEffect(() => {
    if (!bus) return
    void load()
    const channel = supabase
      .channel(`web-driver-${bus.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bus_runs', filter: `bus_id=eq.${bus.id}` }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance', filter: `bus_id=eq.${bus.id}` }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'absence_reports' }, () => void load())
      .subscribe()
    const tick = setInterval(() => setNow(new Date()), 60_000)
    return () => {
      clearInterval(tick)
      supabase.removeChannel(channel)
    }
  }, [bus, load, supabase])

  const busRuns: BusRunsToday = Object.fromEntries(runRows.map((r) => [r.run, { startedAt: r.started_at, endedAt: r.ended_at }]))
  const state = driverRun(busRuns, now)
  const run = state.run
  const running = state.phase === 'running'
  const runRow = runRows.find((r) => r.run === run)
  const ordered = running && runRow ? savedRunOrder(students, runRow.stops.map((s) => s.student_id), run) : runOrder(students, run)
  const stops = groupStops(ordered)
  const markOf = (id: string) => marks.get(id)?.[run]
  const reported = (id: string) => reportCovers(reports.get(id), run)

  // A child is dealt with when they boarded (morning), were dropped off (afternoon), were marked absent, or a parent
  // reported them; in the afternoon a child who never boarded at school isn't on the bus.
  const handled = (s: Student) => {
    const m = markOf(s.id)
    if (reported(s.id) || m === 'absent') return true
    return run === 'morning' ? m === 'boarded' || m === 'dropped_off' : m === 'dropped_off' || m === undefined
  }
  const riding = students.filter((s) => !reported(s.id))
  const boarded = students.filter((s) => markOf(s.id) === 'boarded' || markOf(s.id) === 'dropped_off').length
  const atSchoolDone = students.every((s) => reported(s.id) || markOf(s.id) !== undefined)
  const currentStopIndex = run === 'afternoon' && !atSchoolDone ? -1 : stops.findIndex((g) => !g.students.every(handled))
  const currentStop = currentStopIndex >= 0 ? stops[currentStopIndex] : null
  const stillOnBoard = students.filter((s) => markOf(s.id) === 'boarded' && run === 'afternoon')

  async function mark(id: string, status: Mark | null) {
    setBusy(id)
    const { error } = await supabase.rpc('mark_attendance', { p_student_id: id, p_status: status })
    setBusy(null)
    if (error) toast.error(error.message)
    await load()
  }

  async function start() {
    setBusy('run')
    const { error } = await supabase.rpc('start_run', { p_run: run })
    setBusy(null)
    if (error) toast.error(error.message)
    else toast.success(`${RUN_LABEL[run]} started`)
    await load()
  }

  async function end(force = false) {
    if (!force && run === 'afternoon' && stillOnBoard.length > 0) {
      setConfirmEnd(true)
      return
    }
    setConfirmEnd(false)
    setBusy('run')
    const { error } = await supabase.rpc('end_run')
    setBusy(null)
    if (error) toast.error(error.message)
    else toast.success(run === 'morning' ? 'Morning run ended. Everyone on board is at school.' : 'Afternoon run ended')
    await load()
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const header = (
    <header className="flex items-center justify-between pb-2 pt-5">
      <span className="flex items-center gap-2">
        <RouteyLogo size={26} />
        <span className="font-display text-lg font-bold tracking-[-0.01em]">Routey<span className="text-brand">AI</span></span>
      </span>
      <span className="flex items-center gap-1">
        {bus && (
          <button onClick={() => setMessagesOpen(true)} aria-label="Messages from school" className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-2 transition-colors hover:bg-white hover:text-ink">
            <Bell size={19} />
            {announcements.length > 0 && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-bad ring-2 ring-canvas" />}
          </button>
        )}
        <button onClick={signOut} aria-label="Sign out" className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-2 transition-colors hover:bg-white hover:text-ink">
          <LogOut size={18} />
        </button>
      </span>
    </header>
  )

  if (!bus) {
    return (
      <div className="mx-auto max-w-[480px] px-5">
        {header}
        <EmptyState icon={Bus} title="No bus assigned" className="mt-16">Your school hasn&apos;t put you on a bus yet. Ask your school admin.</EmptyState>
      </div>
    )
  }

  const studentRow = (s: Student, kind: 'board' | 'drop') => {
    const m = markOf(s.id)
    const isBusy = busy === s.id
    if (reported(s.id)) return <Badge tone="warning">Staying home</Badge>
    if (!running) return null
    if (kind === 'drop') {
      if (m === 'absent') return <Badge tone="danger">Absent</Badge>
      if (m === undefined) return <span className="text-[13px] text-ink-2">Not on the bus</span>
      const dropped = m === 'dropped_off'
      return (
        <ActionButton size="sm" variant={dropped ? 'secondary' : 'primary'} loading={isBusy} onClick={() => mark(s.id, dropped ? 'boarded' : 'dropped_off')}>
          {dropped ? <><Check /> Dropped off</> : 'Drop off'}
        </ActionButton>
      )
    }
    return (
      <span className="inline-flex rounded-xl bg-canvas p-0.5" role="group" aria-label={`${s.name}: board or absent`}>
        {(['boarded', 'absent'] as const).map((status) => {
          const on = m === status || (status === 'boarded' && m === 'dropped_off')
          return (
            <button
              key={status}
              disabled={isBusy || m === 'dropped_off'}
              onClick={() => mark(s.id, on ? null : status)}
              aria-pressed={on}
              className={cn(
                'h-8 rounded-[10px] px-3 text-[13px] font-medium transition-colors duration-150 disabled:opacity-60',
                on ? (status === 'boarded' ? 'bg-ok text-white' : 'bg-bad text-white') : 'text-ink-2 hover:text-ink',
              )}
            >
              {status === 'boarded' ? 'Board' : 'Absent'}
            </button>
          )
        })}
      </span>
    )
  }

  return (
    <div className="mx-auto max-w-[480px] px-5 pb-12">
      {header}

      <div className="mb-5 mt-3 animate-rise motion-reduce:animate-none">
        <h1 className="font-display text-[28px] font-bold leading-[34px] tracking-[-0.02em]">{bus.name}</h1>
        <p className="mt-0.5 text-[15px] text-ink-2">{schoolName ?? 'School'} · {stops.length} stop{stops.length === 1 ? '' : 's'} · {students.length} student{students.length === 1 ? '' : 's'}</p>
      </div>

      <SignatureCard step={1}>
        {!loaded ? (
          <div className="h-28" aria-busy="true" />
        ) : running ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-medium text-white/80">{RUN_LABEL[run]}</p>
              <LivePill onNight />
            </div>
            <p className="mt-6 text-[13px] text-white/60">
              {run === 'afternoon' && currentStopIndex === -1 ? 'Now' : currentStop ? `Stop ${currentStopIndex + 1} of ${stops.length}` : 'All stops done'}
            </p>
            <p className="mt-1 font-display text-2xl font-bold leading-tight">
              {run === 'afternoon' && currentStopIndex === -1 ? 'Boarding at school' : currentStop?.name ?? (run === 'morning' ? 'Drive to school' : 'Everyone is home')}
            </p>
            <div className="mt-5 flex items-end justify-between gap-4">
              <p className="text-sm text-white/70">
                <span className="font-display text-[32px] font-bold leading-none text-white tabular-nums">{run === 'morning' ? boarded : students.filter((s) => markOf(s.id) === 'dropped_off').length}</span>
                <span className="ml-1">of {run === 'morning' ? riding.length : boarded} {run === 'morning' ? 'boarded' : 'dropped off'}</span>
              </p>
              <ActionButton variant="on-night" size="sm" loading={busy === 'run'} onClick={() => end()}>
                End {run} run
              </ActionButton>
            </div>
          </>
        ) : state.phase === 'ended' ? (
          <>
            <p className="text-[15px] font-medium text-white/80">Done for today</p>
            <p className="mt-6 font-display text-2xl font-bold">Both runs are finished.</p>
            <p className="mt-1 text-sm text-white/70">See you tomorrow morning.</p>
          </>
        ) : (
          <>
            <p className="text-[15px] font-medium text-white/80">{run === 'afternoon' && busRuns.morning ? 'Morning run done' : 'Today'}</p>
            <p className="mt-6 font-display text-2xl font-bold">Ready for the {run} run?</p>
            <p className="mt-1 text-sm text-white/70">
              {run === 'morning' ? 'Pick students up stop by stop, then drive to school.' : 'Board everyone at school, then drop them off stop by stop.'}
            </p>
            <ActionButton variant="on-night" className="mt-5" loading={busy === 'run'} onClick={start}>Start {run} run</ActionButton>
          </>
        )}
      </SignatureCard>

      <p className="mt-3 flex items-center gap-2 px-1 text-xs text-ink-2">
        <Smartphone size={13} aria-hidden="true" /> Parents see the bus move only when you drive with the RouteyAI app on your phone.
      </p>

      {students.length === 0 ? (
        <EmptyState icon={Bus} title="No students on this bus yet" className="mt-6">Your school adds them on the dashboard.</EmptyState>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {run === 'afternoon' && (
            <section className={cn('rounded-xl bg-white p-4 ring-1 ring-ink/[0.04] animate-rise motion-reduce:animate-none', running && currentStopIndex === -1 && 'ring-2 ring-brand')}>
              <h2 className="flex items-center gap-2.5 text-[15px] font-semibold">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-night text-white"><School size={14} /></span>
                At school
              </h2>
              <ul className="mt-3 divide-y divide-line">
                {students.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="text-sm font-medium">{s.name}</span>
                    {studentRow(s, 'board')}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {stops.map((g, i) => {
            const done = g.students.every(handled)
            const current = running && i === currentStopIndex
            return (
              <section
                key={`${g.name}-${i}`}
                className={cn('rounded-xl bg-white p-4 ring-1 transition-shadow animate-rise motion-reduce:animate-none', current ? 'ring-2 ring-brand' : 'ring-ink/[0.04]')}
                style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
              >
                <h2 className="flex items-center gap-2.5 text-[15px] font-semibold">
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[2.5px] text-xs',
                      done && running ? 'border-brand bg-brand text-white' : 'border-brand bg-white text-ink',
                    )}
                  >
                    {done && running ? <Check size={13} strokeWidth={3} /> : i + 1}
                  </span>
                  <span className="truncate">{g.name}</span>
                </h2>
                <ul className="mt-2 divide-y divide-line">
                  {g.students.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                      <span className="text-sm font-medium">{s.name}</span>
                      {studentRow(s, run === 'morning' ? 'board' : 'drop')}
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}

          {run === 'morning' && (
            <section className="flex items-center gap-2.5 rounded-xl bg-white p-4 text-[15px] font-semibold ring-1 ring-ink/[0.04]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-night text-white"><School size={14} /></span>
              {schoolName ?? 'School'}
            </section>
          )}
        </div>
      )}

      <Modal
        open={confirmEnd}
        onClose={() => setConfirmEnd(false)}
        width="sm"
        title={`${stillOnBoard.length === 1 ? `${stillOnBoard[0]?.name} is` : `${stillOnBoard.length} children are`} still on the bus`}
        description="They boarded at school but weren't marked dropped off. Their parents will see “Not confirmed”, and the school is told."
        footer={
          <>
            <ActionButton variant="danger-plain" onClick={() => end(true)} loading={busy === 'run'}>End anyway</ActionButton>
            <ActionButton onClick={() => setConfirmEnd(false)}>Go back</ActionButton>
          </>
        }
      >
        <ul className="text-sm text-ink">{stillOnBoard.map((s) => <li key={s.id}>{s.name} · {s.home_address}</li>)}</ul>
      </Modal>

      <Modal open={messagesOpen} onClose={() => setMessagesOpen(false)} title="Messages from school">
        {announcements.length === 0 ? (
          <p className="text-sm text-ink-2">No messages yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {announcements.map((a) => (
              <li key={a.id} className="rounded-xl bg-canvas px-4 py-3">
                <p className="text-sm text-ink">{a.message}</p>
                <p className="mt-1 text-xs text-ink-2">{clock.format(new Date(a.created_at))}</p>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  )
}
