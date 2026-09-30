'use client'

import { motion, useReducedMotion } from 'framer-motion'

/** Reveals text word by word, each word sliding up from behind a mask. */
export function WordReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion()
  const words = text.split(' ')

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <motion.span
              className="inline-block"
              initial={reduceMotion ? false : { y: '105%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.7, delay: delay + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}
            </motion.span>
            {i < words.length - 1 && ' '}
          </span>
        ))}
      </span>
    </span>
  )
}
