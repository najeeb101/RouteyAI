import { OptimizeDemo } from '@/components/landing/OptimizeDemo'
import { Reveal } from '@/components/landing/Reveal'
import { SectionHeading } from '@/components/landing/SectionHeading'

const STEPS = [
  {
    title: 'Add your students',
    desc: 'Enter each student’s home address. RouteyAI finds it and puts it on the map.',
  },
  {
    title: 'Create the routes',
    desc: 'Press Optimize. Students are grouped by area, no bus goes over its seat count, and the stops are put in order using real road travel times.',
  },
  {
    title: 'Invite drivers and parents',
    desc: 'Assign a driver to each bus and send every parent a personal invite link. Each person signs in to their own view.',
  },
  {
    title: 'Run the route',
    desc: 'The driver starts the route and marks each student as boarded or absent. Parents follow the bus on a map.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 border-y border-border bg-muted/50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <SectionHeading title="How it works" intro="Four steps from a list of addresses to buses on the road." />
        </Reveal>

        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <ol className="space-y-7">
              {STEPS.map((step, i) => (
                <li key={step.title}>
                  <Reveal delay={i * 0.1} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {i + 1}
                    </span>
                    <div className="pt-1">
                      <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                      <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{step.desc}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
            <Reveal delay={0.4}>
              <p className="mt-8 border-t border-border pt-6 text-[15px] leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">Students who join mid-year</span> are added to the nearest bus
                with a free seat, and that bus’s route is recalculated.
              </p>
            </Reveal>
          </div>

          <Reveal from="right" delay={0.15}>
            <OptimizeDemo />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
