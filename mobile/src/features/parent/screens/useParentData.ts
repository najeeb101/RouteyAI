import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type ParentChildProfile = {
  id: string
  name: string
  homeAddress: string
  stopOrder: number | null
  busId: string | null
  busName: string | null
  busColor: string
}

export type ParentRoutePoint = {
  lat: number
  lng: number
  stopOrder: number
  studentId: string
}

export type ParentBusLocation = {
  lat: number
  lng: number
}

type StudentRow = {
  id: string
  name: string
  home_address: string
  stop_order: number | null
  bus_id: string | null
}

type BusRow = {
  name: string
  color: string | null
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
  status: 'boarded' | 'absent' | null
}

function getLocalDateKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function useParentData() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [child, setChild] = useState<ParentChildProfile | null>(null)
  const [routePoints, setRoutePoints] = useState<ParentRoutePoint[]>([])
  const [encodedPolyline, setEncodedPolyline] = useState<string | null>(null)
  const [busLocation, setBusLocation] = useState<ParentBusLocation | null>(null)
  const [attendanceStatus, setAttendanceStatus] = useState<'boarded' | 'absent' | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser()
      if (authErr) throw authErr
      const user = authData.user
      if (!user) throw new Error('No authenticated user')

      const { data: studentData, error: studentErr } = await supabase
        .from('students')
        .select('id, name, home_address, stop_order, bus_id')
        .eq('parent_id', user.id)
        .limit(1)
        .maybeSingle()
      if (studentErr) throw studentErr
      if (!studentData) throw new Error('No child linked to this parent account')

      const student = studentData as StudentRow

      let busName: string | null = null
      let busColor = '#3B82F6'
      if (student.bus_id) {
        const { data: busData } = await supabase
          .from('buses')
          .select('name, color')
          .eq('id', student.bus_id)
          .maybeSingle()
        const bus = busData as BusRow | null
        busName = bus?.name ?? null
        busColor = bus?.color ?? '#3B82F6'
      }

      setChild({
        id: student.id,
        name: student.name,
        homeAddress: student.home_address,
        stopOrder: student.stop_order,
        busId: student.bus_id,
        busName,
        busColor,
      })

      if (student.bus_id) {
        const { data: routeData } = await supabase
          .from('routes')
          .select('waypoints, encoded_polyline')
          .eq('bus_id', student.bus_id)
          .order('optimized_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        const route = routeData as RouteRow | null
        const points = (route?.waypoints ?? [])
          .filter((wp) => typeof wp?.lat === 'number' && typeof wp?.lng === 'number')
          .sort((a, b) => a.stop_order - b.stop_order)
          .map((wp) => ({
            lat: wp.lat,
            lng: wp.lng,
            stopOrder: wp.stop_order,
            studentId: wp.student_id,
          }))
        setRoutePoints(points)
        setEncodedPolyline(route?.encoded_polyline ?? null)

        const { data: locData } = await supabase
          .from('bus_locations')
          .select('location')
          .eq('bus_id', student.bus_id)
          .order('timestamp', { ascending: false })
          .limit(1)
          .maybeSingle()
        const locText = (locData as { location?: string } | null)?.location ?? null
        const match = locText?.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/)
        if (match?.[1] && match?.[2]) {
          setBusLocation({ lng: Number(match[1]), lat: Number(match[2]) })
        } else {
          setBusLocation(null)
        }
      } else {
        setRoutePoints([])
        setEncodedPolyline(null)
        setBusLocation(null)
      }

      const today = getLocalDateKey()
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('status')
        .eq('student_id', student.id)
        .eq('date', today)
        .limit(1)
        .maybeSingle()
      const attendance = attendanceData as AttendanceRow | null
      setAttendanceStatus(attendance?.status ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load parent data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (!child?.busId) return
    const channel = supabase
      .channel(`parent-bus-location-${child.busId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bus_locations', filter: `bus_id=eq.${child.busId}` },
        (payload) => {
          const locText = (payload.new as { location?: string })?.location ?? null
          const match = locText?.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/)
          if (match?.[1] && match?.[2]) {
            setBusLocation({ lng: Number(match[1]), lat: Number(match[2]) })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [child?.busId])

  return {
    loading,
    error,
    child,
    routePoints,
    encodedPolyline,
    busLocation,
    attendanceStatus,
    refresh,
  }
}
