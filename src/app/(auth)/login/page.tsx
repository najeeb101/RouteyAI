'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { RouteyLogo } from '@/components/RouteyLogo'
import { createClient } from '@/lib/supabase/client'
import { ROLE_HOME, type Role } from '@/lib/constants'

function MobileAppModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-7 w-full max-w-sm shadow-[0_20px_60px_-15px_rgb(0_0_0/0.35)]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]">Use the Mobile App</h2>
            <p className="text-sm text-[#64748B] mt-0.5">Drivers & parents sign in via the app.</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 bg-[#F1F5F9] rounded-lg flex items-center justify-center text-[#64748B]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 flex flex-col items-center mb-5">
          <div className="w-24 h-24 bg-[#0F172A] rounded-xl flex items-center justify-center mb-2">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <rect x="4" y="4" width="20" height="20" rx="2" fill="white"/>
              <rect x="7" y="7" width="14" height="14" rx="1" fill="#0F172A"/>
              <rect x="9" y="9" width="10" height="10" rx="0.5" fill="white"/>
              <rect x="36" y="4" width="20" height="20" rx="2" fill="white"/>
              <rect x="39" y="7" width="14" height="14" rx="1" fill="#0F172A"/>
              <rect x="41" y="9" width="10" height="10" rx="0.5" fill="white"/>
              <rect x="4" y="36" width="20" height="20" rx="2" fill="white"/>
              <rect x="7" y="39" width="14" height="14" rx="1" fill="#0F172A"/>
              <rect x="9" y="41" width="10" height="10" rx="0.5" fill="white"/>
              <rect x="36" y="36" width="4" height="4" fill="white"/>
              <rect x="42" y="36" width="4" height="4" fill="white"/>
              <rect x="48" y="36" width="4" height="4" fill="white" opacity="0.6"/>
              <rect x="36" y="42" width="4" height="4" fill="white" opacity="0.6"/>
              <rect x="42" y="42" width="4" height="4" fill="white"/>
              <rect x="48" y="42" width="4" height="4" fill="white"/>
              <rect x="36" y="48" width="4" height="4" fill="white"/>
              <rect x="42" y="48" width="4" height="4" fill="white" opacity="0.6"/>
              <rect x="48" y="48" width="4" height="4" fill="white"/>
            </svg>
          </div>
          <p className="text-[11px] text-[#94A3B8]">Scan to download · Coming soon</p>
        </div>

        <div className="flex gap-2 mb-4">
          <button className="flex-1 bg-[#0F172A] text-white rounded-xl px-3 py-2.5 flex items-center gap-2 hover:bg-[#1E293B] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div>
              <div className="text-[8px] text-white/60 leading-none">Download on</div>
              <div className="text-[11px] font-bold">App Store</div>
            </div>
          </button>
          <button className="flex-1 bg-[#0F172A] text-white rounded-xl px-3 py-2.5 flex items-center gap-2 hover:bg-[#1E293B] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M3.18 23.76c.3.17.65.19.97.08l11.46-6.62-2.36-2.36-10.07 8.9zM20.73 9.11L17.5 7.23 14.86 9.87l2.77 2.77 3.12-1.8c.89-.51.89-1.74-.02-2.73zM2.13.29C1.86.56 1.7.97 1.7 1.5v21c0 .53.16.94.43 1.21l.07.06 11.76-11.76v-.28L2.2.23l-.07.06zM14.57 10.53l-2.77-2.77L2.2.23l12.37 10.3z"/>
            </svg>
            <div>
              <div className="text-[8px] text-white/60 leading-none">Get it on</div>
              <div className="text-[11px] font-bold">Google Play</div>
            </div>
          </button>
        </div>

        <button onClick={onClose} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] rounded-xl py-2.5 text-sm font-medium">
          Back to Login
        </button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMobileModal, setShowMobileModal] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .maybeSingle()

    const role = roleRow?.role as Role | undefined
    router.push(role ? ROLE_HOME[role] : '/school')
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm">
      {showMobileModal && <MobileAppModal onClose={() => setShowMobileModal(false)} />}

      {/* Brand header */}
      <div className="flex flex-col items-center mb-6">
        <RouteyLogo size={64} variant="white" />
        <div className="mt-3 text-2xl font-extrabold text-white tracking-tight">
          Routey<span className="text-sky-400">AI</span>
        </div>
        <p className="text-sm text-white/60 mt-1">School Admin Portal</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-6">
        <h1 className="text-xl font-bold text-[#0F172A] mb-1">Welcome back</h1>
        <p className="text-sm text-[#64748B] mb-5">Sign in to the admin dashboard</p>

        {error && (
          <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Email address</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 6.5L22 7"/>
              </svg>
              <input
                type="email"
                placeholder="admin@school.edu"
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
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full border border-[#E2E8F0] rounded-xl py-2.5 pl-9 pr-10 text-sm text-[#0F172A] bg-[#FAFAFA] outline-none focus:border-[#3B82F6] transition-colors"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors hover:text-[#475569]">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end -mt-2">
            <span className="text-xs text-[#3B82F6] font-medium cursor-pointer">Forgot password?</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E3A8A] text-white rounded-xl py-3 text-sm font-semibold transition-opacity disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in…
              </>
            ) : 'Sign in'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-2 my-4">
          <div className="flex-1 h-px bg-[#E2E8F0]" />
          <span className="text-xs text-[#94A3B8]">or</span>
          <div className="flex-1 h-px bg-[#E2E8F0]" />
        </div>

        {/* Sign up link */}
        <p className="text-center text-xs text-[#64748B] mb-4">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#3B82F6] font-semibold hover:underline">
            Sign up
          </Link>
        </p>

        {/* Mobile app notice */}
        <div className="border-t border-[#F1F5F9] pt-4">
          <p className="text-[12px] text-[#94A3B8] mb-3 text-center">Driver or Parent? Use the mobile app.</p>
          <button
            onClick={() => setShowMobileModal(true)}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2.5 text-[13px] font-semibold text-[#0F172A] flex items-center justify-center gap-2 hover:bg-[#F1F5F9] transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
            Download the RouteyAI App
          </button>
        </div>
      </div>
    </div>
  )
}
