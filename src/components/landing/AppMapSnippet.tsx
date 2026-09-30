'use client'

import { motion } from 'framer-motion'

/** Small street-map drawing used inside the phone mockups: blocks, roads, a park, one route and a moving bus. */
export function AppMapSnippet({
  route,
  stops,
  bus,
  instant = false,
  home,
}: {
  route: string
  stops: [number, number][]
  /** Bus position; pass arrays of keyframes to move it along the route. */
  bus: { x: number | number[]; y: number | number[] }
  /** Jump to the new position instead of animating (used when a loop restarts). */
  instant?: boolean
  home?: [number, number]
}) {
  return (
    <svg viewBox="0 0 252 140" className="block h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="252" height="140" className="fill-slate-100" />
      {/* Park and water */}
      <rect x="168" y="12" width="58" height="36" rx="6" className="fill-secondary/20" />
      <path d="M 0 118 C 40 110, 70 132, 110 124 L 110 140 L 0 140 Z" className="fill-accent/25" />
      {/* Roads */}
      <g className="stroke-white" strokeWidth="7" fill="none" strokeLinecap="round">
        <path d="M -5 34 H 257" />
        <path d="M -5 82 H 257" />
        <path d="M 58 -5 V 145" />
        <path d="M 150 -5 V 145" />
        <path d="M 212 -5 V 145" />
      </g>
      <g className="stroke-white" strokeWidth="3.5" fill="none">
        <path d="M -5 58 H 257" />
        <path d="M 104 -5 V 145" />
        <path d="M 10 110 L 90 34" />
      </g>
      {/* Route */}
      <path d={route} fill="none" className="stroke-primary" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {stops.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4" className="fill-secondary stroke-white" strokeWidth="2" />
      ))}
      {home && <circle cx={home[0]} cy={home[1]} r="6" className="fill-warning stroke-white" strokeWidth="2.5" />}
      {/* Bus */}
      <motion.g
        initial={false}
        animate={{ x: bus.x, y: bus.y }}
        transition={instant ? { duration: 0 } : { duration: 1.4, ease: 'easeInOut' }}
      >
        <rect x="-15" y="-8" width="30" height="16" rx="5" className="fill-primary" />
        <text y="3.5" textAnchor="middle" className="fill-white text-[8px] font-extrabold">BUS 3</text>
      </motion.g>
    </svg>
  )
}
