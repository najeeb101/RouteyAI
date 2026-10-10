/**
 * optimize-route: plans bus routes (Docs/Claude.md §1.2). A route never changes by
 * itself: its order changes only when a school admin applies a proposal that is clearly better.
 *
 *   { action: 'update', bus_id | school_id }                 keep each bus's order, slot changes in, save both runs
 *   { action: 'optimize', bus_id }                           propose a fresh plan for one bus; saves nothing
 *   { action: 'optimize', bus_id, apply: true, chain }       save the accepted order if it is still clearly better
 *   { action: 'optimize', school_id }                        propose new bus assignments for the school; saves nothing
 *   { action: 'optimize', school_id, apply: true, assignments }  move those students, plan each changed bus afresh
 *   { action: 'update', reverse: true }                      service role, once: flip routes planned before two runs
 *                                                            a day so the morning ends at the school
 *
 * A request without an action (what today's dashboard sends) is an update.
 */
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.117.2'
import { getCaller, type Caller } from '../_shared/caller.ts'
import { mapboxDirections, type Directions } from '../_shared/directions.ts'
import { assignBuses } from '../_shared/busAssignment.ts'
import {
  checkApply,
  currentChain,
  planFresh,
  planUpdate,
  proposeOptimize,
  straightMinutesPerRun,
  type BusState,
  type MeasuredChain,
  type RunPlan,
  type Suggestion,
} from '../_shared/busPlanner.ts'
import { planChain, type Stop } from '../_shared/routePlan.ts'

type PayloadRow = {
  bus_id: string
  school_id: string
  bus_capacity: number
  school_lat: number
  school_lng: number
  student_id: string | null
  student_lat: number | null
  student_lng: number | null
  home_address: string | null
  stop_order: number | null
}

type SavedWaypoint = { student_id?: unknown; lat?: unknown; lng?: unknown; stop_order?: unknown }

type RouteRow = {
  bus_id: string
  run: 'morning' | 'afternoon'
  waypoints: SavedWaypoint[] | null
  plan_version: number
  total_distance_km: number | null
  total_duration_min: number | null
  suggestion: Suggestion | null
}

type LoadedBus = BusState & { name: string; schoolId: string; capacity: number; routes: RouteRow[] }

type Named = { student_id: string; name: string; stop?: number }

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const reply = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { headers, status })

class RequestError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/**
 * Whether the caller may plan what the request names. Platform admins and the service role may plan anything,
 * including every bus at once (no bus_id or school_id). A school admin may plan one of their school's buses or their
 * whole school. Nobody else may.
 */
async function canPlan(supabase: SupabaseClient, caller: Caller, busId: string | null, schoolId: string | null): Promise<boolean> {
  if (caller.kind === 'service' || caller.roles.some((r) => r.role === 'platform_admin')) return true

  let target = schoolId
  if (busId) {
    const { data: bus, error } = await supabase.from('buses').select('school_id').eq('id', busId).maybeSingle()
    if (error) throw error
    target = bus?.school_id ?? null
  }
  return target !== null && caller.roles.some((r) => r.role === 'school_admin' && r.school_id === target)
}

/** Everything the planner needs for the buses a request names: students, saved order and saved routes. */
async function loadBuses(supabase: SupabaseClient, busId: string | null, schoolId: string | null): Promise<LoadedBus[]> {
  const { data, error } = await supabase.rpc('get_route_plan_payload', { p_bus_id: busId, p_school_id: schoolId })
  if (error) throw error
  const byBus = new Map<string, PayloadRow[]>()
  for (const row of (data ?? []) as PayloadRow[]) {
    if (!byBus.has(row.bus_id)) byBus.set(row.bus_id, [])
    byBus.get(row.bus_id)!.push(row)
  }
  const busIds = [...byBus.keys()]
  if (busIds.length === 0) return []

  const [{ data: routeData, error: routeErr }, { data: busData, error: busErr }] = await Promise.all([
    supabase.from('routes').select('bus_id, run, waypoints, plan_version, total_distance_km, total_duration_min, suggestion').in('bus_id', busIds),
    supabase.from('buses').select('id, name').in('id', busIds),
  ])
  if (routeErr) throw routeErr
  if (busErr) throw busErr
  const names = new Map(((busData ?? []) as { id: string; name: string }[]).map((b) => [b.id, b.name]))
  const routes = (routeData ?? []) as RouteRow[]

  return busIds.map((id) => {
    const rows = byBus.get(id)!
    const first = rows[0]!
    const onBus = rows.filter((r) => r.student_id && r.student_lat !== null && r.student_lng !== null)
    const busRoutes = routes.filter((r) => r.bus_id === id)
    const morning = busRoutes.find((r) => r.run === 'morning')
    const saved = (morning?.waypoints ?? [])
      .filter((w): w is { student_id: string; lat: number; lng: number; stop_order: number } =>
        typeof w?.student_id === 'string' && typeof w.lat === 'number' && typeof w.lng === 'number')
      .sort((a, b) => (Number(a.stop_order) || 0) - (Number(b.stop_order) || 0))
    return {
      busId: id,
      name: names.get(id) ?? 'Bus',
      schoolId: first.school_id,
      capacity: first.bus_capacity,
      routes: busRoutes,
      school: { lat: first.school_lat, lng: first.school_lng },
      students: onBus.map((r) => ({ id: r.student_id!, lat: r.student_lat!, lng: r.student_lng!, address: r.home_address })),
      // The payload comes ordered by stop_order, students without a place last.
      savedOrder: onBus.filter((r) => r.stop_order !== null).map((r) => r.student_id!),
      routeStudents: saved.map((w) => w.student_id),
      plannedAt: new Map(saved.map((w) => [w.student_id, { lat: w.lat, lng: w.lng }])),
      hasBothRuns: busRoutes.some((r) => r.run === 'morning') && busRoutes.some((r) => r.run === 'afternoon'),
    }
  })
}

/** Saves the chain and both runs in one transaction. Returns the plan version. */
async function saveRoutes(supabase: SupabaseClient, busId: string, chain: readonly Stop[], measured: MeasuredChain, suggestion: Suggestion | null): Promise<number> {
  const { data, error } = await supabase.rpc('save_route_plan', {
    p_bus_id: busId,
    p_chain: chain.map((s) => s.id),
    p_morning: measured.morning,
    p_afternoon: measured.afternoon,
    p_suggestion: suggestion,
  })
  if (error) {
    // A student left the bus between reading and saving.
    if (/not on this bus/i.test(error.message)) throw new RequestError(409, 'The bus changed while planning. Try again.')
    throw error
  }
  return data as number
}

const totals = (run: RunPlan) => ({ km: run.total_distance_km, minutes: run.total_duration_min })
const savedTotals = (row: RouteRow | undefined) =>
  row ? { km: Number(row.total_distance_km ?? 0), minutes: Number(row.total_duration_min ?? 0) } : null
const runsSummary = (m: MeasuredChain) => ({
  morning: totals(m.morning),
  afternoon: totals(m.afternoon),
  minutes_per_run: Math.round(m.minutesPerRun * 10) / 10,
})

async function studentNames(supabase: SupabaseClient, ids: readonly string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map()
  const { data, error } = await supabase.from('students').select('id, name').in('id', [...new Set(ids)])
  if (error) throw error
  return new Map(((data ?? []) as { id: string; name: string }[]).map((s) => [s.id, s.name]))
}

/** update: every named bus keeps its order; only buses with changes are saved. */
async function runUpdate(supabase: SupabaseClient, directions: Directions, busId: string | null, schoolId: string | null, reverse: boolean) {
  const results = []
  for (const bus of await loadBuses(supabase, busId, schoolId)) {
    let plan = await planUpdate(bus, directions, { reverse })
    let version: number | null = null
    if (plan.save) {
      try {
        version = await saveRoutes(supabase, bus.busId, plan.chain, plan.measured, plan.suggestion)
      } catch (err) {
        if (!(err instanceof RequestError)) throw err
        // Read the bus again and try once more.
        const [fresh] = await loadBuses(supabase, bus.busId, null)
        plan = fresh ? await planUpdate(fresh, directions, { reverse }) : { save: false }
        if (plan.save) version = await saveRoutes(supabase, bus.busId, plan.chain, plan.measured, plan.suggestion)
      }
    }

    if (!plan.save) {
      const morning = bus.routes.find((r) => r.run === 'morning')
      results.push({
        bus_id: bus.busId,
        bus_name: bus.name,
        changed: false,
        plan_version: morning?.plan_version ?? null,
        added: [],
        removed: [],
        moved: [],
        reversed: false,
        morning: savedTotals(morning),
        afternoon: savedTotals(bus.routes.find((r) => r.run === 'afternoon')),
        suggestion: morning?.suggestion ?? null,
      })
      continue
    }

    const names = await studentNames(supabase, [...plan.added, ...plan.removed, ...plan.moved])
    const stopOf = (id: string) => plan.save ? plan.chain.findIndex((s) => s.id === id) + 1 : 0
    const named = (id: string, withStop: boolean): Named =>
      withStop ? { student_id: id, name: names.get(id) ?? 'A student', stop: stopOf(id) } : { student_id: id, name: names.get(id) ?? 'A student' }
    results.push({
      bus_id: bus.busId,
      bus_name: bus.name,
      changed: true,
      plan_version: version,
      added: plan.added.map((id) => named(id, true)),
      removed: plan.removed.map((id) => named(id, false)),
      moved: plan.moved.map((id) => named(id, true)),
      reversed: plan.reversed,
      morning: totals(plan.measured.morning),
      afternoon: totals(plan.measured.afternoon),
      suggestion: plan.suggestion,
    })
  }
  return { ok: true, action: 'update', buses: results }
}

/** optimize for one bus: a proposal, or saving the accepted order. */
async function optimizeBus(supabase: SupabaseClient, directions: Directions, busId: string, apply: boolean, chain: unknown) {
  const [bus] = await loadBuses(supabase, busId, null)
  if (!bus) throw new RequestError(404, 'Bus not found')

  if (!apply) {
    const proposal = await proposeOptimize(bus, directions)
    return {
      ok: true,
      action: 'optimize',
      applied: false,
      bus_id: bus.busId,
      bus_name: bus.name,
      current: runsSummary(proposal.current),
      proposed: runsSummary(proposal.proposed),
      minutes_saved: Math.round(proposal.minutesSaved * 10) / 10,
      students_moved: proposal.studentsMoved,
      clearly_better: proposal.clearlyBetter,
      message: proposal.clearlyBetter ? null : 'Your route is already good',
      // Sent back with apply: true to save exactly this order.
      chain: proposal.proposed.chain.map((s) => s.id),
    }
  }

  if (!Array.isArray(chain) || !chain.every((id) => typeof id === 'string')) throw new RequestError(400, 'chain must list student ids')
  const check = await checkApply(bus, chain as string[], directions)
  if (!check.ok) {
    if (check.reason === 'stale') throw new RequestError(409, 'The bus changed since this proposal. Review it again.')
    throw new RequestError(422, "Your route is already good: the new plan isn't clearly better.")
  }
  const version = await saveRoutes(supabase, bus.busId, check.proposal.proposed.chain, check.proposal.proposed, null)
  return { ok: true, action: 'optimize', applied: true, bus_id: bus.busId, bus_name: bus.name, plan_version: version, ...runsSummary(check.proposal.proposed) }
}

type SchoolRow = { bus_id: string; bus_capacity: number; student_id: string | null; student_lat: number | null; student_lng: number | null }
type Assignment = { student_id: string; from_bus_id: string | null; bus_id: string }

/** optimize for a whole school: which students would change bus, or applying that after the admin confirms. */
async function optimizeSchool(supabase: SupabaseClient, directions: Directions, schoolId: string, apply: boolean, rawAssignments: unknown) {
  const [{ data: payload, error }, { data: studentData, error: studentErr }] = await Promise.all([
    supabase.rpc('get_school_optimization_payload', { p_school_id: schoolId }),
    supabase.from('students').select('id, name, bus_id').eq('school_id', schoolId),
  ])
  if (error) throw error
  if (studentErr) throw studentErr
  const rows = (payload ?? []) as SchoolRow[]
  const students = new Map(((studentData ?? []) as { id: string; name: string; bus_id: string | null }[]).map((s) => [s.id, s]))
  const buses = [...new Map(rows.map((r) => [r.bus_id, { id: r.bus_id, capacity: r.bus_capacity }])).values()]
  const busIds = new Set(buses.map((b) => b.id))

  if (apply) {
    if (!Array.isArray(rawAssignments)) throw new RequestError(400, 'assignments must be a list')
    const assignments = rawAssignments as Assignment[]
    const valid = assignments.every((a) =>
      typeof a?.student_id === 'string' && typeof a.bus_id === 'string' && busIds.has(a.bus_id) &&
      students.has(a.student_id) && (students.get(a.student_id)!.bus_id ?? null) === (a.from_bus_id ?? null))
    if (!valid) throw new RequestError(409, 'Students or buses changed since this proposal. Review it again.')
    if (assignments.length === 0) return { ok: true, action: 'optimize', applied: true, moved: 0, buses: [] }

    const { error: saveErr } = await supabase.rpc('save_student_bus_assignments', {
      p_assignments: assignments.map((a) => ({ student_id: a.student_id, bus_id: a.bus_id })),
    })
    if (saveErr) throw saveErr

    // Every bus that gained or lost a student is planned from scratch; the others keep their routes.
    const changed = new Set(assignments.flatMap((a) => (a.from_bus_id ? [a.from_bus_id, a.bus_id] : [a.bus_id])))
    const results = []
    for (const bus of (await loadBuses(supabase, null, schoolId)).filter((b) => changed.has(b.busId))) {
      const measured = await planFresh(bus, directions)
      const version = await saveRoutes(supabase, bus.busId, measured.chain, measured, null)
      results.push({ bus_id: bus.busId, bus_name: bus.name, plan_version: version, ...runsSummary(measured) })
    }
    return { ok: true, action: 'optimize', applied: true, moved: assignments.length, buses: results }
  }

  const homes = [...new Map(rows.filter((r) => r.student_id && r.student_lat !== null && r.student_lng !== null)
    .map((r) => [r.student_id!, { id: r.student_id!, lat: r.student_lat!, lng: r.student_lng! }])).values()]
  const currentBus = new Map([...students.values()].flatMap((s) => (s.bus_id ? [[s.id, s.bus_id] as const] : [])))
  const assigned = assignBuses(homes, buses, currentBus)
  const loaded = await loadBuses(supabase, null, schoolId)
  const busName = new Map(loaded.map((b) => [b.busId, b.name]))
  const changes = homes
    .filter((h) => assigned.get(h.id) !== (students.get(h.id)?.bus_id ?? null))
    .map((h) => {
      const from = students.get(h.id)?.bus_id ?? null
      const to = assigned.get(h.id)!
      return {
        student_id: h.id,
        name: students.get(h.id)?.name ?? 'A student',
        from_bus_id: from,
        from_bus: from ? busName.get(from) ?? 'Bus' : null,
        bus_id: to,
        to_bus: busName.get(to) ?? 'Bus',
      }
    })

  // Straight-line estimates, so a proposal doesn't cost a Mapbox request per bus.
  const busSummaries = loaded.map((bus) => {
    const after = homes.filter((h) => assigned.get(h.id) === bus.busId)
    return {
      bus_id: bus.busId,
      bus_name: bus.name,
      students_now: bus.students.length,
      students_after: after.length,
      minutes_per_run_now: Math.round(straightMinutesPerRun(currentChain(bus).chain, bus.school)),
      minutes_per_run_after: Math.round(straightMinutesPerRun(planChain(after, bus.school), bus.school)),
    }
  })

  return {
    ok: true,
    action: 'optimize',
    applied: false,
    school_id: schoolId,
    estimate: 'straight_line',
    changes,
    buses: busSummaries,
    // Sent back with apply: true.
    assignments: changes.map((c) => ({ student_id: c.student_id, from_bus_id: c.from_bus_id, bus_id: c.bus_id })),
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceKey) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')

    const supabase = createClient(supabaseUrl, serviceKey)
    const caller = await getCaller(req, supabase, { url: supabaseUrl, serviceKey })
    if (!caller) return reply({ ok: false, error: 'Sign in required' }, 401)

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
    const busId = typeof body.bus_id === 'string' ? body.bus_id : null
    const schoolId = typeof body.school_id === 'string' ? body.school_id : null
    const action = body.action === 'optimize' ? 'optimize' : 'update'
    const apply = body.apply === true
    const reverse = body.reverse === true

    if (!(await canPlan(supabase, caller, busId, schoolId))) return reply({ ok: false, error: 'Not allowed to plan these routes' }, 403)
    if (reverse && caller.kind !== 'service') return reply({ ok: false, error: 'Not allowed' }, 403)

    const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN') ?? Deno.env.get('NEXT_PUBLIC_MAPBOX_TOKEN') ?? null
    const directions = mapboxDirections(mapboxToken)

    if (action === 'update') return reply(await runUpdate(supabase, directions, busId, schoolId, reverse))
    if (busId) return reply(await optimizeBus(supabase, directions, busId, apply, body.chain))
    if (schoolId) return reply(await optimizeSchool(supabase, directions, schoolId, apply, body.assignments))
    return reply({ ok: false, error: 'optimize needs a bus_id or a school_id' }, 400)
  } catch (err) {
    if (err instanceof RequestError) return reply({ ok: false, error: err.message }, err.status)
    const message = err instanceof Error ? err.message : (err as { message?: string })?.message ?? 'Unknown error'
    console.error('optimize-route:', message)
    return reply({ ok: false, error: message }, 500)
  }
})
