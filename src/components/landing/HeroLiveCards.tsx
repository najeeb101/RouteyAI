'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bus, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStepLoop } from '@/components/landing/useStepLoop'

/**
 * What a parent sees during one pickup: the arrival time counts down, the "almost there" alert arrives at 5 minutes,
 * then the boarding notification. Notification text matches supabase/functions/send-notification.
 */
const ETAS = [6, 5, 4, 3, 2, 1] as const
const STEPS = [1600, 1600, 1600, 1600, 1600, 1600, 1500, 5200] as const
const AT_STOP = ETAS.length
const BOARDED = ETAS.length + 1

const NOTIFICATIONS = {
  arriving: { title: 'Bus arriving in ~5 minutes', body: 'Get Aisha ready - the bus is almost at your stop.' },
  boarded: { title: 'Aisha has boarded', body: 'Aisha is on the bus and on the way to school.' },
} as const

/** Stop dots on the ETA card's route line: the pickups before Aisha's, then her stop. */
const STOPS = 5

export function HeroLiveCards() {
  const { ref, step, reduceMotion } = useStepLoop(STEPS, 2)
  const notification = step >= BOARDED ? 'boarded' : step >= 1 ? 'arriving' : null
  const eta = ETAS[Math.min(step, ETAS.length - 1)]
  const passed = step >= AT_STOP ? STOPS : Math.min(STOPS - 1, Math.floor(step / 2) + 1)
  const desktop = useDesktop()

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/*
        Arrival card: desktop only, top right. Not rendered at all on smaller screens, where CSS used to hide it while
        it kept re-rendering and animating every 1.6 s.
      */}
      {desktop && (
        <div
          className="absolute top-[17%] w-[17.5rem] animate-fade-up motion-reduce:animate-none"
          style={{ right: 'max(1.5rem, calc((100% - 72rem) / 2 + 1.5rem))', animationDelay: '700ms' }}
        >
          <div className="rounded-2xl border border-border/70 bg-card/95 p-4 shadow-[0_24px_48px_-24px_hsl(var(--brand-ink)/0.55)]">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-semibold text-foreground">Bus 3 · Al Waab</span>
              <span className="flex items-center gap-1.5 font-medium text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                Live
              </span>
            </div>
            <p className="mt-3 text-[13px] text-muted-foreground">
              {step >= BOARDED ? 'Aisha is on the bus. At school by' : step === AT_STOP ? 'The bus is at your stop' : 'Arriving at your stop in'}
            </p>
            <div className="relative mt-0.5 h-11 overflow-hidden font-display text-[2.1rem] font-bold leading-[2.75rem] tracking-tight text-foreground tabular-nums">
              <AnimatePresence initial={false}>
                <motion.span
                  key={step >= AT_STOP ? `state-${step >= BOARDED}` : eta}
                  initial={reduceMotion ? false : { y: 28, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -28, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  {step >= BOARDED ? '7:24' : step === AT_STOP ? 'Now' : `${eta} min`}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="mt-3 flex items-center">
              {Array.from({ length: STOPS }, (_, i) => (
                <span key={i} className="flex flex-1 items-center last:flex-none">
                  <span
                    className={cn(
                      'h-2.5 w-2.5 shrink-0 rounded-full border-2 transition-colors duration-500',
                      i < passed ? 'border-primary bg-primary' : i === STOPS - 1 ? 'border-primary bg-card' : 'border-border bg-card'
      )}
                />
                {i < STOPS - 1 && (
                  <span className={cn('h-0.5 flex-1 transition-colors duration-500', i < passed - 1 ? 'bg-primary' : 'bg-border')} />
                )}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-muted-foreground">Your stop: Villa 12, Al Waab St</p>
        </div>
      </div>
      )}

      {/* Push notification: below the bus on desktop, above it at the top of the photo on phones. */}
      <div
        className="absolute left-4 right-4 top-2 animate-fade-up motion-reduce:animate-none sm:left-auto sm:w-[21rem] lg:bottom-[9%] lg:top-auto"
        style={{ right: 'max(1rem, calc((100% - 72rem) / 2 + 4.5rem))', animationDelay: '1100ms' }}
      >
        <div className="relative h-[78px]">
          <AnimatePresence initial={false}>
            {notification && (
              <motion.div
                key={notification}
                initial={reduceMotion ? false : { y: 18, opacity: 0, scale: 0.97 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -12, opacity: 0, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                className="absolute inset-x-0 bottom-0 flex gap-3 rounded-2xl border border-border/70 bg-card/95 p-3 shadow-[0_24px_48px_-24px_hsl(var(--brand-ink)/0.55)]"
              >
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white',
                    notification === 'boarded' ? 'bg-secondary' : 'bg-brand'
                  )}
                >
                  {notification === 'boarded' ? <CheckCircle2 size={18} /> : <Bus size={17} />}
                </span>
                <span className="min-w-0 text-[13px] leading-snug">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-semibold text-foreground">{NOTIFICATIONS[notification].title}</span>
                    <span className="shrink-0 text-[12px] text-muted-foreground">now</span>
                  </span>
                  <span className="mt-0.5 block text-muted-foreground">{NOTIFICATIONS[notification].body}</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

/** True from Tailwind's `lg` breakpoint up. False during server render and hydration, so nothing mismatches. */
function useDesktop() {
  const [desktop, setDesktop] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    const update = () => setDesktop(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return desktop
}
