import { Check } from 'lucide-react'
import { DemoRequestForm } from '@/components/landing/DemoRequestForm'
import { Reveal } from '@/components/landing/Reveal'
import { SectionHeading } from '@/components/landing/SectionHeading'

const DEMO_POINTS = [
  'Routes being planned and buses tracked on a real map',
  'The driver and parent apps',
  'A quote for your fleet size',
]

/** The brand-navy band with the demo form. Same navy in both themes. */
export function FinalCta() {
  return (
    <section id="demo" className="relative isolate scroll-mt-20 overflow-hidden bg-brand">
      <span aria-hidden="true" className="absolute -left-24 -top-24 -z-10 h-80 w-80 rounded-full bg-white/[0.06]" />
      <span aria-hidden="true" className="absolute -bottom-40 left-1/3 -z-10 h-96 w-96 rounded-full bg-white/[0.04]" />
      <span aria-hidden="true" className="absolute right-8 top-8 -z-10 hidden h-10 w-10 rounded-full bg-warning lg:block" />
      <span aria-hidden="true" className="absolute right-24 top-8 -z-10 hidden h-10 w-10 rounded-full bg-accent lg:block" />
      <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <Reveal>
          <SectionHeading
            inverted
            title="See your own routes in a demo"
            intro="Tell us about your school and how many buses you run. We’ll set up a short demo and walk you through it."
            className="mb-10 md:mb-10"
          />
          <p className="text-[15px] font-semibold text-white">In the demo you’ll see:</p>
          <ul className="mt-4 space-y-3">
            {DEMO_POINTS.map(point => (
              <li key={point} className="flex items-start gap-3 text-[15px] text-white/85">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                  <Check size={12} strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal from="right" delay={0.1} className="rounded-[1.25rem] bg-card p-5 shadow-[0_30px_60px_-30px_hsl(var(--brand-ink)/0.8)] sm:p-8">
          <DemoRequestForm />
        </Reveal>
      </div>
    </section>
  )
}
