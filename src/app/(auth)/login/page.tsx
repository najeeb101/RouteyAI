'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RouteyLogo } from '@/components/RouteyLogo'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      router.push('/school')
    }, 1100)
  }

  const demoRoles = [
    { label: 'School Admin', href: '/school', color: '#1E3A8A', bg: '#EFF6FF' },
    { label: 'Driver', href: '/driver', color: '#10B981', bg: '#F0FDF4' },
    { label: 'Parent', href: '/parent', color: '#F59E0B', bg: '#FFFBEB' },
  ]

  return (
    <div className="w-full max-w-sm">
      {/* Brand header */}
      <div className="flex flex-col items-center mb-6">
        <RouteyLogo size={64} variant="white" />
        <div className="mt-3 text-2xl font-extrabold text-white tracking-tight">
          Routey<span className="text-sky-400">AI</span>
        </div>
        <p className="text-sm text-white/60 mt-1">Smart routing. Real-time tracking.</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-6">
        <h1 className="text-xl font-bold text-[#0F172A] mb-1">Welcome back</h1>
        <p className="text-sm text-[#64748B] mb-5">Sign in to your account</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Email address
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 7l10 6.5L22 7" />
              </svg>
              <input
                type="email"
                placeholder="you@school.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-[#E2E8F0] rounded-xl py-2.5 pl-9 pr-3 text-sm text-[#0F172A] bg-[#FAFAFA] outline-none focus:border-[#3B82F6] transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Password
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-[#E2E8F0] rounded-xl py-2.5 pl-9 pr-10 text-sm text-[#0F172A] bg-[#FAFAFA] outline-none focus:border-[#3B82F6] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] text-sm"
              >
                {showPass ? '🙈' : '👁️'}
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
          <span className="text-xs text-[#94A3B8]">or continue with</span>
          <div className="flex-1 h-px bg-[#E2E8F0]" />
        </div>

        {/* Google SSO */}
        <button className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2.5 text-sm font-medium text-[#0F172A] flex items-center justify-center gap-2 mb-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>

        {/* Demo shortcuts */}
        <div className="border-t border-[#F1F5F9] pt-4">
          <p className="text-[11px] text-[#94A3B8] mb-2">Demo — tap to sign in as:</p>
          <div className="flex gap-2">
            {demoRoles.map(r => (
              <button
                key={r.label}
                onClick={() => { setLoading(true); setTimeout(() => router.push(r.href), 800) }}
                style={{ color: r.color, background: r.bg, borderColor: r.color }}
                className="flex-1 border rounded-lg py-1.5 text-[11px] font-semibold transition-opacity"
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
