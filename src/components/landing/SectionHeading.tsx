import { cn } from '@/lib/utils'

/**
 * Joins the last two words with a non-breaking space so a heading never ends on a single word.
 * Cheaper than `text-wrap: balance`, which cost a lot of layout time on this page.
 */
export function noOrphan(text: string) {
  const i = text.lastIndexOf(' ')
  return i === -1 ? text : `${text.slice(0, i)} ${text.slice(i + 1)}`
}

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
    <div className={cn('mb-8 max-w-2xl md:mb-12', className)}>
      <h2
        className={cn(
          'max-w-[34rem] font-display text-[1.75rem] font-bold leading-[1.08] tracking-[-0.025em] md:text-4xl lg:text-[2.6rem]',
          inverted ? 'text-white' : 'text-foreground'
        )}
      >
        {typeof title === 'string' ? noOrphan(title) : title}
      </h2>
      {intro && (
        <p className={cn('mt-3 text-base leading-relaxed', inverted ? 'text-white/80' : 'text-muted-foreground')}>
          {intro}
        </p>
      )}
    </div>
  )
}
