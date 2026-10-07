import type { Metadata } from 'next'
import { CalendarCheck2, CalendarX2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { RIDES_LABEL, qatarDateKey, type ReportRuns } from '@/lib/runs'
import type { AbsenceReason } from '@/types/database'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Notice } from '@/components/dashboard/Notice'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Panel } from '@/components/dashboard/Panel'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Badge } from '@/components/dashboard/StatusText'

export const metadata: Metadata = {
  title: 'Absences',
}

type AbsenceRow = {
  id: string
  date: string
  reason: AbsenceReason
  runs: ReportRuns
  note: string | null
  created_at: string
  student_name: string
  bus_name: string | null
  bus_color: string | null
}

// Same words as the parent app (mobile/src/lib/absence.ts).
const REASONS: Record<AbsenceReason, string> = {
  sick: 'Sick',
  appointment: 'Appointment',
  travel: 'Travelling',
  other: 'Other',
}

const PAST_DAYS = 30

function formatDay(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
}

function formatReported(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Qatar' })
}

function BusLabel({ name, color }: { name: string | null; color: string | null }) {
  if (!name) return <span className="text-ink-3">No bus</span>
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color ?? '#3B82F6' }} aria-hidden="true" />
      {name}
    </span>
  )
}

/** Which rides the report covers: plain text for both, a badge when only one ride is affected. */
function Rides({ runs }: { runs: ReportRuns }) {
  return runs === 'both' ? <span className="text-ink-2">{RIDES_LABEL.both}</span> : <Badge tone="warning">{RIDES_LABEL[runs]}</Badge>
}

function AbsenceItem({ a, showDate, step }: { a: AbsenceRow; showDate: boolean; step: number }) {
  const initials = a.student_name.split(/\s+/).filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join('')
  return (
    <li className="flex items-start gap-3 border-t border-line py-3.5 first:border-t-0 animate-rise motion-reduce:animate-none" style={{ animationDelay: `${step * 40}ms` }}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-tint text-xs font-semibold text-brand">{initials}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold text-ink">{a.student_name}</span>
          <span className="text-[13px] text-ink-2">· {REASONS[a.reason]}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-2">
          <BusLabel name={a.bus_name} color={a.bus_color} />
          <Rides runs={a.runs} />
          {showDate && <span>{formatDay(a.date)}</span>}
        </div>
        {a.note && <p className="mt-1.5 text-[13px] text-ink">&ldquo;{a.note}&rdquo;</p>}
      </div>
      <span className="shrink-0 text-xs text-ink-3">{formatReported(a.created_at)}</span>
    </li>
  )
}

export default async function AbsencesPage() {
  const supabase = createClient()

  const now = new Date()
  const today = qatarDateKey(now)
  const from = qatarDateKey(new Date(now.getTime() - PAST_DAYS * 24 * 60 * 60 * 1000))

  const { data: reports, error } = await supabase
    .from('absence_reports')
    .select('id, student_id, date, reason, runs, note, created_at')
    .gte('date', from)
    .order('date', { ascending: true })
    .order('created_at', { ascending: true })

  const studentIds = Array.from(new Set((reports ?? []).map((r) => r.student_id)))
  const [studentsResult, busesResult] = await Promise.all([
    studentIds.length ? supabase.from('students').select('id, name, bus_id').in('id', studentIds) : Promise.resolve({ data: [], error: null }),
    supabase.from('buses').select('id, name, color'),
  ])

  const loadError = error ?? studentsResult.error ?? busesResult.error
  if (loadError) console.error('Failed to load absences', loadError)

  const students = new Map((studentsResult.data ?? []).map((s) => [s.id, s]))
  const buses = new Map((busesResult.data ?? []).map((b) => [b.id, b]))

  const rows: AbsenceRow[] = (reports ?? []).map((r) => {
    const student = students.get(r.student_id)
    const bus = student?.bus_id ? buses.get(student.bus_id) : undefined
    return {
      id: r.id,
      date: r.date,
      reason: r.reason,
      runs: r.runs,
      note: r.note,
      created_at: r.created_at,
      student_name: student?.name ?? 'Unknown student',
      bus_name: bus?.name ?? null,
      bus_color: bus?.color ?? null,
    }
  })

  const todayRows = rows.filter((r) => r.date === today)
  const upcoming = rows.filter((r) => r.date > today)
  const past = rows.filter((r) => r.date < today).reverse()
  const oneRideToday = todayRows.filter((r) => r.runs !== 'both').length

  return (
    <>
      <PageHeader title="Absences" subtitle="Reported ahead by parents in the app. Drivers see them on their route, ride by ride." />

      {loadError && <Notice tone="danger" className="mb-4">Couldn&apos;t load absence reports. Refresh the page to try again.</Notice>}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard step={1} label="Staying home today" value={todayRows.length} sub={oneRideToday ? `${oneRideToday} for one ride only` : formatDay(today)} />
        <StatsCard step={2} label="Coming up" value={upcoming.length} sub="Later school days" />
        <StatsCard step={3} label={`Past ${PAST_DAYS} days`} value={past.length} sub="Reported absences" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel step={4} title="Today" subtitle={formatDay(today)} bodyClassName="py-1">
          {todayRows.length === 0 ? (
            <EmptyState icon={CalendarCheck2} title="No one is staying home today" className="py-8" />
          ) : (
            <ul>{todayRows.map((a, i) => <AbsenceItem key={a.id} a={a} showDate={false} step={i} />)}</ul>
          )}
        </Panel>
        <Panel step={5} title="Coming up" bodyClassName="py-1">
          {upcoming.length === 0 ? (
            <EmptyState icon={CalendarCheck2} title="Nothing reported for later days" className="py-8" />
          ) : (
            <ul>{upcoming.map((a, i) => <AbsenceItem key={a.id} a={a} showDate step={i} />)}</ul>
          )}
        </Panel>
      </div>

      <Panel step={6} className="mt-4" title={`Past ${PAST_DAYS} days`} bodyClassName="p-0 pt-2">
        {past.length === 0 ? (
          <EmptyState icon={CalendarX2} title={`No absences in the past ${PAST_DAYS} days`} className="py-8" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="text-left text-[13px] text-ink-2">
                  {['Date', 'Student', 'Bus', 'Rides', 'Reason', 'Note', 'Reported'].map((h, i) => (
                    <th key={h} className={i === 0 ? 'px-5 py-3 font-medium' : 'px-3 py-3 font-medium'}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {past.map((a) => (
                  <tr key={a.id} className="border-t border-line transition-colors hover:bg-canvas/60">
                    <td className="whitespace-nowrap px-5 py-3 text-[13px] text-ink">{formatDay(a.date)}</td>
                    <td className="px-3 py-3 text-sm font-semibold text-ink">{a.student_name}</td>
                    <td className="px-3 py-3 text-[13px] text-ink"><BusLabel name={a.bus_name} color={a.bus_color} /></td>
                    <td className="px-3 py-3 text-[13px]"><Rides runs={a.runs} /></td>
                    <td className="px-3 py-3 text-[13px] text-ink">{REASONS[a.reason]}</td>
                    <td className="max-w-[240px] truncate px-3 py-3 text-[13px] text-ink-2">{a.note ?? <span className="text-ink-3">—</span>}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-ink-3">{formatReported(a.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  )
}
