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
  'Driver app with pickup and drop-off lists and attendance',
  'Parent app with bus tracking and notifications',
]

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6 md:py-28">
      <SectionHeading
        title="One product, priced by fleet size"
        intro="Every plan includes everything. Tell us how many buses you run and we’ll send you a quote."
      />

      <div className="grid overflow-hidden rounded-[1.25rem] border border-border bg-card lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col divide-y divide-border">
          {PLANS.map(plan => (
            <div key={plan.name} className="flex flex-1 flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-6 md:px-8">
              <div>
                <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-0.5 text-[15px] text-muted-foreground">{plan.blurb}</p>
                {PLAN_SUPPORT[plan.name].length > 0 && (
                  <p className="mt-1 text-[13px] text-muted-foreground">{PLAN_SUPPORT[plan.name].join(', ')}</p>
                )}
              </div>
              <p className="font-display text-2xl font-bold tracking-tight text-primary">{plan.fleet}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col border-t border-border bg-muted/60 px-6 py-7 md:px-8 lg:border-l lg:border-t-0">
          <h3 className="text-base font-semibold text-foreground">Included in every plan</h3>
          <ul className="mt-5 space-y-3">
            {INCLUDED.map(item => (
              <li key={item} className="flex items-start gap-3 text-[15px] leading-snug text-foreground">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check size={12} strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <a
            href="#demo"
            className="mt-8 rounded-full bg-primary px-5 py-3.5 text-center text-[15px] font-semibold text-primary-foreground transition-[transform,background-color] duration-200 hover:bg-primary/90 active:scale-[0.98]"
          >
            Request a quote
          </a>
        </div>
      </div>
    </section>
  )
}
