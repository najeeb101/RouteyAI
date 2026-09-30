'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { routeColor } from '@/components/landing/routeColors'
import { CLUSTER_COUNT, FINAL_SNAPSHOT, HOMES, KMEANS_HISTORY, ROUTE_PATHS, SCHOOL } from '@/components/landing/optimizeDemoData'

/** 0 add students · 1 plan routes · 2 invite drivers and parents · 3 run the route */
export type PlannerStage = 0 | 1 | 2 | 3

type Phase = 'clustering' | 'routing' | 'done'

const ITERATION_MS = 520
const DRIVERS = ['Khalid', 'Rashid', 'Imran'] as const
/** First stop of each route, where its driver label sits. */
const ROUTE_STARTS = ROUTE_PATHS.map(d => {
  const [, x = '0', y = '0'] = d.split(' ')
  return { x: Number(x), y: Number(y) }
})

function caption(stage: PlannerStage, phase: Phase) {
  if (stage === 0) return `${HOMES.length} home addresses on the map`
  if (stage === 1) return phase === 'clustering' ? 'Grouping students by area…' : phase === 'routing' ? 'Putting the stops in order…' : `${CLUSTER_COUNT} routes ready`
  if (stage === 2) return `${CLUSTER_COUNT} drivers and ${HOMES.length} parents invited`
  return `${CLUSTER_COUNT} buses on the road, parents following live`
}

const STATUS = ['Addresses added', 'Planning routes', 'Invites sent', 'Live'] as const

/**
 * The route planner, shown at one of the four steps. Step 1 plays a real K-Means grouping of the sample addresses
 * and then draws the ordered routes; step 3 sends a bus along each route.
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
    at(routingAt + 1300, () => setPhase('done'))
    return () => timers.current.forEach(t => window.clearTimeout(t))
  }, [stage, reduceMotion])

  const clustered = stage >= 1
  const snapshot = stage === 1 ? KMEANS_HISTORY[iteration] ?? FINAL_SNAPSHOT : FINAL_SNAPSHOT
  const showRoutes = stage >= 2 || (stage === 1 && phase !== 'clustering')
  const planning = stage === 1 && phase !== 'done'

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
          <p className="truncate text-[13px] text-muted-foreground">Sample school, {HOMES.length} students</p>
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

      <div className="relative bg-map-grid">
        <svg viewBox="0 0 540 400" className="block h-auto w-full" role="img" aria-label={`Sample route planner: ${caption(stage, phase)}`}>
          {/* Routes */}
          {ROUTE_PATHS.map((d, k) => (
            <motion.path
              key={`route-${k}`}
              id={`planner-route-${k}`}
              d={d}
              fill="none"
              stroke={routeColor(k)}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              animate={showRoutes ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
              transition={{ duration: reduceMotion || stage !== 1 ? 0.3 : 1.1, delay: reduceMotion || stage !== 1 ? 0 : k * 0.12, ease: [0.65, 0, 0.35, 1] }}
            />
          ))}

          {/* Homes */}
          {HOMES.map((home, i) => (
            <circle
              key={`home-${i}`}
              cx={home.x}
              cy={home.y}
              r="5"
              fill={clustered ? routeColor(snapshot.assignment[i] ?? 0) : undefined}
              // SVG animations run on the main thread, so the pop-in only plays once the panel is on screen.
              className={cn('stroke-card', !clustered && 'fill-muted-foreground', stage === 0 && inView && !reduceMotion && 'animate-fade-up')}
              strokeWidth="2"
              style={{ transition: 'fill 450ms ease', animationDelay: `${i * 25}ms`, transformBox: 'fill-box' }}
            />
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
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <circle r="16" fill={routeColor(k)} opacity="0.14" />
                  <path d="M -6 0 H 6 M 0 -6 V 6" stroke={routeColor(k)} strokeWidth="2.5" strokeLinecap="round" />
                </motion.g>
              ))}
          </AnimatePresence>

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
                  <g transform={`translate(${Math.min(Math.max(p.x, 70), 470)} ${Math.max(p.y - 22, 20)})`}>
                    <rect x="-62" y="-14" width="124" height="28" rx="14" className="fill-card" stroke={routeColor(k)} strokeWidth="1.5" />
                    <circle cx="-47" cy="0" r="8" fill={routeColor(k)} />
                    <text x="-47" y="3.5" textAnchor="middle" className="fill-white text-[10px] font-bold">{DRIVERS[k]?.[0]}</text>
                    <text x="-34" y="4" className="fill-foreground text-[11px] font-semibold">
                      {`Bus ${k + 1} · ${DRIVERS[k]}`}
                    </text>
                  </g>
                </motion.g>
              ))}
          </AnimatePresence>

          {/* Buses running their routes */}
          {stage === 3 &&
            ROUTE_PATHS.map((_, k) => (
              <g key={`bus-${k}`}>
                <g>
                  <rect x="-10" y="-7" width="20" height="14" rx="4" fill={routeColor(k)} className="stroke-card" strokeWidth="2" />
                  <rect x="-5" y="-3.5" width="10" height="4" rx="1" className="fill-white/90" />
                  {!reduceMotion && (
                    <animateMotion dur={`${7 + k * 1.3}s`} repeatCount="indefinite" rotate="0" begin={`${k * 0.4}s`}>
                      <mpath href={`#planner-route-${k}`} />
                    </animateMotion>
                  )}
                </g>
              </g>
            ))}

          {/* School */}
          <g transform={`translate(${SCHOOL.x} ${SCHOOL.y})`}>
            <rect x="-13" y="-13" width="26" height="26" rx="6" className="fill-primary stroke-card" strokeWidth="3" />
            <text y="30" textAnchor="middle" className="fill-foreground text-[13px] font-semibold">School</text>
          </g>
        </svg>

        <p
          className="absolute bottom-3 left-3 rounded-full border border-border bg-card px-3.5 py-1.5 text-[13px] text-foreground shadow-sm"
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
