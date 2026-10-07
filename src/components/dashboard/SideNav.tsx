'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bus, CalendarX2, ChartColumnBig, LayoutGrid, LogOut, Route, School, Users, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RouteyLogo } from '@/components/RouteyLogo'
import { createClient } from '@/lib/supabase/client'

export type NavSection = 'school' | 'admin'

type NavItem = { href: string; label: string; icon: LucideIcon }

export const NAV: Record<NavSection, NavItem[]> = {
  school: [
    { href: '/school', label: 'Overview', icon: LayoutGrid },
    { href: '/school/routes', label: 'Routes', icon: Route },
    { href: '/school/students', label: 'Students', icon: Users },
    { href: '/school/absences', label: 'Absences', icon: CalendarX2 },
    { href: '/school/buses', label: 'Fleet', icon: Bus },
    { href: '/school/analytics', label: 'Analytics', icon: ChartColumnBig },
  ],
  admin: [
    { href: '/admin', label: 'Overview', icon: LayoutGrid },
    { href: '/admin/schools', label: 'Schools', icon: School },
    { href: '/admin/analytics', label: 'Analytics', icon: ChartColumnBig },
  ],
}

/** The nav item a path belongs to: the longest matching href, so /school doesn't light up on /school/routes. */
export function activeItem(section: NavSection, pathname: string): NavItem | undefined {
  return NAV[section]
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]
}

const ITEM_H = 40
const ITEM_GAP = 2

/**
 * The navy side bar (the landing page's navy and the app's login panel): the logo and name, the school, the pages with
 * a highlight that slides to the one you're on, and who is signed in.
 */
export function SideNav({ section, place, userName, userEmail, onNavigate }: {
  section: NavSection
  /** The school's name, or "Platform admin". */
  place: string
  userName: string
  userEmail: string
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const items = NAV[section]
  const active = activeItem(section, pathname)
  const activeIndex = active ? items.indexOf(active) : -1
  const initials = userName.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'A'

  async function signOut() {
    setSigningOut(true)
    await createClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="relative isolate flex h-full w-64 flex-col overflow-hidden bg-night text-white">
      <span aria-hidden="true" className="pointer-events-none absolute -right-28 -top-32 -z-10 h-72 w-80 rounded-full bg-night-glow/50 blur-3xl" />

      <div className="px-5 pb-5 pt-6">
        <Link href={NAV[section][0]!.href} onClick={onNavigate} className="flex items-center gap-2.5">
          <RouteyLogo size={30} />
          <span className="font-display text-xl font-bold tracking-[-0.01em]">
            Routey<span className="text-live">AI</span>
          </span>
        </Link>
        <p className="mt-3 truncate text-[13px] text-white/60" title={place}>{place}</p>
      </div>

      <nav aria-label="Dashboard" className="relative flex-1 px-3">
        {activeIndex >= 0 && (
          <span
            aria-hidden="true"
            className="absolute left-3 right-3 top-0 rounded-xl bg-white/[0.09] transition-transform duration-300 ease-swift motion-reduce:transition-none"
            style={{ height: ITEM_H, transform: `translateY(${activeIndex * (ITEM_H + ITEM_GAP)}px)` }}
          >
            <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-live" />
          </span>
        )}
        <ul className="relative flex flex-col" style={{ gap: ITEM_GAP }}>
          {items.map((item) => {
            const isActive = item === active
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-colors duration-150',
                    isActive ? 'text-white' : 'text-white/60 hover:bg-white/[0.05] hover:text-white',
                  )}
                  style={{ height: ITEM_H }}
                >
                  <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="m-3 flex items-center gap-3 rounded-xl bg-white/[0.06] p-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-[13px] font-semibold">{initials}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold">{userName}</p>
          <p className="truncate text-xs text-white/50">{userEmail}</p>
        </div>
        <button
          onClick={signOut}
          disabled={signingOut}
          aria-label="Sign out"
          title="Sign out"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  )
}
