'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

/** The real school-admin dashboard, tilting up into place as it scrolls into view. */
export function ProductShot() {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const rotateX = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [14, 0])
  const scale = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [0.92, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.35], reduceMotion ? [1, 1] : [0.4, 1])

  return (
    <section aria-label="School admin dashboard" className="mx-auto mb-24 max-w-6xl px-4 sm:px-6 md:mb-32">
      <div ref={ref} style={{ perspective: 1400 }}>
        <motion.figure
          style={{ rotateX, scale, opacity, transformOrigin: 'center top' }}
          className="overflow-hidden rounded-lg border border-border bg-card shadow-[0_40px_80px_-40px_rgb(15_23_42/0.45)]"
        >
          <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
            <span className="rounded bg-muted px-2.5 py-1 font-mono text-[11px] text-muted-foreground">routeyai.vercel.app/school</span>
          </div>
          <Image
            src="/assets/dashboard-screenshot.png"
            alt="RouteyAI school admin dashboard with the live fleet map and route stats"
            width={1200}
            height={675}
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="h-auto w-full"
          />
          <figcaption className="border-t border-border px-4 py-3 text-[13px] text-muted-foreground">
            The school admin dashboard: buses, students, routes and live fleet status in one place.
          </figcaption>
        </motion.figure>
      </div>
    </section>
  )
}
