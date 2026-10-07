'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bus, House, Lock, Mail, User, Users, type LucideIcon } from 'lucide-react'
import { AuthHeading, AuthShell } from '@/components/auth/AuthShell'
import { AuthInput } from '@/components/auth/AuthInput'
import { ActionButton } from '@/components/dashboard/ActionButton'
import { Notice } from '@/components/dashboard/Notice'
import { createClient } from '@/lib/supabase/client'
import { ROLE_HOME, type Role } from '@/lib/constants'
import type { InviteRole, RedeemInviteResult } from '@/types/database'

const ROLES: Record<InviteRole, { label: string; icon: LucideIcon }> = {
  school_admin: { label: 'School administrator', icon: House },
  driver: { label: 'Bus driver', icon: Bus },
  parent: { label: 'Parent', icon: Users },
}

interface Props {
  code: string
  role: InviteRole
}

export default function InviteForm({ code, role }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const RoleIcon = ROLES[role].icon

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Account created — check your email to confirm, then sign in.')
      setLoading(false)
      return
    }

    const { data: redeemData, error: redeemError } = await supabase.rpc('redeem_invite', {
      p_code: code,
      p_user_id: data.user.id,
    })
    const redeemResult = redeemData as RedeemInviteResult | null

    if (redeemError || !redeemResult || 'error' in redeemResult) {
      const msg = (redeemResult && 'error' in redeemResult ? redeemResult.error : null) ?? redeemError?.message ?? 'Failed to redeem invite.'
      setError(msg === 'invite_already_used' ? 'This invite has already been used.' :
               msg === 'invite_expired' ? 'This invite has expired.' :
               msg === 'invalid_user' ? 'This account cannot use the invite. Sign up again to continue.' : msg)
      setLoading(false)
      return
    }

    const assignedRole = (redeemResult.role ?? role) as Role
    router.push(ROLE_HOME[assignedRole] ?? '/login')
    router.refresh()
  }

  return (
    <AuthShell subtitle="You’ve been invited">
      <div className="mb-5 flex items-center gap-3 rounded-xl bg-brand-tint px-3.5 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand">
          <RoleIcon size={16} aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs text-ink-2">Joining as</p>
          <p className="text-sm font-semibold text-brand">{ROLES[role].label}</p>
        </div>
      </div>

      <AuthHeading title="Create your account">Set up your RouteyAI account to get started.</AuthHeading>

      {error && <Notice tone="danger" className="mb-4">{error}</Notice>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthInput label="Full name" icon={User} placeholder="Your full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
        <AuthInput label="Email address" icon={Mail} type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <AuthInput label="Password" icon={Lock} type="password" placeholder="Min. 8 characters" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
        <ActionButton type="submit" loading={loading} className="mt-1 w-full">
          {loading ? 'Creating account…' : 'Accept invite and create account'}
        </ActionButton>
      </form>

      <p className="mt-5 text-center text-[13px] text-ink-2">
        Already have an account?{' '}
        <a href="/login" className="font-semibold text-brand hover:underline">Sign in</a>
      </p>
    </AuthShell>
  )
}
