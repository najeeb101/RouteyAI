'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPinOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DOHA_CENTER, MAPBOX_TOKEN } from '@/lib/mapbox/config'
import { mapStyle } from '@/lib/mapStyle'
import type { LatLng } from '@/lib/geo'

/** A route line in a bus's colour, as [lng, lat] pairs. */
export type MapRoute = { id: string; color: string; coords: Array<[number, number]> }
/** A numbered stop on the selected route. */
export type MapStop = { id: string; lat: number; lng: number; label: string; color: string; title?: string }
/** A bus's last GPS point; `live` while it is on a run. */
export type MapBus = { id: string; name: string; lat: number; lng: number; live: boolean }

type FleetMapProps = {
  school: LatLng | null
  routes: MapRoute[]
  stops?: MapStop[]
  buses?: MapBus[]
  /** Highlights one route and fades the others. */
  selectedId?: string | null
  className?: string
}

const DRAW_MS = 1100
const GLIDE_MS = 1000
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function schoolElement(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-night text-white shadow-[0_4px_12px_rgba(15,23,42,0.3)]'
  el.title = 'School'
  el.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 22v-4a2 2 0 1 0-4 0v4"/><path d="m18 10 3.447 1.724a1 1 0 0 1 .553.894V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7.382a1 1 0 0 1 .553-.894L6 10"/><path d="M18 5v17"/><path d="m4 6 7.106-3.553a2 2 0 0 1 1.788 0L20 6"/><path d="M6 5v17"/><circle cx="12" cy="9" r="2"/></svg>'
  return el
}

function stopElement(stop: MapStop): HTMLElement {
  const el = document.createElement('div')
  el.className = 'flex h-6 min-w-6 items-center justify-center rounded-full border-[2.5px] bg-white px-1 text-[11px] font-semibold text-ink shadow-[0_1px_3px_rgba(15,23,42,0.25)] animate-in fade-in-0 zoom-in-50 duration-500'
  el.style.borderColor = stop.color
  el.textContent = stop.label
  if (stop.title) el.title = stop.title
  return el
}

function busElement(bus: MapBus): HTMLElement {
  const el = document.createElement('div')
  el.className = 'flex h-8 items-center gap-2 rounded-full bg-night pl-2.5 pr-3 text-[13px] font-medium text-white shadow-[0_4px_12px_rgba(15,23,42,0.3)]'
  const dot = bus.live
    ? '<span class="relative inline-flex h-2 w-2"><span class="absolute inset-0 rounded-full bg-live animate-pulse-ring motion-reduce:hidden"></span><span class="relative h-2 w-2 rounded-full bg-live"></span></span>'
    : '<span class="h-2 w-2 rounded-full bg-white/40"></span>'
  el.innerHTML = `${dot}<span></span>`
  el.lastElementChild!.textContent = bus.name
  return el
}

/**
 * The school's buses on a real map, in the apps' map style (lib/mapStyle): each route as a line in its bus's colour that
 * draws itself in, the school, numbered stops for a selected route, and buses as navy tags that glide to each new GPS
 * point. Mapbox GL directly, client-only (load it through DynamicFleetMap).
 */
export function FleetMap({ school, routes, stops = [], buses = [], selectedId = null, className }: FleetMapProps) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [ready, setReady] = useState(false)
  const drawn = useRef<string[]>([])
  const fittedFor = useRef<string | null>(null)
  const staticMarkers = useRef<mapboxgl.Marker[]>([])
  const busMarkers = useRef(new Map<string, { marker: mapboxgl.Marker; at: [number, number]; live: boolean; frame: number }>())

  useEffect(() => {
    if (!MAPBOX_TOKEN || !container.current) return
    mapboxgl.accessToken = MAPBOX_TOKEN
    const map = new mapboxgl.Map({
      container: container.current,
      style: mapStyle('light') as unknown as mapboxgl.StyleSpecification,
      center: DOHA_CENTER,
      zoom: 11,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    })
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    map.scrollZoom.setWheelZoomRate(1 / 300)
    map.on('load', () => setReady(true))
    mapRef.current = map
    const markers = busMarkers.current
    return () => {
      markers.forEach((m) => cancelAnimationFrame(m.frame))
      markers.clear()
      map.remove()
      mapRef.current = null
      drawn.current = []
      fittedFor.current = null
    }
  }, [])

  // Route lines: added again only when the routes themselves change, then drawn in from the start of each line.
  const routeKey = routes.map((r) => `${r.id}:${r.color}:${r.coords.length}:${r.coords[0]?.join(',')}`).join('|')
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    for (const id of drawn.current) {
      if (map.getLayer(`${id}-line`)) map.removeLayer(`${id}-line`)
      if (map.getLayer(`${id}-casing`)) map.removeLayer(`${id}-casing`)
      if (map.getSource(id)) map.removeSource(id)
    }
    drawn.current = []
    // Lines start hidden and draw themselves in; with reduced motion they are simply there.
    const hidden: [number, number] = reducedMotion() ? [1, 1] : [0, 1]
    for (const route of routes) {
      if (route.coords.length < 2) continue
      const id = `route-${route.id}`
      map.addSource(id, {
        type: 'geojson',
        lineMetrics: true,
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: route.coords } },
      })
      map.addLayer({ id: `${id}-casing`, type: 'line', source: id, layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#FFFFFF', 'line-width': 8, 'line-trim-offset': hidden } })
      map.addLayer({ id: `${id}-line`, type: 'line', source: id, layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': route.color, 'line-width': 4.5, 'line-trim-offset': hidden } })
      drawn.current.push(id)
    }
    if (reducedMotion() || drawn.current.length === 0) return

    const ids = [...drawn.current]
    const start = performance.now()
    let frame = 0
    const step = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - start) / DRAW_MS))
      const shown = 1 - Math.pow(1 - t, 3)
      for (const id of ids) {
        for (const layer of [`${id}-line`, `${id}-casing`]) {
          if (map.getLayer(layer)) map.setPaintProperty(layer, 'line-trim-offset', [shown, 1])
        }
      }
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- routeKey stands for routes
  }, [ready, routeKey])

  // The selected route stands out; the others step back.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    for (const route of routes) {
      const id = `route-${route.id}`
      if (!map.getLayer(`${id}-line`)) continue
      const faded = selectedId !== null && route.id !== selectedId
      map.setPaintProperty(`${id}-line`, 'line-opacity', faded ? 0.25 : 1)
      map.setPaintProperty(`${id}-casing`, 'line-opacity', faded ? 0.25 : 1)
      map.setPaintProperty(`${id}-line`, 'line-width', route.id === selectedId ? 6 : 4.5)
      if (route.id === selectedId) {
        map.moveLayer(`${id}-casing`)
        map.moveLayer(`${id}-line`)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- routeKey stands for routes
  }, [ready, routeKey, selectedId])

  // The school and the stops, then the camera: fitted again when what it frames changes.
  const stopKey = stops.map((s) => `${s.id}:${s.label}:${s.lat}:${s.lng}`).join('|')
  const schoolKey = school ? `${school.lat},${school.lng}` : ''
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    staticMarkers.current.forEach((m) => m.remove())
    staticMarkers.current = []
    if (school) staticMarkers.current.push(new mapboxgl.Marker({ element: schoolElement() }).setLngLat([school.lng, school.lat]).addTo(map))
    for (const stop of stops) {
      staticMarkers.current.push(new mapboxgl.Marker({ element: stopElement(stop) }).setLngLat([stop.lng, stop.lat]).addTo(map))
    }

    const focus = selectedId ? routes.filter((r) => r.id === selectedId) : routes
    const points: Array<[number, number]> = [
      ...focus.flatMap((r) => r.coords),
      ...stops.map((s): [number, number] => [s.lng, s.lat]),
      ...(school ? [[school.lng, school.lat] as [number, number]] : []),
    ]
    const key = `${selectedId}|${routeKey}|${stopKey}|${schoolKey}`
    if (points.length === 0 || fittedFor.current === key) return
    fittedFor.current = key
    const bounds = points.reduce((b, p) => b.extend(p), new mapboxgl.LngLatBounds(points[0], points[0]))
    map.fitBounds(bounds, { padding: 56, maxZoom: 15, duration: reducedMotion() ? 0 : 900 })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the keys stand for school, stops and routes
  }, [ready, stopKey, schoolKey, routeKey, selectedId])

  // Buses glide from their last point to the new one instead of jumping.
  const busKey = buses.map((b) => `${b.id}:${b.lat}:${b.lng}:${b.live}:${b.name}`).join('|')
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    const current = busMarkers.current
    const seen = new Set<string>()
    for (const bus of buses) {
      seen.add(bus.id)
      const target: [number, number] = [bus.lng, bus.lat]
      const existing = current.get(bus.id)
      if (!existing || existing.live !== bus.live) {
        existing?.marker.remove()
        if (existing) cancelAnimationFrame(existing.frame)
        const marker = new mapboxgl.Marker({ element: busElement(bus), anchor: 'bottom', offset: [0, -6] }).setLngLat(target).addTo(map)
        current.set(bus.id, { marker, at: target, live: bus.live, frame: 0 })
        continue
      }
      const from = existing.at
      if (from[0] === target[0] && from[1] === target[1]) continue
      cancelAnimationFrame(existing.frame)
      existing.at = target
      if (reducedMotion()) {
        existing.marker.setLngLat(target)
        continue
      }
      const start = performance.now()
      const glide = (now: number) => {
        const t = Math.max(0, Math.min(1, (now - start) / GLIDE_MS))
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
        existing.marker.setLngLat([from[0] + (target[0] - from[0]) * e, from[1] + (target[1] - from[1]) * e])
        if (t < 1) existing.frame = requestAnimationFrame(glide)
      }
      existing.frame = requestAnimationFrame(glide)
    }
    for (const [id, entry] of current) {
      if (seen.has(id)) continue
      cancelAnimationFrame(entry.frame)
      entry.marker.remove()
      current.delete(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- busKey stands for buses
  }, [ready, busKey])

  if (!MAPBOX_TOKEN) {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-2 rounded-xl bg-canvas text-center', className)}>
        <MapPinOff size={24} className="text-ink-3" aria-hidden="true" />
        <p className="text-sm font-medium text-ink">Map unavailable</p>
        <p className="max-w-xs text-xs text-ink-2">Set NEXT_PUBLIC_MAPBOX_TOKEN to show routes on the map.</p>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden rounded-xl bg-[#ECEEF1]', className)}>
      {/* h-full, not absolute: mapbox-gl.css sets .mapboxgl-map to position: relative. */}
      <div ref={container} className="h-full w-full" />
      {!ready && <div className="absolute inset-0 animate-pulse bg-[#ECEEF1]" aria-hidden="true" />}
    </div>
  )
}
