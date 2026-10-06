import { forwardRef } from 'react'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const VARIANTS = {
  /** The one main action on a screen or in a dialog. */
  primary: 'bg-brand text-white hover:bg-brand-pressed',
  /** Actions next to the main one. */
  secondary: 'bg-brand-tint text-brand hover:bg-brand-tint-pressed',
  /** Quiet actions: Cancel, View all. */
  plain: 'text-brand hover:bg-brand-tint',
  danger: 'bg-bad text-white hover:bg-bad-text',
  'danger-plain': 'text-bad-text hover:bg-bad-tint',
  /** On the navy signature card. */
  'on-night': 'bg-white text-night hover:bg-white/85',
} as const

const SIZES = {
  sm: 'h-8 gap-1.5 px-3 text-[13px] [&_svg]:size-3.5',
  md: 'h-10 gap-2 px-4 text-sm [&_svg]:size-4',
} as const

export type ActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS
  size?: keyof typeof SIZES
  /** Shows a spinner in place of the icon and blocks clicks. */
  loading?: boolean
}

/**
 * The dashboard's button, the same shapes as the app's (radius 12, brand fill for the main action, brand tint next to
 * it). Presses sink slightly.
 */
export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(function ActionButton(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-xl font-semibold',
        'transition-[background-color,color,transform,opacity] duration-150 ease-swift active:scale-[0.97]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        'disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading && <LoaderCircle className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
})
