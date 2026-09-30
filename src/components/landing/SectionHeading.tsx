import { cn } from '@/lib/utils'

/** Plain section heading: a title and an optional one-line intro. */
export function SectionHeading({
  title,
  intro,
  inverted = false,
  className,
}: {
  title: React.ReactNode
  intro?: React.ReactNode
  inverted?: boolean
  className?: string
}) {
  return (
    <div className={cn('mb-10 max-w-2xl md:mb-12', className)}>
      <h2
        className={cn(
          'text-balance text-3xl font-bold tracking-tight md:text-4xl',
          inverted ? 'text-white' : 'text-primary'
        )}
      >
        {title}
      </h2>
      {intro && (
        <p className={cn('mt-3 text-base leading-relaxed md:text-lg', inverted ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
          {intro}
        </p>
      )}
    </div>
  )
}
