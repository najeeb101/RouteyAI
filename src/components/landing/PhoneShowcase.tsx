'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

/** Phone mockup that drifts slightly against the scroll, with a floating app card beside it. */
export function PhoneShowcase({
  src,
  alt,
  tone,
  card,
  cardSide,
}: {
  src: string
  alt: string
  tone: 'dark' | 'light'
  card: React.ReactNode
  cardSide: 'left' | 'right'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const phoneY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [36, -36])
  const cardY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [70, -50])

  return (
    <div ref={ref} className="relative mx-auto w-fit px-10 py-6">
      <motion.div style={{ y: phoneY }} className="relative h-[420px] w-[212px]">
        <div
          className={cn(
            'absolute inset-0 rounded-[2.3rem] shadow-[0_30px_60px_-30px_rgb(15_23_42/0.55)]',
            tone === 'dark' ? 'bg-slate-950' : 'bg-slate-100 ring-1 ring-slate-300 dark:bg-slate-800 dark:ring-slate-700'
          )}
        />
        <div className={cn('absolute left-1/2 top-3 z-20 h-1.5 w-14 -translate-x-1/2 rounded-full', tone === 'dark' ? 'bg-slate-700' : 'bg-slate-300')} />
        <div className="absolute inset-[7px] overflow-hidden rounded-[1.95rem] bg-black">
          <Image src={src} alt={alt} fill sizes="212px" className="scale-[1.26] object-cover object-center" />
        </div>
      </motion.div>

      <motion.div
        style={{ y: cardY }}
        className={cn('absolute top-24 z-30 w-[200px]', cardSide === 'left' ? '-left-4 sm:-left-10' : '-right-4 sm:-right-10')}
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: cardSide === 'left' ? -24 : 24, scale: 0.96 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-lg border border-border bg-card p-3 shadow-[0_12px_32px_-12px_rgb(15_23_42/0.35)]"
          >
            {card}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
