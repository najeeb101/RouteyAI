/**
 * What the route planner (optimize-route) sends back, and the words the dashboard uses for it. No imports, so Node's
 * test runner checks it (plannerText.test.ts; `pnpm test:logic`).
 */

export type Named = { student_id: string; name: string; stop?: number }
export type RunTotals = { km: number; minutes: number }

/** One bus after `update`: who was added, removed or moved, and both runs' totals. */
export type UpdatedBus = {
  bus_id: string
  bus_name: string
  changed: boolean
  plan_version: number | null
  added: Named[]
  removed: Named[]
  moved: Named[]
  reversed: boolean
  morning: RunTotals | null
  afternoon: RunTotals | null
  suggestion: { minutes_saved: number; students_moved: number } | null
}

export type RunsSummary = { morning: RunTotals; afternoon: RunTotals; minutes_per_run: number }

/** `optimize` for one bus: a fresh plan compared with today's route. Nothing is saved. */
export type BusProposal = {
  bus_id: string
  bus_name: string
  current: RunsSummary
  proposed: RunsSummary
  minutes_saved: number
  students_moved: number
  clearly_better: boolean
  chain: string[]
}

/** `optimize` for the school: which students would change bus, with straight-line minutes per bus. */
export type SchoolProposal = {
  changes: { student_id: string; name: string; from_bus_id: string | null; from_bus: string | null; bus_id: string; to_bus: string }[]
  buses: { bus_id: string; bus_name: string; students_now: number; students_after: number; minutes_per_run_now: number; minutes_per_run_after: number }[]
  assignments: { student_id: string; from_bus_id: string | null; bus_id: string }[]
}

const list = (names: readonly string[]) =>
  names.length <= 2 ? names.join(' and ') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`

const stopText = (n: Named) => (n.stop ? `${n.name} at stop ${n.stop}` : n.name)

/**
 * What an update did to a bus, in one or two sentences: "Omar at stop 4 joins the route. Sara leaves the route."
 * `names` fills in children the planner could no longer look up (a child who was just removed).
 */
export function describeUpdate(bus: UpdatedBus, names: ReadonlyMap<string, string> = new Map()): string {
  if (!bus.changed) return `${bus.bus_name}'s route is up to date. Nothing changed.`
  const named = (n: Named): Named => ({ ...n, name: names.get(n.student_id) ?? n.name })
  bus = { ...bus, added: bus.added.map(named), moved: bus.moved.map(named), removed: bus.removed.map(named) }
  const parts: string[] = []
  if (bus.added.length) parts.push(`${list(bus.added.map(stopText))} ${bus.added.length === 1 ? 'joins' : 'join'} the route.`)
  if (bus.moved.length) parts.push(`${list(bus.moved.map(stopText))} ${bus.moved.length === 1 ? 'has a new stop' : 'have new stops'} for the new address.`)
  if (bus.removed.length) parts.push(`${list(bus.removed.map((n) => n.name))} ${bus.removed.length === 1 ? 'leaves' : 'leave'} the route.`)
  if (parts.length === 0) parts.push(bus.reversed ? 'The morning now ends at the school.' : 'Map lines and times refreshed.')
  parts.push('Every other stop keeps its place.')
  return parts.join(' ')
}

/** Several buses updated at once (a child moved between buses): each bus by name, then one reassurance. */
export function describeUpdates(buses: readonly UpdatedBus[], names: ReadonlyMap<string, string> = new Map()): string {
  const changed = buses.filter((b) => b.changed)
  if (changed.length === 0) return buses.length === 1 ? describeUpdate(buses[0]!, names) : 'The routes are up to date. Nothing changed.'
  if (changed.length === 1) return describeUpdate(changed[0]!, names)
  const keep = ' Every other stop keeps its place.'
  return `${changed.map((b) => `${b.bus_name}: ${describeUpdate(b, names).replace(keep, '')}`).join(' ')}${keep}`
}

/** "about 6 minutes", rounded the way people say it. */
export function aboutMinutes(minutes: number): string {
  const m = Math.max(1, Math.round(minutes))
  return `about ${m} minute${m === 1 ? '' : 's'}`
}

/** "24 min · 11.2 km" for a run. */
export function runLine(t: RunTotals | null | undefined): string {
  if (!t) return 'Not planned'
  return `${Math.round(t.minutes)} min · ${t.km.toFixed(1)} km`
}
