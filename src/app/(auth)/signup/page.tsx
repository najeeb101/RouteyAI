'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { House, Lock, Mail, User } from 'lucide-react'
import { AuthHeading, AuthShell } from '@/components/auth/AuthShell'
import { AuthInput } from '@/components/auth/AuthInput'
import { LegalLinks } from '@/components/auth/LegalLinks'
import { ConsentCheckbox } from '@/components/ConsentCheckbox'
import { MobileAppNotice } from '@/components/auth/MobileAppNotice'
import { ActionButton } from '@/components/dashboard/ActionButton'
import { Notice } from '@/components/dashboard/Notice'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, role: 'school_admin' },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: data.user.id,
        role: 'school_admin',
        school_id: null,
      })

      if (roleError) {
        setError('Account created but role assignment failed. Please contact support.')
        setLoading(false)
        return
      }
    }

    router.push('/school')
    router.refresh()
  }

  return (
    <AuthShell subtitle="School admin portal">
      <AuthHeading title="Create your account">Set up your school admin dashboard.</AuthHeading>

      <div className="mb-4 flex items-center gap-3 rounded-xl bg-brand-tint px-3.5 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand">
          <House size={16} aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs text-ink-2">Role</p>
          <p className="text-sm font-semibold text-brand">School administrator</p>
        </div>
      </div>

      {error && <Notice tone="danger" className="mb-4">{error}</Notice>}

      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <AuthInput label="Full name" icon={User} placeholder="Mohammed Al-Rashid" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
        <AuthInput label="Email address" icon={Mail} type="email" placeholder="admin@school.edu" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <AuthInput label="Password" icon={Lock} type="password" placeholder="Min. 8 characters" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
        <ConsentCheckbox
          id="terms-consent"
          required
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          textClassName="text-ink-2"
          errorClassName="text-bad-text"
        >
          I agree to the <LegalLinks />.
        </ConsentCheckbox>
        <ActionButton type="submit" loading={loading} className="mt-1 w-full">
          {loading ? 'Creating account…' : 'Create account'}
        </ActionButton>
      </form>

      <p className="mt-5 text-center text-[13px] text-ink-2">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-brand hover:underline">Sign in</Link>
      </p>

      <MobileAppNotice />
    </AuthShell>
  )
}
