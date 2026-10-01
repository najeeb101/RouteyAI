import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/dashboard/StatsCard'
import type { AbsenceReason } from '@/types/database'

export const metadata: Metadata = {
  title: 'Absences',
}

type AbsenceRow = {
  id: string
  date: string
  reason: AbsenceReason
  note: string | null
  created_at: string
  student_name: string
  bus_name: string | null
  bus_color: string | null
}

// Same labels as the parent app (mobile/src/lib/absence.ts)
const REASONS: Record<AbsenceReason, { label: string; className: string }> = {
  sick:        { label: 'Sick',        className: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]' },
  appointment: { label: 'Appointment', className: 'bg-[#EFF6FF] text-[#1E3A8A] border-[#BFDBFE]' },
  travel:      { label: 'Travelling',  className: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]' },
  other:       { label: 'Other',       className: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]' },
}

const PAST_DAYS = 30

/** YYYY-MM-DD in Qatar, where the school day happens (the server runs in UTC). */
function qatarDate(d: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Qatar' }).format(d)
}

function formatDay(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
  })
}

function formatReported(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Qatar',
  })
}

function ReasonBadge({ reason }: { reason: AbsenceReason }) {
  const r = REASONS[reason]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold ${r.className}`}>
      {r.label}
    </span>
  )
}

function BusLabel({ name, color }: { name: string | null; color: string | null }) {
  if (!name) return <span className="text-[#94A3B8]">No bus</span>
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color ?? '#3B82F6' }} />
      {name}
    </span>
  )
}

function AbsenceItem({ a, showDate }: { a: AbsenceRow; showDate: boolean }) {
  const initials = a.student_name.split(' ').map(n => n[0] ?? '').join('').slice(0, 2)
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#F1F5F9] last:border-0">
      <div className="w-8 h-8 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[12px] font-bold text-[#1E3A8A] shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-[#0F172A]">{a.student_name}</span>
          <ReasonBadge reason={a.reason} />
        </div>
        <div className="text-[12px] text-[#64748B] mt-0.5">
          <BusLabel name={a.bus_name} color={a.bus_color} />
          {showDate && <span> · {formatDay(a.date)}</span>}
        </div>
        {a.note && <p className="text-[12px] text-[#475569] mt-1">&ldquo;{a.note}&rdquo;</p>}
      </div>
      <span className="text-[11px] text-[#94A3B8] shrink-0">Reported {formatReported(a.created_at)}</span>
    </div>
  )
}

export default async function AbsencesPage() {
  const supabase = createClient()

  const now = new Date()
  const today = qatarDate(now)
  const from = qatarDate(new Date(now.getTime() - PAST_DAYS * 24 * 60 * 60 * 1000))

  const { data: reports, error } = await supabase
    .from('absence_reports')
    .select('id, student_id, date, reason, note, created_at')
    .gte('date', from)
    .order('date', { ascending: true })
    .order('created_at', { ascending: true })

  const studentIds = Array.from(new Set((reports ?? []).map(r => r.student_id)))
  const [studentsResult, busesResult] = await Promise.all([
    studentIds.length
      ? supabase.from('students').select('id, name, bus_id').in('id', studentIds)
      : Promise.resolve({ data: [], error: null }),
    supabase.from('buses').select('id, name, color'),
  ])

  const loadError = error ?? studentsResult.error ?? busesResult.error
  if (loadError) console.error('Failed to load absences', loadError)

  const students = new Map((studentsResult.data ?? []).map(s => [s.id, s]))
  const buses = new Map((busesResult.data ?? []).map(b => [b.id, b]))

  const rows: AbsenceRow[] = (reports ?? []).map(r => {
    const student = students.get(r.student_id)
    const bus = student?.bus_id ? buses.get(student.bus_id) : undefined
    return {
      id: r.id,
      date: r.date,
      reason: r.reason,
      note: r.note,
      created_at: r.created_at,
      student_name: student?.name ?? 'Unknown student',
      bus_name: bus?.name ?? null,
      bus_color: bus?.color ?? null,
    }
  })

  const todayRows = rows.filter(r => r.date === today)
  const upcoming  = rows.filter(r => r.date > today)
  const past      = rows.filter(r => r.date < today).reverse()

  const todayLabel = formatDay(today)

  return (
    <div className="p-7 max-w-[1280px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A] leading-tight">Absences</h1>
        <p className="text-sm text-[#64748B] mt-0.5">
          Reported ahead of time by parents in the app. Drivers see them on their route.
        </p>
      </div>

      {loadError && (
        <div className="mb-4 px-4 py-3 bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-sm rounded-xl">
          Couldn&apos;t load absence reports. Refresh the page to try again.
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatsCard
          label="Staying home today"
          value={String(todayRows.length)}
          sub={todayLabel}
          color="#F59E0B"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          }
        />
        <StatsCard
          label="Coming up"
          value={String(upcoming.length)}
          sub="Future school days"
          color="#1E3A8A"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" strokeWidth="1.75" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
        <StatsCard
          label={`Past ${PAST_DAYS} days`}
          value={String(past.length)}
          sub="Reported absences"
          color="#64748B"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.75" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-5 mb-6">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-5">
          <div className="text-sm font-bold text-[#0F172A] mb-2">Today · {todayLabel}</div>
          {todayRows.length === 0 ? (
            <p className="text-xs text-[#94A3B8] py-6 text-center">No one is staying home today.</p>
          ) : (
            todayRows.map(a => <AbsenceItem key={a.id} a={a} showDate={false} />)
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-5">
          <div className="text-sm font-bold text-[#0F172A] mb-2">Coming up</div>
          {upcoming.length === 0 ? (
            <p className="text-xs text-[#94A3B8] py-6 text-center">No absences reported for later days.</p>
          ) : (
            upcoming.map(a => <AbsenceItem key={a.id} a={a} showDate />)
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-5">
        <div className="text-sm font-bold text-[#0F172A] mb-4">Past {PAST_DAYS} days</div>
        {past.length === 0 ? (
          <p className="text-xs text-[#94A3B8] py-6 text-center">No absences in the past {PAST_DAYS} days.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC]">
                {['Date', 'Student', 'Bus', 'Reason', 'Note', 'Reported'].map(h => (
                  <th key={h} className="px-3.5 py-2.5 text-left text-[11px] font-bold text-[#64748B] uppercase tracking-wide border-b border-[#E2E8F0]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {past.map(a => (
                <tr key={a.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-3.5 py-3 text-[13px] text-[#0F172A] whitespace-nowrap">{formatDay(a.date)}</td>
                  <td className="px-3.5 py-3 text-sm font-semibold text-[#0F172A]">{a.student_name}</td>
                  <td className="px-3.5 py-3 text-[13px] text-[#0F172A]"><BusLabel name={a.bus_name} color={a.bus_color} /></td>
                  <td className="px-3.5 py-3"><ReasonBadge reason={a.reason} /></td>
                  <td className="px-3.5 py-3 text-[13px] text-[#64748B] max-w-[260px] truncate">{a.note ?? <span className="text-[#94A3B8]">—</span>}</td>
                  <td className="px-3.5 py-3 text-[12px] text-[#94A3B8] whitespace-nowrap">{formatReported(a.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
