'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ROUTE_COLORS } from '@/components/landing/routeColors'

type Status = 'On route' | 'Arriving' | 'At school' | 'Delayed'

interface BusRun {
  bus: string
  area: string
  riders: number
  startEta: number
  /** Minutes of delay added once, part-way through the run (0 = on time). */
  delayAt?: number
}

const RUNS: BusRun[] = [
  { bus: 'Bus 1', area: 'West Bay', riders: 18, startEta: 9 },
  { bus: 'Bus 2', area: 'Al Waab', riders: 24, startEta: 12, delayAt: 7 },
  { bus: 'Bus 3', area: 'Al Sadd', riders: 15, startEta: 6 },
  { bus: 'Bus 4', area: 'Al Thumama', riders: 21, startEta: 14 },
]

const START_MINUTE = 6 * 60 + 48 // 06:48
const TICK_MS = 2600
const CYCLE = 18 // minutes simulated before the board restarts

function stateAt(run: BusRun, minute: number) {
  const delay = run.delayAt !== undefined && minute >= run.delayAt ? 3 : 0
  const eta = Math.max(0, run.startEta + delay - minute)
  const total = run.startEta + delay
  const boarded = Math.min(run.riders, Math.round((run.riders * Math.min(minute, total)) / Math.max(1, total - 1)))
  let status: Status = 'On route'
  if (eta === 0) status = 'At school'
  else if (eta <= 2) status = 'Arriving'
  else if (delay > 0 && minute < (run.delayAt ?? 0) + 3) status = 'Delayed'
  return { eta, boarded, status }
}

const STATUS_STYLE: Record<Status, string> = {
  'On route': 'text-secondary',
  Arriving: 'text-accent',
  'At school': 'text-primary-light',
  Delayed: 'text-warning',
}

function Roll({ value, className }: { value: string; className?: string }) {
  const reduceMotion = useReducedMotion()
  return (
    <span className={cn('relative inline-flex overflow-hidden align-bottom', className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={reduceMotion ? false : { y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block whitespace-nowrap"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function clock(minute: number) {
  const m = START_MINUTE + minute
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

export function LiveBoard() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-15% 0px' })
  const reduceMotion = useReducedMotion()
  const [minute, setMinute] = useState(1)

  useEffect(() => {
    if (!inView || reduceMotion) return
    const id = window.setInterval(() => setMinute(m => (m + 1) % CYCLE), TICK_MS)
    return () => window.clearInterval(id)
  }, [inView, reduceMotion])

  return (
    <section aria-label="Sample live departure board" className="mx-auto mb-24 max-w-6xl px-4 sm:px-6 md:mb-32">
      <div ref={ref} className="overflow-hidden rounded-lg bg-slate-950 text-slate-100 ring-1 ring-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-3.5">
          <div className="flex items-center gap-3 text-sm">
            <span className="font-semibold text-white">Arrivals</span>
            <span className="text-slate-500">Al Noor School · sample morning run</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-sm">
            <span className="rounded bg-slate-900 px-2 py-0.5 text-[11px] uppercase tracking-wider text-slate-400">Demo data</span>
            <Roll value={clock(minute)} className="text-white" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left font-mono text-[13px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                <th scope="col" className="px-5 py-2.5 font-medium">Bus</th>
                <th scope="col" className="px-3 py-2.5 font-medium">From</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">Boarded</th>
                <th scope="col" className="px-5 py-2.5 text-right font-medium">ETA</th>
              </tr>
            </thead>
            <tbody>
              {RUNS.map((run, i) => {
                const { eta, boarded, status } = stateAt(run, minute)
                return (
                  <tr key={run.bus} className="border-t border-slate-800/80">
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2.5 text-white">
                        <span className="h-4 w-1 rounded-full" style={{ backgroundColor: ROUTE_COLORS[i] }} />
                        {run.bus}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-300">{run.area}</td>
                    <td className="px-3 py-3">
                      <Roll value={status === 'Delayed' ? 'Delayed +3' : status} className={STATUS_STYLE[status]} />
                    </td>
                    <td className="px-3 py-3 text-right text-slate-300">
                      <Roll value={`${boarded}/${run.riders}`} />
                    </td>
                    <td className="px-5 py-3 text-right text-white">
                      <Roll value={eta === 0 ? '—' : `${eta} min`} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
