import { useCallback, useEffect, useRef, useState } from 'react'
import * as Location from 'expo-location'
import { supabase } from '@/lib/supabase'
import {
  GPS_INTERVAL_MS,
  getRunningTrip,
  saveRunningTrip,
  sendLocation,
  startBackgroundGps,
  stopBackgroundGps,
  subscribeGps,
} from '@/features/driver/gpsTask'
import type { TripStatus } from '@/types/route'

const FOREGROUND_ONLY_NOTICE = 'Keep RouteyAI open: on this phone the location stops when the screen locks.'

/**
 * The morning run: start (GPS on, bus active), end (GPS off), and the times the end-of-route summary needs.
 * Lives in the driver context so it keeps running whichever tab is open. GPS comes from the background
 * task in gpsTask.ts, which keeps going with the screen locked; if the phone won't start it, an in-app
 * timer sends the location instead while the app is open.
 */
export function useTrip(busId: string | null) {
  const [status, setStatus] = useState<TripStatus>('idle')
  const [startedAt, setStartedAt] = useState<Date | null>(null)
  const [endedAt, setEndedAt] = useState<Date | null>(null)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [lastFixAt, setLastFixAt] = useState<Date | null>(null)
  const [inAppGps, setInAppGps] = useState(false)
  const [busy, setBusy] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const sendCurrentLocation = useCallback(async () => {
    if (!busId) return
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
    await sendLocation(busId, position.coords)
  }, [busId])

  const startGps = useCallback(async () => {
    try {
      await startBackgroundGps()
      setInAppGps(false)
    } catch (e) {
      console.warn('Background GPS could not start; sending from the app instead', e)
      setInAppGps(true)
    }
  }, [])

  // Fixes sent by the background task, which runs outside React.
  useEffect(() => subscribeGps({
    onFix: (at) => {
      setLastFixAt(at)
      setGpsError(null)
    },
    onError: () => setGpsError('GPS update failed. Retrying…'),
  }), [])

  // A route still running from before the app was closed: show it as running so the driver can end it.
  useEffect(() => {
    if (!busId) return
    let cancelled = false
    getRunningTrip().then(async (trip) => {
      if (cancelled || !trip) return
      if (trip.busId !== busId) {
        await stopBackgroundGps()
        return
      }
      setStartedAt(new Date(trip.startedAt))
      setEndedAt(null)
      setStatus('active')
      await startGps()
    })
    return () => { cancelled = true }
  }, [busId, startGps])

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
      const now = new Date()
      // Saved before the GPS starts so the background task knows which bus to report.
      await saveRunningTrip({ busId, startedAt: now.toISOString() })
      setStartedAt(now)
      setEndedAt(null)
      setStatus('active')
      await startGps()
      // The first GPS fix can take a while (or wait on a system prompt); don't hold the button on it.
      sendCurrentLocation().catch(() => setGpsError('Could not get your location yet. Trying again every 10 seconds.'))
    } finally {
      setBusy(false)
    }
  }, [busId, busy, sendCurrentLocation, startGps])

  const end = useCallback(async () => {
    if (!busId || busy) return
    setBusy(true)
    try {
      const { error } = await supabase.rpc('set_bus_active', { p_active: false })
      if (error) {
        setGpsError('Could not end the route. Check your connection and try again.')
        return
      }
      await stopBackgroundGps().catch(() => {})
      setInAppGps(false)
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

  // Fallback when the background task couldn't start: send from the app while it is open.
  useEffect(() => {
    if (status !== 'active' || !busId || !inAppGps) return
    timer.current = setInterval(async () => {
      try {
        await sendCurrentLocation()
        setGpsError(null)
      } catch {
        setGpsError('GPS update failed. Retrying…')
      }
    }, GPS_INTERVAL_MS)
    return () => {
      if (timer.current) clearInterval(timer.current)
      timer.current = null
    }
  }, [status, busId, inAppGps, sendCurrentLocation])

  return {
    status,
    startedAt,
    endedAt,
    lastFixAt,
    gpsError: gpsError ?? (status === 'active' && inAppGps ? FOREGROUND_ONLY_NOTICE : null),
    busy,
    start,
    end,
    reset,
  }
}
