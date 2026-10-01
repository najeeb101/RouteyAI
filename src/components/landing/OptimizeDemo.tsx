'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Bus, School } from 'lucide-react'
import { cn } from '@/lib/utils'
import { routeColor } from '@/components/landing/routeColors'
import {
  CLUSTER_COUNT,
  FINAL_SNAPSHOT,
  HOMES,
  KMEANS_HISTORY,
  MAP_HEIGHT,
  MAP_WIDTH,
  METERS_PER_UNIT,
  ROUTE_PATHS,
  ROUTE_STARTS,
  SCHOOL,
  MAP_IMAGES,
} from '@/components/landing/optimizeDemoData'

/** 0 add students · 1 plan routes · 2 invite drivers and parents · 3 run the route */
export type PlannerStage = 0 | 1 | 2 | 3

type Phase = 'clustering' | 'routing' | 'done'

const ITERATION_MS = 650
const DRIVERS = ['Khalid', 'Rashid', 'Imran'] as const
const SCALE_METERS = 500
/** Map pin with its tip at (0, 0). */
const PIN = 'M0 0C-1.3-3.4-5.2-5.8-5.2-9.6a5.2 5.2 0 1 1 10.4 0C5.2-5.8 1.3-3.4 0 0Z'

function caption(stage: PlannerStage, phase: Phase) {
  if (stage === 0) return `${HOMES.length} home addresses on the map`
  if (stage === 1) return phase === 'clustering' ? 'Grouping students by area…' : phase === 'routing' ? 'Routing along the roads…' : `${CLUSTER_COUNT} routes ready`
  if (stage === 2) return `${CLUSTER_COUNT} drivers and ${HOMES.length} parents invited`
  return `${CLUSTER_COUNT} buses on the road, parents following live`
}

const STATUS = ['Addresses added', 'Planning routes', 'Invites sent', 'Live'] as const

/**
 * The route planner, shown at one of the four steps, on a real street map around Aspire Park, Doha.
 * Step 1 plays a real K-Means grouping of the sample homes and then draws each route along the roads to the school;
 * step 3 drives a bus along each route. Map data and routes come from scripts/landing-map/build.mjs.
 */
export function OptimizeDemo({ stage, inView }: { stage: PlannerStage; inView: boolean }) {
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = useState<Phase>('done')
  const [iteration, setIteration] = useState(KMEANS_HISTORY.length - 1)
  const timers = useRef<number[]>([])

  useEffect(() => {
    timers.current.forEach(t => window.clearTimeout(t))
    timers.current = []
    if (stage !== 1 || reduceMotion) {
      setIteration(KMEANS_HISTORY.length - 1)
      setPhase('done')
      return
    }
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms))
    setIteration(0)
    setPhase('clustering')
    KMEANS_HISTORY.forEach((_, i) => at(300 + i * ITERATION_MS, () => setIteration(i)))
    const routingAt = 300 + KMEANS_HISTORY.length * ITERATION_MS
    at(routingAt, () => setPhase('routing'))
    at(routingAt + 1800, () => setPhase('done'))
    return () => timers.current.forEach(t => window.clearTimeout(t))
  }, [stage, reduceMotion])

  const clustered = stage >= 1
  const snapshot = stage === 1 ? KMEANS_HISTORY[iteration] ?? FINAL_SNAPSHOT : FINAL_SNAPSHOT
  const showRoutes = stage >= 2 || (stage === 1 && phase !== 'clustering')
  const planning = stage === 1 && phase !== 'done'
  const drawSlowly = stage === 1 && !reduceMotion

  const stats = [
    { label: 'Students', value: String(HOMES.length) },
    { label: 'Buses', value: clustered ? String(CLUSTER_COUNT) : '–' },
    { label: stage === 3 ? 'On the road' : 'Stops in order', value: stage === 3 ? String(CLUSTER_COUNT) : showRoutes && !planning ? String(HOMES.length) : '–' },
  ]

  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-border bg-card shadow-[0_30px_60px_-40px_hsl(var(--brand-ink)/0.45)]">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Route planner</p>
          <p className="truncate text-[13px] text-muted-foreground">Near Aspire Park, {HOMES.length} students</p>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold transition-colors duration-300',
            stage === 3 ? 'bg-secondary/15 text-emerald-700 dark:text-emerald-300' : 'bg-primary/10 text-primary'
          )}
        >
          {stage === 3 && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary motion-reduce:animate-none" />}
          {planning ? STATUS[1] : stage === 1 ? `${CLUSTER_COUNT} routes ready` : STATUS[stage]}
        </span>
      </div>

      <div className="relative aspect-[540/400] bg-muted">
        {/* Base map: real streets from OpenStreetMap, drawn once per theme. Only the visible one is downloaded. */}
        <Image src={MAP_IMAGES.light} alt="" fill sizes="(min-width: 1024px) 640px, 100vw" className="object-cover dark:hidden" />
        <Image src={MAP_IMAGES.dark} alt="" fill sizes="(min-width: 1024px) 640px, 100vw" className="hidden object-cover dark:block" />

        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label={`Sample route planner on a map of streets around Aspire Park, Doha: ${caption(stage, phase)}`}
        >
          {/* Routes, with a light edge so they read over the streets, like a navigation app. */}
          {ROUTE_PATHS.map((d, k) => (
            <g key={`route-${k}`}>
              <motion.path
                d={d}
                fill="none"
                className="stroke-white dark:stroke-[#26282B]"
                strokeWidth="6.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={showRoutes ? { pathLength: 1, opacity: 0.95 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: drawSlowly ? 1.5 : 0.3, delay: drawSlowly ? k * 0.15 : 0, ease: [0.65, 0, 0.35, 1] }}
              />
              <motion.path
                id={`planner-route-${k}`}
                d={d}
                fill="none"
                stroke={routeColor(k)}
                strokeWidth="3.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={showRoutes ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: drawSlowly ? 1.5 : 0.3, delay: drawSlowly ? k * 0.15 : 0, ease: [0.65, 0, 0.35, 1] }}
              />
            </g>
          ))}

          {/* Group centres moving while students are grouped */}
          <AnimatePresence>
            {stage === 1 &&
              phase === 'clustering' &&
              snapshot.centroids.map((c, k) => (
                <motion.g
                  key={`centroid-${k}`}
                  initial={{ opacity: 0, x: c.x, y: c.y }}
                  animate={{ opacity: 1, x: c.x, y: c.y }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <circle r="22" fill={routeColor(k)} opacity="0.16" />
                  <circle r="22" fill="none" stroke={routeColor(k)} strokeWidth="1.2" strokeDasharray="3 3" />
                  <path d="M -6 0 H 6 M 0 -6 V 6" stroke={routeColor(k)} strokeWidth="2.5" strokeLinecap="round" />
                </motion.g>
              ))}
          </AnimatePresence>

          {/* Homes as map pins */}
          {HOMES.map((home, i) => (
            <g key={`home-${i}`} transform={`translate(${home.x} ${home.y})`}>
              {/* SVG animations run on the main thread, so the drop only plays once the panel is on screen. */}
              <g
                className={cn(stage === 0 && inView && !reduceMotion && 'animate-fade-up')}
                style={{ animationDelay: `${i * 30}ms`, transformBox: 'fill-box' }}
              >
                <path
                  d={PIN}
                  fill={clustered ? routeColor(snapshot.assignment[i] ?? 0) : undefined}
                  className={cn('stroke-white', !clustered && 'fill-slate-500 dark:fill-slate-400')}
                  strokeWidth="1.3"
                  style={{ transition: 'fill 450ms ease' }}
                />
                <circle cy="-9.6" r="1.9" className="fill-white" />
              </g>
            </g>
          ))}

          {/* School */}
          <g transform={`translate(${SCHOOL.x} ${SCHOOL.y})`}>
            <rect x="-10" y="-10" width="20" height="20" rx="5.5" className="fill-brand stroke-white" strokeWidth="2.2" />
            <School x={-6} y={-6} width={12} height={12} className="text-white" strokeWidth={2.2} />
            <text
              y="21"
              textAnchor="middle"
              className="fill-foreground stroke-card text-[10px] font-semibold"
              strokeWidth="3"
              paintOrder="stroke"
              strokeLinejoin="round"
            >
              School
            </text>
          </g>

          {/* Drivers assigned to each route */}
          <AnimatePresence>
            {stage === 2 &&
              ROUTE_STARTS.map((p, k) => (
                <motion.g
                  key={`driver-${k}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, delay: reduceMotion ? 0 : k * 0.12 }}
                >
                  <g transform={`translate(${Math.min(Math.max(p.x, 66), MAP_WIDTH - 66)} ${Math.max(p.y - 26, 18)})`}>
                    <rect x="-60" y="-13" width="120" height="26" rx="13" className="fill-card" stroke={routeColor(k)} strokeWidth="1.5" />
                    <circle cx="-46" cy="0" r="8" fill={routeColor(k)} />
                    <text x="-46" y="3.5" textAnchor="middle" className="fill-white text-[10px] font-bold">
                      {DRIVERS[k]?.[0]}
                    </text>
                    <text x="-33" y="4" className="fill-foreground text-[11px] font-semibold">
                      {`Bus ${k + 1} · ${DRIVERS[k]}`}
                    </text>
                  </g>
                </motion.g>
              ))}
          </AnimatePresence>

          {/* Buses driving their routes, as live GPS markers */}
          {stage === 3 &&
            ROUTE_PATHS.map((d, k) => (
              <g key={`bus-${k}`}>
                <g>
                  {!reduceMotion && (
                    <circle r="9" fill={routeColor(k)} opacity="0.35">
                      <animate attributeName="r" values="9;18" dur="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.35;0" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle r="9.5" fill={routeColor(k)} className="stroke-white" strokeWidth="2" />
                  <Bus x={-5.5} y={-5.5} width={11} height={11} className="text-white" strokeWidth={2.4} />
                  {!reduceMotion && (
                    <animateMotion dur={`${Math.round(6 + d.length / 90)}s`} repeatCount="indefinite" rotate="0" begin={`${k * 0.5}s`}>
                      <mpath href={`#planner-route-${k}`} />
                    </animateMotion>
                  )}
                </g>
              </g>
            ))}
        </svg>

        {/* Map furniture: a scale bar (its width is 500 m on this map) and the required OpenStreetMap credit */}
        <div
          aria-hidden="true"
          className="absolute left-2 top-2 whitespace-nowrap rounded-sm bg-card/80 px-1 pb-1 text-[10px] leading-tight text-foreground/80"
          style={{ width: `calc(${((SCALE_METERS / METERS_PER_UNIT) / MAP_WIDTH) * 100}% + 0.5rem)` }}
        >
          {SCALE_METERS} m
          <span className="block h-1 border-x border-b border-foreground/60" />
        </div>
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="absolute right-2 top-2 rounded-sm bg-card/80 px-1 text-[10px] leading-4 text-muted-foreground hover:text-foreground"
        >
          © OpenStreetMap contributors
        </a>

        <p
          className="absolute bottom-3 left-3 rounded-full border border-border bg-card/95 px-3.5 py-1.5 text-[13px] text-foreground shadow-sm"
          aria-live="polite"
        >
          {caption(stage, phase)}
        </p>
      </div>

      <dl className="grid grid-cols-3 divide-x divide-border border-t border-border">
        {stats.map(stat => (
          <div key={stat.label} className="px-5 py-3.5">
            <dt className="text-[13px] text-muted-foreground">{stat.label}</dt>
            <dd className={cn('mt-0.5 font-display text-2xl font-bold tabular-nums', stat.value === '–' ? 'text-muted-foreground/50' : 'text-foreground')}>
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
