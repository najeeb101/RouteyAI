import { cn } from '@/lib/utils'

/**
 * Content that settles into place when the page opens, one block after another (`step` × 60 ms). CSS only, so pages
 * stay Server Components. Still with reduced motion.
 */
export function Rise({ step = 0, className, children, as: Tag = 'div' }: {
  step?: number
  className?: string
  children: React.ReactNode
  as?: 'div' | 'section' | 'li'
}) {
  return (
    <Tag className={cn('animate-rise motion-reduce:animate-none', className)} style={step ? { animationDelay: `${step * 60}ms` } : undefined}>
      {children}
    </Tag>
  )
}
