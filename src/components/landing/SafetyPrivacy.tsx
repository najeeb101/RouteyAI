import Link from 'next/link'
import { BellRing, Bus, Building2, UserRound, type LucideIcon } from 'lucide-react'
import { Reveal } from '@/components/landing/Reveal'
import { SectionHeading } from '@/components/landing/SectionHeading'

const POINTS: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Building2,
    title: 'Each school’s data is kept separate',
    desc: 'Access rules are enforced in the database itself, so each school only sees its own students, buses and routes.',
  },
  {
    icon: UserRound,
    title: 'Parents see only their own child',
    desc: 'A parent sees their child’s bus, stop and attendance. They don’t see other students or their addresses.',
  },
  {
    icon: Bus,
    title: 'Drivers see only their own bus',
    desc: 'A driver sees the student list for the bus they are assigned to, and nothing else.',
  },
  {
    icon: BellRing,
    title: 'Parents are told about absences',
    desc: 'When a driver marks a student boarded or absent, the parent gets a notification on their phone.',
  },
]

/** A navy band with the four privacy points. Same look in both themes. */
export function SafetyPrivacy() {
  return (
    <section id="safety" className="relative isolate scroll-mt-20 overflow-hidden bg-brand-ink">
      <div className="relative mx-auto max-w-7xl 2xl:max-w-[88rem] px-4 py-20 sm:px-6 lg:py-28">
        <div>
          <Reveal>
            <SectionHeading inverted title="Student data stays private" intro="Everyone sees only what they need for their role." />
          </Reveal>
          <ul className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
            {POINTS.map(({ icon: Icon, title, desc }, i) => (
              <li key={title}>
                <Reveal delay={i * 0.08}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-accent ring-1 ring-white/10">
                    <Icon size={19} />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-white/70">{desc}</p>
                </Reveal>
              </li>
            ))}
          </ul>
          <p className="mt-12 text-[15px] text-white/70">
            Read our{' '}
            <Link href="/privacy" className="font-semibold text-accent underline-offset-4 hover:underline">
              privacy policy
            </Link>{' '}
            for the details.
          </p>
        </div>
      </div>
    </section>
  )
}
