'use client'

import { useEffect } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { Bus, Home } from 'lucide-react'
import type { PhoneMap } from '@/components/landing/appMapData'

/** CSS width of the map inside the phone mockups; sizes below are in CSS pixels and converted to map units. */
const MAP_CSS_WIDTH = 252

/** The point `d` map units along a polyline. */
function pointAlong(points: [number, number][], d: number): { x: number; y: number } {
  let walked = 0
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1] as [number, number]
    const [bx, by] = points[i] as [number, number]
    const seg = Math.hypot(bx - ax, by - ay)
    if (walked + seg >= d && seg > 0) {
      const t = (d - walked) / seg
      return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t }
    }
    walked += seg
  }
  const [lx, ly] = points[points.length - 1] ?? [0, 0]
  return { x: lx, y: ly }
}

/**
 * Street map inside the phone mockups: a real OpenStreetMap crop (see scripts/landing-map/build.mjs), the route
 * along the roads, stops, and a bus that drives along the route line to `busAt` (map units from the first stop).
 */
export function AppMapSnippet({
  map,
  busAt,
  instant = false,
  showStops = true,
  home,
  homeLabel,
  duration = 1.4,
  loadMap = true,
}: {
  map: PhoneMap
  busAt: number
  /** Jump instead of driving (used when a loop restarts). */
  instant?: boolean
  /** Driver app shows every stop; the parent app only shows the child's own stop. */
  showStops?: boolean
  /** Index of the child's stop, drawn as a home pin. */
  home?: number
  homeLabel?: string
  duration?: number
  /** The base map image is only fetched once this is true (the phones sit far down the page). */
  loadMap?: boolean
}) {
  const { box, route } = map
  const u = box.w / MAP_CSS_WIDTH
  const distance = useMotionValue(busAt)
  const x = useTransform(distance, d => pointAlong(route.points, d).x)
  const y = useTransform(distance, d => pointAlong(route.points, d).y)

  useEffect(() => {
    if (instant) {
      distance.set(busAt)
      return
    }
    const controls = animate(distance, busAt, { duration, ease: 'easeInOut' })
    return () => controls.stop()
  }, [busAt, instant, duration, distance])

  const line = route.points.map(([px, py], i) => `${i ? 'L' : 'M'}${px} ${py}`).join(' ')
  const homeStop = home === undefined ? undefined : route.stops[home]

  return (
    <svg viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`} className="block h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {loadMap && (
        <>
          <image href={map.src} x={box.x} y={box.y} width={box.w} height={box.h} preserveAspectRatio="none" className="dark:hidden" />
          <image href={map.srcDark} x={box.x} y={box.y} width={box.w} height={box.h} preserveAspectRatio="none" className="hidden dark:inline" />
        </>
      )}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={line} className="stroke-white dark:stroke-[#26282B]" strokeWidth={7 * u} />
        <path d={line} className="stroke-primary dark:stroke-[#8AB4F8]" strokeWidth={4 * u} />
      </g>
      {showStops &&
        route.stops.map(s => (
          <circle key={`${s.x}-${s.y}`} cx={s.x} cy={s.y} r={4.5 * u} className="fill-secondary stroke-white" strokeWidth={2 * u} />
        ))}
      {homeStop && (
        <g transform={`translate(${homeStop.x} ${homeStop.y})`}>
          {homeLabel && (
            <g transform={`translate(0 ${-24 * u})`}>
              <rect x={-34 * u} y={-9 * u} width={68 * u} height={16 * u} rx={5 * u} className="fill-slate-900" />
              <text y={2.8 * u} textAnchor="middle" fill="#FFFFFF" style={{ fontSize: 8.5 * u, fontWeight: 700 }}>
                {homeLabel}
              </text>
            </g>
          )}
          <circle r={11 * u} className="fill-warning" stroke="#FFFFFF" strokeWidth={2.5 * u} />
          <Home x={-5.5 * u} y={-5.5 * u} width={11 * u} height={11 * u} color="#FFFFFF" strokeWidth={2.6} />
        </g>
      )}
      <motion.g style={{ x, y }}>
        <circle r={17 * u} className="fill-primary/20" />
        <circle r={11 * u} className="fill-primary" stroke="#FFFFFF" strokeWidth={2.5 * u} />
        <Bus x={-6 * u} y={-6 * u} width={12 * u} height={12 * u} color="#FFFFFF" strokeWidth={2.4} />
      </motion.g>
    </svg>
  )
}
