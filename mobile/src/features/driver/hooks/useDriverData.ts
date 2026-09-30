import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toAbsenceReport, type AbsenceReport, type AbsenceReportRow } from '@/lib/absence'
import { localDateKey, timeLabel } from '@/lib/dates'

export type DriverStudent = {
  id: string
  name: string
  initials: string
  stopOrder: number | null
}

export type DriverStop = {
  id: string
  name: string
  eta: string
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

type BusRow = {
  id: string
  name: string
  school_id: string
  capacity: number | null
}

type SchoolRow = {
  name: string
}

type StudentRow = {
  id: string
  name: string
  home_address: string
  stop_order: number | null
}

type AttendanceRow = {
  student_id: string
  status: 'boarded' | 'absent'
}

type AnnouncementRow = {
  id: string
  message: string
  created_at: string
  sender_id: string | null
}

type WaypointRow = {
  lat: number
  lng: number
  student_id: string
  stop_order: number
}

type RouteRow = {
  waypoints: WaypointRow[] | null
  encoded_polyline: string | null
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? 'S') + (parts[1]?.[0] ?? '')).toUpperCase()
}

/** A stop is done once every student on it is boarded, marked absent, or reported absent by a parent. */
function deriveStopProgress(stops: DriverStop[], boardedIds: Set<string>, absentIds: Set<string>, reportedIds: Set<string>) {
  let activeStopAssigned = false
  const accountedIds = new Set([...boardedIds, ...absentIds, ...reportedIds])
  const nextStops = stops.map((stop) => {
    const done = stop.students.length > 0 && stop.students.every((student) => accountedIds.has(student.id))
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
  const [baseStops, setBaseStops] = useState<DriverStop[]>([])
  const [messages, setMessages] = useState<DriverMessage[]>([])
  const [boardedIds, setBoardedIds] = useState<Set<string>>(new Set())
  const [absentIds, setAbsentIds] = useState<Set<string>>(new Set())
  const [busCapacity, setBusCapacity] = useState<number>(40)
  const [routePoints, setRoutePoints] = useState<DriverRoutePoint[]>([])
  const [encodedPolyline, setEncodedPolyline] = useState<string | null>(null)
  /** Parents' absence reports for today, by student. */
  const [reported, setReported] = useState<Map<string, AbsenceReport>>(new Map())

  const loadReports = useCallback(async (studentIds: string[]) => {
    if (studentIds.length === 0) return setReported(new Map())
    const { data, error: err } = await supabase
      .from('absence_reports')
      .select('id, student_id, date, reason, note, created_at')
      .in('student_id', studentIds)
      .eq('date', localDateKey())
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
        .limit(1)
        .maybeSingle()
      if (busErr) throw busErr
      if (!busData) throw new Error('No bus assigned to this driver yet')
      const bus = busData as BusRow

      const { data: schoolData } = await supabase
        .from('schools')
        .select('name')
        .eq('id', bus.school_id)
        .maybeSingle()
      const school = schoolData as SchoolRow | null

      const rawName =
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        'Driver'

      setProfile({
        busId: bus.id,
        busName: bus.name,
        routeName: bus.name,
        schoolId: bus.school_id,
        schoolName: school?.name ?? 'School',
        driverName: rawName,
        email: user.email ?? null,
        capacity: bus.capacity ?? 40,
      })
      setBusCapacity(bus.capacity ?? 40)

      const { data: studentsData, error: studentsErr } = await supabase
        .from('students')
        .select('id, name, home_address, stop_order')
        .eq('bus_id', bus.id)
        .order('stop_order', { ascending: true, nullsFirst: false })
      if (studentsErr) throw studentsErr
      const students = (studentsData ?? []) as StudentRow[]

      const grouped = new Map<string, DriverStudent[]>()
      for (const s of students) {
        const stopName = s.home_address || 'Stop'
        const list = grouped.get(stopName) ?? []
        list.push({
          id: s.id,
          name: s.name,
          initials: initialsFromName(s.name),
          stopOrder: s.stop_order,
        })
        grouped.set(stopName, list)
      }

      const stopList: DriverStop[] = Array.from(grouped.entries()).map(([name, list], idx) => ({
        id: `stop-${idx + 1}`,
        name,
        eta: '--:--',
        current: false,
        done: false,
        students: list,
      }))
      setBaseStops(stopList)

      const { data: routeData } = await supabase
        .from('routes')
        .select('waypoints, encoded_polyline')
        .eq('bus_id', bus.id)
        .order('optimized_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      const latestRoute = routeData as RouteRow | null
      const points = (latestRoute?.waypoints ?? [])
        .filter((wp) => typeof wp?.lat === 'number' && typeof wp?.lng === 'number')
        .sort((a, b) => a.stop_order - b.stop_order)
        .map((wp) => ({
          lat: wp.lat,
          lng: wp.lng,
          stopOrder: wp.stop_order,
          studentId: wp.student_id,
        }))
      setRoutePoints(points)
      setEncodedPolyline(latestRoute?.encoded_polyline ?? null)

      const today = localDateKey()
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('bus_id', bus.id)
        .eq('date', today)
      const rows = (attendanceData as AttendanceRow[] | null) ?? []
      setBoardedIds(new Set(rows.filter((a) => a.status === 'boarded').map((a) => a.student_id)))
      setAbsentIds(new Set(rows.filter((a) => a.status === 'absent').map((a) => a.student_id)))
      await loadReports(students.map((s) => s.id))

      const { data: announcementsData } = await supabase
        .from('announcements')
        .select('id, message, created_at, sender_id')
        .or(`bus_id.eq.${bus.id},bus_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(25)
      const messageRows = (announcementsData ?? []) as AnnouncementRow[]
      setMessages(
        messageRows.map((m) => {
          const mine = m.sender_id === user.id
          return {
            id: m.id,
            mine,
            from: mine ? 'You' : `${school?.name ?? 'School'}`,
            body: m.message,
            time: timeLabel(m.created_at),
            type: /running .*late|delay/i.test(m.message) ? ('warn' as const) : ('info' as const),
          }
        }),
      )
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load driver data'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [loadReports])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!profile?.busId) return
    const channel = supabase
      .channel(`driver-announcements-${profile.busId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, () => refresh())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [profile?.busId, refresh])

  // Parents can report an absence while the route is running; RLS only sends this driver's students.
  const studentKey = baseStops.flatMap((stop) => stop.students.map((s) => s.id)).join(',')
  useEffect(() => {
    if (!profile?.busId || !studentKey) return
    const ids = studentKey.split(',')
    const channel = supabase
      .channel(`driver-absence-reports-${profile.busId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'absence_reports' }, () => loadReports(ids))
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.busId, studentKey, loadReports])

  /** Reported absent by a parent and not boarded after all. */
  const reportedIds = useMemo(
    () => new Set([...reported.keys()].filter((id) => !boardedIds.has(id))),
    [reported, boardedIds],
  )

  const stops = useMemo(
    () => deriveStopProgress(baseStops, boardedIds, absentIds, reportedIds),
    [baseStops, boardedIds, absentIds, reportedIds],
  )
  const totalStudents = useMemo(
    () => stops.reduce((total, stop) => total + stop.students.length, 0),
    [stops],
  )

  return {
    loading,
    error,
    profile,
    stops,
    totalStudents,
    boardedIds,
    setBoardedIds,
    absentIds,
    setAbsentIds,
    reported,
    reportedIds,
    busCapacity,
    messages,
    routePoints,
    encodedPolyline,
    refresh,
  }
}
