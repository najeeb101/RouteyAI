'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { routeColor } from '@/components/landing/routeColors'
import { useTicker } from '@/components/landing/visuals/useTicker'

/** Existing homes as [x, y, route index]. */
const HOMES: [number, number, number][] = [
  [30, 40, 1], [90, 60, 1], [150, 50, 1], [40, 140, 2], [110, 125, 2], [190, 140, 2],
]

/** Smart placement: a new student joins the nearest route */
export function PlacementVisual() {
  const { ref, tick, reduceMotion } = useTicker(2600)
  const placed = reduceMotion || tick % 2 === 1
  return (
    <div ref={ref} className="relative h-full min-h-[170px]">
      <svg viewBox="0 0 300 170" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d="M 30 40 L 90 60 L 150 50 L 250 120" fill="none" stroke={routeColor(1)} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 40 140 L 110 125 L 190 140 L 250 120" fill="none" stroke={routeColor(2)} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {HOMES.map(([x, y, k]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="4.5" fill={routeColor(k)} className="stroke-card" strokeWidth="2" />
        ))}
        <rect x="240" y="110" width="20" height="20" rx="5" className="fill-primary stroke-card" strokeWidth="2.5" />
        <motion.line
          x1="120" y1="88" x2="150" y2="50"
          stroke={routeColor(1)}
          strokeWidth="2"
          strokeDasharray="4 4"
          initial={false}
          animate={{ pathLength: placed ? 1 : 0, opacity: placed ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />
        <motion.circle
          cx="120"
          cy="88"
          r="6"
          className="stroke-card"
          strokeWidth="2.5"
          initial={false}
          animate={{ scale: placed ? 1 : [0.6, 1.15, 1] }}
          transition={{ duration: 0.5 }}
          style={{
            fill: placed ? routeColor(1) : 'hsl(var(--muted-foreground))',
            transition: 'fill 400ms ease',
            transformBox: 'fill-box',
            transformOrigin: 'center',
          }}
        />
      </svg>
      <div className="absolute bottom-3 left-4 rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] shadow-sm">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={String(placed)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="block">
            {placed ? (
              <>
                <span className="font-semibold text-foreground">Added to Bus 2</span>
                <span className="text-muted-foreground"> · 3 seats left</span>
              </>
            ) : (
              <span className="text-muted-foreground">New student: Villa 8, Al Sadd</span>
            )}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}
