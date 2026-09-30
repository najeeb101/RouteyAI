'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { SectionHeading } from '@/components/landing/SectionHeading'

const ROWS = [
  {
    before: 'Routes planned by hand in spreadsheets and maps',
    after: 'Routes generated from student addresses in one click',
  },
  {
    before: 'Parents calling the school to ask where the bus is',
    after: 'Parents see the live bus and ETA on their phone',
  },
  {
    before: 'Paper attendance lists on every bus',
    after: 'One-tap attendance, with parents notified instantly',
  },
  {
    before: 'A new student means re-planning routes',
    after: 'Smart Placement puts them on the nearest bus with space',
  },
]

export function ProblemOutcome() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="mx-auto mb-24 max-w-6xl px-4 sm:px-6 md:mb-32">
      <SectionHeading
        index="01"
        label="Why RouteyAI"
        title="School transport, without the guesswork"
        subtitle="Most schools still run buses on spreadsheets, phone calls and paper lists. RouteyAI replaces all three."
      />

      <div className="border-t border-border">
        <div className="hidden grid-cols-2 gap-10 py-3 text-[13px] font-medium text-muted-foreground md:grid">
          <span>Today</span>
          <span>With RouteyAI</span>
        </div>
        <ul>
          {ROWS.map((row, i) => (
            <motion.li
              key={row.before}
              initial={reduceMotion ? false : 'hidden'}
              whileInView="shown"
              viewport={{ once: true, margin: '-80px' }}
              className="grid gap-2 border-t border-border py-5 md:grid-cols-2 md:gap-10"
            >
              <span className="relative w-fit text-[15px] text-muted-foreground">
                {row.before}
                <motion.span
                  aria-hidden="true"
                  className="absolute left-0 top-1/2 h-px w-full origin-left bg-muted-foreground/70"
                  variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1 } }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: [0.65, 0, 0.35, 1] }}
                />
              </span>
              <motion.span
                className="flex items-start gap-3 text-[15px] font-medium text-foreground"
                variants={{ hidden: { opacity: 0, x: -12 }, shown: { opacity: 1, x: 0 } }}
                transition={{ duration: 0.45, delay: 0.5 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <span aria-hidden="true" className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-primary" />
                {row.after}
              </motion.span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
