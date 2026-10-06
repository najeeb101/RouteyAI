import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ABSENCE_REPORT_COLUMNS, toAbsenceReport, type AbsenceReport, type AbsenceReportRow } from '@/lib/absence'
import { timeLabel } from '@/lib/dates'
import {
  driverRun,
  groupStops,
  qatarDateKey,
  reportCovers,
  runOrder,
  savedRunOrder,
  type BusRunsToday,
  type Mark,
  type Run,
} from '@/lib/runs'

export type DriverStudent = {
  id: string
  name: string
  initials: string
  stopOrder: number | null
  address: string
}

export type DriverStop = {
  id: string
  name: string
  /** The afternoon's first stop: everyone boards at school. */
  school?: boolean
  done?: boolean
  current?: boolean
  students: DriverStudent[]
}

export type DriverBusProfile = {
  busId: string
  busName: string
  routeName: string
  schoolId: string
  schoolName: string
  driverName: string
  email: string | null
  capacity: number
}

export type DriverMessage = {
  id: string
  /** True for messages this driver sent (e.g. delay notices). */
  mine: boolean
  from: string
  body: string
  time: string
  type: 'ok' | 'info' | 'warn'
}

export type DriverRoutePoint = {
  lat: number
  lng: number
  stopOrder: number
  studentId: string
}

/** Who did what on the run so far, for the progress card and the end-of-run summary. */
export type RunCounts = {
  total: number
  /** Got on the bus (still on it, or dropped off since). */
  rode: number
  droppedOff: number
  /** On the bus now (afternoon: boarded and not yet dropped off). */
  onBoard: DriverStudent[]
  absent: number
  reported: number
  notChecked: number
}

type BusRow = { id: string; name: string; school_id: string; capacity: number | null }
type StudentRow = { id: string; name: string; home_address: string; stop_order: number | null }
type BusRunRow = { run: Run; started_at: string; ended_at: string | null; plan_version: number; stops: { student_id: string; position: number }[] | null }
type AttendanceRow = { student_id: string; status: Mark }
type AnnouncementRow = { id: string; message: string; created_at: string; sender_id: string | null }
type WaypointRow = { lat: number; lng: number; student_id: string; stop_order: number }
type RouteRow = { run: Run; waypoints: WaypointRow[] | null; encoded_polyline: string | null; plan_version: number | null }

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? 'S') + (parts[1]?.[0] ?? '')).toUpperCase()
}

/** Marks each stop done (everyone there accounted for) and the first stop that isn't as current. */
function deriveStopProgress(stops: DriverStop[], isDone: (stop: DriverStop) => boolean) {
  let activeStopAssigned = false
  const nextStops = stops.map((stop) => {
    const done = stop.students.length > 0 && isDone(stop)
    const current = !done && !activeStopAssigned
    if (current) activeStopAssigned = true
    return { ...stop, done, current }
  })
  if (!activeStopAssigned && nextStops.length > 0) {
    const lastIndex = nextStops.length - 1
    nextStops[lastIndex] = { ...nextStops[lastIndex]!, current: true }
  }
  return nextStops
}

export function useDriverData() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<DriverBusProfile | null>(null)
  const [students, setStudents] = useState<DriverStudent[]>([])
  const [messages, setMessages] = useState<DriverMessage[]>([])
  const [busRunRows, setBusRunRows] = useState<BusRunRow[]>([])
  const [runsLoaded, setRunsLoaded] = useState(false)
  const [marks, setMarks] = useState<Map<string, Mark>>(new Map())
  const [routes, setRoutes] = useState<RouteRow[]>([])
  /** The plan version the last run before today started with, to spot a route change. */
  const [lastRunPlan, setLastRunPlan] = useState<number | null>(null)
  /** Parents' absence reports for today, by student. */
  const [reported, setReported] = useState<Map<string, AbsenceReport>>(new Map())
  const [now, setNow] = useState(() => new Date())

  const busId = profile?.busId ?? null

  const busRuns = useMemo<BusRunsToday>(
    () => Object.fromEntries(busRunRows.map((r) => [r.run, { startedAt: r.started_at, endedAt: r.ended_at }])),
    [busRunRows],
  )
  const runState = useMemo(() => driverRun(busRuns, now), [busRuns, now])
  const run = runState.run
  const runRow = busRunRows.find((r) => r.run === run) ?? null
  const runningSince = runState.phase === 'running' ? (runRow?.started_at ?? null) : null
  const running = useMemo(() => (runningSince ? { startedAt: runningSince, endedAt: null } : null), [runningSince])

  // The 11:00 switch to the afternoon happens without a refresh.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const loadRuns = useCallback(async (id: string) => {
    const { data, error: err } = await supabase
      .from('bus_runs')
      .select('run, started_at, ended_at, plan_version, stops')
      .eq('bus_id', id)
      .eq('date', qatarDateKey())
    if (err) return
    setBusRunRows((data ?? []) as BusRunRow[])
    setRunsLoaded(true)
  }, [])

  const loadMarks = useCallback(async (id: string, forRun: Run) => {
    const { data, error: err } = await supabase
      .from('attendance')
      .select('student_id, status')
      .eq('bus_id', id)
      .eq('date', qatarDateKey())
      .eq('run', forRun)
    if (err) return
    setMarks(new Map(((data ?? []) as AttendanceRow[]).map((a) => [a.student_id, a.status])))
  }, [])

  const loadReports = useCallback(async (studentIds: string[]) => {
    if (studentIds.length === 0) return setReported(new Map())
    const { data, error: err } = await supabase
      .from('absence_reports')
      .select(ABSENCE_REPORT_COLUMNS)
      .in('student_id', studentIds)
      .eq('date', qatarDateKey())
    if (err) return
    setReported(new Map(((data ?? []) as AbsenceReportRow[]).map((row) => [row.student_id, toAbsenceReport(row)])))
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser()
      if (authErr) throw authErr
      const user = authData.user
      if (!user) throw new Error('No authenticated user')

      const { data: busData, error: busErr } = await supabase
        .from('buses')
        .select('id, name, school_id, capacity')
        .eq('driver_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (busErr) throw busErr
      if (!busData) throw new Error('No bus assigned to this driver yet')
      const bus = busData as BusRow

      const [{ data: schoolData }, { data: studentsData, error: studentsErr }, { data: routeData }, { data: lastRun }] = await Promise.all([
        supabase.from('schools').select('name').eq('id', bus.school_id).maybeSingle(),
        supabase.from('students').select('id, name, home_address, stop_order').eq('bus_id', bus.id),
        supabase.from('routes').select('run, waypoints, encoded_polyline, plan_version').eq('bus_id', bus.id),
        supabase.from('bus_runs').select('plan_version').eq('bus_id', bus.id).order('started_at', { ascending: false }).limit(1).maybeSingle(),
      ])
      if (studentsErr) throw studentsErr
      const schoolName = (schoolData as { name: string } | null)?.name ?? 'School'

      const rawName =
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        'Driver'
      setProfile({
        busId: bus.id,
        busName: bus.name,
        routeName: bus.name,
        schoolId: bus.school_id,
        schoolName,
        driverName: rawName,
        email: user.email ?? null,
        capacity: bus.capacity ?? 40,
      })

      const list = ((studentsData ?? []) as StudentRow[]).map((s) => ({
        id: s.id,
        name: s.name,
        initials: initialsFromName(s.name),
        stopOrder: s.stop_order,
        address: s.home_address,
      }))
      setStudents(list)
      setRoutes((routeData ?? []) as RouteRow[])
      setLastRunPlan((lastRun as { plan_version: number } | null)?.plan_version ?? null)
      await Promise.all([loadRuns(bus.id), loadReports(list.map((s) => s.id))])

      const { data: announcementsData } = await supabase
        .from('announcements')
        .select('id, message, created_at, sender_id')
        .or(`bus_id.eq.${bus.id},bus_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(25)
      setMessages(
        ((announcementsData ?? []) as AnnouncementRow[]).map((m) => {
          const mine = m.sender_id === user.id
          return {
            id: m.id,
            mine,
            from: mine ? 'You' : schoolName,
            body: m.message,
            time: timeLabel(m.created_at),
            type: /running .*late|delay/i.test(m.message) ? ('warn' as const) : ('info' as const),
          }
        }),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load driver data')
    } finally {
      setLoading(false)
    }
  }, [loadReports, loadRuns])

  useEffect(() => {
    refresh()
  }, [refresh])

  // The run's check-ins, reloaded when the run changes.
  useEffect(() => {
    if (busId) loadMarks(busId, run)
  }, [busId, run, loadMarks])

  useEffect(() => {
    if (!busId) return
    const channel = supabase
      .channel(`driver-bus-${busId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bus_runs', filter: `bus_id=eq.${busId}` }, () => loadRuns(busId))
      // Ending the morning run marks everyone on board as arrived at school.
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance', filter: `bus_id=eq.${busId}` }, () => loadMarks(busId, run))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [busId, run, refresh, loadRuns, loadMarks])

  // Parents can report an absence while the route is running; RLS only sends this driver's students.
  const studentKey = students.map((s) => s.id).join(',')
  useEffect(() => {
    if (!busId || !studentKey) return
    const ids = studentKey.split(',')
    const channel = supabase
      .channel(`driver-absence-reports-${busId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'absence_reports' }, () => loadReports(ids))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [busId, studentKey, loadReports])

  /** Checks a student in or out on the running run; undoes the change on screen if the database refuses it. */
  const mark = useCallback(async (studentId: string, status: Mark | null): Promise<string | null> => {
    const before = marks.get(studentId) ?? null
    setMarks((prev) => {
      const next = new Map(prev)
      if (status) next.set(studentId, status)
      else next.delete(studentId)
      return next
    })
    const { error: err } = await supabase.rpc('mark_attendance', { p_student_id: studentId, p_status: status })
    if (!err) return null
    setMarks((prev) => {
      const next = new Map(prev)
      if (before) next.set(studentId, before)
      else next.delete(studentId)
      return next
    })
    return err.message
  }, [marks])

  /** Reported absent by a parent for this run and not on the bus after all. */
  const reportedIds = useMemo(
    () => new Set([...reported.values()]
      .filter((r) => reportCovers(r.runs, run) && marks.get(r.studentId) !== 'boarded' && marks.get(r.studentId) !== 'dropped_off')
      .map((r) => r.studentId)),
    [reported, run, marks],
  )

  const ordered = useMemo(() => {
    const saved = runRow?.stops?.length ? [...runRow.stops].sort((a, b) => a.position - b.position).map((s) => s.student_id) : null
    return saved ? savedRunOrder(students, saved, run) : runOrder(students, run)
  }, [students, runRow, run])

  const stops = useMemo(() => {
    const homes: DriverStop[] = groupStops(ordered).map((s, i) => ({ id: `stop-${i + 1}`, name: s.name, students: s.students }))
    const status = (id: string) => marks.get(id)
    if (run === 'morning') {
      return deriveStopProgress(homes, (stop) => stop.students.every((s) => status(s.id) === 'boarded' || status(s.id) === 'dropped_off' || status(s.id) === 'absent' || reportedIds.has(s.id)))
    }
    const school: DriverStop = { id: 'school', name: profile?.schoolName ?? 'School', school: true, students: ordered }
    return deriveStopProgress([school, ...homes], (stop) => stop.school
      // At school: everyone boarded, marked absent, or reported.
      ? stop.students.every((s) => status(s.id) !== undefined || reportedIds.has(s.id))
      // At home: everyone who rode is dropped off; children not on the bus count as done.
      : stop.students.every((s) => status(s.id) !== 'boarded'))
  }, [ordered, marks, run, reportedIds, profile?.schoolName])

  const counts = useMemo<RunCounts>(() => {
    const status = (id: string) => marks.get(id)
    const rode = students.filter((s) => status(s.id) === 'boarded' || status(s.id) === 'dropped_off').length
    const absent = students.filter((s) => status(s.id) === 'absent').length
    return {
      total: students.length,
      rode,
      droppedOff: students.filter((s) => status(s.id) === 'dropped_off').length,
      onBoard: ordered.filter((s) => status(s.id) === 'boarded'),
      absent,
      reported: reportedIds.size,
      notChecked: Math.max(0, students.length - rode - absent - reportedIds.size),
    }
  }, [students, ordered, marks, reportedIds])

  const route = routes.find((r) => r.run === run) ?? null
  const routePoints = useMemo<DriverRoutePoint[]>(
    () => (route?.waypoints ?? [])
      .filter((wp) => typeof wp?.lat === 'number' && typeof wp?.lng === 'number')
      .sort((a, b) => a.stop_order - b.stop_order)
      .map((wp) => ({ lat: wp.lat, lng: wp.lng, stopOrder: wp.stop_order, studentId: wp.student_id })),
    [route],
  )
  const planVersion = Math.max(0, ...routes.map((r) => r.plan_version ?? 0))
  const lastPlan = busRunRows.length > 0 ? Math.max(...busRunRows.map((r) => r.plan_version)) : lastRunPlan
  const reloadRuns = useCallback(async () => { if (busId) await loadRuns(busId) }, [busId, loadRuns])

  return {
    loading,
    error,
    profile,
    run,
    runState,
    runsLoaded,
    running,
    stops,
    marks,
    mark,
    counts,
    totalStudents: students.length,
    reported,
    reportedIds,
    busCapacity: profile?.capacity ?? 40,
    messages,
    routePoints,
    encodedPolyline: route?.encoded_polyline ?? null,
    /** The school re-planned the route since the last run: the driver should look at the stop list. */
    routeChanged: runState.phase === 'ready' && lastPlan !== null && planVersion > lastPlan,
    refresh,
    reloadRuns,
  }
}
