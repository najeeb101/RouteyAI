import type MapboxModule from '@rnmapbox/maps'

/** Web preview (screenshots only): no Mapbox, so the map screens show MapPlaceholder. See mapbox.ts. */
export const IN_EXPO_GO = false

export const Mapbox: typeof MapboxModule | null = null
