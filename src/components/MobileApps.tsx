import Image from 'next/image'
import { motion } from 'framer-motion'

function DriverPhone() {
  return (
    <div className="relative w-[240px] h-[490px] drop-shadow-[0_30px_60px_rgba(0,0,0,0.2)]">
      <Image 
        src="/assets/mockups/driver-app.png" 
        alt="Driver App Mockup" 
        fill
        className="object-contain"
      />
    </div>
  )
}

function ParentPhone() {
  return (
    <div className="relative w-[240px] h-[490px] drop-shadow-[0_30px_60px_rgba(0,0,0,0.2)]">
      <Image 
        src="/assets/mockups/parent-app.png" 
        alt="Parent App Mockup" 
        fill
        className="object-contain"
      />
    </div>
  )
}

export function MobileAppsSection({ onDownloadClick }: { onDownloadClick: () => void }) {
  return (
    <section id="apps" className="max-w-6xl mx-auto px-6 mb-16 scroll-mt-24">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-[#BFDBFE] dark:border-slate-700 rounded-full px-4 py-1.5 text-[11px] font-bold text-[#1E3A8A] dark:text-blue-400 mb-5 uppercase tracking-wide shadow-sm">
          Free Mobile Apps
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] dark:text-white tracking-tight mb-4">
          Built for every role.<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-purple-500">In every pocket.</span>
        </h2>
        <p className="text-[#64748B] dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Free apps for drivers and parents — real-time navigation, live tracking, and instant updates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">

        {/* Driver card */}
        <div className="bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/50 dark:via-slate-900 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800/30 rounded-3xl p-8 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/25 dark:text-emerald-400 text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide mb-4">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/>
              <path d="M18 18h3s.5-1.7.8-4.3c.3-2.7.2-7.7.2-7.7H2S1.7 7 2 9.7c.3 2.6.8 4.3.8 4.3H5"/>
              <circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
            </svg>
            For Drivers
          </div>

          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white text-center mb-2">Navigate. Check in. Repeat.</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-6 max-w-xs leading-relaxed">
            Turn-by-turn routing, per-stop student check-ins, and instant messages from school — all hands-free.
          </p>

          <div className="mb-8">
            <DriverPhone />
          </div>

          <ul className="w-full space-y-2.5 mb-8">
            {[
              'Turn-by-turn route navigation',
              'Digital student check-in at every stop',
              'Instant broadcast alerts from school',
              'Live route progress & ETA updates',
            ].map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                <span className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 dark:bg-emerald-500/15 dark:border-emerald-500/30 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                {f}
              </li>
            ))}
          </ul>

          <div className="flex gap-3 w-full">
            <button
              onClick={onDownloadClick}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 rounded-xl transition-all hover:shadow-[0_6px_20px_-4px_rgba(16,185,129,0.45)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              App Store
            </button>
            <button
              onClick={onDownloadClick}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 rounded-xl transition-all hover:shadow-[0_6px_20px_-4px_rgba(16,185,129,0.45)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M3.18 23.76c.3.17.65.19.97.08l11.46-6.62-2.36-2.36-10.07 8.9zM20.73 9.11L17.5 7.23 14.86 9.87l2.77 2.77 3.12-1.8c.89-.51.89-1.74-.02-2.73zM2.13.29C1.86.56 1.7.97 1.7 1.5v21c0 .53.16.94.43 1.21l.07.06 11.76-11.76v-.28L2.2.23l-.07.06zM14.57 10.53l-2.77-2.77L2.2.23l12.37 10.3z"/></svg>
              Google Play
            </button>
          </div>
        </div>

        {/* Parent card */}
        <div className="bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/50 dark:via-slate-900 dark:to-slate-900 border border-purple-200 dark:border-purple-800/30 rounded-3xl p-8 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-200 text-purple-700 dark:bg-purple-500/10 dark:border-purple-500/25 dark:text-purple-400 text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide mb-4">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            For Parents
          </div>

          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white text-center mb-2">Know where your child is. Always.</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-6 max-w-xs leading-relaxed">
            Live bus location, boarding confirmation, and real-time ETA — before your child even gets on the bus.
          </p>

          <div className="mb-8">
            <ParentPhone />
          </div>

          <ul className="w-full space-y-2.5 mb-8">
            {[
              'Live bus location on an interactive map',
              'Boarding & drop-off confirmations',
              'Real-time ETA to stop and school',
              'Instant delay and absence alerts',
            ].map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                <span className="w-5 h-5 rounded-full bg-purple-100 border border-purple-300 dark:bg-purple-500/15 dark:border-purple-500/30 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                {f}
              </li>
            ))}
          </ul>

          <div className="flex gap-3 w-full">
            <button
              onClick={onDownloadClick}
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm py-3 rounded-xl transition-all hover:shadow-[0_6px_20px_-4px_rgba(124,58,237,0.45)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              App Store
            </button>
            <button
              onClick={onDownloadClick}
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm py-3 rounded-xl transition-all hover:shadow-[0_6px_20px_-4px_rgba(124,58,237,0.45)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M3.18 23.76c.3.17.65.19.97.08l11.46-6.62-2.36-2.36-10.07 8.9zM20.73 9.11L17.5 7.23 14.86 9.87l2.77 2.77 3.12-1.8c.89-.51.89-1.74-.02-2.73zM2.13.29C1.86.56 1.7.97 1.7 1.5v21c0 .53.16.94.43 1.21l.07.06 11.76-11.76v-.28L2.2.23l-.07.06zM14.57 10.53l-2.77-2.77L2.2.23l12.37 10.3z"/></svg>
              Google Play
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}
