'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { useTicker } from '@/components/landing/visuals/useTicker'

/** Alerts stacking in */
const ALERTS = [
  { title: 'Bus 2 running 5 min late', meta: 'Sent to 24 parents' },
  { title: 'Early dismissal Thursday', meta: 'Sent to all drivers' },
  { title: 'Bus 1 is 5 min away', meta: 'ETA alert · Aisha’s stop' },
]

export function AlertsVisual() {
  const { ref, tick, reduceMotion } = useTicker(1800)
  const count = reduceMotion ? ALERTS.length : (tick % (ALERTS.length + 2)) + 1
  const visible = ALERTS.slice(0, Math.min(count, ALERTS.length))
  return (
    <div ref={ref} className="flex h-full min-h-[170px] flex-col justify-start gap-1.5 overflow-hidden px-5 py-4">
      <AnimatePresence initial={false}>
        {visible
          .slice()
          .reverse()
          .map(alert => (
            <motion.div
              key={alert.title}
              layout={!reduceMotion}
              initial={{ opacity: 0, y: -14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-start gap-2.5 rounded-md border border-border bg-card px-3 py-2 text-[12px] shadow-sm"
            >
              <Bell size={13} className="mt-0.5 shrink-0 text-primary" />
              <span>
                <span className="block font-medium text-foreground">{alert.title}</span>
                <span className="text-muted-foreground">{alert.meta}</span>
              </span>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  )
}
