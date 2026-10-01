/**
 * RouteyAI's map look: Mapbox Streets data drawn with a Google Maps-like palette (grey land, white or charcoal roads,
 * soft parks and water, coloured place dots, English names with Arabic underneath). The colours match the landing-page
 * maps in scripts/landing-map/build.mjs, so the website and the app look the same. Pass to MapView as `styleJSON`.
 */

export type MapScheme = 'light' | 'dark'

type Palette = {
  land: string
  park: string
  pitch: string
  water: string
  building: string
  buildingOutline: string
  hospital: string
  casing: string
  majorCasing: string
  street: string
  road: string
  major: string
  motorway: string
  service: string
  label: string
  halo: string
  poiLabel: string | null
  grey: string
  place: string
}

const PALETTES: Record<MapScheme, Palette> = {
  light: {
    land: '#F1F3F4',
    park: '#C9E9CF',
    pitch: '#B5DFBD',
    water: '#A0CBF2',
    building: '#E3E6EA',
    buildingOutline: '#D6DADF',
    hospital: '#FCE8E6',
    casing: '#D7DBE0',
    majorCasing: '#C1C7CF',
    street: '#FFFFFF',
    road: '#FFFFFF',
    major: '#FFFFFF',
    motorway: '#FDE7A9',
    service: '#FFFFFF',
    label: '#5F6368',
    halo: '#FFFFFF',
    poiLabel: null,
    grey: '#5F6368',
    place: '#3C4043',
  },
  dark: {
    land: '#26282B',
    park: '#1E3A2B',
    pitch: '#244634',
    water: '#17273A',
    building: '#2E3135',
    buildingOutline: '#35383D',
    hospital: '#33282A',
    casing: '#26282B',
    majorCasing: '#26282B',
    street: '#3A3D42',
    road: '#44484E',
    major: '#4F5359',
    motorway: '#5A5F66',
    service: '#323539',
    label: '#A9AEB5',
    halo: '#26282B',
    poiLabel: '#C4C7CC',
    grey: '#80868B',
    place: '#C4C7CC',
  },
}

const FONT = ['DIN Pro Medium', 'Arial Unicode MS Regular']
const NAME = ['coalesce', ['get', 'name_en'], ['get', 'name']]

/** Line width by zoom, like Mapbox's own styles (thin when zoomed out, wide at street level). */
function width(stops: [number, number][]) {
  return ['interpolate', ['exponential', 1.5], ['zoom'], ...stops.flat()]
}

const ROADS = [
  { id: 'service', classes: ['service', 'track'], fill: 'service', casing: 'casing', width: [[14, 0.5], [18, 8]] as [number, number][] },
  { id: 'street', classes: ['street', 'street_limited', 'pedestrian'], fill: 'street', casing: 'casing', width: [[12, 0.5], [14, 2.5], [18, 18]] as [number, number][] },
  { id: 'secondary', classes: ['secondary', 'tertiary', 'secondary_link', 'tertiary_link'], fill: 'road', casing: 'casing', width: [[10, 0.6], [14, 4], [18, 24]] as [number, number][] },
  { id: 'primary', classes: ['primary', 'primary_link'], fill: 'major', casing: 'majorCasing', width: [[9, 0.8], [14, 5], [18, 28]] as [number, number][] },
  { id: 'motorway', classes: ['motorway', 'trunk', 'motorway_link', 'trunk_link'], fill: 'motorway', casing: 'majorCasing', width: [[8, 1], [14, 6], [18, 32]] as [number, number][] },
] as const

/** Category colours for place dots, as on Google Maps. */
function poiColor(p: Palette) {
  return [
    'match',
    ['get', 'class'],
    ['food_and_drink', 'food_and_drink_stores'],
    '#E8710A',
    ['store_like', 'commercial_services', 'motorist'],
    '#1A73E8',
    ['medical'],
    '#D93025',
    ['park_like', 'sport_and_leisure'],
    '#188038',
    ['lodging'],
    '#D01884',
    ['arts_and_entertainment', 'landmark', 'historic'],
    '#129EAF',
    p.grey,
  ]
}

export function mapStyle(scheme: MapScheme): Record<string, unknown> {
  const p = PALETTES[scheme]
  const roadFilter = (classes: readonly string[]) => ['match', ['get', 'class'], [...classes], true, false]

  return {
    version: 8,
    name: `RouteyAI ${scheme}`,
    glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
    sources: { composite: { type: 'vector', url: 'mapbox://mapbox.mapbox-streets-v8' } },
    layers: [
      { id: 'land', type: 'background', paint: { 'background-color': p.land } },
      {
        id: 'landuse-park',
        type: 'fill',
        source: 'composite',
        'source-layer': 'landuse',
        filter: ['match', ['get', 'class'], ['park', 'grass', 'cemetery', 'wood', 'scrub', 'agriculture'], true, false],
        paint: { 'fill-color': p.park },
      },
      { id: 'landuse-pitch', type: 'fill', source: 'composite', 'source-layer': 'landuse', filter: ['==', ['get', 'class'], 'pitch'], paint: { 'fill-color': p.pitch } },
      { id: 'landuse-hospital', type: 'fill', source: 'composite', 'source-layer': 'landuse', filter: ['==', ['get', 'class'], 'hospital'], paint: { 'fill-color': p.hospital } },
      { id: 'national-park', type: 'fill', source: 'composite', 'source-layer': 'landuse_overlay', paint: { 'fill-color': p.park } },
      { id: 'water', type: 'fill', source: 'composite', 'source-layer': 'water', paint: { 'fill-color': p.water } },
      { id: 'waterway', type: 'line', source: 'composite', 'source-layer': 'waterway', paint: { 'line-color': p.water, 'line-width': width([[10, 0.5], [18, 6]]) } },
      {
        id: 'building',
        type: 'fill',
        source: 'composite',
        'source-layer': 'building',
        minzoom: 15,
        paint: { 'fill-color': p.building, 'fill-outline-color': p.buildingOutline },
      },
      ...ROADS.map(r => ({
        id: `road-${r.id}-case`,
        type: 'line',
        source: 'composite',
        'source-layer': 'road',
        filter: roadFilter(r.classes),
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': p[r.casing], 'line-width': width(r.width.map(([z, w]) => [z, w + (z >= 14 ? 2 : 1)] as [number, number])) },
      })),
      ...ROADS.map(r => ({
        id: `road-${r.id}`,
        type: 'line',
        source: 'composite',
        'source-layer': 'road',
        filter: roadFilter(r.classes),
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': p[r.fill], 'line-width': width(r.width) },
      })),
      {
        id: 'road-label',
        type: 'symbol',
        source: 'composite',
        'source-layer': 'road',
        minzoom: 13,
        filter: roadFilter(['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'street', 'street_limited']),
        layout: {
          'symbol-placement': 'line',
          'text-field': NAME,
          'text-font': FONT,
          'text-size': ['interpolate', ['linear'], ['zoom'], 13, 10, 18, 14],
          'text-max-angle': 30,
        },
        paint: { 'text-color': p.label, 'text-halo-color': p.halo, 'text-halo-width': 1.5 },
      },
      {
        id: 'neighbourhood-label',
        type: 'symbol',
        source: 'composite',
        'source-layer': 'place_label',
        filter: ['==', ['get', 'class'], 'settlement_subdivision'],
        layout: {
          'text-field': NAME,
          'text-font': FONT,
          'text-size': 11,
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.12,
          'text-max-width': 8,
        },
        paint: { 'text-color': p.label, 'text-halo-color': p.halo, 'text-halo-width': 1.2 },
      },
      {
        id: 'place-dot',
        type: 'circle',
        source: 'composite',
        'source-layer': 'poi_label',
        minzoom: 14,
        filter: ['<=', ['get', 'filterrank'], 3],
        paint: {
          'circle-color': poiColor(p),
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 14, 3.5, 17, 6],
          'circle-stroke-color': p.halo,
          'circle-stroke-width': 1.5,
        },
      },
      {
        id: 'place-label',
        type: 'symbol',
        source: 'composite',
        'source-layer': 'poi_label',
        minzoom: 14,
        filter: ['<=', ['get', 'filterrank'], 3],
        layout: {
          // English name, with the Arabic name underneath when it differs.
          'text-field': [
            'case',
            ['all', ['has', 'name_ar'], ['!=', ['get', 'name_ar'], NAME]],
            ['format', NAME, {}, '\n', {}, ['get', 'name_ar'], { 'font-scale': 0.85 }],
            NAME,
          ],
          'text-font': FONT,
          'text-size': ['interpolate', ['linear'], ['zoom'], 14, 11, 18, 13],
          'text-anchor': 'left',
          'text-justify': 'left',
          'text-offset': [0.9, 0],
          'text-max-width': 10,
        },
        paint: { 'text-color': p.poiLabel ?? poiColor(p), 'text-halo-color': p.halo, 'text-halo-width': 1.5 },
      },
    ],
  }
}

const cache: Partial<Record<MapScheme, string>> = {}

/** The style as the JSON string MapView's `styleJSON` expects (built once per scheme). */
export function mapStyleJSON(scheme: MapScheme): string {
  return (cache[scheme] ??= JSON.stringify(mapStyle(scheme)))
}

/** Route lines: the brand navy disappears on the charcoal map, so dark mode uses Google's dark-map blue. */
export const ROUTE_LINE = {
  light: { line: '#1E3A8A', casing: '#FFFFFF' },
  dark: { line: '#8AB4F8', casing: '#26282B' },
} as const
