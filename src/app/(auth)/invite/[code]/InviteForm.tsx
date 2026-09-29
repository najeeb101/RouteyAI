'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { RouteyLogo } from '@/components/RouteyLogo'
import { createClient } from '@/lib/supabase/client'
import { ROLE_HOME, type Role } from '@/lib/constants'
import type { InviteRole, RedeemInviteResult } from '@/types/database'

const ROLE_LABELS: Record<InviteRole, string> = {
  school_admin: 'School Administrator',
  driver: 'Bus Driver',
  parent: 'Parent',
}

const ROLE_ICONS: Record<InviteRole, React.ReactNode> = {
  school_admin: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  driver: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="2"/>
      <path d="M16 8h4l3 3v5h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  parent: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
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
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
               msg === 'invite_expired' ? 'This invite has expired.' : msg)
      setLoading(false)
      return
    }

    const assignedRole = (redeemResult.role ?? role) as Role
    router.push(ROLE_HOME[assignedRole] ?? '/login')
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center mb-6">
        <RouteyLogo size={64} variant="white" />
        <div className="mt-3 text-2xl font-extrabold text-white tracking-tight">
          Routey<span className="text-sky-400">AI</span>
        </div>
        <p className="text-sm text-white/60 mt-1">You&apos;ve been invited</p>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-5 p-3 bg-[#EFF6FF] rounded-xl border border-[#BFDBFE]">
          <div className="w-8 h-8 rounded-lg bg-[#DBEAFE] flex items-center justify-center text-[#1E3A8A]">
            {ROLE_ICONS[role]}
          </div>
          <div>
            <div className="text-xs text-[#3B82F6] font-semibold uppercase tracking-wide">Joining as</div>
            <div className="text-sm font-bold text-[#1E3A8A]">{ROLE_LABELS[role]}</div>
          </div>
        </div>

        <h1 className="text-xl font-bold text-[#0F172A] mb-1">Create your account</h1>
        <p className="text-sm text-[#64748B] mb-5">Set up your RouteyAI account to get started.</p>

        {error && (
          <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Full name</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full border border-[#E2E8F0] rounded-xl py-2.5 pl-9 pr-3 text-sm text-[#0F172A] bg-[#FAFAFA] outline-none focus:border-[#3B82F6] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Email address</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 6.5L22 7"/>
              </svg>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-[#E2E8F0] rounded-xl py-2.5 pl-9 pr-3 text-sm text-[#0F172A] bg-[#FAFAFA] outline-none focus:border-[#3B82F6] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Password</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full border border-[#E2E8F0] rounded-xl py-2.5 pl-9 pr-10 text-sm text-[#0F172A] bg-[#FAFAFA] outline-none focus:border-[#3B82F6] transition-colors"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E3A8A] text-white rounded-xl py-3 text-sm font-semibold transition-opacity disabled:opacity-70 flex items-center justify-center gap-2 mt-1"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account…
              </>
            ) : 'Accept invite & create account'}
          </button>
        </form>

        <p className="text-center text-xs text-[#94A3B8] mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-[#3B82F6] font-semibold hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  )
}
