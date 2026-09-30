import { Check } from 'lucide-react'
import { DemoRequestForm } from '@/components/landing/DemoRequestForm'
import { Reveal } from '@/components/landing/Reveal'
import { SectionHeading } from '@/components/landing/SectionHeading'

const DEMO_POINTS = [
  'Routes being planned and buses tracked on a real map',
  'The driver and parent apps',
  'A quote for your fleet size',
]

export function FinalCta() {
  return (
    <section id="demo" className="relative isolate scroll-mt-16 overflow-hidden bg-primary">
      <span aria-hidden="true" className="absolute -left-24 -top-24 -z-10 h-72 w-72 rounded-full bg-white/[0.06]" />
      <span aria-hidden="true" className="absolute -bottom-32 left-1/3 -z-10 h-80 w-80 rounded-full bg-white/[0.04]" />
      <span aria-hidden="true" className="absolute right-8 top-8 -z-10 hidden h-10 w-10 rounded-full bg-warning lg:block" />
      <span aria-hidden="true" className="absolute right-24 top-8 -z-10 hidden h-10 w-10 rounded-full bg-white lg:block" />
      <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <Reveal>
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
        </Reveal>

        <Reveal from="right" delay={0.1} className="rounded-lg bg-card p-5 shadow-lg sm:p-7">
          <DemoRequestForm />
        </Reveal>
      </div>
    </section>
  )
}
