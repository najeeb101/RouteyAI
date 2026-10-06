import type { Metadata } from 'next'
import { ChartColumnBig } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { qatarDateKey, type Run } from '@/lib/runs'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Panel } from '@/components/dashboard/Panel'
import { StatsCard } from '@/components/dashboard/StatsCard'
import type { BusRow } from '../buses/BusesTable'

export const metadata: Metadata = {
  title: 'Analytics',
}

const WINDOW_DAYS = 28
const CHART_DAYS = 10

// Checked with the dataviz palette validator (light surface): all checks pass. The tritan separation is in the floor
// band, so the chart also has a legend, gaps between bars, a tooltip per day and the numbers in a table.
const SERIES: Record<Run, { label: string; color: string }> = {
  morning: { label: 'Morning', color: '#2563EB' },
  afternoon: { label: 'Afternoon', color: '#0891B2' },
}

const dayLabel = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', timeZone: 'UTC' })
const longDay = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' })
const minutesBetween = (a: string, b: string) => (new Date(b).getTime() - new Date(a).getTime()) / 60000
const average = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null)

/** A round, even top for the y axis, so the top and middle gridlines land on whole numbers. */
function niceMax(n: number) {
  if (n <= 4) return 4
  const step = Math.pow(10, Math.floor(Math.log10(n)))
  const top = Math.ceil(n / step) * step
  return top % 2 === 0 ? top : top + step
}

/** Minutes for a run; runs shorter than a minute (a test drive) say so instead of "0 min". */
const runText = (m: number | null) => (m === null ? '—' : m < 1 ? 'Under 1 min' : `${Math.round(m)} min`)

export default async function AnalyticsPage() {
  const supabase = createClient()
  const now = new Date()
  const from = qatarDateKey(new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000))

  const [marksRes, runsRes, reportsRes, busesRes] = await Promise.all([
    supabase.from('attendance').select('date, run, status').gte('date', from),
    supabase.from('bus_runs').select('bus_id, date, run, started_at, ended_at').gte('date', from),
    supabase.from('absence_reports').select('id', { count: 'exact', head: true }).gte('date', from),
    supabase.rpc('get_buses_with_drivers'),
  ])
  for (const { error } of [marksRes, runsRes, reportsRes, busesRes]) {
    if (error) console.error('Analytics:', error.message)
  }

  const marks = marksRes.data ?? []
  const runs = runsRes.data ?? []
  const buses = (busesRes.data ?? []) as BusRow[]

  // School days are the days a bus drove or a child was checked in.
  const days = [...new Set([...runs.map((r) => r.date), ...marks.map((m) => m.date)])].sort()
  const chartDays = days.slice(-CHART_DAYS)
  const rode = (date: string, run: Run) => marks.filter((m) => m.date === date && m.run === run && (m.status === 'boarded' || m.status === 'dropped_off')).length
  const perDay = chartDays.map((date) => ({ date, morning: rode(date, 'morning'), afternoon: rode(date, 'afternoon') }))
  const top = niceMax(Math.max(1, ...perDay.flatMap((d) => [d.morning, d.afternoon])))

  const totalRides = marks.filter((m) => m.status === 'boarded' || m.status === 'dropped_off').length
  const ended = runs.filter((r) => r.ended_at)
  const runMinutes = (run: Run, busId?: string) =>
    average(ended.filter((r) => r.run === run && (!busId || r.bus_id === busId)).map((r) => minutesBetween(r.started_at, r.ended_at!)).filter((m) => m > 0 && m < 240))
  const avgRun = average(ended.map((r) => minutesBetween(r.started_at, r.ended_at!)).filter((m) => m > 0 && m < 240))

  return (
    <>
      <PageHeader title="Analytics" subtitle={`The last ${WINDOW_DAYS} days, from the driver app’s check-ins and runs.`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard step={1} label="School days" value={days.length} sub="With at least one run" />
        <StatsCard step={2} label="Rides" value={totalRides} sub="Children checked onto a bus" />
        <StatsCard step={3} label="Average run" value={runText(avgRun)} sub={`${ended.length} runs driven`} />
        <StatsCard step={4} label="Absences reported" value={reportsRes.count ?? 0} sub="By parents in the app" />
      </div>

      <Panel
        step={5}
        className="mt-4"
        title="Rides per school day"
        subtitle={chartDays.length === 1 ? 'Children who rode each run on the last school day' : `Children who rode each run, the last ${chartDays.length || CHART_DAYS} school days`}
        action={
          <div className="flex items-center gap-4 text-[13px] text-ink-2" aria-hidden="true">
            {(['morning', 'afternoon'] as const).map((r) => (
              <span key={r} className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: SERIES[r].color }} />
                {SERIES[r].label}
              </span>
            ))}
          </div>
        }
      >
        {perDay.length === 0 ? (
          <EmptyState icon={ChartColumnBig} title="No runs yet" className="py-14">
            Charts fill in once drivers start their runs in the driver app.
          </EmptyState>
        ) : (
          <figure>
            <div className="relative h-56 pl-8">
              {[0, 0.5, 1].map((f) => (
                <div key={f} className="absolute inset-x-0 flex items-center" style={{ bottom: `${f * 100}%` }} aria-hidden="true">
                  <span className="w-7 -translate-y-px pr-2 text-right text-[11px] tabular-nums text-ink-3">{Math.round(top * f)}</span>
                  <span className="h-px flex-1 bg-line" />
                </div>
              ))}
              <div className="relative flex h-full items-end gap-2">
                {perDay.map((d, i) => (
                  <div key={d.date} className="group relative flex h-full flex-1 items-end justify-center gap-0.5 rounded-lg hover:bg-canvas/70">
                    {(['morning', 'afternoon'] as const).map((r) => (
                      <span
                        key={r}
                        className="w-full max-w-[22px] origin-bottom rounded-t-[4px] animate-grow-y motion-reduce:animate-none"
                        style={{ height: `${(d[r] / top) * 100}%`, background: SERIES[r].color, animationDelay: `${200 + i * 50}ms` }}
                      />
                    ))}
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full z-10 mb-2 hidden whitespace-nowrap rounded-lg bg-night px-3 py-2 text-xs text-white shadow-lg group-hover:block"
                    >
                      <span className="block font-semibold">{longDay(d.date)}</span>
                      <span className="block text-white/80">Morning {d.morning} · Afternoon {d.afternoon}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2 flex gap-2 pl-8" aria-hidden="true">
              {perDay.map((d) => <span key={d.date} className="flex-1 text-center text-[11px] text-ink-2">{dayLabel(d.date)}</span>)}
            </div>
            <figcaption className="sr-only">
              {perDay.map((d) => `${longDay(d.date)}: ${d.morning} in the morning, ${d.afternoon} in the afternoon.`).join(' ')}
            </figcaption>
          </figure>
        )}
      </Panel>

      <Panel step={6} className="mt-4" title="Buses" subtitle={`Seats taken today, and how long runs took over the last ${WINDOW_DAYS} days`} bodyClassName="p-0 pt-2">
        {buses.length === 0 ? (
          <EmptyState icon={ChartColumnBig} title="No buses yet" className="py-10" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="text-left text-[13px] text-ink-2">
                  <th className="px-5 py-3 font-medium">Bus</th>
                  <th className="px-3 py-3 font-medium">Seats taken</th>
                  <th className="px-3 py-3 text-right font-medium">Runs</th>
                  <th className="px-3 py-3 text-right font-medium">Average morning</th>
                  <th className="px-5 py-3 text-right font-medium">Average afternoon</th>
                </tr>
              </thead>
              <tbody>
                {buses.map((b, i) => {
                  const pct = b.capacity ? Math.min(100, (Number(b.student_count) / b.capacity) * 100) : 0
                  const m = runMinutes('morning', b.id)
                  const a = runMinutes('afternoon', b.id)
                  return (
                    <tr key={b.id} className="border-t border-line">
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                          <span className="h-2 w-2 rounded-full" style={{ background: b.color }} aria-hidden="true" />
                          {b.name}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-canvas" aria-hidden="true">
                            <div className="h-full origin-left rounded-full bg-brand animate-grow-x motion-reduce:animate-none" style={{ width: `${pct}%`, animationDelay: `${300 + i * 60}ms` }} />
                          </div>
                          <span className="text-[13px] tabular-nums text-ink">{b.student_count} of {b.capacity}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right text-[13px] tabular-nums text-ink">{ended.filter((r) => r.bus_id === b.id).length}</td>
                      <td className="px-3 py-3 text-right text-[13px] tabular-nums text-ink">{runText(m)}</td>
                      <td className="px-5 py-3 text-right text-[13px] tabular-nums text-ink">{runText(a)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  )
}
