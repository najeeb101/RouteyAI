'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { RouteyLogo } from '@/components/RouteyLogo'
import { activeItem, type NavSection } from './SideNav'

const qatarClock = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Qatar', weekday: 'short', day: 'numeric', month: 'short' })
const qatarTime = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Qatar', hour: 'numeric', minute: '2-digit' })

/**
 * The thin bar above each page: where you are, and the time in Qatar, which decides which run the buses are on. On
 * small screens it carries the logo and the menu button.
 */
export function TopBar({ section, place, onMenu }: { section: NavSection; place: string; onMenu: () => void }) {
  const pathname = usePathname()
  const page = activeItem(section, pathname)?.label ?? 'Dashboard'
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-line/80 bg-canvas/85 px-5 backdrop-blur-md lg:px-8">
      <button
        onClick={onMenu}
        aria-label="Open menu"
        className="-ml-2 flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-white lg:hidden"
      >
        <Menu size={20} />
      </button>
      <span className="lg:hidden"><RouteyLogo size={24} /></span>

      <p className="min-w-0 truncate text-[13px] text-ink-2">
        <span className="hidden sm:inline">{place}</span>
        <span className="hidden px-1.5 text-ink-3 sm:inline">/</span>
        <span className="font-medium text-ink">{page}</span>
      </p>

      <p className="ml-auto shrink-0 text-[13px] tabular-nums text-ink-2" suppressHydrationWarning>
        {now ? (
          <>
            <span className="hidden sm:inline">{qatarClock.format(now)} · </span>
            {qatarTime.format(now)} <span className="hidden text-ink-2 md:inline">Qatar</span>
          </>
        ) : null}
      </p>
    </header>
  )
}
