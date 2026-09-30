import { BatteryFull, Signal, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Phone bezel with a status bar. The screen content is real markup, so it stays sharp at any size. */
export function PhoneFrame({
  time,
  label,
  className,
  children,
}: {
  time: string
  /** Describes the screen for screen readers; the mock UI itself is hidden from them. */
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        'relative w-[270px] shrink-0 rounded-[2.6rem] bg-slate-900 p-[9px] shadow-[0_30px_60px_-28px_rgb(15_23_42/0.6)] ring-1 ring-slate-700',
        className
      )}
    >
      <div aria-hidden="true" className="relative h-[560px] overflow-hidden rounded-[2.05rem] bg-slate-100 font-sans text-slate-900">
        <div className="absolute left-1/2 top-2 z-20 h-[22px] w-[84px] -translate-x-1/2 rounded-full bg-black" />
        <div className="flex h-[34px] items-end justify-between bg-slate-900 px-6 pb-1 text-[11px] font-semibold text-white">
          <span>{time}</span>
          <span className="flex items-center gap-1">
            <Signal size={11} strokeWidth={2.5} />
            <Wifi size={11} strokeWidth={2.5} />
            <BatteryFull size={14} strokeWidth={2} />
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
