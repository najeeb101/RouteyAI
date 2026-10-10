import { cn } from '@/lib/utils'

/** Text inputs, selects and text areas in dashboard forms: 44 px, radius 12, a brand ring on focus. */
export const inputClass = cn(
  'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-2',
  'outline-none transition-[border-color,box-shadow] duration-150 focus:border-brand focus:ring-4 focus:ring-brand-tint',
  'disabled:bg-canvas disabled:text-ink-2',
)

/** A form field: the label above (sentence case, like the app's login), the control, and an optional hint. */
export function Field({ label, hint, htmlFor, className, children }: {
  label: string
  hint?: React.ReactNode
  htmlFor?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-ink">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-ink-2">{hint}</p>}
    </div>
  )
}
