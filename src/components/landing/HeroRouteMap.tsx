'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimationFrame, useInView, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import { routeColor } from '@/components/landing/routeColors'

/** Schematic (45°/90°) routes into one school at (300, 250). Illustrative only — not real geography. */
const ROUTES = [
  { bus: 'Bus 1', area: 'West Bay', d: 'M 420 60 V 110 L 366 164 H 336 L 306 194 V 250', stops: [0, 0.28, 0.52, 0.76], duration: 14, offset: 0.1, label: { x: 420, y: 44, anchor: 'middle' } },
  { bus: 'Bus 2', area: 'Al Waab', d: 'M 56 330 H 140 L 190 280 H 250 L 270 260 H 300', stops: [0, 0.3, 0.58, 0.8], duration: 12, offset: 0.55, label: { x: 48, y: 354, anchor: 'start' } },
  { bus: 'Bus 3', area: 'Al Sadd', d: 'M 90 84 L 150 144 H 234 L 294 204 V 250', stops: [0, 0.34, 0.62, 0.84], duration: 13, offset: 0.3, label: { x: 90, y: 68, anchor: 'middle' } },
  { bus: 'Bus 4', area: 'Al Thumama', d: 'M 410 420 L 376 386 V 318 L 330 272 H 300', stops: [0, 0.36, 0.66], duration: 11, offset: 0.8, label: { x: 410, y: 444, anchor: 'middle' } },
] as const

const TOASTS = [
  { text: 'Aisha boarded', bus: 'Bus 1', time: '6:58' },
  { text: 'Omar boarded', bus: 'Bus 2', time: '7:02' },
  { text: 'Maryam boarded', bus: 'Bus 3', time: '7:05' },
  { text: 'Yusuf boarded', bus: 'Bus 4', time: '7:09' },
] as const

const DRAW_SECONDS = 1.6
const TRIP_MINUTES = 14

/** 0→1 fade near the ends of a loop so buses never visibly jump back to the start. */
function edgeFade(p: number) {
  if (p < 0.05) return p / 0.05
  if (p > 0.93) return Math.max(0, (1 - p) / 0.07)
  return 1
}

export function HeroRouteMap() {
  const reduceMotion = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement>(null)
  const inView = useInView(wrapRef, { margin: '-10% 0px' })
  const pathRefs = useRef<(SVGPathElement | null)[]>([])
  const busRefs = useRef<(SVGGElement | null)[]>([])
  const stopRefs = useRef<(SVGCircleElement | null)[][]>(ROUTES.map(() => []))
  const lengths = useRef<number[]>([])
  const progress = useRef<number[]>(ROUTES.map(r => r.offset))
  const clock = useRef(0)
  const [stopPoints, setStopPoints] = useState<{ x: number; y: number }[][]>([])
  const [eta, setEta] = useState(TRIP_MINUTES)
  const [toast, setToast] = useState(0)

  // Measure the paths once so stops sit exactly on the lines.
  useLayoutEffect(() => {
    lengths.current = pathRefs.current.map(p => p?.getTotalLength() ?? 0)
    setStopPoints(
      ROUTES.map((route, i) => {
        const path = pathRefs.current[i]
        const len = lengths.current[i] ?? 0
        return route.stops.map(f => {
          const pt = path?.getPointAtLength(f * len)
          return { x: pt?.x ?? 0, y: pt?.y ?? 0 }
        })
      })
    )
  }, [])

  useAnimationFrame((_, delta) => {
    if (!inView || lengths.current.length === 0) return
    const dt = reduceMotion ? 0 : Math.min(delta, 64) / 1000
    clock.current += dt
    const started = reduceMotion || clock.current > DRAW_SECONDS

    ROUTES.forEach((route, i) => {
      if (started && !reduceMotion) progress.current[i] = ((progress.current[i] ?? 0) + dt / route.duration) % 1
      const p = reduceMotion ? 0.6 : progress.current[i] ?? 0
      const path = pathRefs.current[i]
      const bus = busRefs.current[i]
      if (!path || !bus) return
      const pt = path.getPointAtLength(p * (lengths.current[i] ?? 0))
      bus.setAttribute('transform', `translate(${pt.x} ${pt.y})`)
      bus.style.opacity = started ? String(reduceMotion ? 1 : edgeFade(p)) : '0'
      route.stops.forEach((f, s) => {
        const stop = stopRefs.current[i]?.[s]
        if (stop) stop.style.fill = started && p >= f ? routeColor(i) : 'hsl(var(--background))'
      })
    })
  })

  // Low-frequency UI: ETA for Bus 1 and the boarding toast.
  useEffect(() => {
    if (reduceMotion) return
    const etaTimer = window.setInterval(() => {
      setEta(Math.max(1, Math.ceil((1 - (progress.current[0] ?? 0)) * TRIP_MINUTES)))
    }, 500)
    const toastTimer = window.setInterval(() => setToast(t => (t + 1) % TOASTS.length), 3200)
    return () => {
      window.clearInterval(etaTimer)
      window.clearInterval(toastTimer)
    }
  }, [reduceMotion])

  const current = TOASTS[toast] ?? TOASTS[0]

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-[0_1px_2px_rgb(15_23_42/0.04),0_24px_48px_-24px_rgb(15_23_42/0.18)]">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 text-[13px]">
          <span className="font-semibold text-foreground">Morning run · 4 buses</span>
          <span className="text-muted-foreground">Sample data</span>
        </div>

        <div className="relative bg-map-grid">
          <svg viewBox="0 0 560 460" className="block h-auto w-full" role="img" aria-label="Illustration: four bus routes converging on a school, with buses moving along them">
            {/* Coastline */}
            <path d="M 492 0 C 452 90, 540 160, 470 232 C 420 292, 502 360, 462 460 L 560 460 L 560 0 Z" className="fill-accent/10" />
            <text x="520" y="300" className="hidden fill-accent text-[12px] italic sm:block" textAnchor="middle" transform="rotate(90 520 300)">
              Arabian Gulf
            </text>

            {/* Minor roads */}
            <g className="stroke-border" strokeWidth="6" fill="none" strokeLinecap="round">
              <path d="M 20 200 H 250" />
              <path d="M 200 20 V 440" />
              <path d="M 340 300 H 440" />
              <path d="M 120 400 L 220 300" />
            </g>

            {/* Routes: a soft casing, then the colored line drawn in on load */}
            {ROUTES.map((route, i) => (
              <g key={route.bus}>
                <path d={route.d} fill="none" className="stroke-background" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                <motion.path
                  ref={el => { pathRefs.current[i] = el }}
                  d={route.d}
                  fill="none"
                  stroke={routeColor(i)}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={reduceMotion ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.1, delay: 0.25 + i * 0.15, ease: [0.65, 0, 0.35, 1] }}
                />
              </g>
            ))}

            {/* Stops */}
            {stopPoints.map((points, i) =>
              points.map((pt, s) => (
                <circle
                  key={`${i}-${s}`}
                  ref={el => {
                    const row = stopRefs.current[i]
                    if (row) row[s] = el
                  }}
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  stroke={routeColor(i)}
                  strokeWidth="2.5"
                  style={{ fill: 'hsl(var(--background))', transition: 'fill 300ms ease' }}
                />
              ))
            )}

            {/* Area labels */}
            {ROUTES.map((route, i) => (
              <text
                key={route.area}
                x={route.label.x}
                y={route.label.y}
                textAnchor={route.label.anchor}
                className="hidden fill-muted-foreground text-[13px] font-medium sm:block"
              >
                {route.area}
              </text>
            ))}

            {/* Buses */}
            {ROUTES.map((route, i) => (
              <g key={`bus-${route.bus}`} ref={el => { busRefs.current[i] = el }} style={{ opacity: 0 }}>
                <circle r="11" fill={routeColor(i)} opacity="0.18" />
                <circle r="7" fill={routeColor(i)} className="stroke-background" strokeWidth="2.5" />
              </g>
            ))}

            {/* School */}
            <g transform="translate(300 252)">
              <rect x="-16" y="-16" width="32" height="32" rx="7" className="fill-primary stroke-background" strokeWidth="3" />
              <path d="M -7 3 V -2 L 0 -7 L 7 -2 V 3 Z M -3 3 V -1 H 3 V 3" className="fill-none stroke-primary-foreground" strokeWidth="1.8" strokeLinejoin="round" />
              <text y="34" textAnchor="middle" className="fill-foreground text-[13px] font-semibold">School</text>
            </g>
          </svg>

          {/* Boarding notification */}
          <div className="pointer-events-none absolute right-3 top-3 w-[min(210px,48%)]" aria-live="off">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={toast}
                initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2.5 rounded-md border border-border bg-card/95 px-3 py-2 shadow-sm backdrop-blur"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                  <Check size={13} strokeWidth={3} />
                </span>
                <span className="min-w-0 text-xs leading-tight">
                  <span className="block truncate font-semibold text-foreground">{current.text}</span>
                  <span className="text-muted-foreground">{current.bus} · {current.time}</span>
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ETA card for Bus 1 */}
          <div className="absolute bottom-3 left-3 w-[min(200px,46%)] rounded-md border border-border bg-card/95 px-3 py-2.5 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: routeColor(0) }} />
              Bus 1 · West Bay
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold tracking-tight text-foreground">{eta} min</span>
              <span className="text-xs text-muted-foreground">to school</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border px-4 py-3 text-[13px]">
          {ROUTES.map((route, i) => (
            <li key={route.bus} className="flex items-center gap-2 text-muted-foreground">
              <span className="h-[3px] w-4 shrink-0 rounded-full" style={{ backgroundColor: routeColor(i) }} />
              <span className="truncate">
                <span className="font-medium text-foreground">{route.bus}</span> · {route.area}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
