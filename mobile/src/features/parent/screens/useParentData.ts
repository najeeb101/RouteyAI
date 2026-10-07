import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { parsePoint, type LatLng } from '@/lib/geo'
import { localDateKey, timeLabel } from '@/lib/dates'
import { ABSENCE_REPORT_COLUMNS, toAbsenceReport, type AbsenceReason, type AbsenceReport, type AbsenceReportRow } from '@/lib/absence'
import { storage } from '@/lib/storage'
import {
  parentCard,
  qatarDateKey,
  type BusRunsToday,
  type CardKind,
  type DayMark,
  type Mark,
  type ParentCard,
  type ReportRuns,
  type Run,
} from '@/lib/runs'

export type ParentChildProfile = {
  id: string
  name: string
  firstName: string
  initials: string
  homeAddress: string
  stopOrder: number | null
  busId: string | null
  busName: string | null
  busColor: string
  schoolName: string | null
}

/** Where a child is in the day: the kind of the parent's card (lib/runs). */
export type ChildStatus = CardKind

/** What the driver recorded for a child today, per run. */
export type ChildMarks = Partial<Record<Run, DayMark>>

export type ParentAnnouncement = {
  id: string
  from: string
  body: string
  time: string
  createdAt: string
  busId: string | null
  busName: string | null
  type: 'ok' | 'info' | 'warn'
}

/** One run of the child's bus as get_parent_route returns it: the line and the child's own stop, never other homes. */
export type ParentRoute = {
  run: Run
  encodedPolyline: string | null
  stop: LatLng | null
  stopsBefore: number | null
  school: LatLng | null
}

/** Where the bus is on the running run, worked out by the database (get_parent_bus_progress). */
export type ParentProgress = {
  run: Run
  live: boolean
  stopsBefore: number | null
  minutesToStop: number | null
  minutesToSchool: number | null
}

export type ParentBusLocation = LatLng & { at: string | null }

/** The driver's phone sends a point every 10 seconds; older than this and the bus is not shown as live. */
const LIVE_WINDOW_MS = 3 * 60 * 1000
/** "Bus almost there" alerts already sent today, so an app restart doesn't send them again. */
const ETA_ALERTS_KEY = 'routeyai.eta-alerts'

type StudentRow = { id: string; name: string; home_address: string; stop_order: number | null; bus_id: string | null }
type BusRow = { id: string; name: string; color: string | null; school_id: string | null }
type AnnouncementRow = { id: string; message: string; created_at: string; bus_id: string | null }
type AttendanceRow = { student_id: string; run: Run; status: Mark; created_at: string; dropped_off_at: string | null }
type BusRunRow = { bus_id: string; run: Run; started_at: string; ended_at: string | null }
type LocationRow = { location: unknown; timestamp: string | null }
type RouteJson = {
  run: Run
  encoded_polyline: string | null
  stop: { lat: number; lng: number } | null
  stops_before: number | null
  school: { lat: number; lng: number } | null
} | null
type ProgressJson = {
  run: Run
  live: boolean
  stops_before?: number | null
  minutes_to_stop?: number | null
  minutes_to_school?: number | null
} | null

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? 'S') + (parts[1]?.[0] ?? '')).toUpperCase()
}

/** Delay notices from drivers start with the bus name and "running"; show them as warnings. */
function announcementType(message: string): ParentAnnouncement['type'] {
  return /running .*late|delay/i.test(message) ? 'warn' : 'info'
}

/** Remembers a sent alert for today; false if it was already sent. */
async function claimEtaAlert(key: string): Promise<boolean> {
  const today = qatarDateKey()
  let sent: string[] = []
  try {
    const saved = JSON.parse((await storage.getItem(ETA_ALERTS_KEY)) ?? 'null') as { date: string; sent: string[] } | null
    if (saved?.date === today) sent = saved.sent
  } catch {
    // A broken entry is replaced below.
  }
  if (sent.includes(key)) return false
  await storage.setItem(ETA_ALERTS_KEY, JSON.stringify({ date: today, sent: [...sent, key] })).catch(() => {})
  return true
}

export function useParentData() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [parentName, setParentName] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [children, setChildren] = useState<ParentChildProfile[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [attendance, setAttendance] = useState<Record<string, ChildMarks>>({})
  const [reports, setReports] = useState<AbsenceReport[]>([])
  const [busRuns, setBusRuns] = useState<Record<string, BusRunsToday>>({})
  const [announcements, setAnnouncements] = useState<ParentAnnouncement[]>([])
  const [route, setRoute] = useState<ParentRoute | null>(null)
  const [progress, setProgress] = useState<ParentProgress | null>(null)
  const [lastLocation, setBusLocation] = useState<ParentBusLocation | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [today, setToday] = useState(localDateKey)
  const etaAlertsSent = useRef(new Set<string>())
  const busNames = useRef(new Map<string, string>())
  const progressAt = useRef(0)

  const childKey = children.map((c) => c.id).join(',')
  const busKey = [...new Set(children.map((c) => c.busId).filter(Boolean))].join(',')
  const child = children.find((c) => c.id === selectedChildId) ?? children[0] ?? null

  const loadAttendance = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return setAttendance({})
    const { data, error: err } = await supabase
      .from('attendance')
      .select('student_id, run, status, created_at, dropped_off_at')
      .in('student_id', ids)
      .eq('date', qatarDateKey())
    if (err) return
    const next: Record<string, ChildMarks> = {}
    for (const row of (data ?? []) as AttendanceRow[]) {
      next[row.student_id] = { ...next[row.student_id], [row.run]: { status: row.status, at: row.created_at, droppedAt: row.dropped_off_at } }
    }
    setAttendance(next)
  }, [])

  const loadBusRuns = useCallback(async (busIds: string[]) => {
    if (busIds.length === 0) return setBusRuns({})
    const { data, error: err } = await supabase
      .from('bus_runs')
      .select('bus_id, run, started_at, ended_at')
      .in('bus_id', busIds)
      .eq('date', qatarDateKey())
    if (err) return
    const next: Record<string, BusRunsToday> = {}
    for (const row of (data ?? []) as BusRunRow[]) {
      next[row.bus_id] = { ...next[row.bus_id], [row.run]: { startedAt: row.started_at, endedAt: row.ended_at } }
    }
    setBusRuns(next)
  }, [])

  const loadReports = useCallback(async (ids: string[], day: string) => {
    if (ids.length === 0) return setReports([])
    const { data, error: err } = await supabase
      .from('absence_reports')
      .select(ABSENCE_REPORT_COLUMNS)
      .in('student_id', ids)
      .gte('date', day)
      .order('date', { ascending: true })
    if (err) return
    setReports(((data ?? []) as AbsenceReportRow[]).map(toAbsenceReport))
  }, [])

  const loadAnnouncements = useCallback(async (busIds: string[], schoolLabel: string) => {
    const filter = busIds.length > 0 ? `bus_id.in.(${busIds.join(',')}),bus_id.is.null` : 'bus_id.is.null'
    const { data, error: err } = await supabase
      .from('announcements')
      .select('id, message, created_at, bus_id')
      .or(filter)
      .order('created_at', { ascending: false })
      .limit(40)
    if (err) return
    setAnnouncements(
      ((data ?? []) as AnnouncementRow[]).map((a) => {
        const busName = a.bus_id ? (busNames.current.get(a.bus_id) ?? null) : null
        return {
          id: a.id,
          from: busName ?? schoolLabel,
          body: a.message,
          time: timeLabel(a.created_at),
          createdAt: a.created_at,
          busId: a.bus_id,
          busName,
          type: announcementType(a.message),
        }
      }),
    )
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    const day = localDateKey()
    setToday(day)

    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser()
      if (authErr) throw authErr
      const user = authData.user
      if (!user) throw new Error('No authenticated user')
      setEmail(user.email ?? null)
      setParentName(
        (user.user_metadata?.full_name as string | undefined) ?? (user.user_metadata?.name as string | undefined) ?? null,
      )

      const { data: studentData, error: studentErr } = await supabase
        .from('students')
        .select('id, name, home_address, stop_order, bus_id')
        .eq('parent_id', user.id)
        .order('name', { ascending: true })
      if (studentErr) throw studentErr
      const students = (studentData ?? []) as StudentRow[]
      if (students.length === 0) throw new Error('No child is linked to this account yet. Ask your school for an invite link.')

      const busIds = [...new Set(students.map((s) => s.bus_id).filter((id): id is string => Boolean(id)))]
      const buses = new Map<string, BusRow>()
      if (busIds.length > 0) {
        const { data: busData } = await supabase.from('buses').select('id, name, color, school_id').in('id', busIds)
        for (const bus of (busData ?? []) as BusRow[]) buses.set(bus.id, bus)
      }
      busNames.current = new Map([...buses.values()].map((b) => [b.id, b.name]))

      const schoolIds = [...new Set([...buses.values()].map((b) => b.school_id).filter((id): id is string => Boolean(id)))]
      const schools = new Map<string, string>()
      if (schoolIds.length > 0) {
        const { data: schoolData } = await supabase.from('schools').select('id, name').in('id', schoolIds)
        for (const school of (schoolData ?? []) as { id: string; name: string }[]) schools.set(school.id, school.name)
      }

      const profiles: ParentChildProfile[] = students.map((s) => {
        const bus = s.bus_id ? buses.get(s.bus_id) : undefined
        return {
          id: s.id,
          name: s.name,
          firstName: s.name.trim().split(/\s+/)[0] ?? s.name,
          initials: initialsFromName(s.name),
          homeAddress: s.home_address,
          stopOrder: s.stop_order,
          busId: s.bus_id,
          busName: bus?.name ?? null,
          busColor: bus?.color ?? '#3B82F6',
          schoolName: bus?.school_id ? (schools.get(bus.school_id) ?? null) : null,
        }
      })
      setChildren(profiles)
      setSelectedChildId((current) => (current && profiles.some((p) => p.id === current) ? current : (profiles[0]?.id ?? null)))

      const ids = profiles.map((p) => p.id)
      const schoolLabel = profiles.find((p) => p.schoolName)?.schoolName ?? 'School'
      await Promise.all([loadAttendance(ids), loadReports(ids, day), loadBusRuns(busIds), loadAnnouncements(busIds, schoolLabel)])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load parent data')
    } finally {
      setLoading(false)
    }
  }, [loadAnnouncements, loadAttendance, loadBusRuns, loadReports])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Re-check every 30 seconds whether the last GPS point is still recent (and the 11:00 switch to the afternoon).
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  const cardFor = useCallback(
    (id: string): ParentCard => {
      const profile = children.find((c) => c.id === id)
      const report = reports.find((r) => r.studentId === id && r.date === today)
      return parentCard(
        {
          hasBus: Boolean(profile?.busId),
          marks: attendance[id] ?? {},
          report: (report?.runs ?? null) as ReportRuns | null,
          busRuns: profile?.busId ? (busRuns[profile.busId] ?? {}) : {},
        },
        new Date(now),
      )
    },
    [attendance, busRuns, children, reports, today, now],
  )
  const statusFor = useCallback((id: string): ChildStatus => cardFor(id).kind, [cardFor])
  const card = child ? cardFor(child.id) : null
  const run: Run = card?.run ?? 'morning'
  const busId = child?.busId ?? null
  const runsKey = busId ? JSON.stringify(busRuns[busId] ?? {}) : ''

  const loadProgress = useCallback(async (studentId: string) => {
    progressAt.current = Date.now()
    const { data, error: err } = await supabase.rpc('get_parent_bus_progress', { p_student_id: studentId })
    if (err) return
    const p = data as ProgressJson
    setProgress(p ? {
      run: p.run,
      live: p.live,
      stopsBefore: p.stops_before ?? null,
      minutesToStop: p.minutes_to_stop ?? null,
      minutesToSchool: p.minutes_to_school ?? null,
    } : null)
  }, [])

  // The selected child's route for the run their card follows: the line and their own stop only.
  const childId = child?.id ?? null
  useEffect(() => {
    setRoute(null)
    if (!childId || !busId) return
    let cancelled = false
    supabase.rpc('get_parent_route', { p_student_id: childId, p_run: run }).then(({ data, error: err }) => {
      if (cancelled || err) return
      const r = data as RouteJson
      setRoute(r ? { run: r.run, encodedPolyline: r.encoded_polyline, stop: r.stop, stopsBefore: r.stops_before, school: r.school } : null)
    })
    return () => { cancelled = true }
    // runsKey: a run starting reloads the route, in case the school changed it since.
  }, [childId, busId, run, runsKey])

  // The bus's latest GPS point and live updates; each new point refreshes the progress (at most every 8 seconds).
  useEffect(() => {
    setBusLocation(null)
    setProgress(null)
    if (!busId || !childId) return
    let cancelled = false

    ;(async () => {
      const { data: locData } = await supabase
        .from('bus_locations')
        .select('location, timestamp')
        .eq('bus_id', busId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (cancelled) return
      const loc = locData as LocationRow | null
      const point = parsePoint(loc?.location)
      setBusLocation(point ? { ...point, at: loc?.timestamp ?? null } : null)
      loadProgress(childId)
    })()

    const channel = supabase
      .channel(`parent-bus-location-${busId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bus_locations', filter: `bus_id=eq.${busId}` }, (payload) => {
        const row = payload.new as LocationRow
        const point = parsePoint(row?.location)
        if (point) setBusLocation({ ...point, at: row.timestamp ?? new Date().toISOString() })
        if (Date.now() - progressAt.current > 8_000) loadProgress(childId)
      })
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [busId, childId, runsKey, loadProgress])

  // Check-ins, absence reports, runs starting and ending, and announcements, kept live.
  useEffect(() => {
    if (!childKey) return
    const ids = childKey.split(',')
    const busIds = busKey ? busKey.split(',') : []
    const schoolLabel = children.find((c) => c.schoolName)?.schoolName ?? 'School'
    let channel = supabase
      .channel(`parent-children-${childKey}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance', filter: `student_id=in.(${childKey})` }, () => loadAttendance(ids))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'absence_reports', filter: `student_id=in.(${childKey})` }, () =>
        loadReports(ids, localDateKey()),
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, () => loadAnnouncements(busIds, schoolLabel))
    if (busKey) {
      channel = channel.on('postgres_changes', { event: '*', schema: 'public', table: 'bus_runs', filter: `bus_id=in.(${busKey})` }, () => loadBusRuns(busIds))
    }
    channel.subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [childKey, busKey, children, loadAnnouncements, loadAttendance, loadBusRuns, loadReports])

  /** Only a recent point counts as the bus's live position (an old one would show yesterday's bus as "7 min away"). */
  const busLocation = useMemo(() => {
    if (!lastLocation?.at) return null
    return now - Date.parse(lastLocation.at) < LIVE_WINDOW_MS ? lastLocation : null
  }, [lastLocation, now])

  /** The arrival time for the card: to the child's stop, or to school once picked up in the morning. */
  const eta = useMemo(() => {
    if (!card?.target || !progress?.live || progress.run !== card.run) return null
    if (card.target === 'school') return progress.minutesToSchool === null ? null : { minutes: progress.minutesToSchool, stopsBefore: null }
    return progress.minutesToStop === null ? null : { minutes: progress.minutesToStop, stopsBefore: progress.stopsBefore }
  }, [card, progress])

  // "Bus almost there": once per child, day and run, also across app restarts.
  useEffect(() => {
    if (!child || !card || (card.kind !== 'waiting' && card.kind !== 'on-way-home') || !eta || eta.minutes > 5) return
    const key = `${child.id}:${card.run}`
    if (etaAlertsSent.current.has(key)) return
    etaAlertsSent.current.add(key)
    claimEtaAlert(key).then((fresh) => {
      if (fresh) supabase.functions.invoke('send-notification', { body: { type: 'eta_alert', student_id: child.id } }).catch(() => {})
    })
  }, [child, card, eta])

  const reportAbsence = useCallback(
    async ({ studentId, dates, runs, reason, note }: { studentId: string; dates: string[]; runs: ReportRuns; reason: AbsenceReason; note: string }) => {
      if (dates.length === 0) return 'Pick at least one day.'
      // Parents have no UPDATE policy, so days already reported are left out by the sheet instead of upserted.
      const rows = dates.map((date) => ({ student_id: studentId, date, runs, reason, note: note.trim() || null }))
      const { data, error: err } = await supabase.from('absence_reports').insert(rows).select(ABSENCE_REPORT_COLUMNS)
      if (err) return 'Could not send the report. Check your connection and try again.'
      const saved = ((data ?? []) as AbsenceReportRow[]).map(toAbsenceReport)
      setReports((prev) =>
        [...prev.filter((r) => !saved.some((s) => s.studentId === r.studentId && s.date === r.date)), ...saved].sort((a, b) =>
          a.date.localeCompare(b.date),
        ),
      )
      return null
    },
    [],
  )

  const cancelAbsence = useCallback(async (reportId: string) => {
    const { error: err } = await supabase.from('absence_reports').delete().eq('id', reportId)
    if (err) return 'Could not cancel the report. Try again.'
    setReports((prev) => prev.filter((r) => r.id !== reportId))
    return null
  }, [])

  return {
    loading,
    error,
    parentName,
    email,
    children,
    child,
    selectChild: setSelectedChildId,
    statusFor,
    status: (card?.kind ?? 'not-started') as ChildStatus,
    card,
    attendance,
    today,
    reports,
    announcements,
    route,
    busLocation,
    progress,
    eta,
    reportAbsence,
    cancelAbsence,
    refresh,
  }
}
