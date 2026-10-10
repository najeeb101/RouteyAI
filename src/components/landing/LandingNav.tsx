'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { RouteyLogo } from '@/components/RouteyLogo'

const NAV_LINKS = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Drivers & parents', href: '/#apps' },
  { label: 'Privacy', href: '/#safety' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faqs' },
]

/**
 * Site navigation. With `overlay` it floats over the hero photo and only gets a background once the page scrolls;
 * otherwise it is a normal sticky bar.
 */
export function LandingNav({ overlay = false }: { overlay?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const reduceMotion = useReducedMotion()
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.3 })
  const busLeft = useTransform(progress, v => `${Math.max(v * 100, 1.5)}%`)

  useMotionValueEvent(scrollY, 'change', y => setScrolled(y > 12))
  useEffect(() => setScrolled(window.scrollY > 12), [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const close = () => setMenuOpen(false)
  const solid = !overlay || scrolled || menuOpen

  return (
    <nav
      aria-label="Main"
      className={cn(
        'top-0 z-30 w-full border-b transition-[background-color,border-color,box-shadow] duration-300',
        overlay ? 'fixed inset-x-0' : 'sticky',
        solid
          ? 'border-border bg-background/85 shadow-[0_8px_24px_-18px_hsl(var(--brand-ink)/0.5)] backdrop-blur-lg'
          : 'border-transparent bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:h-[72px]">
        <Link href="/" onClick={close} className="flex items-center gap-2 rounded-md">
          <RouteyLogo size={28} variant="gradient" />
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            Routey<span className="text-primary">AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeButton className="hidden sm:flex" />
          <Link
            href="/login"
            className="hidden rounded-full px-3.5 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-foreground/[0.06] hover:text-foreground sm:block"
          >
            Log in
          </Link>
          <a
            href="/#demo"
            className="whitespace-nowrap rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,background-color] duration-200 hover:bg-primary/90 active:scale-[0.98] sm:px-5"
          >
            Book a demo
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/[0.06] lg:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Scroll progress drawn as a route line with a bus at its head */}
      {!reduceMotion && (
        <div aria-hidden="true" className={cn('absolute inset-x-0 -bottom-px h-[2px] transition-opacity duration-300', solid ? 'opacity-100' : 'opacity-0')}>
          <motion.div className="h-full origin-left bg-primary" style={{ scaleX: progress }} />
          <motion.span
            className="absolute top-1/2 block h-2 w-3.5 -translate-x-full -translate-y-1/2 rounded-[3px] bg-primary ring-2 ring-background"
            style={{ left: busLeft }}
          />
        </div>
      )}

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-border bg-background px-4 pb-4 pt-2 lg:hidden">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={close}
              className="block rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center justify-between rounded-lg px-3 py-2 sm:hidden">
            <span className="text-base font-medium text-foreground">Dark mode</span>
            <ThemeButton />
          </div>
          <Link
            href="/login"
            onClick={close}
            className="mt-2 block rounded-full border border-border px-3 py-3 text-center text-base font-semibold text-foreground"
          >
            Log in
          </Link>
        </div>
      )}
    </nav>
  )
}

/** Switches between light and dark. Both icons are rendered and CSS picks one, so there's no hydration mismatch. */
function ThemeButton({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Switch between light and dark mode"
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full text-foreground/75 transition-colors hover:bg-foreground/[0.06] hover:text-foreground',
        className
      )}
    >
      <Moon size={18} className="dark:hidden" />
      <Sun size={18} className="hidden dark:block" />
    </button>
  )
}
