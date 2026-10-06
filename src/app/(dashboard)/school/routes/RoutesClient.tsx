'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowRight, Check, MapPin, RefreshCw, Route as RouteIcon, School, WandSparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LatLng } from '@/lib/geo'
import type { BusRoute } from '@/lib/dashboard/today'
import { applyBus, applySchool, proposeBus, proposeSchool, updateBuses, type PlannerResult } from '@/lib/dashboard/planner'
import { aboutMinutes, describeUpdate, runLine, type BusProposal, type SchoolProposal, type UpdatedBus } from '@/lib/dashboard/plannerText'
import { groupStops, qatarHour, AFTERNOON_FROM_HOUR, RUN_LABEL, type BusRunsToday, type Run } from '@/lib/runs'
import { ActionButton } from '@/components/dashboard/ActionButton'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Modal } from '@/components/dashboard/Modal'
import { Notice } from '@/components/dashboard/Notice'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Panel } from '@/components/dashboard/Panel'
import { Rise } from '@/components/dashboard/Rise'
import { SegmentedControl } from '@/components/dashboard/SegmentedControl'
import { Badge } from '@/components/dashboard/StatusText'
import { DynamicFleetMap } from '@/components/maps/DynamicFleetMap'

export type RouteBus = { id: string; school_id: string; name: string; color: string | null; driver_name: string | null }
export type RouteStudent = { id: string; name: string; home_address: string; bus_id: string | null; stop_order: number | null }

const RUNS = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
] as const

const shortDate = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Qatar', day: 'numeric', month: 'short' })

/** The run a bus is driving right now, if any. */
function runningRun(runs: BusRunsToday | undefined): Run | null {
  if (runs?.afternoon && !runs.afternoon.endedAt) return 'afternoon'
  if (runs?.morning && !runs.morning.endedAt) return 'morning'
  return null
}

function DriverNote({ bus, running }: { bus: RouteBus; running: Run | null }) {
  if (!running) return <p className="text-[13px] text-ink-2">The driver sees &ldquo;Your route changed&rdquo; before their next run.</p>
  return (
    <Notice tone="warning">
      {bus.name} is on its {running} run now. The driver keeps today&apos;s order until the run ends and gets the new route on the next run.
    </Notice>
  )
}

export default function RoutesClient({ buses, students, routes, school, runsByBus }: {
  buses: RouteBus[]
  students: RouteStudent[]
  routes: BusRoute[]
  school: LatLng | null
  runsByBus: Record<string, BusRunsToday>
}) {
  const router = useRouter()
  const [run, setRun] = useState<Run>(() => (qatarHour() >= AFTERNOON_FROM_HOUR ? 'afternoon' : 'morning'))
  const routed = useMemo(() => new Set(routes.map((r) => r.busId)), [routes])
  const [selectedId, setSelectedId] = useState<string | null>(() => buses.find((b) => routed.has(b.id))?.id ?? buses[0]?.id ?? null)
  const [updateFor, setUpdateFor] = useState<RouteBus | null>(null)
  const [replanFor, setReplanFor] = useState<RouteBus | null>(null)
  const [allOpen, setAllOpen] = useState(false)

  const selected = buses.find((b) => b.id === selectedId) ?? null
  const schoolId = buses[0]?.school_id ?? null
  const routeOf = (busId: string, r: Run) => routes.find((x) => x.busId === busId && x.run === r) ?? null
  const studentsOf = (busId: string) => students.filter((s) => s.bus_id === busId)

  /** Students on the bus but not on its saved route, and students on the route who have left the bus. */
  const pending = (busId: string) => {
    const onRoute = new Set(routeOf(busId, 'morning')?.stops.map((s) => s.studentId) ?? [])
    const kids = studentsOf(busId)
    return {
      notOnRoute: kids.filter((s) => s.stop_order === null || !onRoute.has(s.id)),
      left: [...onRoute].filter((id) => !kids.some((s) => s.id === id)).length,
    }
  }

  const route = selected ? routeOf(selected.id, run) : null
  const byId = new Map(students.map((s) => [s.id, s]))
  const ordered = (route?.stops ?? []).map((stop) => ({ ...stop, student: byId.get(stop.studentId), address: byId.get(stop.studentId)?.home_address ?? 'A student who left' }))
  const stopGroups = groupStops(ordered)
  const color = selected?.color ?? '#3B82F6'
  const mapStops = stopGroups.map((g, i) => ({
    id: `${g.students[0]!.studentId}`,
    lat: g.students[0]!.lat,
    lng: g.students[0]!.lng,
    label: String(i + 1),
    color,
    title: `${g.name}: ${g.students.map((s) => s.student?.name ?? 'left').join(', ')}`,
  }))
  const sel = selected ? pending(selected.id) : { notOnRoute: [], left: 0 }
  const suggestion = selected ? routeOf(selected.id, 'morning')?.suggestion ?? null : null

  const refresh = () => router.refresh()

  return (
    <>
      <PageHeader
        title="Routes"
        subtitle="Each bus drives its stops twice a day. Routes keep their order until you choose to re-plan."
        actions={
          <ActionButton variant="secondary" onClick={() => setAllOpen(true)} disabled={!schoolId || students.length === 0}>
            <WandSparkles /> Re-plan all buses
          </ActionButton>
        }
      />

      {buses.length === 0 ? (
        <Panel step={1}>
          <EmptyState icon={RouteIcon} title="No buses yet">Add buses on the Fleet page and students on the Students page. Each bus then gets a route here.</EmptyState>
        </Panel>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <ul className="flex flex-col gap-2.5">
            {buses.map((b, i) => {
              const morning = routeOf(b.id, 'morning')
              const afternoon = routeOf(b.id, 'afternoon')
              const p = pending(b.id)
              const isSelected = b.id === selectedId
              return (
                <Rise as="li" step={i + 1} key={b.id}>
                  <button
                    onClick={() => setSelectedId(b.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      'group flex w-full items-stretch gap-3 rounded-xl bg-white p-4 text-left ring-1 transition-[box-shadow,transform] duration-200 ease-swift hover:-translate-y-px',
                      isSelected ? 'ring-2 ring-brand' : 'ring-ink/[0.04] hover:ring-ink/10',
                    )}
                  >
                    <span className="w-1 shrink-0 rounded-full" style={{ background: b.color ?? '#3B82F6' }} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[15px] font-semibold text-ink">{b.name}</span>
                        {runningRun(runsByBus[b.id]) && <Badge tone="success">On a run</Badge>}
                      </span>
                      {morning ? (
                        <span className="mt-1 block text-[13px] text-ink-2">
                          {groupStops(morning.stops.map((s) => ({ address: byId.get(s.studentId)?.home_address ?? s.studentId }))).length} stops · {studentsOf(b.id).length} students
                          <span className="block tabular-nums">Morning {Math.round(morning.minutes ?? 0)} min{afternoon ? ` · Afternoon ${Math.round(afternoon.minutes ?? 0)} min` : ''}</span>
                        </span>
                      ) : (
                        <span className="mt-1 block text-[13px] text-ink-2">No route yet · {studentsOf(b.id).length} student{studentsOf(b.id).length === 1 ? '' : 's'}</span>
                      )}
                      {(p.notOnRoute.length > 0 && morning) || morning?.suggestion ? (
                        <span className="mt-2 flex flex-wrap gap-1.5">
                          {p.notOnRoute.length > 0 && morning && <Badge tone="warning">{p.notOnRoute.length} not on the route</Badge>}
                          {morning?.suggestion && <Badge>Could save {Math.round(morning.suggestion.minutesSaved)} min</Badge>}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </Rise>
              )
            })}
          </ul>

          {selected && (
            <Panel step={2} key={selected.id} bodyClassName="p-0">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: color }} aria-hidden="true" />
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-xl font-bold tracking-[-0.01em] text-ink">{selected.name}</h2>
                    <p className="text-[13px] text-ink-2">{selected.driver_name ?? 'No driver yet'}</p>
                  </div>
                </div>
                {routed.has(selected.id) && (
                  <div className="flex flex-wrap items-center gap-2">
                    <SegmentedControl label="Run" value={run} options={RUNS} onChange={setRun} className="w-[210px]" />
                    <ActionButton size="sm" variant="secondary" onClick={() => setUpdateFor(selected)}><RefreshCw /> Update</ActionButton>
                    <ActionButton size="sm" variant="plain" onClick={() => setReplanFor(selected)}><WandSparkles /> Re-plan</ActionButton>
                  </div>
                )}
              </div>

              {!routed.has(selected.id) ? (
                <EmptyState
                  icon={RouteIcon}
                  title={`${selected.name} has no route yet`}
                  action={studentsOf(selected.id).length > 0 && <ActionButton onClick={() => setUpdateFor(selected)}><RouteIcon /> Plan route</ActionButton>}
                >
                  {studentsOf(selected.id).length > 0
                    ? `Plan it to put its ${studentsOf(selected.id).length} student${studentsOf(selected.id).length === 1 ? '' : 's'} in stop order for both runs.`
                    : 'Put students on this bus on the Students page first.'}
                </EmptyState>
              ) : (
                <div className="p-5 pt-4">
                  <div className="flex flex-col gap-2">
                    {(sel.notOnRoute.length > 0 || sel.left > 0) && (
                      <Notice
                        tone="warning"
                        action={<ActionButton size="sm" variant="secondary" onClick={() => setUpdateFor(selected)}>Update route</ActionButton>}
                      >
                        {sel.notOnRoute.length > 0 && `${sel.notOnRoute.map((s) => s.name).join(', ')} ${sel.notOnRoute.length === 1 ? "isn't" : "aren't"} on the route yet. `}
                        {sel.left > 0 && `${sel.left} student${sel.left === 1 ? ' has' : 's have'} left the bus. `}
                        Updating slots the changes in without moving anyone else.
                      </Notice>
                    )}
                    {suggestion && (
                      <Notice
                        tone="info"
                        action={<ActionButton size="sm" variant="plain" onClick={() => setReplanFor(selected)}>See the plan</ActionButton>}
                      >
                        Re-planning this route could save {aboutMinutes(suggestion.minutesSaved)} a run. It stays as it is unless you apply it.
                      </Notice>
                    )}
                  </div>

                  <div className={cn('h-[340px]', (sel.notOnRoute.length > 0 || sel.left > 0 || suggestion) && 'mt-4')}>
                    <DynamicFleetMap
                      className="h-full"
                      school={school}
                      routes={route ? [{ id: `${selected.id}-${run}`, color, coords: route.coords }] : []}
                      stops={mapStops}
                    />
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      ['Stops', String(stopGroups.length)],
                      ['Distance', route?.km ? `${route.km.toFixed(1)} km` : '—'],
                      ['Drive', route?.minutes ? `${Math.round(route.minutes)} min` : '—'],
                      ['Version', route ? `${route.planVersion} · ${shortDate.format(new Date(route.optimizedAt))}` : '—'],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-canvas px-4 py-3">
                        <dt className="text-[13px] text-ink-2">{label}</dt>
                        <dd className="mt-0.5 font-display text-xl font-bold tabular-nums text-ink">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  <h3 className="mt-6 text-[13px] font-medium text-ink-2">{RUN_LABEL[run]}, in driving order</h3>
                  <ol className="mt-2">
                    {run === 'afternoon' && <SchoolRow minutes={0} />}
                    {stopGroups.map((g, i) => (
                      <li key={`${g.name}-${i}`} className="relative flex gap-4 pb-1 animate-rise motion-reduce:animate-none" style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}>
                        <span className="flex w-7 shrink-0 flex-col items-center">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full border-[2.5px] bg-white text-xs font-semibold text-ink" style={{ borderColor: color }}>{i + 1}</span>
                          <span className="w-0.5 flex-1 rounded-full bg-line" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1 pb-3">
                          <span className="flex items-baseline justify-between gap-3">
                            <span className="truncate text-sm font-semibold text-ink">{g.name}</span>
                            <span className="shrink-0 text-xs tabular-nums text-ink-2">{g.students[0]?.etaMin != null ? `+${g.students[0].etaMin} min` : ''}</span>
                          </span>
                          <span className="block truncate text-[13px] text-ink-2">{g.students.map((s) => s.student?.name ?? 'A student who left').join(', ')}</span>
                        </span>
                      </li>
                    ))}
                    {run === 'morning' && <SchoolRow minutes={route?.minutes ?? null} last />}
                  </ol>
                </div>
              )}
            </Panel>
          )}
        </div>
      )}

      <UpdateDialog bus={updateFor} hasRoute={updateFor ? routed.has(updateFor.id) : false} running={updateFor ? runningRun(runsByBus[updateFor.id]) : null} onClose={() => setUpdateFor(null)} onDone={refresh} />
      <ReplanDialog bus={replanFor} running={replanFor ? runningRun(runsByBus[replanFor.id]) : null} onClose={() => setReplanFor(null)} onDone={refresh} />
      <ReplanAllDialog open={allOpen} schoolId={schoolId} onClose={() => setAllOpen(false)} onDone={refresh} />
    </>
  )
}

function SchoolRow({ minutes, last = false }: { minutes: number | null; last?: boolean }) {
  return (
    <li className="flex gap-4 pb-1">
      <span className="flex w-7 shrink-0 flex-col items-center">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-night text-white"><School size={14} /></span>
        {!last && <span className="w-0.5 flex-1 rounded-full bg-line" aria-hidden="true" />}
      </span>
      <span className="flex min-w-0 flex-1 items-baseline justify-between gap-3 pb-3">
        <span className="text-sm font-semibold text-ink">School</span>
        {minutes !== null && <span className="text-xs tabular-nums text-ink-2">{last ? `+${Math.round(minutes)} min` : 'Start'}</span>}
      </span>
    </li>
  )
}

/** Update (one bus): keep the order, slot changes in. Also the first plan for a bus without a route. */
function UpdateDialog({ bus, hasRoute, running, onClose, onDone }: { bus: RouteBus | null; hasRoute: boolean; running: Run | null; onClose: () => void; onDone: () => void }) {
  const [state, setState] = useState<'confirm' | 'saving' | 'done'>('confirm')
  const [result, setResult] = useState<UpdatedBus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!bus) return
    setState('confirm')
    setResult(null)
    setError(null)
  }, [bus])

  const run = async () => {
    if (!bus) return
    setState('saving')
    setError(null)
    const res = await updateBuses([bus.id])
    if (!res.ok) {
      setError(res.message)
      setState('confirm')
      return
    }
    setResult(res.data[0] ?? null)
    setState('done')
    onDone()
  }

  const title = hasRoute ? `Update ${bus?.name ?? 'route'}` : `Plan ${bus?.name ?? 'route'}`
  return (
    <Modal
      open={bus !== null}
      onClose={onClose}
      dismissible={state !== 'saving'}
      title={state === 'done' ? (result?.changed ? 'Route updated' : 'Nothing to change') : title}
      footer={
        state === 'done' ? (
          <ActionButton onClick={onClose}>Done</ActionButton>
        ) : (
          <>
            <ActionButton variant="plain" onClick={onClose} disabled={state === 'saving'}>Cancel</ActionButton>
            <ActionButton onClick={run} loading={state === 'saving'}>{state !== 'saving' && <RefreshCw />}{hasRoute ? 'Update route' : 'Plan route'}</ActionButton>
          </>
        )
      }
    >
      {state === 'done' && result ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ok-tint text-ok-text animate-in zoom-in-50 duration-500"><Check size={18} /></span>
            <p className="text-sm text-ink">{describeUpdate(result)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <RunBox label="Morning" value={runLine(result.morning)} />
            <RunBox label="Afternoon" value={runLine(result.afternoon)} />
          </div>
          {result.suggestion && (
            <Notice tone="info">A fresh plan could save {aboutMinutes(result.suggestion.minutes_saved)} a run. Use Re-plan to see it.</Notice>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {error && <Notice tone="danger">{error}</Notice>}
          <ul className="flex flex-col gap-2.5 text-sm text-ink">
            {(hasRoute
              ? ['Students who joined or moved house get the stop where they add the least driving.', 'Students who left drop off the route.', 'Every other stop keeps its place and number.']
              : ['Puts every student on this bus in stop order.', 'The morning ends at the school; the afternoon drives the same stops in reverse.']
            ).map((line) => (
              <li key={line} className="flex gap-2.5"><Check size={16} className="mt-0.5 shrink-0 text-ok" aria-hidden="true" />{line}</li>
            ))}
          </ul>
          {bus && <DriverNote bus={bus} running={running} />}
        </div>
      )}
    </Modal>
  )
}

function RunBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-canvas px-4 py-3">
      <p className="text-[13px] text-ink-2">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-ink">{value}</p>
    </div>
  )
}

/** Re-plan one bus: a proposal compared with today's route, applied only if the admin says so. */
function ReplanDialog({ bus, running, onClose, onDone }: { bus: RouteBus | null; running: Run | null; onClose: () => void; onDone: () => void }) {
  const [proposal, setProposal] = useState<PlannerResult<BusProposal> | null>(null)
  const [saving, setSaving] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)

  const load = async (busId: string) => {
    setProposal(null)
    setApplyError(null)
    setProposal(await proposeBus(busId))
  }

  useEffect(() => {
    if (bus) void load(bus.id)
  }, [bus])

  const apply = async () => {
    if (!bus || !proposal?.ok) return
    setSaving(true)
    setApplyError(null)
    const res = await applyBus(bus.id, proposal.data.chain)
    setSaving(false)
    if (!res.ok) {
      setApplyError(res.status === 409 ? 'The bus changed since this plan was made. Look at it again.' : res.message)
      return
    }
    toast.success(`${bus.name} has its new route`, { description: 'The driver sees "Your route changed" before the next run.' })
    onClose()
    onDone()
  }

  const p = proposal?.ok ? proposal.data : null
  const better = p?.clearly_better ?? false

  return (
    <Modal
      open={bus !== null}
      onClose={onClose}
      dismissible={!saving}
      width="lg"
      title={!p ? `Re-plan ${bus?.name ?? ''}` : better ? 'A shorter route is possible' : 'Your route is already good'}
      description={!p ? 'Working out a fresh plan and comparing it with the route the driver knows.' : undefined}
      footer={
        p && better ? (
          <>
            <ActionButton variant="plain" onClick={onClose} disabled={saving}>Keep current route</ActionButton>
            <ActionButton onClick={apply} loading={saving}>Apply new route</ActionButton>
          </>
        ) : (
          <ActionButton variant={p ? 'primary' : 'plain'} onClick={onClose}>{p ? 'Done' : 'Cancel'}</ActionButton>
        )
      }
    >
      {!proposal ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          {[0, 1].map((i) => <div key={i} className="h-16 rounded-xl bg-[linear-gradient(90deg,#F6F7F9_0%,#ECEEF1_50%,#F6F7F9_100%)] bg-[length:200%_100%] animate-shimmer" />)}
        </div>
      ) : !proposal.ok ? (
        <Notice tone="danger" action={bus && <ActionButton size="sm" variant="plain" onClick={() => load(bus.id)}>Try again</ActionButton>}>{proposal.message}</Notice>
      ) : p ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink">
            {better
              ? `A fresh plan saves ${aboutMinutes(p.minutes_saved)} a run. ${p.students_moved} student${p.students_moved === 1 ? '' : 's'} would get a new stop number.`
              : p.minutes_saved > 0.5
                ? `A fresh plan would save only ${aboutMinutes(p.minutes_saved)} a run. That isn't worth changing a route the driver knows, so it stays as it is.`
                : 'A fresh plan is no shorter than the route the driver already knows, so it stays as it is.'}
          </p>
          <div className="overflow-hidden rounded-xl ring-1 ring-line">
            <table className="w-full text-sm">
              <thead className="bg-canvas text-left text-[13px] text-ink-2">
                <tr><th className="px-4 py-2.5 font-medium">Run</th><th className="px-4 py-2.5 font-medium">Now</th><th className="px-4 py-2.5 font-medium">Fresh plan</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {(['morning', 'afternoon'] as const).map((r) => {
                  const saved = p.current[r].minutes - p.proposed[r].minutes
                  return (
                    <tr key={r}>
                      <td className="px-4 py-3 font-medium text-ink">{RUN_LABEL[r]}</td>
                      <td className="px-4 py-3 tabular-nums text-ink-2">{runLine(p.current[r])}</td>
                      <td className="px-4 py-3 tabular-nums">
                        <span className={saved >= 1 ? 'font-semibold text-ok-text' : 'text-ink-2'}>{runLine(p.proposed[r])}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {better && bus && <DriverNote bus={bus} running={running} />}
          {applyError && (
            <Notice tone="danger" action={bus && <ActionButton size="sm" variant="plain" onClick={() => load(bus.id)}>Look again</ActionButton>}>{applyError}</Notice>
          )}
        </div>
      ) : null}
    </Modal>
  )
}

/** Re-plan all buses: which students would change bus, applied only after the admin confirms. */
function ReplanAllDialog({ open, schoolId, onClose, onDone }: { open: boolean; schoolId: string | null; onClose: () => void; onDone: () => void }) {
  const [proposal, setProposal] = useState<PlannerResult<SchoolProposal> | null>(null)
  const [saving, setSaving] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)

  const load = async (id: string) => {
    setProposal(null)
    setApplyError(null)
    setProposal(await proposeSchool(id))
  }

  useEffect(() => {
    if (open && schoolId) void load(schoolId)
  }, [open, schoolId])

  const p = proposal?.ok ? proposal.data : null
  const moves = p?.changes.length ?? 0

  const apply = async () => {
    if (!schoolId || !p) return
    setSaving(true)
    setApplyError(null)
    const res = await applySchool(schoolId, p.assignments)
    setSaving(false)
    if (!res.ok) {
      setApplyError(res.status === 409 ? 'Students or buses changed since this plan was made. Look at it again.' : res.message)
      return
    }
    toast.success(`${moves} student${moves === 1 ? '' : 's'} moved`, { description: 'Each bus that changed has a fresh route. The other buses kept theirs.' })
    onClose()
    onDone()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!saving}
      width="lg"
      title={!p ? 'Re-plan all buses' : moves ? `${moves} student${moves === 1 ? '' : 's'} would change bus` : 'Every student is on the best bus'}
      description={!p ? 'Grouping students by where they live and checking which bus suits each one. Nothing changes until you apply it.' : undefined}
      footer={
        p && moves > 0 ? (
          <>
            <ActionButton variant="plain" onClick={onClose} disabled={saving}>Keep current buses</ActionButton>
            <ActionButton onClick={apply} loading={saving}>Move {moves} student{moves === 1 ? '' : 's'}</ActionButton>
          </>
        ) : (
          <ActionButton variant={p ? 'primary' : 'plain'} onClick={onClose}>{p ? 'Done' : 'Cancel'}</ActionButton>
        )
      }
    >
      {!proposal ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          {[0, 1, 2].map((i) => <div key={i} className="h-12 rounded-xl bg-[linear-gradient(90deg,#F6F7F9_0%,#ECEEF1_50%,#F6F7F9_100%)] bg-[length:200%_100%] animate-shimmer" />)}
        </div>
      ) : !proposal.ok ? (
        <Notice tone="danger" action={schoolId && <ActionButton size="sm" variant="plain" onClick={() => load(schoolId)}>Try again</ActionButton>}>{proposal.message}</Notice>
      ) : p && moves === 0 ? (
        <p className="text-sm text-ink">Grouping students by where they live puts every one of them on the bus they are already on. Routes stay as they are.</p>
      ) : p ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink">Each bus that gains or loses a student gets a fresh route. Buses with no changes keep theirs. Drivers see &ldquo;Your route changed&rdquo; before their next run.</p>
          <div className="max-h-56 overflow-y-auto rounded-xl ring-1 ring-line">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-canvas text-left text-[13px] text-ink-2">
                <tr><th className="px-4 py-2.5 font-medium">Student</th><th className="px-4 py-2.5 font-medium">Moves</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {p.changes.map((c) => (
                  <tr key={c.student_id}>
                    <td className="px-4 py-2.5 font-medium text-ink">{c.name}</td>
                    <td className="px-4 py-2.5 text-ink-2">
                      <span className="inline-flex items-center gap-1.5">{c.from_bus ?? 'No bus'} <ArrowRight size={13} aria-hidden="true" /> <span className="text-ink">{c.to_bus}</span></span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {p.buses.filter((b) => b.students_now !== b.students_after).map((b) => (
              <div key={b.bus_id} className="rounded-xl bg-canvas px-4 py-3 text-[13px]">
                <p className="font-semibold text-ink">{b.bus_name}</p>
                <p className="mt-0.5 tabular-nums text-ink-2">{b.students_now} → {b.students_after} students · about {b.minutes_per_run_now} → {b.minutes_per_run_after} min a run</p>
              </div>
            ))}
          </div>
          <p className="flex items-center gap-1.5 text-xs text-ink-2"><MapPin size={12} aria-hidden="true" /> Minutes are straight-line estimates. The saved routes use road times.</p>
          {applyError && (
            <Notice tone="danger" action={schoolId && <ActionButton size="sm" variant="plain" onClick={() => load(schoolId)}>Look again</ActionButton>}>{applyError}</Notice>
          )}
        </div>
      ) : null}
    </Modal>
  )
}
