import Constants, { ExecutionEnvironment } from 'expo-constants'
import type MapboxModule from '@rnmapbox/maps'

/** True inside the Expo Go app, used to try the app on a phone without an EAS build. */
export const IN_EXPO_GO = Constants.executionEnvironment === ExecutionEnvironment.StoreClient

/**
 * Mapbox, or null in Expo Go. Expo Go has no Mapbox native code, so the library is only loaded in real builds and the
 * map screens show MapPlaceholder instead. Background GPS isn't in Expo Go either; useTrip already falls back to sending
 * the location from the open app. The web preview uses mapbox.web.ts.
 */
export const Mapbox: typeof MapboxModule | null = IN_EXPO_GO
  ? null
  : (require('@rnmapbox/maps') as { default: typeof MapboxModule }).default

Mapbox?.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '')
