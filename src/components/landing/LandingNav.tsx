'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { RouteyLogo } from '@/components/RouteyLogo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useOpenAppModal } from '@/components/landing/AppModalProvider'

const NAV_LINKS = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faqs' },
]

export function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const openAppModal = useOpenAppModal()

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const close = () => setMenuOpen(false)

  return (
    <nav className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-[#E2E8F0] dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        <Link href="/" onClick={close} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <RouteyLogo size={26} variant="gradient" />
          <span className="text-base font-extrabold tracking-tight">
            <span className="text-[#0F172A] dark:text-white">Routey</span>
            <span className="text-[#1E3A8A] dark:text-blue-400">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={openAppModal}
            className="hidden lg:block text-sm font-semibold text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors"
          >
            Get the App
          </button>
          <Link
            href="/login"
            className="hidden sm:block text-sm font-semibold text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors px-2"
          >
            Log in
          </Link>
          <a
            href="/#demo"
            className="bg-[#1E3A8A] text-white px-3.5 sm:px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1e40af] dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors whitespace-nowrap"
          >
            Book a demo
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl text-[#64748B] hover:bg-[#F1F5F9] dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pb-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={close}
              className="block rounded-lg px-3 py-3 text-[15px] font-medium text-[#334155] dark:text-slate-200 hover:bg-[#F1F5F9] dark:hover:bg-slate-900"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#E2E8F0] dark:border-slate-800 pt-3">
            <button
              type="button"
              onClick={() => { close(); openAppModal() }}
              className="rounded-lg border border-[#E2E8F0] dark:border-slate-800 px-3 py-2.5 text-sm font-semibold text-[#334155] dark:text-slate-200"
            >
              Get the App
            </button>
            <Link
              href="/login"
              onClick={close}
              className="rounded-lg border border-[#E2E8F0] dark:border-slate-800 px-3 py-2.5 text-center text-sm font-semibold text-[#334155] dark:text-slate-200"
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
