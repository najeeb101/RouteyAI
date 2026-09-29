import { LayoutDashboard, Route, ShieldCheck, Smartphone } from 'lucide-react'

const ITEMS = [
  { icon: LayoutDashboard, label: 'Web dashboard for school admins' },
  { icon: Smartphone, label: 'iOS & Android apps for drivers and parents' },
  { icon: Route, label: 'Real road travel times via Mapbox' },
  { icon: ShieldCheck, label: 'Every school’s data kept separate' },
]

export function TrustStrip() {
  return (
    <section aria-label="Platform highlights" className="max-w-6xl mx-auto px-4 sm:px-6 mb-20 md:mb-24">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {ITEMS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 px-4 py-3.5"
          >
            <Icon size={18} className="shrink-0 text-[#1E3A8A] dark:text-blue-400" />
            <span className="text-[13px] font-semibold text-[#334155] dark:text-slate-300 leading-snug">{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
