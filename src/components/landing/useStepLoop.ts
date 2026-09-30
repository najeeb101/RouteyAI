'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

/**
 * Steps through a looping sequence (one duration in ms per step) while the element is on screen.
 * With reduced motion it holds `stillStep`. Pass a module-level array so the effect stays stable.
 */
export function useStepLoop(durations: readonly number[], stillStep = 0) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-10% 0px' })
  /** True once the element is within ~800px of the screen, for loading images late. */
  const near = useInView(ref, { margin: '800px 0px', once: true })
  const reduceMotion = useReducedMotion()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!inView || reduceMotion) return
    const id = window.setTimeout(() => setStep(s => (s + 1) % durations.length), durations[step])
    return () => window.clearTimeout(id)
  }, [inView, reduceMotion, step, durations])

  return { ref, step: reduceMotion ? stillStep : step, reduceMotion: Boolean(reduceMotion), near }
}
