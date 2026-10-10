'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Smartphone, X } from 'lucide-react'
import { RouteyLogo } from '@/components/RouteyLogo'
import { AppleIcon, GooglePlayIcon } from '@/components/landing/StoreIcons'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function AppDownloadModal({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // Keyboard: focus moves into the dialog, Tab stays inside it, Escape closes it, and focus goes back to the button
  // that opened it.
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const items = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (!items || items.length === 0) return
      const first = items[0] as HTMLElement
      const last = items[items.length - 1] as HTMLElement
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      opener?.focus()
    }
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-modal-title"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-lg border border-border bg-card p-7 shadow-[0_24px_60px_-20px_rgb(15_23_42/0.45)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <RouteyLogo size={22} variant="gradient" />
              <span className="font-semibold text-foreground">Routey<span className="text-primary">AI</span></span>
            </div>
            <h2 id="app-modal-title" className="text-xl font-semibold tracking-tight text-foreground">The mobile apps</h2>
            <p className="mt-1 text-sm text-muted-foreground">For drivers and parents. Coming soon to iOS and Android.</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="mb-6 flex items-center gap-4 rounded-md border border-border bg-muted/50 p-4">
          <Smartphone aria-hidden="true" size={22} className="shrink-0 text-primary" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            The apps are not in the stores yet. Your school will send you an invite link when they are.
          </p>
        </div>

        <div className="mb-5 flex gap-3">
          {[
            { icon: <AppleIcon />, small: 'Coming soon to the', big: 'App Store' },
            { icon: <GooglePlayIcon />, small: 'Coming soon on', big: 'Google Play' },
          ].map(store => (
            <div
              key={store.big}
              aria-disabled="true"
              className="flex flex-1 cursor-not-allowed items-center gap-2.5 rounded-md bg-slate-950 px-4 py-3 text-white opacity-60"
            >
              {store.icon}
              <div className="text-left">
                <div className="text-[9px] leading-none text-white/60">{store.small}</div>
                <div className="text-[13px] font-semibold leading-tight">{store.big}</div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[13px] text-muted-foreground">
          School admins use the{' '}
          <Link href="/login" className="font-semibold text-primary underline underline-offset-2">
            web dashboard
          </Link>{' '}
          instead.
        </p>
      </motion.div>
    </motion.div>
  )
}
