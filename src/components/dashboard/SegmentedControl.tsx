'use client'

import { cn } from '@/lib/utils'

/**
 * Two to four choices side by side (Morning / Afternoon), like the app's segmented control. The white thumb slides to
 * the chosen one.
 */
export function SegmentedControl<T extends string>({ value, options, onChange, label, className }: {
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
  label: string
  className?: string
}) {
  const index = Math.max(0, options.findIndex((o) => o.value === value))
  return (
    <div role="radiogroup" aria-label={label} className={cn('relative grid rounded-xl bg-canvas p-1', className)} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      <span
        aria-hidden="true"
        className="absolute bottom-1 left-1 top-1 rounded-[9px] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.12)] transition-transform duration-300 ease-swift motion-reduce:transition-none"
        style={{ width: `calc((100% - 0.5rem) / ${options.length})`, transform: `translateX(${index * 100}%)` }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            'relative z-10 h-8 rounded-[9px] px-3 text-[13px] font-medium transition-colors duration-200',
            o.value === value ? 'text-ink' : 'text-ink-2 hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
