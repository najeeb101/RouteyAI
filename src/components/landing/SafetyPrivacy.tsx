import { BellRing, Building2, Eye, Lock } from 'lucide-react'
import { SectionHeading } from '@/components/landing/SectionHeading'
import { Reveal } from '@/components/landing/Reveal'

const POINTS = [
  {
    icon: Building2,
    title: 'Each school’s data stays separate',
    desc: 'Access rules are enforced inside the database itself, so one school can never see another school’s students, buses or routes.',
  },
  {
    icon: Eye,
    title: 'Parents see only their child’s bus',
    desc: 'A parent sees their own child’s bus, stop and attendance — never other students or their addresses.',
  },
  {
    icon: Lock,
    title: 'Drivers see only their route',
    desc: 'Drivers get the manifest for the bus they’re assigned to and nothing else.',
  },
  {
    icon: BellRing,
    title: 'No silent absences',
    desc: 'The moment a student is marked Boarded or Absent, their parent gets a push notification.',
  },
]

export function SafetyPrivacy() {
  return (
    <section id="safety" className="mx-auto mb-24 max-w-6xl scroll-mt-24 px-4 sm:px-6 md:mb-32">
      <div className="rounded-lg bg-slate-950 px-5 py-12 ring-1 ring-slate-800 sm:px-10 md:px-14 md:py-16">
        <SectionHeading
          inverted
          index="06"
          label="Safety & privacy"
          title="Built for children’s data"
          subtitle="Every role sees exactly what it needs, and nothing more."
        />
        <div className="grid border-t border-slate-800 sm:grid-cols-2">
          {POINTS.map(({ icon: Icon, title, desc }, i) => (
            <Reveal
              key={title}
              delay={i * 0.08}
              className="flex gap-4 border-b border-slate-800 py-7 sm:px-6 sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(odd)]:pl-0"
            >
              <Icon size={20} className="mt-0.5 shrink-0 text-accent" />
              <div>
                <h3 className="text-[15px] font-semibold text-white">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
