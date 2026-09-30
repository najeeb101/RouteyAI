'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

/** Fleet capacity meters */
const FLEET = [
  { bus: 'Bus 1', filled: 34, seats: 40 },
  { bus: 'Bus 2', filled: 38, seats: 40 },
  { bus: 'Bus 3', filled: 21, seats: 32 },
  { bus: 'Bus 4', filled: 27, seats: 40 },
]

export function CapacityVisual() {
  const reduceMotion = useReducedMotion()
  return (
    <div className="flex h-full min-h-[170px] flex-col justify-center gap-3 px-5 py-4">
      {FLEET.map((row, i) => {
        const ratio = row.filled / row.seats
        const nearlyFull = ratio >= 0.9
        return (
          <div key={row.bus}>
            <div className="mb-1 flex items-baseline justify-between text-[12px]">
              <span className="text-foreground">{row.bus}</span>
              <span className="text-muted-foreground">
                {nearlyFull && <span className="mr-1.5 font-medium text-warning">Nearly full</span>}
                {row.filled} / {row.seats}
              </span>
            </div>
            <div className={cn('h-2 overflow-hidden rounded-full', nearlyFull ? 'bg-warning/20' : 'bg-primary/15')}>
              <motion.div
                className={cn('h-full rounded-full', nearlyFull ? 'bg-warning' : 'bg-primary')}
                initial={{ width: reduceMotion ? `${ratio * 100}%` : '0%' }}
                whileInView={{ width: `${ratio * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
