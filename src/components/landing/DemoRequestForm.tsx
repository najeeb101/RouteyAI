'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { submitDemoRequest } from '@/lib/actions/submitDemoRequest'
import { demoRequestSchema, FLEET_SIZES, type DemoRequestInput } from '@/lib/validations/demoRequest'

const fieldClass = 'h-11 rounded-md bg-background border-border'

export function DemoRequestForm() {
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DemoRequestInput>({
    resolver: zodResolver(demoRequestSchema),
    defaultValues: { fullName: '', schoolName: '', email: '', phone: '', message: '', website: '' },
  })

  const onSubmit = async (values: DemoRequestInput) => {
    const result = await submitDemoRequest(values)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Thanks! We’ll be in touch soon.')
    reset()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-14 h-14 bg-secondary/15 rounded-full flex items-center justify-center mb-5">
          <CheckCircle2 className="w-7 h-7 text-secondary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Request received</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          We’ll email you soon to set up your demo.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Send another request
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Your name" id="fullName" error={errors.fullName?.message}>
          <Input id="fullName" autoComplete="name" className={fieldClass} {...register('fullName')} />
        </Field>
        <Field label="School" id="schoolName" error={errors.schoolName?.message}>
          <Input id="schoolName" autoComplete="organization" className={fieldClass} {...register('schoolName')} />
        </Field>
        <Field label="Work email" id="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" className={fieldClass} {...register('email')} />
        </Field>
        <Field label="Phone (optional)" id="phone" error={errors.phone?.message}>
          <Input id="phone" type="tel" autoComplete="tel" className={fieldClass} {...register('phone')} />
        </Field>
      </div>

      <Field label="Fleet size" id="fleetSize" error={errors.fleetSize?.message}>
        <select
          id="fleetSize"
          defaultValue=""
          className={cn(
            'flex w-full rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            fieldClass
          )}
          {...register('fleetSize')}
        >
          <option value="" disabled>
            How many buses do you run?
          </option>
          {FLEET_SIZES.map(size => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Anything we should know? (optional)" id="message" error={errors.message?.message}>
        <textarea
          id="message"
          rows={3}
          className="flex w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          {...register('message')}
        />
      </Field>

      {/* Honeypot — hidden from people, filled in by bots */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? 'Sending…' : 'Book my demo'}
      </button>
      <p className="text-[12px] text-center text-muted-foreground">
        We only use these details to contact you about RouteyAI. See our{' '}
        <a href="/privacy" className="underline hover:text-foreground">privacy policy</a>.
      </p>
    </form>
  )
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string
  id: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[13px] font-medium text-foreground">
        {label}
      </Label>
      {children}
      {error && <p className="text-[12px] font-medium text-destructive">{error}</p>}
    </div>
  )
}
