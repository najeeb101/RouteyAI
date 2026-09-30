import { Check } from 'lucide-react'
import { DemoRequestForm } from '@/components/landing/DemoRequestForm'
import { SectionHeading } from '@/components/landing/SectionHeading'

const DEMO_POINTS = [
  'Routes being planned and buses tracked on a real map',
  'The driver and parent apps',
  'A quote for your fleet size',
]

export function FinalCta() {
  return (
    <section id="demo" className="scroll-mt-16 bg-primary">
      <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <SectionHeading
            inverted
            title="Book a demo"
            intro="Tell us about your school and how many buses you run. We’ll set up a short demo and walk you through it."
            className="mb-8 md:mb-8"
          />
          <p className="text-[15px] font-semibold text-primary-foreground">In the demo you’ll see:</p>
          <ul className="mt-3 space-y-2.5">
            {DEMO_POINTS.map(point => (
              <li key={point} className="flex items-start gap-3 text-[15px] text-primary-foreground/90">
                <Check size={16} className="mt-0.5 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg bg-card p-5 shadow-lg sm:p-7">
          <DemoRequestForm />
        </div>
      </div>
    </section>
  )
}
