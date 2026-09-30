import { Check } from 'lucide-react'
import { DemoRequestForm } from '@/components/landing/DemoRequestForm'
import { SectionHeading } from '@/components/landing/SectionHeading'

const DEMO_POINTS = [
  'Route optimization and live tracking on a real map',
  'A walkthrough of the driver and parent apps',
  'A quote based on your fleet size',
]

export function FinalCta() {
  return (
    <section id="demo" className="mx-auto mb-24 max-w-6xl scroll-mt-24 px-4 sm:px-6 md:mb-32">
      <div className="grid items-start gap-10 border-t border-border pt-14 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <SectionHeading
            index="08"
            label="Last stop"
            title="See RouteyAI on your school’s routes"
            subtitle="Tell us a little about your school. We’ll set up a short demo tailored to your fleet."
            className="mb-8 md:mb-8"
          />
          <ul className="space-y-3">
            {DEMO_POINTS.map(point => (
              <li key={point} className="flex items-start gap-3 text-sm text-foreground">
                <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-[0_1px_2px_rgb(15_23_42/0.04),0_24px_48px_-28px_rgb(15_23_42/0.2)] sm:p-7">
          <DemoRequestForm />
        </div>
      </div>
    </section>
  )
}
