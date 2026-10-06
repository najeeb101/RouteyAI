import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as Location from 'expo-location'
import { supabase } from '@/lib/supabase'
import {
  GPS_INTERVAL_MS,
  getRunningTrip,
  isBackgroundGpsRunning,
  saveRunningTrip,
  sendLocation,
  startBackgroundGps,
  stopBackgroundGps,
  subscribeGps,
} from '@/features/driver/gpsTask'
import type { RunCounts } from '@/features/driver/hooks/useDriverData'
import type { Run, RunTimes } from '@/lib/runs'
import type { TripStatus } from '@/types/route'

const FOREGROUND_ONLY_NOTICE = 'Keep RouteyAI open: on this phone the location stops when the screen locks.'

/** What the end-of-run summary shows, frozen when the driver ends the run. */
export type RunSummary = { run: Run; startedAt: Date | null; endedAt: Date; counts: RunCounts }

/**
 * Starting and ending a run (start_run / end_run in the database), the GPS while it runs, and the summary after it.
 * The database says which run is going (`running`, from bus_runs), so a reopened app picks it back up. Lives in the
 * driver context so it keeps running whichever tab is open. GPS comes from the background task in gpsTask.ts, which
 * keeps going with the screen locked; if the phone won't start it, an in-app timer sends the location instead.
 */
export function useTrip({ busId, run, running, runsLoaded, onRunsChanged }: {
  busId: string | null
  run: Run
  running: RunTimes | null
  runsLoaded: boolean
  onRunsChanged: () => Promise<void>
}) {
  /** Set between start_run returning and bus_runs being reloaded, so the screen doesn't flash back to "Start". */
  const [starting, setStarting] = useState<{ run: Run; startedAt: string } | null>(null)
  const [summary, setSummary] = useState<RunSummary | null>(null)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [lastFixAt, setLastFixAt] = useState<Date | null>(null)
  const [inAppGps, setInAppGps] = useState(false)
  const [busy, setBusy] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const active = useMemo(
    () => running ?? (starting && starting.run === run ? { startedAt: starting.startedAt, endedAt: null } : null),
    [running, starting, run],
  )
  const status: TripStatus = summary ? 'done' : active ? 'active' : 'idle'

  useEffect(() => {
    if (running) setStarting(null)
  }, [running])

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

  // Keep the GPS in step with the database: a run still going after the app was closed starts sending again; a trip
  // the phone remembers but the database has ended (or another bus's) stops.
  useEffect(() => {
    if (!busId || !runsLoaded || starting) return
    let cancelled = false
    ;(async () => {
      const trip = await getRunningTrip()
      if (cancelled) return
      if (running) {
        if (trip?.busId === busId && (await isBackgroundGpsRunning())) return
        const permission = await Location.getForegroundPermissionsAsync()
        if (!permission.granted || cancelled) return
        await saveRunningTrip({ busId, startedAt: running.startedAt, run })
        await startGps()
      } else if (trip) {
        await stopBackgroundGps()
        setInAppGps(false)
      }
    })()
    return () => { cancelled = true }
  }, [busId, runsLoaded, running, run, starting, startGps])

  const start = useCallback(async () => {
    if (!busId || busy) return
    setBusy(true)
    setGpsError(null)
    setSummary(null)
    try {
      // Only ask when not granted yet: on some Android versions the request never settles if it was already granted.
      const current = await Location.getForegroundPermissionsAsync()
      const permission = current.granted ? current.status : (await Location.requestForegroundPermissionsAsync()).status
      if (permission !== 'granted') {
        setGpsError('Allow location access so parents can see the bus. You can change this in your phone settings.')
        return
      }
      const { data, error } = await supabase.rpc('start_run', { p_run: run })
      if (error) {
        setGpsError('Could not start the run. Check your connection and try again.')
        return
      }
      const startedAt = (data as { started_at?: string } | null)?.started_at ?? new Date().toISOString()
      // Saved before the GPS starts so the background task knows which bus to report.
      await saveRunningTrip({ busId, startedAt, run })
      setStarting({ run, startedAt })
      await startGps()
      // The first GPS fix can take a while (or wait on a system prompt); don't hold the button on it.
      sendCurrentLocation().catch(() => setGpsError('Could not get your location yet. Trying again every 10 seconds.'))
      await onRunsChanged()
    } finally {
      setBusy(false)
    }
  }, [busId, busy, run, sendCurrentLocation, startGps, onRunsChanged])

  /** Ends the running run. `counts` is what the summary shows, taken as the run ends. */
  const end = useCallback(async (counts: RunCounts) => {
    if (!busId || busy) return
    setBusy(true)
    try {
      const { error } = await supabase.rpc('end_run')
      if (error) {
        setGpsError('Could not end the run. Check your connection and try again.')
        return
      }
      await stopBackgroundGps().catch(() => {})
      setInAppGps(false)
      setGpsError(null)
      setSummary({ run, startedAt: active ? new Date(active.startedAt) : null, endedAt: new Date(), counts })
      setStarting(null)
      await onRunsChanged()
    } finally {
      setBusy(false)
    }
  }, [busId, busy, run, active, onRunsChanged])

  /** Back to the start screen after reading the summary. */
  const reset = useCallback(() => {
    setSummary(null)
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
    startedAt: active ? new Date(active.startedAt) : null,
    summary,
    lastFixAt,
    gpsError: gpsError ?? (status === 'active' && inAppGps ? FOREGROUND_ONLY_NOTICE : null),
    busy,
    start,
    end,
    reset,
  }
}
