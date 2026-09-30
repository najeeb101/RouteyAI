'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

/** Runs `tick` on an interval only while the element is on screen and motion is allowed. */
export function useTicker(ms: number) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-10% 0px' })
  const reduceMotion = useReducedMotion()
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (!inView || reduceMotion) return
    const id = window.setInterval(() => setTick(t => t + 1), ms)
    return () => window.clearInterval(id)
  }, [inView, reduceMotion, ms])
  return { ref, tick, reduceMotion }
}
