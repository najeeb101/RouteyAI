'use client'

import { useEffect } from 'react'
import Link from 'next/link'
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
    <div
      className="fixed inset-0 bg-[#0F172A]/40 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 px-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-modal-title"
        className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-md shadow-[0_20px_60px_-15px_rgb(0_0_0/0.35)] dark:shadow-[0_20px_60px_-15px_rgb(0_0_0/0.7)] animate-in zoom-in-95 duration-300 border border-transparent dark:border-slate-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <RouteyLogo size={24} variant="gradient" />
              <span className="font-extrabold text-[#0F172A] dark:text-white">Routey<span className="text-[#1E3A8A] dark:text-blue-400">AI</span></span>
            </div>
            <h2 id="app-modal-title" className="text-xl font-bold text-[#0F172A] dark:text-white">Get the Mobile App</h2>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">For drivers and parents — coming soon to iOS & Android.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 bg-[#F1F5F9] dark:bg-slate-800 rounded-xl flex items-center justify-center text-[#64748B] dark:text-slate-400 shrink-0 hover:bg-[#E2E8F0] dark:hover:bg-slate-700 transition-colors"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex items-center gap-4 bg-[#F8FAFC] dark:bg-slate-800/50 border border-[#E2E8F0] dark:border-slate-700 rounded-2xl p-5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] dark:bg-slate-800 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400 shrink-0">
            <Smartphone size={22} />
          </div>
          <p className="text-sm text-[#475569] dark:text-slate-300 leading-relaxed">
            The apps are in final testing. Your school will send you an invite link as soon as they&apos;re live in the stores.
          </p>
        </div>

        <div className="flex gap-3 mb-5">
          {[
            { icon: <AppleIcon />, small: 'Coming soon to the', big: 'App Store' },
            { icon: <GooglePlayIcon />, small: 'Coming soon on', big: 'Google Play' },
          ].map(store => (
            <div
              key={store.big}
              aria-disabled="true"
              className="flex-1 bg-[#0F172A] text-white rounded-xl px-4 py-3 flex items-center gap-2.5 opacity-60 cursor-not-allowed"
            >
              {store.icon}
              <div className="text-left">
                <div className="text-[9px] text-white/60 leading-none">{store.small}</div>
                <div className="text-[13px] font-bold leading-tight">{store.big}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-[#EFF6FF] dark:bg-blue-950/40 border border-[#BFDBFE] dark:border-blue-900/60 rounded-xl px-3.5 py-2.5">
          <p className="text-[12px] text-[#1E3A8A] dark:text-blue-300">
            School admins use the <Link href="/login" className="font-bold underline">web dashboard</Link> instead.
          </p>
        </div>
      </div>
    </div>
  )
}
