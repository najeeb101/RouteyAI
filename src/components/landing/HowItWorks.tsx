'use client'

import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import { SectionHeading } from '@/components/landing/SectionHeading'

const STEPS = [
  {
    title: 'Add your students',
    desc: 'Enter each student’s home address. RouteyAI places it on the map automatically.',
  },
  {
    title: 'Optimize routes',
    desc: 'One click groups students by area, assigns buses within capacity, and orders every stop using real road travel times.',
  },
  {
    title: 'Invite drivers & parents',
    desc: 'Assign a driver to each bus and send invite links. Everyone signs in to the right view for their role.',
  },
  {
    title: 'Go live',
    desc: 'Drivers start the route and mark attendance. Parents follow the bus live and get notified at every step.',
  },
]

export function HowItWorks() {
  const ref = useRef<HTMLOListElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 45%'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 })
  const progress = reduceMotion ? scrollYProgress : smooth
  const [reached, setReached] = useState(0)

  useMotionValueEvent(progress, 'change', value => {
    if (reduceMotion) return
    const next = Math.min(STEPS.length, Math.floor(value * STEPS.length + 0.35))
    setReached(prev => (prev === next ? prev : next))
  })

  const fill = useTransform(progress, v => (reduceMotion ? 1 : v))
  const busX = useTransform(fill, v => `${v * 100}%`)

  return (
    <section id="how-it-works" className="mx-auto mb-24 max-w-6xl scroll-mt-24 px-4 sm:px-6 md:mb-32">
      <SectionHeading
        index="02"
        label="How it works"
        title="From address list to live buses in four stops"
        subtitle="No zones to draw and no routes to plan by hand."
      />

      <ol ref={ref} className="relative grid gap-10 pl-14 lg:grid-cols-4 lg:gap-8 lg:pl-0 lg:pt-14">
        {/* Track — horizontal on desktop */}
        <div aria-hidden="true" className="absolute left-[18px] right-0 top-[17px] hidden h-[3px] rounded-full bg-border lg:block">
          <motion.div className="h-full origin-left rounded-full bg-primary" style={{ scaleX: fill }} />
          <motion.div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: busX }}>
            <span className="block h-3.5 w-6 rounded-[5px] bg-primary ring-4 ring-background" />
          </motion.div>
        </div>
        {/* Track — vertical on mobile */}
        <div aria-hidden="true" className="absolute bottom-2 left-[17px] top-[18px] w-[3px] rounded-full bg-border lg:hidden">
          <motion.div className="w-full origin-top rounded-full bg-primary" style={{ scaleY: fill, height: '100%' }} />
        </div>

        {STEPS.map((step, i) => {
          const active = reduceMotion || i < reached
          return (
            <li key={step.title} className="relative">
              <motion.span
                aria-hidden="true"
                animate={{ scale: active ? 1 : 0.86 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                className={cn(
                  'absolute -left-14 top-0 flex h-9 w-9 items-center justify-center rounded-full border-2 font-mono text-[13px] font-semibold transition-colors duration-300 lg:-top-14 lg:left-0',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground'
                )}
              >
                {i + 1}
              </motion.span>
              <h3
                className={cn(
                  'pt-1.5 text-[17px] font-semibold tracking-tight transition-colors duration-300 lg:pt-0',
                  active ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
