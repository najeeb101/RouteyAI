import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import { supabase } from '@/lib/supabase'
import { storage } from '@/lib/storage'
import { colors } from '@/lib/colors'

/**
 * Driver GPS that keeps running with the screen locked or another app open.
 * Android runs it as a foreground service (a "Route in progress" notification), iOS as a background
 * location session. Both only need "while using the app" permission because the route is started
 * from the app. Imported for its side effect in app/_layout.tsx: the task must be defined at startup.
 */
export const GPS_TASK = 'routeyai-driver-gps'
export const GPS_INTERVAL_MS = 10_000

/** The running trip, so the task knows which bus to report and a reopened app can pick the trip back up. */
const TRIP_KEY = 'routeyai.trip'

export type RunningTrip = { busId: string; startedAt: string }

type GpsListener = { onFix: (at: Date) => void; onError: () => void }
const listeners = new Set<GpsListener>()

let lastSentAt = 0

/** Lets the open app show "last update …" and errors for fixes sent by the task. */
export function subscribeGps(listener: GpsListener) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export async function sendLocation(busId: string, coords: Location.LocationObjectCoords) {
  const { error } = await supabase.from('bus_locations').insert({
    bus_id: busId,
    location: `SRID=4326;POINT(${coords.longitude} ${coords.latitude})`,
    heading: coords.heading ?? null,
    speed: coords.speed ?? null,
  })
  if (error) throw error
  lastSentAt = Date.now()
  listeners.forEach(l => l.onFix(new Date()))
}

TaskManager.defineTask<{ locations: Location.LocationObject[] }>(GPS_TASK, async ({ data, error }) => {
  const latest = data?.locations[data.locations.length - 1]
  if (error || !latest) {
    listeners.forEach(l => l.onError())
    return
  }
  // iOS ignores timeInterval and may report every second, and Android can hand over a backlog at once;
  // keep to one row every 10 seconds. The slot is taken before any await so overlapping calls skip.
  if (Date.now() - lastSentAt < GPS_INTERVAL_MS - 1_000) return
  lastSentAt = Date.now()
  const trip = await getRunningTrip()
  if (!trip) return
  try {
    await sendLocation(trip.busId, latest.coords)
  } catch {
    listeners.forEach(l => l.onError())
  }
})

export async function getRunningTrip(): Promise<RunningTrip | null> {
  const raw = await storage.getItem(TRIP_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as RunningTrip
  } catch {
    return null
  }
}

export function saveRunningTrip(trip: RunningTrip) {
  return storage.setItem(TRIP_KEY, JSON.stringify(trip))
}

/** Must be called while the app is on screen: Android won't start a foreground service from the background. */
export async function startBackgroundGps() {
  await Location.startLocationUpdatesAsync(GPS_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: GPS_INTERVAL_MS,
    distanceInterval: 0,
    pausesUpdatesAutomatically: false,
    activityType: Location.ActivityType.AutomotiveNavigation,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Route in progress',
      notificationBody: 'Sharing the bus location with parents until you end the route.',
      notificationColor: colors.primary,
    },
  })
}

export async function isBackgroundGpsRunning() {
  return Location.hasStartedLocationUpdatesAsync(GPS_TASK).catch(() => false)
}

/** Stops the GPS and forgets the trip. Safe to call when nothing is running. */
export async function stopBackgroundGps() {
  await storage.removeItem(TRIP_KEY)
  if (await isBackgroundGpsRunning()) await Location.stopLocationUpdatesAsync(GPS_TASK)
}
