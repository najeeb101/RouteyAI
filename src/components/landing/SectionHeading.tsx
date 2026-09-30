import { cn } from '@/lib/utils'

/**
 * Section heading styled like a transit line stop: "02 — How it works" with a small route glyph,
 * a left-aligned title, and an optional subtitle. Replaces generic centered pill badges.
 */
export function SectionHeading({
  index,
  label,
  title,
  subtitle,
  align = 'left',
  inverted = false,
  className,
}: {
  index?: string
  label?: string
  title: React.ReactNode
  subtitle?: React.ReactNode
  align?: 'left' | 'center'
  inverted?: boolean
  className?: string
}) {
  return (
    <div className={cn('mb-12 md:mb-14', align === 'center' ? 'text-center mx-auto max-w-2xl' : 'max-w-2xl', className)}>
      {label && (
        <div
          className={cn(
            'mb-4 flex items-center gap-3 text-[13px] font-medium',
            align === 'center' && 'justify-center',
            inverted ? 'text-slate-400' : 'text-muted-foreground'
          )}
        >
          <span aria-hidden="true" className="flex items-center">
            <span className={cn('h-[3px] w-6 rounded-full', inverted ? 'bg-accent' : 'bg-primary')} />
            <span
              className={cn(
                '-ml-0.5 h-2.5 w-2.5 rounded-full border-2',
                inverted ? 'border-accent bg-slate-950' : 'border-primary bg-background'
              )}
            />
          </span>
          {index && <span className={cn('font-mono text-xs', inverted ? 'text-slate-500' : 'text-muted-foreground/70')}>{index}</span>}
          <span>{label}</span>
        </div>
      )}
      <h2
        className={cn(
          'text-3xl md:text-[2.75rem] font-semibold tracking-[-0.02em] leading-[1.1] text-balance',
          inverted ? 'text-white' : 'text-foreground'
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn('mt-4 text-base md:text-lg leading-relaxed', inverted ? 'text-slate-400' : 'text-muted-foreground')}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
