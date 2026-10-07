import type { Metadata } from 'next'
import { ChartColumnBig } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Panel } from '@/components/dashboard/Panel'
import { StatsCard } from '@/components/dashboard/StatsCard'

export const metadata: Metadata = {
  title: 'Platform analytics',
}

type SchoolRow = {
  id: string
  name: string
  bus_count: number
  student_count: number
}

/** The share of seats taken for a school, 0 when it has no buses. */
const share = (students: number, seats: number) => (seats > 0 ? Math.round((students / seats) * 100) : 0)

export default async function AdminAnalyticsPage() {
  const supabase = createClient()

  const [schoolsResult, busesResult] = await Promise.all([
    supabase.rpc('get_schools_with_admins'),
    supabase.from('buses').select('school_id, capacity'),
  ])
  for (const { error } of [schoolsResult, busesResult]) {
    if (error) console.error('Platform analytics:', error.message)
  }

  const schools = (schoolsResult.data ?? []) as SchoolRow[]
  const seatsBySchool = new Map<string, number>()
  for (const b of busesResult.data ?? []) seatsBySchool.set(b.school_id, (seatsBySchool.get(b.school_id) ?? 0) + b.capacity)

  const rows = schools
    .map((s) => {
      const seats = seatsBySchool.get(s.id) ?? 0
      return { ...s, seats, taken: share(s.student_count, seats) }
    })
    .sort((a, b) => b.student_count - a.student_count)

  const totalStudents = rows.reduce((n, r) => n + r.student_count, 0)
  const totalSeats = rows.reduce((n, r) => n + r.seats, 0)
  const totalBuses = rows.reduce((n, r) => n + r.bus_count, 0)
  const overall = share(totalStudents, totalSeats)

  return (
    <>
      <PageHeader title="Analytics" subtitle="Students and seats across every school, as of now." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard step={1} label="Schools" value={rows.length} sub="On the platform" />
        <StatsCard step={2} label="Students" value={totalStudents} sub={`${totalSeats} seats in total`} />
        <StatsCard step={3} label="Seats taken" value={`${overall}%`} sub="Across all schools" subTone={overall >= 90 ? 'warning' : 'neutral'} />
        <StatsCard step={4} label="Buses" value={totalBuses} sub="Across all schools" />
      </div>

      <Panel step={5} className="mt-4" title="Schools" subtitle="Students and seats for each school" bodyClassName="p-0 pt-2">
        {rows.length === 0 ? (
          <EmptyState icon={ChartColumnBig} title="No schools yet" className="py-10">
            Numbers appear here once a school has buses and students.
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="text-left text-[13px] text-ink-2">
                  <th className="px-5 py-3 font-medium">School</th>
                  <th className="px-3 py-3 text-right font-medium">Buses</th>
                  <th className="px-3 py-3 text-right font-medium">Students</th>
                  <th className="px-3 py-3 text-right font-medium">Free seats</th>
                  <th className="px-5 py-3 font-medium">Seats taken</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} className="border-t border-line">
                    <td className="px-5 py-3 text-sm font-semibold text-ink">{r.name}</td>
                    <td className="px-3 py-3 text-right text-[13px] tabular-nums text-ink">{r.bus_count}</td>
                    <td className="px-3 py-3 text-right text-[13px] tabular-nums text-ink">{r.student_count}</td>
                    <td className="px-3 py-3 text-right text-[13px] tabular-nums text-ink">{Math.max(0, r.seats - r.student_count)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-canvas" aria-hidden="true">
                          <div
                            className="h-full origin-left rounded-full bg-brand animate-grow-x motion-reduce:animate-none"
                            style={{ width: `${Math.min(100, r.taken)}%`, animationDelay: `${300 + i * 60}ms` }}
                          />
                        </div>
                        <span className="w-10 text-[13px] tabular-nums text-ink">{r.seats > 0 ? `${r.taken}%` : '—'}</span>
                      </div>
                    </td>
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
