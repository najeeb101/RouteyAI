import { Check } from 'lucide-react'
import { SectionHeading } from '@/components/landing/SectionHeading'
import { PLAN_SUPPORT, type PlanName } from '@/lib/siteConfig'

const PLANS: { name: PlanName; fleet: string; blurb: string }[] = [
  { name: 'Starter', fleet: 'Up to 5 buses', blurb: 'For small schools with a few buses.' },
  { name: 'Growth', fleet: '6 to 50 buses', blurb: 'For schools running a full fleet.' },
  { name: 'Enterprise', fleet: 'More than 50 buses', blurb: 'For large fleets.' },
]

const INCLUDED = [
  'Route planning for your whole fleet',
  'New students placed on the nearest bus with space',
  'Live map of every bus',
  'Seat capacity for every bus',
  'Announcements to one bus or all of them',
  'Web dashboard for school staff',
  'Driver app with pickup list and attendance',
  'Parent app with bus tracking and notifications',
]

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-16 sm:px-6 md:py-24">
      <SectionHeading
        title="Pricing"
        intro="Priced by the number of buses you run. Every plan includes the full product. Tell us about your fleet and we’ll send you a quote."
      />

      <div className="grid overflow-hidden rounded-lg border border-border bg-card lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col divide-y divide-border">
          {PLANS.map(plan => (
            <div key={plan.name} className="flex flex-1 flex-wrap items-center justify-between gap-x-6 gap-y-1 px-6 py-5">
              <div>
                <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-0.5 text-[15px] text-muted-foreground">{plan.blurb}</p>
                {PLAN_SUPPORT[plan.name].length > 0 && (
                  <p className="mt-1 text-[13px] text-muted-foreground">{PLAN_SUPPORT[plan.name].join(' · ')}</p>
                )}
              </div>
              <p className="text-lg font-bold text-primary">{plan.fleet}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col border-t border-border bg-muted/50 px-6 py-6 lg:border-l lg:border-t-0">
          <h3 className="text-base font-semibold text-foreground">Included in every plan</h3>
          <ul className="mt-4 space-y-2.5">
            {INCLUDED.map(item => (
              <li key={item} className="flex items-start gap-2.5 text-[15px] leading-snug text-foreground">
                <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
          <a
            href="#demo"
            className="mt-7 rounded-md bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get a quote
          </a>
        </div>
      </div>
    </section>
  )
}
