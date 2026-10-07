import { CircleCheck, Info, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

const TONE = {
  info: { box: 'bg-info-tint text-info-text', icon: Info },
  warning: { box: 'bg-warn-tint text-warn-text', icon: TriangleAlert },
  danger: { box: 'bg-bad-tint text-bad-text', icon: TriangleAlert },
  success: { box: 'bg-ok-tint text-ok-text', icon: CircleCheck },
} as const

/** A tinted note with no border (the app's Banner): something to know, or something to do. */
export function Notice({ tone = 'info', title, children, action, className }: {
  tone?: keyof typeof TONE
  title?: React.ReactNode
  children?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  const { box, icon: Icon } = TONE[tone]
  return (
    <div role={tone === 'danger' ? 'alert' : undefined} className={cn('flex items-start gap-3 rounded-xl px-4 py-3', box, className)}>
      <Icon size={17} className="mt-px shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1 text-[13px] leading-relaxed">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-0.5', 'opacity-90')}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
