import { forwardRef } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type ConsentCheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> & {
  id: string
  /** The sentence next to the box, including its links. */
  children: React.ReactNode
  /** Colour of the sentence, so the same box works on the landing page's themed cards and on the white sign-in card. */
  textClassName: string
  /** Colour of the error line. */
  errorClassName: string
  error?: string
}

/**
 * An unticked, required agreement box. The whole sentence is its label (a big target), it is reachable and toggled
 * by keyboard, and an error is announced and linked to it. The box is drawn here, not by the browser, so it looks the
 * same in light and dark mode (the sign-in card is white in both).
 */
export const ConsentCheckbox = forwardRef<HTMLInputElement, ConsentCheckboxProps>(function ConsentCheckbox(
  { id, children, textClassName, errorClassName, error, ...props },
  ref
) {
  const errorId = `${id}-error`
  return (
    <div>
      <div className="flex items-start gap-3">
        <span className="relative mt-0.5 flex h-5 w-5 shrink-0">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            aria-required="true"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-slate-500 bg-white checked:border-primary checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...props}
          />
          <Check
            aria-hidden="true"
            strokeWidth={3}
            className="pointer-events-none absolute inset-0 m-auto h-3.5 w-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100"
          />
        </span>
        <label htmlFor={id} className={cn('cursor-pointer text-[13px] leading-relaxed', textClassName)}>
          {children}
        </label>
      </div>
      {error && (
        <p id={errorId} role="alert" className={cn('mt-1.5 pl-8 text-[13px] font-medium', errorClassName)}>
          {error}
        </p>
      )}
    </div>
  )
})
