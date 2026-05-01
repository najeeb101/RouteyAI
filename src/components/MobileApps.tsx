import Image from 'next/image'

function DriverPhone() {
  return (
    <div className="relative h-[430px] w-[218px]">
      <div className="absolute inset-0 rounded-[2.4rem] bg-slate-950 shadow-[0_22px_60px_-20px_rgba(15,23,42,0.7)]" />
      <div className="absolute left-1/2 top-3 z-20 h-1.5 w-16 -translate-x-1/2 rounded-full bg-slate-700" />
      <div className="absolute inset-[7px] overflow-hidden rounded-[2rem] bg-black">
        <Image
          src="/assets/mockups/driver-app.png"
          alt="Driver App Mockup"
          fill
          className="object-cover object-center scale-[1.26]"
        />
      </div>
    </div>
  )
}

function ParentPhone() {
  return (
    <div className="relative h-[430px] w-[218px]">
      <div className="absolute inset-0 rounded-[2.4rem] bg-slate-100 shadow-[0_22px_60px_-20px_rgba(15,23,42,0.55)] ring-1 ring-slate-300" />
      <div className="absolute left-1/2 top-3 z-20 h-1.5 w-16 -translate-x-1/2 rounded-full bg-slate-300" />
      <div className="absolute inset-[7px] overflow-hidden rounded-[2rem] bg-white">
        <Image
          src="/assets/mockups/parent-app.png"
          alt="Parent App Mockup"
          fill
          className="object-cover object-center scale-[1.26]"
        />
      </div>
    </div>
  )
}

const storeButtonPrimary =
  'flex-1 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white'
const storeButtonSecondary =
  'flex-1 rounded-xl bg-white py-3 text-sm font-bold text-slate-900 ring-1 ring-slate-300 transition-all hover:-translate-y-0.5 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-700'

export function MobileAppsSection({ onDownloadClick }: { onDownloadClick: () => void }) {
  return (
    <section id="apps" className="mx-auto mb-16 max-w-6xl scroll-mt-24 px-6">
      <div className="mb-12 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#1E3A8A] shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-blue-400">
          Free Mobile Apps
        </div>
        <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-[#0F172A] dark:text-white md:text-5xl">
          Built for every role.
          <br />
          <span className="bg-gradient-to-r from-emerald-500 to-indigo-500 bg-clip-text text-transparent">In every pocket.</span>
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-[#64748B] dark:text-slate-400">
          Free apps for drivers and parents - real-time navigation, live tracking, and instant updates.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/40 p-6 shadow-[0_20px_50px_-30px_rgba(16,185,129,0.45)] dark:border-emerald-800/40 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900">
          <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_220px]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 6v6" />
                  <path d="M15 6v6" />
                  <path d="M2 12h19.6" />
                  <path d="M18 18h3s.5-1.7.8-4.3c.3-2.7.2-7.7.2-7.7H2S1.7 7 2 9.7c.3 2.6.8 4.3.8 4.3H5" />
                  <circle cx="7" cy="18" r="2" />
                  <circle cx="17" cy="18" r="2" />
                </svg>
                For Drivers
              </div>
              <h3 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Navigate. Check in. Repeat.</h3>
              <p className="mb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Turn-by-turn routing, per-stop student check-ins, and instant messages from school - all hands-free.
              </p>
              <ul className="mb-6 space-y-2.5">
                {[
                  'Turn-by-turn route navigation',
                  'Digital student check-in at every stop',
                  'Instant broadcast alerts from school',
                  'Live route progress and ETA updates',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-300 bg-emerald-100 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                <button onClick={onDownloadClick} className={storeButtonPrimary}>
                  App Store
                </button>
                <button onClick={onDownloadClick} className={storeButtonSecondary}>
                  Google Play
                </button>
              </div>
            </div>
            <div className="mx-auto">
              <DriverPhone />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-100/40 p-6 shadow-[0_20px_50px_-30px_rgba(99,102,241,0.5)] dark:border-indigo-800/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900">
          <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_220px]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-100 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-indigo-700 dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                For Parents
              </div>
              <h3 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Know where your child is. Always.</h3>
              <p className="mb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Live bus location, boarding confirmation, and real-time ETA - before your child even gets on the bus.
              </p>
              <ul className="mb-6 space-y-2.5">
                {[
                  'Live bus location on an interactive map',
                  'Boarding and drop-off confirmations',
                  'Real-time ETA to stop and school',
                  'Instant delay and absence alerts',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-indigo-300 bg-indigo-100 text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/15">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                <button onClick={onDownloadClick} className={storeButtonPrimary}>
                  App Store
                </button>
                <button onClick={onDownloadClick} className={storeButtonSecondary}>
                  Google Play
                </button>
              </div>
            </div>
            <div className="mx-auto">
              <ParentPhone />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
