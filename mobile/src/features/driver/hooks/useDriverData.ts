import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type DriverStudent = {
  id: string
  name: string
  grade: string
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
  schoolName: string
  driverName: string
}

export type DriverMessage = {
  id: string
  from: string
  body: string
  time: string
  type: 'ok' | 'info' | 'warn'
}

type BusRow = {
  id: string
  name: string
  school_id: string
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
}

type AnnouncementRow = {
  id: string
  message: string
  created_at: string
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? 'S') + (parts[1]?.[0] ?? '')).toUpperCase()
}

export function useDriverData() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<DriverBusProfile | null>(null)
  const [stops, setStops] = useState<DriverStop[]>([])
  const [messages, setMessages] = useState<DriverMessage[]>([])
  const [boardedIds, setBoardedIds] = useState<Set<string>>(new Set())

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
        .select('id, name, school_id')
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
        schoolName: school?.name ?? 'School',
        driverName: rawName,
      })

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
          grade: 'N/A',
          initials: initialsFromName(s.name),
          stopOrder: s.stop_order,
        })
        grouped.set(stopName, list)
      }

      const stopList: DriverStop[] = Array.from(grouped.entries()).map(([name, list], idx) => ({
        id: `stop-${idx + 1}`,
        name,
        eta: '--:--',
        current: idx === 0,
        done: false,
        students: list,
      }))
      setStops(stopList)

      const today = new Date().toISOString().slice(0, 10)
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('student_id')
        .eq('bus_id', bus.id)
        .eq('date', today)
        .eq('status', 'boarded')
      const boarded = new Set((attendanceData as AttendanceRow[] | null ?? []).map((a) => a.student_id))
      setBoardedIds(boarded)

      const { data: announcementsData } = await supabase
        .from('announcements')
        .select('id, message, created_at')
        .or(`bus_id.eq.${bus.id},bus_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(25)
      const messageRows = (announcementsData ?? []) as AnnouncementRow[]
      setMessages(
        messageRows.map((m) => ({
          id: m.id,
          from: `${school?.name ?? 'School'} Admin`,
          body: m.message,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'info',
        })),
      )
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load driver data'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

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
    messages,
    refresh,
    setBoardedIds,
  }
}
