'use client'

import { useId, useState } from 'react'
import { Eye, EyeOff, type LucideIcon } from 'lucide-react'
import { Field, inputClass } from '@/components/dashboard/Field'
import { cn } from '@/lib/utils'

type AuthInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  label: string
  icon: LucideIcon
  hint?: React.ReactNode
}

/** A sign-in field: the label above, an icon inside on the left, and a show/hide button when it is a password. */
export function AuthInput({ label, icon: Icon, hint, type = 'text', ...props }: AuthInputProps) {
  const id = useId()
  const [shown, setShown] = useState(false)
  const isPassword = type === 'password'

  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <div className="relative">
        <Icon size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden="true" />
        <input id={id} type={isPassword && shown ? 'text' : type} className={cn(inputClass, 'pl-10', isPassword && 'pr-11')} {...props} />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            aria-label={shown ? 'Hide password' : 'Show password'}
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-canvas hover:text-ink-2"
          >
            {shown ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
    </Field>
  )
}
