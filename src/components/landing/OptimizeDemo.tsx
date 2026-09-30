'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { Loader2, RotateCcw, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionHeading } from '@/components/landing/SectionHeading'
import { routeColor } from '@/components/landing/routeColors'
import { CLUSTER_COUNT, FINAL_SNAPSHOT, HOMES, KMEANS_HISTORY, ROUTE_PATHS, SCHOOL } from '@/components/landing/optimizeDemoData'

type Phase = 'idle' | 'homes' | 'clustering' | 'routing' | 'done'

const ITERATION_MS = 900

const POINTS = [
  {
    title: 'Groups students by area',
    desc: 'K-Means clustering splits home addresses into one group per bus. No zones to draw.',
  },
  {
    title: 'Orders every stop',
    desc: 'Each route is sequenced from the farthest home to the school, using real road travel times in the product.',
  },
  {
    title: 'Keeps up as students join',
    desc: 'Smart Placement adds a new student to the nearest bus with free seats and recalculates that route.',
  },
]

function caption(phase: Phase, iteration: number) {
  switch (phase) {
    case 'idle':
    case 'homes':
      return `Placing ${HOMES.length} home addresses…`
    case 'clustering':
      return `Grouping by area — K-Means iteration ${iteration + 1} of ${KMEANS_HISTORY.length}`
    case 'routing':
      return 'Ordering stops, nearest neighbor first…'
    case 'done':
      return `${CLUSTER_COUNT} routes ready`
  }
}

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
    { label: 'Students placed', value: phase === 'idle' ? '—' : String(HOMES.length) },
    { label: 'Buses used', value: clustered ? String(CLUSTER_COUNT) : '—' },
    { label: 'Stops ordered', value: phase === 'done' ? String(HOMES.length) : '—' },
  ]

  return (
    <section className="mx-auto mb-24 max-w-6xl px-4 sm:px-6 md:mb-32">
      <SectionHeading
        index="03"
        label="Route optimization"
        title="Watch the routes build themselves"
        subtitle="This is the same approach RouteyAI runs on your real student list, shown here on sample addresses."
      />

      <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.55fr] lg:gap-14">
        <ol className="order-2 divide-y divide-border border-y border-border lg:order-1">
          {POINTS.map((point, i) => (
            <li key={point.title} className="flex gap-4 py-5">
              <span className="font-mono text-xs text-muted-foreground/70">0{i + 1}</span>
              <div>
                <h3 className="text-[15px] font-semibold text-foreground">{point.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{point.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        <div ref={ref} className="order-1 overflow-hidden rounded-lg border border-border bg-card shadow-[0_1px_2px_rgb(15_23_42/0.04),0_24px_48px_-28px_rgb(15_23_42/0.2)] lg:order-2">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Routes</p>
              <p className="truncate text-xs text-muted-foreground">Sample school · illustrative data</p>
            </div>
            <button
              type="button"
              onClick={play}
              disabled={busy}
              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-default disabled:opacity-80"
            >
              {busy ? <Loader2 size={13} className="animate-spin" /> : phase === 'done' ? <RotateCcw size={13} /> : <Sparkles size={13} />}
              {busy ? 'Optimizing…' : phase === 'done' ? 'Run again' : 'Optimize routes'}
            </button>
          </div>

          <div className="relative bg-map-grid">
            <svg viewBox="0 0 540 400" className="block h-auto w-full" role="img" aria-label={`Illustration: ${caption(phase, iteration)}`}>
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
                  className="stroke-card"
                  strokeWidth="2"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={phase === 'idle' ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: reduceMotion ? 0 : phase === 'homes' ? i * 0.025 : 0 }}
                  style={{
                    fill: clustered ? routeColor(snapshot.assignment[i] ?? 0) : 'hsl(var(--muted-foreground))',
                    transition: 'fill 450ms ease',
                    transformBox: 'fill-box',
                    transformOrigin: 'center',
                  }}
                />
              ))}

              {/* Moving centroids during clustering */}
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
                <text y="28" textAnchor="middle" className="fill-foreground text-[11px] font-semibold">School</text>
              </g>
            </svg>

            <div className="absolute bottom-3 left-3 rounded-md border border-border bg-card/95 px-3 py-1.5 text-xs text-foreground shadow-sm backdrop-blur" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={caption(phase, iteration)}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="block"
                >
                  {caption(phase, iteration)}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <dl className="grid grid-cols-3 divide-x divide-border border-t border-border">
            {stats.map(stat => (
              <div key={stat.label} className="px-4 py-3.5">
                <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                <dd className={cn('mt-1 text-xl font-semibold tracking-tight transition-colors', stat.value === '—' ? 'text-muted-foreground/50' : 'text-foreground')}>
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
