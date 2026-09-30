'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { OptimizeDemo, type PlannerStage } from '@/components/landing/OptimizeDemo'
import { SectionHeading } from '@/components/landing/SectionHeading'

const STEPS = [
  {
    title: 'Add your students',
    desc: 'Enter each student’s home address. RouteyAI finds it and puts it on the map.',
  },
  {
    title: 'Plan the routes',
    desc: 'Press Optimize. Students are grouped by area, no bus goes over its seat count, and the stops are put in order using real road travel times. A student who joins mid-year goes to the nearest bus with a free seat.',
  },
  {
    title: 'Invite drivers and parents',
    desc: 'Assign a driver to each bus and send every parent a personal invite link. Each person signs in to their own view.',
  },
  {
    title: 'Run the route',
    desc: 'The driver starts the route and marks each student boarded or absent. Parents follow the bus on a map and get a notification when their child boards.',
  },
] as const

/** How long the phone layout stays on each step while it plays through them. */
const AUTOPLAY_MS = [3500, 6000, 3800, 5000] as const

export function HowItWorks() {
  const [active, setActive] = useState<PlannerStage>(0)
  const [desktop, setDesktop] = useState(false)
  const stepRefs = useRef<(HTMLLIElement | null)[]>([])
  const panelRef = useRef<HTMLDivElement>(null)
  const panelInView = useInView(panelRef, { margin: '-10% 0px' })
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Wide screens: the panel stays pinned and follows the step crossing the middle of the viewport.
  useEffect(() => {
    if (!desktop) return
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step) as PlannerStage)
        }
      },
      { rootMargin: '-45% 0px -45% 0px' }
    )
    stepRefs.current.forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [desktop])

  // Phones: no room to pin the panel, so it plays through the steps while it's on screen.
  useEffect(() => {
    if (desktop || !panelInView || reduceMotion) return
    const id = window.setTimeout(() => setActive(s => ((s + 1) % STEPS.length) as PlannerStage), AUTOPLAY_MS[active])
    return () => window.clearTimeout(id)
  }, [desktop, panelInView, reduceMotion, active])

  const stage: PlannerStage = !desktop && reduceMotion ? 1 : active

  return (
    <section id="how-it-works" className="scroll-mt-20 border-y border-border bg-muted/60">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <SectionHeading title="From a list of addresses to buses on the road" intro="Four steps to your first morning run." />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <ol className="lg:py-[16vh]">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                data-step={i}
                ref={el => {
                  stepRefs.current[i] = el
                }}
                className={cn(
                  'flex gap-5 py-4 transition-opacity duration-500 lg:min-h-[44vh] lg:items-center lg:py-0',
                  stage === i ? 'opacity-100' : 'opacity-100 lg:opacity-35'
                )}
              >
                <div className="flex gap-5">
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-display text-sm font-bold transition-colors duration-500',
                      stage === i ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground'
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className="pt-1">
                    <h3 className="font-display text-xl font-bold tracking-tight text-foreground md:text-2xl">{step.title}</h3>
                    <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground md:text-base">{step.desc}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div
            ref={panelRef}
            className="order-first min-w-0 self-start lg:sticky lg:order-none"
            style={{ top: 'max(5.5rem, calc(50vh - 19rem))' }}
          >
            <OptimizeDemo stage={stage} inView={panelInView} />
            <div className="mt-4 flex gap-1.5 lg:hidden" aria-hidden="true">
              {STEPS.map((step, i) => (
                <span key={step.title} className={cn('h-1 flex-1 rounded-full transition-colors duration-500', stage === i ? 'bg-primary' : 'bg-border')} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
