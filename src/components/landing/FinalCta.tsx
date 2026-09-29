import { CalendarCheck, Check } from 'lucide-react'
import { DemoRequestForm } from '@/components/landing/DemoRequestForm'

const DEMO_POINTS = [
  'Route optimization and live tracking on a real map',
  'A walkthrough of the driver and parent apps',
  'A quote based on your fleet size',
]

export function FinalCta() {
  return (
    <section id="demo" className="max-w-6xl mx-auto px-4 sm:px-6 mb-24 md:mb-32 scroll-mt-24">
      <div className="relative p-6 sm:p-10 md:p-14 rounded-[2rem] md:rounded-[40px] overflow-hidden bg-[#F8FAFF] dark:bg-slate-900/50 border border-blue-100 dark:border-slate-800/60">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/40 text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-6">
              <CalendarCheck size={12} />
              Book a demo
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-5 leading-[1.1]">
              Ready to modernize{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-200">
                your school&apos;s fleet?
              </span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg mb-8 leading-relaxed">
              Tell us a little about your school. We&apos;ll set up a short demo tailored to your fleet.
            </p>
            <ul className="space-y-3">
              {DEMO_POINTS.map(point => (
                <li key={point} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 p-5 sm:p-7 shadow-xl shadow-blue-500/5">
            <DemoRequestForm />
          </div>
        </div>
      </div>
    </section>
  )
}
