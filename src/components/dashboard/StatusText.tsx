import { cn } from '@/lib/utils'
import type { Tone } from '@/lib/runs'
import { LiveDot } from './LivePill'

const DOT: Record<Tone, string> = {
  live: '',
  success: 'bg-ok',
  warning: 'bg-warn',
  danger: 'bg-bad',
  neutral: 'bg-ink-3',
}

const TEXT: Record<Tone, string> = {
  live: 'text-ink',
  success: 'text-ok-text',
  warning: 'text-warn-text',
  danger: 'text-bad-text',
  neutral: 'text-ink-2',
}

/** A status as a coloured dot and words, like the app's StatusText. `live` pulses cyan. */
export function StatusText({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-[13px] font-medium', TEXT[tone], className)}>
      {tone === 'live' ? <LiveDot /> : <span aria-hidden="true" className={cn('h-2 w-2 shrink-0 rounded-full', DOT[tone])} />}
      {children}
    </span>
  )
}

const BADGE: Record<Exclude<Tone, 'live'>, string> = {
  success: 'bg-ok-tint text-ok-text',
  warning: 'bg-warn-tint text-warn-text',
  danger: 'bg-bad-tint text-bad-text',
  neutral: 'bg-canvas text-ink-2',
}

/** A tinted label for something that needs attention ("Not on route", "Morning only"). Radius 6, like the app's badges. */
export function Badge({ tone = 'neutral', children, className }: { tone?: Exclude<Tone, 'live'>; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium', BADGE[tone], className)}>
      {children}
    </span>
  )
}
