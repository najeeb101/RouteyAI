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
    <section id="pricing" className="mx-auto mb-24 max-w-6xl scroll-mt-24 px-4 sm:px-6 md:mb-32">
      <SectionHeading
        index="07"
        label="Pricing"
        title="Priced by fleet size"
        subtitle="Every plan includes every feature. Tell us about your fleet and we’ll send you a quote."
      />
      <div className="grid overflow-hidden rounded-lg border border-border bg-card md:grid-cols-3 md:divide-x md:divide-border">
        {PLANS.map(plan => (
          <div
            key={plan.name}
            className={cn(
              'relative flex flex-col border-b border-border p-7 last:border-b-0 md:border-b-0',
              plan.featured && 'bg-primary/[0.03]'
            )}
          >
            {plan.featured && <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-primary" />}
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
              {plan.featured && <span className="text-xs font-medium text-primary">Most schools</span>}
            </div>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{plan.fleet}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{plan.blurb}</p>
            <ul className="mb-8 mt-6 space-y-2.5">
              {[...BASE_POINTS, ...PLAN_SUPPORT[plan.name]].map(point => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check size={15} className="mt-0.5 shrink-0 text-primary" />
                  {point}
                </li>
              ))}
            </ul>
            <a
              href="#demo"
              className={cn(
                'mt-auto rounded-md px-4 py-2.5 text-center text-sm font-semibold transition-colors',
                plan.featured
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'border border-border text-foreground hover:bg-muted'
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
