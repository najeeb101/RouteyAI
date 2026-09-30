'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const HIDDEN = {
  up: 'translate-y-6',
  left: '-translate-x-10',
  right: 'translate-x-10',
} as const

/**
 * Fades content in as it scrolls into view, sliding from below or from one side.
 * A plain IntersectionObserver plus CSS transitions: much cheaper to hydrate than an animation-library component.
 * With reduced motion it appears without moving.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  from = 'up',
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  from?: keyof typeof HIDDEN
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -60px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        'transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:transition-none',
        shown ? 'translate-x-0 translate-y-0 opacity-100' : cn('opacity-0', HIDDEN[from]),
        className
      )}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}
