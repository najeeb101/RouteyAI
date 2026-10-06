'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// Runs before paint in the browser, so a number mounted by a client-side navigation never flashes its final value.
const useBeforePaint = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * A whole number that counts up from zero when it first appears, and glides to a new value when it changes. The server
 * renders the final number; with reduced motion it stays put.
 */
export function CountUp({ value, duration = 700 }: { value: number; duration?: number }) {
  const [shown, setShown] = useState(value)
  const last = useRef<number | null>(null)

  useBeforePaint(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      last.current = value
      setShown(value)
      return
    }
    const from = last.current ?? 0
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - start) / duration))
      const next = Math.round(from + (value - from) * (1 - Math.pow(1 - t, 3)))
      last.current = next
      setShown(next)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    setShown(from)
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return <>{shown}</>
}
