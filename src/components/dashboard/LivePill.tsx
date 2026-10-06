import { cn } from '@/lib/utils'

/** A cyan dot with a ring that pulses outwards, like the landing page's live bus tag and the app's LiveDot. */
export function LiveDot({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn('relative inline-flex h-2 w-2 shrink-0', className)}>
      <span className="absolute inset-0 rounded-full bg-live opacity-60 animate-pulse-ring motion-reduce:hidden" />
      <span className="relative h-2 w-2 rounded-full bg-live" />
    </span>
  )
}

/** "Live" with a pulsing dot: a small navy pill on white, or just the dot and word on the navy signature card. */
export function LivePill({ label = 'Live', onNight = false, className }: { label?: string; onNight?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-[13px] font-medium text-white',
        !onNight && 'h-7 rounded-full bg-night pl-2.5 pr-3',
        className,
      )}
    >
      <LiveDot />
      {label}
    </span>
  )
}
