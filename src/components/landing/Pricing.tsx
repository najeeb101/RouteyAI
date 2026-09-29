import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionHeading } from '@/components/landing/SectionHeading'
import { PLAN_SUPPORT, type PlanName } from '@/lib/siteConfig'

const BASE_POINTS = ['Every RouteyAI feature', 'Web dashboard for school admins', 'Driver and parent apps']

const PLANS: { name: PlanName; fleet: string; blurb: string; featured: boolean }[] = [
  { name: 'Starter', fleet: 'Up to 5 buses', blurb: 'For small schools running their first digital routes.', featured: false },
  { name: 'Growth', fleet: '6–50 buses', blurb: 'For schools with a full fleet and hundreds of families.', featured: true },
  { name: 'Enterprise', fleet: '50+ buses', blurb: 'For large fleets.', featured: false },
]

export function Pricing() {
  return (
    <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 mb-24 scroll-mt-24">
      <SectionHeading
        eyebrow="Pricing"
        title="Priced by fleet size"
        subtitle="Every plan includes every feature. Tell us about your fleet and we’ll send you a quote."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map(plan => (
          <div
            key={plan.name}
            className={cn(
              'relative flex flex-col rounded-3xl border p-7 bg-white dark:bg-slate-900',
              plan.featured
                ? 'border-[#1E3A8A] dark:border-blue-500 shadow-[0_20px_50px_-25px_rgba(30,58,138,0.45)]'
                : 'border-[#E2E8F0] dark:border-slate-800 shadow-sm'
            )}
          >
            {plan.featured && (
              <span className="absolute -top-3 left-7 rounded-full bg-[#1E3A8A] dark:bg-blue-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                Most schools
              </span>
            )}
            <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">{plan.name}</h3>
            <p className="mt-1 text-sm font-semibold text-[#1E3A8A] dark:text-blue-400">{plan.fleet}</p>
            <p className="mt-3 text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">{plan.blurb}</p>
            <ul className="mt-6 mb-8 space-y-3">
              {[...BASE_POINTS, ...PLAN_SUPPORT[plan.name]].map(point => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-[#334155] dark:text-slate-300">
                  <Check size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                  {point}
                </li>
              ))}
            </ul>
            <a
              href="#demo"
              className={cn(
                'mt-auto rounded-xl px-5 py-3 text-center text-sm font-bold transition-colors',
                plan.featured
                  ? 'bg-[#1E3A8A] text-white hover:bg-[#1e40af] dark:bg-blue-600 dark:hover:bg-blue-500'
                  : 'border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-slate-800'
              )}
            >
              Contact us
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}
