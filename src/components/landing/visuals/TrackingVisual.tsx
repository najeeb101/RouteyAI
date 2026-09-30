'use client'

import { motion } from 'framer-motion'
import { ROUTE_COLORS } from '@/components/landing/routeColors'
import { useTicker } from '@/components/landing/visuals/useTicker'

/** Real-time tracking: a bus gliding between stops */
export function TrackingVisual() {
  const { ref, tick, reduceMotion } = useTicker(1000)
  const stops = [40, 150, 260, 370, 480]
  return (
    <div ref={ref} className="relative h-full min-h-[170px]">
      <svg viewBox="0 0 520 170" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <path d="M 40 110 H 480" stroke={ROUTE_COLORS[0]} strokeOpacity="0.25" strokeWidth="5" strokeLinecap="round" />
        <motion.path
          d="M 40 110 H 480"
          stroke={ROUTE_COLORS[0]}
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ pathLength: reduceMotion ? 0.6 : 0 }}
          animate={reduceMotion ? undefined : { pathLength: [0, 1, 1] }}
          transition={{ duration: 9, times: [0, 0.9, 1], repeat: Infinity, ease: 'linear' }}
        />
        {stops.map(x => (
          <circle key={x} cx={x} cy="110" r="6" className="fill-card" stroke={ROUTE_COLORS[0]} strokeWidth="2.5" />
        ))}
        <motion.g
          initial={{ x: reduceMotion ? 304 : 40, opacity: 1 }}
          animate={reduceMotion ? undefined : { x: [40, 480, 480], opacity: [1, 1, 0] }}
          transition={{ duration: 9, times: [0, 0.9, 1], repeat: Infinity, ease: 'linear' }}
        >
          <circle cy="110" r="14" fill={ROUTE_COLORS[0]} opacity="0.18" />
          <circle cy="110" r="8" fill={ROUTE_COLORS[0]} className="stroke-card" strokeWidth="3" />
        </motion.g>
      </svg>
      <div className="absolute left-4 top-4 rounded-md border border-border bg-card px-2.5 py-1.5 text-[11px] shadow-sm">
        <span className="font-semibold text-foreground">Bus 1</span>
        <span className="text-muted-foreground"> · location updated {reduceMotion ? 3 : (tick % 10) + 1} s ago</span>
      </div>
    </div>
  )
}
