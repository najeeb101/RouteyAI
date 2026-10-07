import { cn } from '@/lib/utils'
import { Rise } from './Rise'

/**
 * A flat white card on the grey canvas (radius 12, no shadow), like the app's cards. `title` is set in Schibsted;
 * `action` sits to its right. `step` staggers it into place with the rest of the page.
 */
export function Panel({ title, subtitle, action, step = 0, className, bodyClassName, children }: {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  action?: React.ReactNode
  step?: number
  className?: string
  bodyClassName?: string
  children: React.ReactNode
}) {
  return (
    <Rise step={step} className={cn('rounded-xl bg-white ring-1 ring-ink/[0.04]', className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <div className="min-w-0">
            {title && <h2 className="font-display text-lg font-bold leading-6 tracking-[-0.01em] text-ink">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-[13px] text-ink-2">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn('p-5', (title || action) && 'pt-4', bodyClassName)}>{children}</div>
    </Rise>
  )
}
