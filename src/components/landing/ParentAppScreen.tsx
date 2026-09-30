'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Bus, ClipboardList, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppMapSnippet } from '@/components/landing/AppMapSnippet'
import { PhoneFrame } from '@/components/landing/PhoneFrame'
import { useStepLoop } from '@/components/landing/useStepLoop'

/** Loop: the ETA counts down from 6 min as the bus approaches, then Aisha boards and the push notification arrives. */
const STEPS = [1400, 1100, 1100, 1100, 1100, 1100, 4200] as const
const ETAS = [6, 5, 4, 3, 2, 1] as const
/** Bus position for each step along the route below; the last one is Aisha's stop. */
const BUS_PATH: [number, number][] = [[59, 34], [87, 34], [104, 45], [104, 73], [123, 82], [145, 82], [160, 82]]

const UPDATES = [
  { time: '6:44', body: 'Bus 3 has started the morning route.' },
  { time: '6:50', body: 'Early dismissal on Thursday at 12:30.' },
]

/** The parent app's home screen, redrawn from mobile/src/features/parent/screens/ParentHomeScreen.tsx. */
export function ParentAppScreen({ className }: { className?: string }) {
  const { ref, step } = useStepLoop(STEPS)
  const boarded = step === STEPS.length - 1
  const eta = ETAS[Math.min(step, ETAS.length - 1)]
  const [busX, busY] = BUS_PATH[step] ?? [59, 34]

  return (
    <div ref={ref}>
      <PhoneFrame
        time="6:53"
        className={className}
        label="Parent app: the arrival time counts down as the bus approaches, then a notification says Aisha has boarded"
      >
        {/* Push notification, as sent by supabase/functions/send-notification */}
        <AnimatePresence>
          {boarded && (
            <motion.div
              initial={{ y: -90, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -90, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="absolute inset-x-2 top-9 z-30 flex gap-2.5 rounded-2xl bg-white/95 p-2.5 shadow-lg ring-1 ring-slate-900/5 backdrop-blur"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                <Bus size={15} />
              </span>
              <span className="min-w-0 text-[10px] leading-snug">
                <span className="flex justify-between text-slate-500">
                  <span className="font-semibold uppercase tracking-wide">RouteyAI</span>
                  <span>now</span>
                </span>
                <span className="block font-bold text-slate-900">Aisha has boarded</span>
                <span className="block text-slate-700">Aisha is on the bus and on the way to school.</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-center justify-between bg-slate-900 px-4 pb-2 pt-2">
          <div>
            <p className="text-[15px] font-extrabold text-white">
              Routey<span className="text-accent">AI</span>
            </p>
            <p className="text-[10px] text-white/70">Good morning</p>
          </div>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-white">
            <Bell size={13} />
          </span>
        </div>

        {/* Child */}
        <div className="bg-slate-900 px-4 pb-3.5">
          <div className="flex items-center gap-2.5 rounded-2xl border border-white/5 bg-white/[0.07] p-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-accent bg-primary text-[12px] font-extrabold text-white">
              AM
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-white">Aisha M.</p>
              <p className="text-[9.5px] text-white/70">Bus 3</p>
            </div>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[9px] font-bold transition-colors duration-500',
                boarded ? 'bg-secondary/20 text-secondary' : 'bg-warning/15 text-warning'
              )}
            >
              {boarded ? 'On Bus' : 'Waiting'}
            </span>
          </div>
        </div>

        <div className="space-y-2 p-2.5">
          {/* ETA */}
          <div className="flex items-center justify-between gap-2 rounded-[18px] bg-primary p-3.5 shadow-[0_8px_18px_-8px_hsl(var(--primary)/0.7)]">
            <div className="min-w-0">
              <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-white/75">ETA to your stop</p>
              <p className="relative h-[34px] overflow-hidden text-[26px] font-extrabold leading-tight tracking-tight text-accent">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={boarded ? 'on-bus' : eta}
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="block whitespace-nowrap"
                  >
                    {boarded ? 'On Bus' : `${eta} min`}
                  </motion.span>
                </AnimatePresence>
              </p>
              <p className="text-[9.5px] text-white/75">{boarded ? 'Your child is on the bus' : 'Estimated time based on live GPS'}</p>
            </div>
            <span className="flex flex-col items-center rounded-xl border border-white/10 bg-white/15 px-3 py-2 text-white">
              <MapPin size={15} />
              <span className="mt-0.5 text-[8.5px] font-bold tracking-wider">LIVE</span>
            </span>
          </div>

          {/* Route info with map preview */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="h-[92px] border-b border-slate-100">
              <AppMapSnippet
                route="M 22 34 H 104 V 82 H 212"
                stops={[[22, 34], [104, 58]]}
                bus={{ x: busX, y: busY }}
                instant={step === 0}
                home={[160, 82]}
              />
            </div>
            <div className="space-y-1.5 px-3 py-2.5 text-[10.5px]">
              <p className="flex items-center gap-1.5 font-bold">
                <Bus size={12} className="text-primary" /> Route Info
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Bus</span>
                <span className="font-semibold">Bus 3</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Stop</span>
                <span className="font-semibold">Villa 8, Al Sadd</span>
              </p>
            </div>
          </div>

          {/* Updates */}
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-[10.5px] font-bold">
              <ClipboardList size={12} className="text-primary" /> Today&apos;s Updates
            </p>
            <ul className="mt-2 space-y-1.5">
              {UPDATES.map(update => (
                <li key={update.time} className="flex gap-2 text-[10px]">
                  <span className="w-7 shrink-0 text-slate-500">{update.time}</span>
                  <span className="text-slate-800">{update.body}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PhoneFrame>
    </div>
  )
}
