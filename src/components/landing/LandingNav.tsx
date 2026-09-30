'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
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
  const [scrolled, setScrolled] = useState(false)
  const openAppModal = useOpenAppModal()
  const reduceMotion = useReducedMotion()
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.3 })
  const busLeft = useTransform(progress, v => `${Math.max(v * 100, 1.5)}%`)

  useMotionValueEvent(scrollY, 'change', y => setScrolled(y > 8))

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const close = () => setMenuOpen(false)

  return (
    <nav
      className={cn(
        'sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md transition-[border-color,box-shadow] duration-300',
        scrolled ? 'border-border shadow-[0_8px_24px_-18px_rgb(15_23_42/0.35)]' : 'border-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" onClick={close} className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <RouteyLogo size={26} variant="gradient" />
          <span className="text-base font-semibold tracking-tight text-foreground">
            Routey<span className="text-primary">AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 text-sm text-muted-foreground transition-[color,background-size] duration-300 hover:bg-[length:100%_1px] hover:text-foreground"
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
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground lg:block"
          >
            Get the app
          </button>
          <Link href="/login" className="hidden px-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:block">
            Log in
          </Link>
          <a
            href="/#demo"
            className="whitespace-nowrap rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:px-4"
          >
            Book a demo
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted md:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Scroll progress drawn as a route line with the bus at its head */}
      {!reduceMotion && (
        <div aria-hidden="true" className="absolute inset-x-0 -bottom-px h-[2px]">
          <motion.div className="h-full origin-left bg-primary" style={{ scaleX: progress }} />
          <motion.span
            className="absolute top-1/2 block h-2 w-3.5 -translate-x-full -translate-y-1/2 rounded-[3px] bg-primary ring-2 ring-background"
            style={{ left: busLeft }}
          />
        </div>
      )}

      {menuOpen && (
        <div
          id="mobile-menu"
          className="border-t border-border bg-background px-4 pb-4 pt-2 duration-200 animate-in fade-in slide-in-from-top-2 md:hidden"
        >
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={close}
              className="block rounded-md px-3 py-3 text-[15px] font-medium text-foreground hover:bg-muted"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-3">
            <button
              type="button"
              onClick={() => { close(); openAppModal() }}
              className="rounded-md border border-border px-3 py-2.5 text-sm font-semibold text-foreground"
            >
              Get the app
            </button>
            <Link
              href="/login"
              onClick={close}
              className="rounded-md border border-border px-3 py-2.5 text-center text-sm font-semibold text-foreground"
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
