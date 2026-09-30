'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { Loader2, RotateCcw, Route } from 'lucide-react'
import { cn } from '@/lib/utils'
import { routeColor } from '@/components/landing/routeColors'
import { CLUSTER_COUNT, FINAL_SNAPSHOT, HOMES, KMEANS_HISTORY, ROUTE_PATHS, SCHOOL } from '@/components/landing/optimizeDemoData'

type Phase = 'idle' | 'homes' | 'clustering' | 'routing' | 'done'

const ITERATION_MS = 900

function caption(phase: Phase) {
  switch (phase) {
    case 'idle':
    case 'homes':
      return `Adding ${HOMES.length} home addresses…`
    case 'clustering':
      return 'Grouping students by area…'
    case 'routing':
      return 'Putting the stops in order…'
    case 'done':
      return `${CLUSTER_COUNT} routes ready`
  }
}

/** Route planner panel that plays the optimize step on sample addresses. */
export function OptimizeDemo() {
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20% 0px' })
  const [phase, setPhase] = useState<Phase>('idle')
  const [iteration, setIteration] = useState(0)
  const [run, setRun] = useState(0)
  const timers = useRef<number[]>([])

  const play = useCallback(() => {
    timers.current.forEach(t => window.clearTimeout(t))
    timers.current = []
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms))

    setRun(r => r + 1)
    setIteration(0)
    setPhase('homes')
    at(1100, () => setPhase('clustering'))
    KMEANS_HISTORY.forEach((_, i) => at(1100 + i * ITERATION_MS, () => setIteration(i)))
    const routingAt = 1100 + KMEANS_HISTORY.length * ITERATION_MS + 200
    at(routingAt, () => setPhase('routing'))
    at(routingAt + 1500, () => setPhase('done'))
  }, [])

  useEffect(() => {
    if (!inView) return
    if (reduceMotion) {
      setIteration(KMEANS_HISTORY.length - 1)
      setPhase('done')
      return
    }
    play()
  }, [inView, reduceMotion, play])

  useEffect(() => () => timers.current.forEach(t => window.clearTimeout(t)), [])

  const clustered = phase === 'clustering' || phase === 'routing' || phase === 'done'
  const snapshot = KMEANS_HISTORY[iteration] ?? FINAL_SNAPSHOT
  const showRoutes = phase === 'routing' || phase === 'done'
  const busy = phase === 'homes' || phase === 'clustering' || phase === 'routing'

  const stats = [
    { label: 'Students', value: phase === 'idle' ? '–' : String(HOMES.length) },
    { label: 'Buses', value: clustered ? String(CLUSTER_COUNT) : '–' },
    { label: 'Stops in order', value: phase === 'done' ? String(HOMES.length) : '–' },
  ]

  return (
    <div ref={ref} className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Route planner</p>
          <p className="truncate text-[13px] text-muted-foreground">Sample school · {HOMES.length} students</p>
        </div>
        <button
          type="button"
          onClick={play}
          disabled={busy}
          className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-default disabled:opacity-80"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : phase === 'done' ? <RotateCcw size={14} /> : <Route size={14} />}
          {busy ? 'Optimizing…' : phase === 'done' ? 'Run again' : 'Optimize routes'}
        </button>
      </div>

      <div className="relative bg-map-grid">
        <svg viewBox="0 0 540 400" className="block h-auto w-full" role="img" aria-label={`Sample route planner: ${caption(phase)}`}>
          {/* Routes */}
          {ROUTE_PATHS.map((d, k) => (
            <motion.path
              key={`${run}-route-${k}`}
              d={d}
              fill="none"
              stroke={routeColor(k)}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={showRoutes ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 1.2, delay: reduceMotion ? 0 : k * 0.15, ease: [0.65, 0, 0.35, 1] }}
            />
          ))}

          {/* Homes */}
          {HOMES.map((home, i) => (
            <motion.circle
              key={`${run}-home-${i}`}
              cx={home.x}
              cy={home.y}
              r="5"
              // Framer Motion ignores later changes to `style.fill`, so the colour goes through the attribute.
              fill={clustered ? routeColor(snapshot.assignment[i] ?? 0) : undefined}
              className={cn('stroke-card', !clustered && 'fill-muted-foreground')}
              strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }}
              animate={phase === 'idle' ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: reduceMotion ? 0 : phase === 'homes' ? i * 0.025 : 0 }}
              style={{
                transition: 'fill 450ms ease',
                transformBox: 'fill-box',
                transformOrigin: 'center',
              }}
            />
          ))}

          {/* Group centres moving while students are grouped */}
          <AnimatePresence>
            {phase === 'clustering' &&
              snapshot.centroids.map((c, k) => (
                <motion.g
                  key={`centroid-${k}`}
                  initial={{ opacity: 0, x: c.x, y: c.y }}
                  animate={{ opacity: 1, x: c.x, y: c.y }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <circle r="16" fill={routeColor(k)} opacity="0.14" />
                  <path d="M -6 0 H 6 M 0 -6 V 6" stroke={routeColor(k)} strokeWidth="2.5" strokeLinecap="round" />
                </motion.g>
              ))}
          </AnimatePresence>

          {/* School */}
          <g transform={`translate(${SCHOOL.x} ${SCHOOL.y})`}>
            <rect x="-13" y="-13" width="26" height="26" rx="6" className="fill-primary stroke-card" strokeWidth="3" />
            <text y="30" textAnchor="middle" className="fill-foreground text-[13px] font-semibold">School</text>
          </g>
        </svg>

        <p
          className="absolute bottom-3 left-3 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] text-foreground shadow-sm"
          aria-live="polite"
        >
          {caption(phase)}
        </p>
      </div>

      <dl className="grid grid-cols-3 divide-x divide-border border-t border-border">
        {stats.map(stat => (
          <div key={stat.label} className="px-4 py-3">
            <dt className="text-[13px] text-muted-foreground">{stat.label}</dt>
            <dd className={cn('mt-0.5 text-xl font-semibold', stat.value === '–' ? 'text-muted-foreground/50' : 'text-foreground')}>
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
