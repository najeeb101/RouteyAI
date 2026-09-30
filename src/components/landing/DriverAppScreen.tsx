'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppMapSnippet } from '@/components/landing/AppMapSnippet'
import { PhoneFrame } from '@/components/landing/PhoneFrame'
import { useStepLoop } from '@/components/landing/useStepLoop'

/**
 * Loop: 0 Maryam waiting → 1 driver taps Board → 2 Maryam boarded → 3 stop done, bus drives to the next stop.
 * Durations in ms. Reduced motion shows step 0.
 */
const STEPS = [2600, 900, 2400, 3600] as const

const ROUTE = 'M 22 34 H 58 V 82 H 150 V 58 H 212 V 20'
const STOPS: [number, number][] = [[22, 34], [58, 60], [104, 82], [150, 70], [212, 58], [212, 20]]

/** The driver app's route screen, redrawn from mobile/src/features/driver/screens/DriverRouteScreen.tsx. */
export function DriverAppScreen({ className }: { className?: string }) {
  const { ref, step } = useStepLoop(STEPS)
  const maryamBoarded = step >= 2
  const stopDone = step === 3
  const boarded = maryamBoarded ? 6 : 5
  const percent = Math.round((boarded / 12) * 100)

  return (
    <div ref={ref}>
      <PhoneFrame
        time="6:52"
        className={className}
        label="Driver app: the driver checks students in at each stop, and the route moves on to the next stop"
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 bg-slate-900 px-4 pb-3 pt-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-white">
            <ArrowLeft size={14} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-extrabold text-white">Route 3 · Al Waab</p>
            <p className="text-[10px] text-white/70">Bus 3 · Tap to check in</p>
          </div>
        </div>

        {/* Map */}
        <div className="relative h-[132px] border-b border-slate-200">
          <AppMapSnippet
            route={ROUTE}
            stops={STOPS}
            bus={stopDone ? { x: [58, 58, 104], y: [60, 82, 82] } : { x: 58, y: 60 }}
            instant={step === 0}
          />
          <div className="absolute inset-x-2.5 bottom-2 flex items-center justify-between rounded-xl bg-slate-900/85 px-3 py-1.5 text-[10px]">
            <span className="font-bold text-white">Route 3 · 6 stops</span>
            <span className="flex items-center gap-1 text-white/70">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary motion-reduce:animate-none" />
              Active
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2.5">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Users size={13} className="text-slate-500" />
            <span className="font-bold tabular-nums">{boarded}/12</span>
            <span className="text-slate-500">boarded</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
              <span className="block h-full rounded-full bg-primary transition-[width] duration-700" style={{ width: `${percent}%` }} />
            </span>
            <span className="rounded-md bg-primary-light/10 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-primary">{percent}%</span>
          </span>
        </div>

        {/* Stops */}
        <div className="space-y-2 p-2.5">
          <DoneStop name="Villa 12, Al Waab St" caption="2/2 boarded" time="6:41" />

          <div
            className={cn(
              'overflow-hidden rounded-2xl border-[1.5px] bg-white transition-colors duration-500',
              stopDone ? 'border-secondary/60' : 'border-primary-light'
            )}
          >
            <div className={cn('flex items-center gap-2.5 px-3 py-2 transition-colors duration-500', stopDone ? 'bg-secondary/10' : 'bg-primary-light/10')}>
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full transition-colors duration-500',
                  stopDone ? 'bg-secondary text-white' : 'bg-primary-light'
                )}
              >
                {stopDone ? <Check size={11} strokeWidth={3.5} /> : <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-bold">Al Furousiya St</p>
                <p className={cn('text-[9px]', stopDone ? 'text-slate-600' : 'text-primary')}>{maryamBoarded ? '2/2' : '1/2'} boarded</p>
              </div>
              <span className={cn('text-right text-[10px] font-bold leading-tight', stopDone ? 'text-emerald-700' : 'text-primary')}>
                6:52
                {!stopDone && <span className="block text-[8px] font-semibold">Now</span>}
              </span>
            </div>
            <StudentRow initials="OK" name="Omar K." grade="Grade 4" boarded />
            <StudentRow initials="MS" name="Maryam S." grade="Grade 2" boarded={maryamBoarded} pressing={step === 1} />
          </div>

          <div
            className={cn(
              'flex items-center gap-2.5 rounded-2xl border px-3 py-2 transition-colors duration-500',
              stopDone ? 'border-[1.5px] border-primary-light bg-primary-light/10' : 'border-slate-200 bg-white'
            )}
          >
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold transition-colors duration-500',
                stopDone ? 'bg-primary-light' : 'bg-slate-100 text-slate-500'
              )}
            >
              {stopDone ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : 3}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold">Al Luqta St</p>
              <p className={cn('text-[9px]', stopDone ? 'text-primary' : 'text-slate-500')}>0/3 boarded</p>
            </div>
            <span className={cn('text-right text-[10px] font-bold leading-tight', stopDone ? 'text-primary' : 'text-slate-500')}>
              7:01
              {stopDone && <span className="block text-[8px] font-semibold">Next</span>}
            </span>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3 py-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500">4</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold">Villa 8, Al Sadd</p>
              <p className="text-[9px] text-slate-500">0/2 boarded</p>
            </div>
            <span className="text-[10px] font-bold text-slate-500">7:09</span>
          </div>
        </div>
      </PhoneFrame>
    </div>
  )
}

function DoneStop({ name, caption, time }: { name: string; caption: string; time: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-secondary/60 bg-secondary/10 px-3 py-2">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-white">
        <Check size={11} strokeWidth={3.5} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-bold text-slate-600">{name}</p>
        <p className="text-[9px] text-slate-600">{caption}</p>
      </div>
      <span className="text-[10px] font-bold text-emerald-700">{time}</span>
    </div>
  )
}

function StudentRow({
  initials,
  name,
  grade,
  boarded,
  pressing = false,
}: {
  initials: string
  name: string
  grade: string
  boarded: boolean
  pressing?: boolean
}) {
  return (
    <div className="flex items-center gap-2 border-t border-slate-100 px-3 py-2">
      <span
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-full border text-[9px] font-bold transition-colors duration-500',
          boarded ? 'border-secondary/30 bg-secondary/15 text-emerald-700' : 'border-primary-light/30 bg-primary-light/10 text-primary'
        )}
      >
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn('text-[10.5px] font-semibold transition-colors', boarded ? 'text-slate-600' : 'text-slate-900')}>{name}</p>
        <p className="text-[9px] text-slate-500">{grade}</p>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {boarded ? (
          <motion.span
            key="boarded"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 24 }}
            className="rounded-lg border border-secondary/30 bg-secondary/15 px-2 py-1 text-[9px] font-bold text-emerald-700"
          >
            ✓ Boarded
          </motion.span>
        ) : (
          <motion.span key="actions" exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15 }} className="flex gap-1">
            <span
              className={cn(
                'rounded-lg border px-2 py-1 text-[9px] font-bold transition-all duration-200',
                pressing
                  ? 'scale-95 border-secondary/40 bg-secondary/20 text-emerald-700'
                  : 'border-slate-200 bg-slate-100 text-slate-600'
              )}
            >
              Board
            </span>
            <span className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-600">Absent</span>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
