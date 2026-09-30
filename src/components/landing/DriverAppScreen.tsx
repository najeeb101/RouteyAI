'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Bus, Check, CircleUserRound, Home, List, MessagesSquare, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppMapSnippet } from '@/components/landing/AppMapSnippet'
import { PHONE_MAPS } from '@/components/landing/appMapData'
import { PhoneFrame } from '@/components/landing/PhoneFrame'
import { PhoneTabBar } from '@/components/landing/PhoneTabBar'
import { useStepLoop } from '@/components/landing/useStepLoop'

/**
 * Loop: 0 Maryam waiting → 1 driver taps Board → 2 Maryam boarded → 3 stop done, bus drives to the next stop.
 * Durations in ms. Reduced motion shows step 0.
 */
const STEPS = [2600, 900, 2400, 3600] as const

const MAP = PHONE_MAPS.driver
const STOPS = MAP.route.stops
/** The mockup shows stops 5 and 6 of Bus 1 (indexes 4 and 5). */
const CURRENT = 4
const NEXT = 5
const VILLAS = ['Villa 27', 'Villa 9'] as const

function stopName(index: number, villa: string) {
  return `${villa}, ${(STOPS[index]?.street ?? 'Street').replace(/ Street$/, ' St')}`
}

/** The driver app's route screen, redrawn from mobile/src/features/driver/screens/DriverRouteScreen.tsx. */
export function DriverAppScreen({ className }: { className?: string }) {
  const { ref, step, near } = useStepLoop(STEPS)
  const maryamBoarded = step >= 2
  const stopDone = step === 3
  const boarded = maryamBoarded ? 6 : 5
  const percent = Math.round((boarded / 11) * 100)

  return (
    <div ref={ref}>
      <PhoneFrame
        time="6:52"
        className={className}
        label="Driver app: the driver checks students in at each stop and the bus moves on to the next stop on the map. A student whose parent reported an absence shows as staying home."
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 bg-slate-900 px-4 pb-3 pt-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-white">
            <ArrowLeft size={14} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-extrabold text-white">{MAP.bus}</p>
            <p className="truncate text-[10px] text-white/70">{STOPS.length} stops · Tap Board or Absent</p>
          </div>
        </div>

        {/* Map */}
        <div className="relative h-[132px] border-b border-slate-200 bg-slate-100">
          <AppMapSnippet map={MAP} busAt={(stopDone ? STOPS[NEXT] : STOPS[CURRENT])?.at ?? 0} instant={step === 0} duration={2} loadMap={near} />
          <div className="absolute inset-x-2.5 bottom-2 flex items-center justify-between rounded-xl bg-slate-900/85 px-3 py-1.5 text-[10px]">
            <span className="font-bold text-white">
              {MAP.bus} · {STOPS.length} stops
            </span>
            <span className="flex items-center gap-1 text-white/75">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary motion-reduce:animate-none" />
              Live
            </span>
          </div>
          <span className="absolute right-1.5 top-1 text-[6.5px] text-slate-500">© OpenStreetMap</span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2.5">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Users size={13} className="text-slate-500" />
            <span className="font-bold tabular-nums">{boarded}/11</span>
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
        <div className="space-y-2 p-2.5 pb-16">
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
                <p className="truncate text-[11px] font-bold">{stopName(CURRENT, VILLAS[0])}</p>
                <p className={cn('text-[9px]', stopDone ? 'text-slate-600' : 'text-primary')}>{maryamBoarded ? '2/3' : '1/3'} boarded · 1 staying home</p>
              </div>
              <span className={cn('text-[10px] font-bold', stopDone ? 'text-emerald-700' : 'text-primary')}>{stopDone ? 'Done' : 'Now'}</span>
            </div>
            <StudentRow initials="OK" name="Omar K." boarded />
            <StudentRow initials="MS" name="Maryam S." boarded={maryamBoarded} pressing={step === 1} />
            <StudentRow initials="SK" name="Sara K." boarded={false} staying="Sick" />
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
              {stopDone ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : NEXT + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold">{stopName(NEXT, VILLAS[1])}</p>
              <p className={cn('text-[9px]', stopDone ? 'text-primary' : 'text-slate-500')}>0/1 boarded</p>
            </div>
            <span className={cn('text-[10px] font-bold', stopDone ? 'text-primary' : 'text-slate-500')}>{stopDone ? 'Now' : `Stop ${NEXT + 1}`}</span>
          </div>
        </div>

        <PhoneTabBar
          active="Route"
          items={[
            { label: 'Home', icon: Bus },
            { label: 'Route', icon: List },
            { label: 'Messages', icon: MessagesSquare },
            { label: 'Account', icon: CircleUserRound },
          ]}
        />
      </PhoneFrame>
    </div>
  )
}

function StudentRow({
  initials,
  name,
  boarded,
  pressing = false,
  staying,
}: {
  initials: string
  name: string
  boarded: boolean
  pressing?: boolean
  /** The reason, when a parent reported the student absent for today. */
  staying?: string
}) {
  return (
    <div className={cn('flex items-center gap-2 border-t border-slate-100 px-3 py-2', staying && 'bg-amber-50')}>
      <span
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-full border text-[9px] font-bold transition-colors duration-500',
          boarded ? 'border-secondary/30 bg-secondary/15 text-emerald-700' : staying ? 'border-amber-300 bg-amber-100 text-amber-700' : 'border-primary-light/30 bg-primary-light/10 text-primary'
        )}
      >
        {initials}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn('block text-[10.5px] font-semibold transition-colors', boarded || staying ? 'text-slate-600' : 'text-slate-900')}>{name}</span>
        {staying && (
          <span className="flex items-center gap-1 whitespace-nowrap text-[8.5px] font-semibold text-amber-700">
            <Home size={8} strokeWidth={2.6} /> Staying home
          </span>
        )}
        {staying && (
          <span className="block whitespace-nowrap text-[8px] text-amber-700/80">Parent says: {staying.toLowerCase()}</span>
        )}
      </span>
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
          <motion.span key="actions" exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15 }} className={cn('flex gap-1', staying && 'opacity-60')}>
            <span
              className={cn(
                'rounded-lg border px-2 py-1 text-[9px] font-bold transition-all duration-200',
                pressing ? 'scale-95 border-secondary/40 bg-secondary/20 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-600'
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
