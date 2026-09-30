'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Bus, CircleUserRound, Clock, Home, House, Navigation } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppMapSnippet } from '@/components/landing/AppMapSnippet'
import { PHONE_MAPS } from '@/components/landing/appMapData'
import { PhoneFrame } from '@/components/landing/PhoneFrame'
import { PhoneTabBar } from '@/components/landing/PhoneTabBar'
import { useStepLoop } from '@/components/landing/useStepLoop'

/** Loop: the ETA counts down from 6 min as the bus drives to Aisha's stop, then she boards and the push notification arrives. */
const STEPS = [1400, 1100, 1100, 1100, 1100, 1100, 4200] as const
const ETAS = [6, 5, 4, 3, 2, 1] as const

const MAP = PHONE_MAPS.parent
/** Aisha's stop is the 8th stop of Bus 3; the bus comes from the 7th. */
const HOME = 7
const FROM = MAP.route.stops[HOME - 1]?.at ?? 0
const TO = MAP.route.stops[HOME]?.at ?? 0
const STOP_NAME = (MAP.route.stops[HOME]?.street ?? 'Street').replace(/ Street$/, ' St')

/** The parent app's live map (Track tab), redrawn from mobile/src/features/parent/screens/ParentMapScreen.tsx. */
export function ParentAppScreen({ className }: { className?: string }) {
  const { ref, step, near } = useStepLoop(STEPS)
  const boarded = step === STEPS.length - 1
  const eta = ETAS[Math.min(step, ETAS.length - 1)]
  const busAt = FROM + ((TO - FROM) * Math.min(step, ETAS.length)) / ETAS.length

  return (
    <div ref={ref}>
      <PhoneFrame
        time="6:53"
        className={className}
        label="Parent app: a live street map shows the bus driving to the child's stop while the arrival time counts down, then a notification says Aisha has boarded. Chips at the top switch between the parent's children."
      >
        {/* Map */}
        <div className="absolute inset-x-0 bottom-[50px] top-[34px] bg-slate-100">
          <AppMapSnippet map={MAP} busAt={busAt} instant={step === 0} showStops={false} home={HOME} homeLabel="Aisha’s stop" duration={1} loadMap={near} />
          <span className="absolute bottom-[132px] right-2 text-[6.5px] text-slate-500">© OpenStreetMap</span>
        </div>

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

        {/* Children */}
        <div className="absolute inset-x-2.5 top-[44px] z-10 flex gap-1.5">
          <ChildChip initials="AM" name="Aisha" status={boarded ? 'On the bus' : 'Waiting'} dot={boarded ? 'bg-emerald-500' : 'bg-sky-500'} selected />
          <ChildChip initials="YM" name="Yousef" status="Staying home" dot="bg-amber-500" />
        </div>

        {/* Bottom card */}
        <div className="absolute inset-x-2.5 bottom-[58px] z-10 rounded-[18px] bg-white p-3 shadow-[0_8px_24px_-8px_rgba(15,23,42,0.35)]">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="relative h-[24px] overflow-hidden text-[18px] font-extrabold leading-tight tracking-tight text-slate-900">
                <AnimatePresence initial={false}>
                  <motion.span
                    key={boarded ? 'on-bus' : eta}
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-x-0 top-0 block whitespace-nowrap"
                  >
                    {boarded ? 'On the bus' : `${eta} min away`}
                  </motion.span>
                </AnimatePresence>
              </p>
              <p className="text-[9.5px] font-medium text-slate-500">{boarded ? 'Boarded at 6:53 AM' : 'Your stop is next'}</p>
            </div>
            <span
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold transition-colors duration-500',
                boarded ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
              )}
            >
              {boarded ? <Bus size={9} /> : <Clock size={9} />}
              {boarded ? 'On the bus' : 'Waiting'}
            </span>
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
            <InfoTile icon={<Bus size={12} />} label="Bus" value={MAP.bus} />
            <InfoTile icon={<House size={12} />} label="Stop" value={STOP_NAME} />
          </div>
        </div>

        <PhoneTabBar
          active="Track"
          items={[
            { label: 'Home', icon: Home },
            { label: 'Track', icon: Navigation },
            { label: 'History', icon: Clock },
            { label: 'Alerts', icon: Bell },
            { label: 'Account', icon: CircleUserRound },
          ]}
        />
      </PhoneFrame>
    </div>
  )
}

function ChildChip({ initials, name, status, dot, selected = false }: { initials: string; name: string; status: string; dot: string; selected?: boolean }) {
  return (
    <span
      className={cn(
        'flex min-w-0 items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 shadow-[0_3px_8px_rgba(15,23,42,0.15)]',
        selected ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
      )}
    >
      <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[8.5px] font-extrabold text-white', selected ? 'bg-primary ring-2 ring-sky-400' : 'bg-sky-600')}>
        {initials}
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block text-[10px] font-bold">{name}</span>
        <span className={cn('flex items-center gap-1 whitespace-nowrap text-[8px]', selected ? 'text-white/70' : 'text-slate-500')}>
          <span className={cn('h-1.5 w-1.5 rounded-full transition-colors duration-500', dot)} />
          {status}
        </span>
      </span>
    </span>
  )
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5 rounded-xl bg-slate-100 px-2 py-1.5">
      <span className="text-primary-light">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[7px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        <span className="block truncate text-[9.5px] font-bold text-slate-900">{value}</span>
      </span>
    </span>
  )
}
