'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { RouteyLogo } from '@/components/RouteyLogo'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  {
    href: '/school',
    label: 'Overview',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    href: '/school/routes',
    label: 'Routes',
    icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
  },
  {
    href: '/school/students',
    label: 'Students',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  },
  {
    href: '/school/buses',
    label: 'Fleet',
    icon: 'M8 6v6m0 0v6m0-6h12M8 12H4',
    isBus: true,
  },
  {
    href: '/school/analytics',
    label: 'Analytics',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
]

const BUS_ICON_PATH = 'M8 6v6m0 0v6m0-6h.01M8 12H4'

export function Sidebar() {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const [schoolName, setSchoolName] = useState('School')
  const [signingOut, setSigningOut] = useState(false)

  const isActive = (href: string) => {
    if (href === '/school') return pathname === '/school'
    return pathname.startsWith(href)
  }

  useEffect(() => {
    let mounted = true

    async function loadSchool() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted || !user) return

      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('school_id')
        .eq('user_id', user.id)
        .maybeSingle()

      const schoolId = roleRow?.school_id
      if (!schoolId) return

      const { data: school } = await supabase
        .from('schools')
        .select('name')
        .eq('id', schoolId)
        .maybeSingle()

      if (mounted && school?.name) setSchoolName(school.name)
    }

    loadSchool()
    return () => { mounted = false }
  }, [supabase])

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-[220px] shrink-0 bg-[#0F172A] flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/[0.07]">
        <RouteyLogo size={28} variant="gradient" />
        <span className="text-base font-extrabold tracking-tight">
          <span className="text-white">Routey</span>
          <span className="text-[#00D4FF]">AI</span>
        </span>
      </div>

      {/* School badge */}
      <div className="mx-3 my-2 flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.07] rounded-lg px-2.5 py-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className="text-[11px] text-white/50 font-medium">{schoolName}</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
              isActive(item.href)
                ? 'bg-blue-500/15 text-white'
                : 'text-white/50 hover:text-white/80 hover:bg-white/[0.05]'
            )}
          >
            {item.isBus ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/>
                <path d="M18 18h3s.5-1.7.8-4.3c.3-2.7.2-7.7.2-7.7H2S1.7 7 2 9.7c.3 2.6.8 4.3.8 4.3H5"/>
                <circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
            )}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-3 pb-5">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg text-[13px] font-medium text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-all duration-150"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {signingOut ? 'Signing Out...' : 'Sign Out'}
        </button>
      </div>
    </aside>
  )
}
