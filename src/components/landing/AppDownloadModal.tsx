'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Smartphone, X } from 'lucide-react'
import { RouteyLogo } from '@/components/RouteyLogo'
import { AppleIcon, GooglePlayIcon } from '@/components/landing/StoreIcons'

export function AppDownloadModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
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
            <h2 id="app-modal-title" className="text-xl font-semibold tracking-tight text-foreground">Get the mobile app</h2>
            <p className="mt-1 text-sm text-muted-foreground">For drivers and parents. Coming soon to iOS and Android.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-6 flex items-center gap-4 rounded-md border border-border bg-muted/50 p-4">
          <Smartphone size={22} className="shrink-0 text-primary" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            The apps are in final testing. Your school will send you an invite link as soon as they&apos;re live in the stores.
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
          <Link href="/login" className="font-semibold text-primary hover:underline">
            web dashboard
          </Link>{' '}
          instead.
        </p>
      </motion.div>
    </motion.div>
  )
}
