import { BellRing, Bus, CheckCircle2, House, School, type LucideIcon } from 'lucide-react'
import { Reveal } from '@/components/landing/Reveal'
import { SectionHeading } from '@/components/landing/SectionHeading'

type Moment = { time: string; icon: LucideIcon; title: string; body: string }

/**
 * One school day as a parent sees it. The notification wording is what supabase/functions/_shared/notifications.ts
 * sends; the names, school and times are examples.
 */
const RUNS: { name: string; summary: string; moments: Moment[] }[] = [
  {
    name: 'Morning run',
    summary: 'Homes to school. The driver picks up stop by stop and ends at the school.',
    moments: [
      { time: '6:48 AM', icon: BellRing, title: 'Bus arriving in ~5 minutes', body: 'Get Aisha ready - the bus is almost at your stop.' },
      { time: '6:52 AM', icon: Bus, title: 'Aisha has boarded', body: 'Aisha is on the bus and on the way to school.' },
      { time: '7:25 AM', icon: School, title: 'Aisha arrived at school', body: 'The bus reached Doha International Academy at 7:25 AM.' },
    ],
  },
  {
    name: 'Afternoon run',
    summary: 'School to homes. The same stops in reverse, with a drop-off at each one.',
    moments: [
      { time: '1:35 PM', icon: Bus, title: 'Aisha is on the bus home', body: 'Aisha boarded at school at 1:35 PM.' },
      { time: '2:00 PM', icon: BellRing, title: 'Aisha is almost home', body: 'The bus is about 5 minutes from your stop.' },
      { time: '2:05 PM', icon: House, title: 'Aisha was dropped off', body: 'Aisha got off at Al Waab, Doha at 2:05 PM.' },
    ],
  },
]

export function DayOnTheBus() {
  return (
    <section id="day" className="mx-auto max-w-7xl 2xl:max-w-[88rem] scroll-mt-20 px-4 py-14 sm:px-6 md:py-20">
      <Reveal>
        <SectionHeading
          title="Two runs every school day, and a parent knows each step"
          intro="Every bus does a morning run and an afternoon run, every school day. The afternoon follows the morning’s stops in reverse."
        />
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        {RUNS.map((run, runIndex) => (
          <Reveal key={run.name} delay={runIndex * 0.1}>
            <div className="h-full rounded-[1.25rem] border border-border bg-card p-6 md:p-8">
              <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">{run.name}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{run.summary}</p>

              <ol className="mt-7 space-y-0">
                {run.moments.map((moment, i) => {
                  const Icon = moment.icon
                  const last = i === run.moments.length - 1
                  return (
                    <li key={moment.title} className="relative flex gap-4 pb-6 last:pb-0">
                      {!last && <span aria-hidden="true" className="absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-px bg-border" />}
                      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-[13px] font-medium text-muted-foreground">{moment.time}</p>
                        <p className="mt-0.5 text-base font-semibold text-foreground">{moment.title}</p>
                        <p className="mt-0.5 text-[15px] leading-snug text-muted-foreground">{moment.body}</p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          </Reveal>
        ))}
      </div>

      <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 size={15} className="shrink-0 text-primary" aria-hidden="true" />
        These are the notifications parents receive. The names, school and times are examples.
      </p>
    </section>
  )
}
