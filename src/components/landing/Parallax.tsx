import { cn } from '@/lib/utils'

/**
 * Drifts its children slightly against the scroll direction, on a CSS scroll timeline (`.parallax` in globals.css).
 * No JavaScript: framer-motion's scroll tracking measured the page during hydration. Off with reduced motion.
 */
export function Parallax({ children, distance = 32, className }: { children: React.ReactNode; distance?: number; className?: string }) {
  return (
    <div className={cn('parallax', className)} style={{ '--parallax-distance': `${distance}px` } as React.CSSProperties}>
      {children}
    </div>
  )
}
