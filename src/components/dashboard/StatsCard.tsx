import { cn } from '@/lib/utils'
import { CountUp } from './CountUp'
import { Rise } from './Rise'

type Tone = 'neutral' | 'warning' | 'danger' | 'success'

const SUB_TONE: Record<Tone, string> = {
  neutral: 'text-ink-2',
  warning: 'text-warn-text',
  danger: 'text-bad-text',
  success: 'text-ok-text',
}

interface StatsCardProps {
  label: string
  value: number | string
  sub?: React.ReactNode
  /** Colours the line under the number when it needs attention. */
  subTone?: Tone
  step?: number
  className?: string
}

/**
 * A number that matters, like the app's Stat: the label above in plain words, the number big in Schibsted (it counts
 * up when the page opens), one line under it. No icon box and no colour unless something needs attention.
 */
export function StatsCard({ label, value, sub, subTone = 'neutral', step = 0, className }: StatsCardProps) {
  return (
    <Rise step={step} className={cn('rounded-xl bg-white p-5 ring-1 ring-ink/[0.04]', className)}>
      <div className="text-[13px] font-medium text-ink-2">{label}</div>
      <div className="mt-2 font-display text-[34px] font-bold leading-[38px] tracking-[-0.02em] text-ink tabular-nums">
        {typeof value === 'number' ? <CountUp value={value} /> : value}
      </div>
      {sub && <div className={cn('mt-1.5 text-[13px]', SUB_TONE[subTone])}>{sub}</div>}
    </Rise>
  )
}
