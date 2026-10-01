import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { etaMinutesBetween, haversineKm, parsePoint, type LatLng } from '@/lib/geo'
import { localDateKey, timeLabel } from '@/lib/dates'
import { toAbsenceReport, type AbsenceReason, type AbsenceReport, type AbsenceReportRow } from '@/lib/absence'

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

/** Where a child stands this morning: on the bus, marked absent by the driver, reported absent by the parent, or still waiting. */
export type ChildStatus = 'boarded' | 'absent' | 'reported' | 'waiting' | 'no-bus'

export type TodayAttendance = {
  status: 'boarded' | 'absent'
  /** When the driver marked it (ISO). */
  at: string
}

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

export type ParentRoutePoint = {
  lat: number
  lng: number
  stopOrder: number
  studentId: string
}

export type ParentBusLocation = LatLng & { at: string | null }

/** The driver's phone sends a point every 10 seconds; older than this and the bus is not shown as live. */
const LIVE_WINDOW_MS = 3 * 60 * 1000

type StudentRow = {
  id: string
  name: string
  home_address: string
  stop_order: number | null
  bus_id: string | null
}

type BusRow = {
  id: string
  name: string
  color: string | null
  school_id: string | null
}

type AnnouncementRow = {
  id: string
  message: string
  created_at: string
  bus_id: string | null
}

type WaypointRow = {
  lat: number
  lng: number
  stop_order: number
  student_id: string
}

type RouteRow = {
  waypoints: WaypointRow[] | null
  encoded_polyline: string | null
}

type AttendanceRow = {
  student_id: string
  status: 'boarded' | 'absent' | null
  created_at: string
}

type LocationRow = {
  location: unknown
  timestamp: string | null
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? 'S') + (parts[1]?.[0] ?? '')).toUpperCase()
}

/** Delay notices from drivers start with the bus name and "running"; show them as warnings. */
function announcementType(message: string): ParentAnnouncement['type'] {
  return /running .*late|delay/i.test(message) ? 'warn' : 'info'
}

export function useParentData() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [parentName, setParentName] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [children, setChildren] = useState<ParentChildProfile[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [attendance, setAttendance] = useState<Record<string, TodayAttendance>>({})
  const [reports, setReports] = useState<AbsenceReport[]>([])
  const [announcements, setAnnouncements] = useState<ParentAnnouncement[]>([])
  const [routePoints, setRoutePoints] = useState<ParentRoutePoint[]>([])
  const [encodedPolyline, setEncodedPolyline] = useState<string | null>(null)
  const [lastLocation, setBusLocation] = useState<ParentBusLocation | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [today, setToday] = useState(localDateKey)
  const etaAlertsSent = useRef(new Set<string>())
  const busNames = useRef(new Map<string, string>())

  const childIds = useMemo(() => children.map((c) => c.id), [children])
  const childKey = childIds.join(',')
  const child = children.find((c) => c.id === selectedChildId) ?? children[0] ?? null

  const loadAttendance = useCallback(async (ids: string[], day: string) => {
    if (ids.length === 0) return setAttendance({})
    const { data, error: err } = await supabase
      .from('attendance')
      .select('student_id, status, created_at')
      .in('student_id', ids)
      .eq('date', day)
    if (err) return
    const next: Record<string, TodayAttendance> = {}
    for (const row of (data ?? []) as AttendanceRow[]) {
      if (row.status) next[row.student_id] = { status: row.status, at: row.created_at }
    }
    setAttendance(next)
  }, [])

  const loadReports = useCallback(async (ids: string[], day: string) => {
    if (ids.length === 0) return setReports([])
    const { data, error: err } = await supabase
      .from('absence_reports')
      .select('id, student_id, date, reason, note, created_at')
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
      await Promise.all([loadAttendance(ids, day), loadReports(ids, day), loadAnnouncements(busIds, schoolLabel)])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load parent data')
    } finally {
      setLoading(false)
    }
  }, [loadAnnouncements, loadAttendance, loadReports])

  useEffect(() => {
    refresh()
  }, [refresh])

  // The selected child's bus: route line, stops and the latest GPS point, then live updates.
  const busId = child?.busId ?? null
  useEffect(() => {
    setRoutePoints([])
    setEncodedPolyline(null)
    setBusLocation(null)
    if (!busId) return
    let cancelled = false

    ;(async () => {
      const [{ data: routeData }, { data: locData }] = await Promise.all([
        supabase
          .from('routes')
          .select('waypoints, encoded_polyline')
          .eq('bus_id', busId)
          .order('optimized_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('bus_locations')
          .select('location, timestamp')
          .eq('bus_id', busId)
          .order('timestamp', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])
      if (cancelled) return
      const route = routeData as RouteRow | null
      setRoutePoints(
        (route?.waypoints ?? [])
          .filter((wp) => typeof wp?.lat === 'number' && typeof wp?.lng === 'number')
          .sort((a, b) => a.stop_order - b.stop_order)
          .map((wp) => ({ lat: wp.lat, lng: wp.lng, stopOrder: wp.stop_order, studentId: wp.student_id })),
      )
      setEncodedPolyline(route?.encoded_polyline ?? null)
      const loc = locData as LocationRow | null
      const point = parsePoint(loc?.location)
      setBusLocation(point ? { ...point, at: loc?.timestamp ?? null } : null)
    })()

    const channel = supabase
      .channel(`parent-bus-location-${busId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bus_locations', filter: `bus_id=eq.${busId}` }, (payload) => {
        const row = payload.new as LocationRow
        const point = parsePoint(row?.location)
        if (point) setBusLocation({ ...point, at: row.timestamp ?? new Date().toISOString() })
      })
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [busId])

  // Attendance, absence reports and announcements for every child, kept live.
  useEffect(() => {
    if (!childKey) return
    const ids = childKey.split(',')
    const busIds = [...new Set(children.map((c) => c.busId).filter((id): id is string => Boolean(id)))]
    const schoolLabel = children.find((c) => c.schoolName)?.schoolName ?? 'School'
    const channel = supabase
      .channel(`parent-children-${childKey}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance', filter: `student_id=in.(${childKey})` }, () =>
        loadAttendance(ids, localDateKey()),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'absence_reports', filter: `student_id=in.(${childKey})` }, () =>
        loadReports(ids, localDateKey()),
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, () => loadAnnouncements(busIds, schoolLabel))
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [childKey, children, loadAnnouncements, loadAttendance, loadReports])

  const statusFor = useCallback(
    (id: string): ChildStatus => {
      const record = attendance[id]
      if (record) return record.status
      if (reports.some((r) => r.studentId === id && r.date === today)) return 'reported'
      const profile = children.find((c) => c.id === id)
      return profile?.busId ? 'waiting' : 'no-bus'
    },
    [attendance, children, reports, today],
  )

  const status: ChildStatus = child ? statusFor(child.id) : 'waiting'
  const childPoint = child ? routePoints.find((p) => p.studentId === child.id) : undefined

  // Re-check every 30 seconds whether the last GPS point is still recent.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  /** Only a recent point counts as the bus's live position (an old one would show yesterday's bus as "7 min away"). */
  const busLocation = useMemo(() => {
    if (!lastLocation?.at) return null
    return now - Date.parse(lastLocation.at) < LIVE_WINDOW_MS ? lastLocation : null
  }, [lastLocation, now])

  /** Route waypoint nearest the bus, and the child's position in the route. */
  const progress = useMemo(() => {
    if (!busLocation || !childPoint || routePoints.length === 0) return null
    let nearest = 0
    let best = Infinity
    routePoints.forEach((p, i) => {
      const d = haversineKm(busLocation, p)
      if (d < best) {
        best = d
        nearest = i
      }
    })
    return { nearest, childIndex: routePoints.indexOf(childPoint) }
  }, [busLocation, childPoint, routePoints])

  /** Minutes to the child's stop along the remaining stops (not straight-line, which stalls on looping routes). */
  const etaMinutes = useMemo(() => {
    if (!busLocation || !childPoint || status !== 'waiting' || !progress) return null
    const { nearest, childIndex } = progress
    if (childIndex <= nearest) return etaMinutesBetween(busLocation, childPoint)
    let km = haversineKm(busLocation, routePoints[nearest] ?? childPoint)
    for (let i = nearest; i < childIndex; i++) {
      const a = routePoints[i]
      const b = routePoints[i + 1]
      if (a && b) km += haversineKm(a, b)
    }
    return Math.max(1, Math.round((km / 25) * 60))
  }, [busLocation, childPoint, progress, routePoints, status])

  /** Stops the bus still has to make before this child's, from the waypoint nearest the bus. */
  const stopsBefore = useMemo(() => {
    if (!progress || status !== 'waiting') return null
    return Math.max(0, progress.childIndex - progress.nearest)
  }, [progress, status])

  // Push "bus arriving in ~5 minutes" once per child per session.
  useEffect(() => {
    if (!child || etaMinutes === null || etaMinutes > 5 || etaAlertsSent.current.has(child.id)) return
    etaAlertsSent.current.add(child.id)
    supabase.functions.invoke('send-notification', { body: { type: 'eta_alert', student_id: child.id } }).catch(() => {})
  }, [child, etaMinutes])

  const reportAbsence = useCallback(
    async ({ studentId, dates, reason, note }: { studentId: string; dates: string[]; reason: AbsenceReason; note: string }) => {
      if (dates.length === 0) return 'Pick at least one day.'
      // Parents have no UPDATE policy, so days already reported are left out by the sheet instead of upserted.
      const rows = dates.map((date) => ({ student_id: studentId, date, reason, note: note.trim() || null }))
      const { data, error: err } = await supabase
        .from('absence_reports')
        .insert(rows)
        .select('id, student_id, date, reason, note, created_at')
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
    status,
    attendance,
    today,
    reports,
    announcements,
    routePoints,
    childPoint,
    encodedPolyline,
    busLocation,
    etaMinutes,
    stopsBefore,
    reportAbsence,
    cancelAbsence,
    refresh,
  }
}
