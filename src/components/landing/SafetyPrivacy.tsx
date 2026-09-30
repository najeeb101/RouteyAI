import Link from 'next/link'
import { SectionHeading } from '@/components/landing/SectionHeading'

const POINTS = [
  {
    title: 'Each school’s data is kept separate',
    desc: 'Access rules are enforced in the database itself, so one school can never see another school’s students, buses or routes.',
  },
  {
    title: 'Parents see only their own child',
    desc: 'A parent sees their child’s bus, stop and attendance. They never see other students or their addresses.',
  },
  {
    title: 'Drivers see only their own bus',
    desc: 'A driver sees the student list for the bus they are assigned to, and nothing else.',
  },
  {
    title: 'Parents hear about absences straight away',
    desc: 'When a driver marks a student boarded or absent, the parent gets a notification at once.',
  },
]

export function SafetyPrivacy() {
  return (
    <section id="safety" className="scroll-mt-16 border-y border-border bg-muted/50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <SectionHeading title="Student data and privacy" intro="Everyone sees only what they need for their role." />
        <div className="grid gap-x-12 sm:grid-cols-2">
          {POINTS.map(point => (
            <div key={point.title} className="border-t border-border py-6">
              <h3 className="text-base font-semibold text-foreground">{point.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{point.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[15px] text-muted-foreground">
          Read our{' '}
          <Link href="/privacy" className="font-semibold text-primary hover:underline">
            privacy policy
          </Link>{' '}
          for the details.
        </p>
      </div>
    </section>
  )
}
