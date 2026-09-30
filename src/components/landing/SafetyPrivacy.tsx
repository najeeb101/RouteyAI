import Image from 'next/image'
import Link from 'next/link'
import { BellRing, Bus, Building2, UserRound, type LucideIcon } from 'lucide-react'
import { Reveal } from '@/components/landing/Reveal'
import { SectionHeading } from '@/components/landing/SectionHeading'
import { PHOTOS } from '@/components/landing/photos'

const POINTS: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Building2,
    title: 'Each school’s data is kept separate',
    desc: 'Access rules are enforced in the database itself, so one school can never see another school’s students, buses or routes.',
  },
  {
    icon: UserRound,
    title: 'Parents see only their own child',
    desc: 'A parent sees their child’s bus, stop and attendance. They never see other students or their addresses.',
  },
  {
    icon: Bus,
    title: 'Drivers see only their own bus',
    desc: 'A driver sees the student list for the bus they are assigned to, and nothing else.',
  },
  {
    icon: BellRing,
    title: 'Parents hear about absences straight away',
    desc: 'When a driver marks a student boarded or absent, the parent gets a notification at once.',
  },
]

export function SafetyPrivacy() {
  return (
    <section id="safety" className="scroll-mt-16 border-y border-border bg-muted/50">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <Reveal>
            <SectionHeading title="Student data and privacy" intro="Everyone sees only what they need for their role." />
          </Reveal>
          <ul className="space-y-6">
            {POINTS.map(({ icon: Icon, title, desc }, i) => (
              <li key={title}>
                <Reveal delay={i * 0.08} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Icon size={19} />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{desc}</p>
                </div>
                </Reveal>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[15px] text-muted-foreground">
            Read our{' '}
            <Link href="/privacy" className="font-semibold text-primary hover:underline">
              privacy policy
            </Link>{' '}
            for the details.
          </p>
        </div>

        <Reveal from="right" className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div aria-hidden="true" className="absolute -right-3 -top-3 hidden h-full w-full rounded-[28px] border-2 border-primary/15 sm:block" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[28px]">
            <Image
              src={PHOTOS.students.src}
              alt={PHOTOS.students.alt}
              fill
              sizes="(min-width: 1024px) 480px, 100vw"
              className="object-cover"
            />
          </div>
          <span aria-hidden="true" className="absolute -left-5 top-12 h-12 w-12 rounded-full bg-warning" />
          <span aria-hidden="true" className="absolute -bottom-4 right-16 h-8 w-8 rounded-full bg-accent" />
        </Reveal>
      </div>
    </section>
  )
}
