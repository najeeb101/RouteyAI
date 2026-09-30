import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Bottom tab bar, as in the Expo apps (mobile/src/components/navigation/TabIcon.tsx). */
export function PhoneTabBar({ items, active }: { items: { label: string; icon: LucideIcon }[]; active: string }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex h-[50px] items-start justify-around border-t border-slate-200 bg-white px-1 pt-1.5">
      {items.map(({ label, icon: Icon }) => {
        const on = label === active
        return (
          <span key={label} className="flex w-12 flex-col items-center gap-0.5">
            <span className={cn('flex h-[22px] w-8 items-center justify-center rounded-full', on && 'bg-primary/10')}>
              <Icon size={14} strokeWidth={on ? 2.5 : 2} className={on ? 'text-primary' : 'text-slate-400'} />
            </span>
            <span className={cn('text-[7.5px]', on ? 'font-bold text-primary' : 'font-medium text-slate-400')}>{label}</span>
          </span>
        )
      })}
    </div>
  )
}
