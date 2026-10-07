'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Mail } from 'lucide-react'
import { AuthHeading, AuthShell } from '@/components/auth/AuthShell'
import { AuthInput } from '@/components/auth/AuthInput'
import { MobileAppNotice } from '@/components/auth/MobileAppNotice'
import { ActionButton } from '@/components/dashboard/ActionButton'
import { Notice } from '@/components/dashboard/Notice'
import { createClient } from '@/lib/supabase/client'
import { ROLE_HOME, type Role } from '@/lib/constants'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authData.user.id)
      .maybeSingle()

    const role = roleRow?.role as Role | undefined
    router.push(role ? ROLE_HOME[role] : '/school')
    router.refresh()
  }

  return (
    <AuthShell subtitle="School admin portal">
      <AuthHeading title="Welcome back">Sign in to the admin dashboard.</AuthHeading>

      {error && <Notice tone="danger" className="mb-4">{error}</Notice>}

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <AuthInput label="Email address" icon={Mail} type="email" placeholder="admin@school.edu" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <AuthInput label="Password" icon={Lock} type="password" placeholder="••••••••" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <ActionButton type="submit" loading={loading} className="mt-1 w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </ActionButton>
      </form>

      <p className="mt-5 text-center text-[13px] text-ink-2">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-semibold text-brand hover:underline">Sign up</Link>
      </p>

      <MobileAppNotice />
    </AuthShell>
  )
}
