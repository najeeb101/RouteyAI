'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTicker } from '@/components/landing/visuals/useTicker'

/** Attendance: students checked off one by one */
const RIDERS = [
  { name: 'Aisha M.', absent: false },
  { name: 'Omar K.', absent: false },
  { name: 'Maryam S.', absent: true },
  { name: 'Yusuf A.', absent: false },
]

export function AttendanceVisual() {
  const { ref, tick, reduceMotion } = useTicker(900)
  const marked = reduceMotion ? RIDERS.length : tick % (RIDERS.length + 3)
  const boarded = RIDERS.slice(0, marked).filter(r => !r.absent).length
  return (
    <div ref={ref} className="flex h-full min-h-[170px] flex-col justify-center gap-1.5 px-5 py-4">
      {RIDERS.map((rider, i) => {
        const done = i < marked
        return (
          <div key={rider.name} className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-1.5 text-[12px]">
            <span className="text-foreground">{rider.name}</span>
            <AnimatePresence mode="wait" initial={false}>
              {done ? (
                <motion.span
                  key="done"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                  className={cn('flex items-center gap-1 font-medium', rider.absent ? 'text-muted-foreground' : 'text-secondary')}
                >
                  {rider.absent ? <X size={13} strokeWidth={3} /> : <Check size={13} strokeWidth={3} />}
                  {rider.absent ? 'Absent' : 'Boarded'}
                </motion.span>
              ) : (
                <motion.span key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-muted-foreground">
                  Waiting
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )
      })}
      <p className="pt-1 text-[11px] text-muted-foreground">
        {boarded} of {RIDERS.filter(r => !r.absent).length} expected students boarded
      </p>
    </div>
  )
}
