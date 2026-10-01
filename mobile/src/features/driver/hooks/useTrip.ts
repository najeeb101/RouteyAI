import { useCallback, useEffect, useRef, useState } from 'react'
import * as Location from 'expo-location'
import { supabase } from '@/lib/supabase'
import type { TripStatus } from '@/types/route'

/** Sends the phone's location to bus_locations every 10 seconds while a route is running. */
const GPS_INTERVAL_MS = 10_000

/**
 * The morning run: start (GPS on, bus active), end (GPS off), and the times the end-of-route summary needs.
 * Lives in the driver context so it keeps running whichever tab is open.
 */
export function useTrip(busId: string | null) {
  const [status, setStatus] = useState<TripStatus>('idle')
  const [startedAt, setStartedAt] = useState<Date | null>(null)
  const [endedAt, setEndedAt] = useState<Date | null>(null)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [lastFixAt, setLastFixAt] = useState<Date | null>(null)
  const [busy, setBusy] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const sendLocation = useCallback(async () => {
    if (!busId) return
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
    const { error } = await supabase.from('bus_locations').insert({
      bus_id: busId,
      location: `SRID=4326;POINT(${position.coords.longitude} ${position.coords.latitude})`,
      heading: position.coords.heading ?? null,
      speed: position.coords.speed ?? null,
    })
    if (error) throw error
    setLastFixAt(new Date())
  }, [busId])

  const start = useCallback(async () => {
    if (!busId || busy) return
    setBusy(true)
    setGpsError(null)
    try {
      // Only ask when not granted yet: on some Android versions the request never settles if it was already granted.
      const current = await Location.getForegroundPermissionsAsync()
      const permission = current.granted ? current.status : (await Location.requestForegroundPermissionsAsync()).status
      if (permission !== 'granted') {
        setGpsError('Allow location access so parents can see the bus. You can change this in your phone settings.')
        return
      }
      // Drivers can't update buses directly; this RPC only touches their own bus (0014_fix_rls.sql).
      const { error } = await supabase.rpc('set_bus_active', { p_active: true })
      if (error) {
        setGpsError('Could not start the route. Check your connection and try again.')
        return
      }
      setStartedAt(new Date())
      setEndedAt(null)
      setStatus('active')
      // The first GPS fix can take a while (or wait on a system prompt); don't hold the button on it.
      sendLocation().catch(() => setGpsError('Could not get your location yet. Trying again every 10 seconds.'))
    } finally {
      setBusy(false)
    }
  }, [busId, busy, sendLocation])

  const end = useCallback(async () => {
    if (!busId || busy) return
    setBusy(true)
    try {
      const { error } = await supabase.rpc('set_bus_active', { p_active: false })
      if (error) {
        setGpsError('Could not end the route. Check your connection and try again.')
        return
      }
      setEndedAt(new Date())
      setStatus('done')
      setGpsError(null)
    } finally {
      setBusy(false)
    }
  }, [busId, busy])

  /** Back to the start screen after reading the summary. */
  const reset = useCallback(() => {
    setStatus('idle')
    setStartedAt(null)
    setEndedAt(null)
    setLastFixAt(null)
  }, [])

  useEffect(() => {
    if (status !== 'active' || !busId) return
    timer.current = setInterval(async () => {
      try {
        await sendLocation()
        setGpsError(null)
      } catch {
        setGpsError('GPS update failed. Retrying…')
      }
    }, GPS_INTERVAL_MS)
    return () => {
      if (timer.current) clearInterval(timer.current)
      timer.current = null
    }
  }, [status, busId, sendLocation])

  return { status, startedAt, endedAt, lastFixAt, gpsError, busy, start, end, reset }
}
