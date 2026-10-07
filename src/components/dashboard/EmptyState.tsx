import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/** One plain icon, one line of what's missing, one line of what to do, like the app's empty states. */
export function EmptyState({ icon: Icon, title, children, action, className }: {
  icon: LucideIcon
  title: string
  children?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-12 text-center', className)}>
      <Icon size={28} strokeWidth={1.75} className="mb-3 text-ink-3" aria-hidden="true" />
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      {children && <p className="mt-1 max-w-sm text-sm text-ink-2">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
