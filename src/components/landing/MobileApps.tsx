import Link from 'next/link'
import { BellRing, CalendarX, ClipboardCheck, Clock, History, House, ListOrdered, MapPin, Radio, Timer, UserCheck, Users, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppDownloadButton } from '@/components/landing/AppDownloadButton'
import { AppShowcase } from '@/components/landing/AppShowcase'
import { DriverAppScreen } from '@/components/landing/DriverAppScreen'
import { ParentAppScreen } from '@/components/landing/ParentAppScreen'
import { Reveal } from '@/components/landing/Reveal'
import { SectionHeading, noOrphan } from '@/components/landing/SectionHeading'
import { PHOTOS } from '@/components/landing/photos'

const APPS: {
  role: string
  title: string
  desc: string
  features: { icon: LucideIcon; text: string }[]
  showcase: React.ComponentProps<typeof AppShowcase>
}[] = [
  {
    role: 'For drivers',
    title: 'The route in order, and a record of who got on',
    desc: 'Drivers see each stop in the planned order, check students in as they board, and can tell every parent at once when the bus is late.',
    features: [
      { icon: ListOrdered, text: 'Stops in the planned order: pickups in the morning, drop-offs in reverse in the afternoon' },
      { icon: UserCheck, text: 'One tap to mark a student boarded, absent or dropped off' },
      { icon: House, text: 'Students staying home, as reported by their parents' },
      { icon: Timer, text: 'A running-late notice to every parent on the bus' },
      { icon: Radio, text: 'Shares the bus location every 10 seconds' },
      { icon: ClipboardCheck, text: 'A summary of who rode when the route ends' },
    ],
    showcase: { photo: PHOTOS.driver, objectPosition: '60% 50%', phone: <DriverAppScreen />, phoneSide: 'left' },
  },
  {
    role: 'For parents',
    title: 'Where the bus is, and when it will arrive',
    desc: 'Parents follow their child’s bus, hear straight away when their child gets on, and can tell the driver when their child is staying home.',
    features: [
      { icon: MapPin, text: 'The bus on a live street map while the route is running' },
      { icon: Clock, text: 'Arrival time for their stop, and an alert when the bus is close' },
      { icon: BellRing, text: 'A notification when their child boards or is marked absent' },
      { icon: Users, text: 'Every child on one account, one tap to switch' },
      { icon: CalendarX, text: 'Report an absence ahead of time, so the bus doesn’t wait' },
      { icon: History, text: 'Each child’s past rides and absences' },
    ],
    showcase: { photo: PHOTOS.parent, objectPosition: '55% 62%', phone: <ParentAppScreen />, phoneSide: 'left' },
  },
]

export function MobileAppsSection() {
  return (
    <section id="apps" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6 md:py-28">
      <Reveal>
        <SectionHeading
          title="An app for every driver and every parent"
          intro="Free for drivers and parents. Coming soon to the App Store and Google Play."
        />
      </Reveal>

      <div className="space-y-24 md:space-y-28">
        {APPS.map((app, i) => (
          <div key={app.role} className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className={cn(i % 2 === 1 && 'lg:order-2')}>
              <AppShowcase {...app.showcase} />
            </div>
            <Reveal delay={0.1} className={cn(i % 2 === 1 && 'lg:order-1')}>
              <p className="text-sm font-semibold text-primary">{app.role}</p>
              <h3 className="mt-3 max-w-md font-display text-[1.75rem] font-bold leading-[1.12] tracking-[-0.02em] text-foreground md:text-4xl">
                {noOrphan(app.title)}
              </h3>
              <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">{app.desc}</p>
              <ul className="mt-8 grid gap-x-6 gap-y-5 sm:grid-cols-2">
                {app.features.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex gap-3.5 text-[15px] leading-snug text-foreground">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon size={19} />
                    </span>
                    <span className="pt-2.5">{text}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        ))}
      </div>

      <Reveal className="mt-20">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[15px] text-foreground">
            <span className="font-semibold">Parent or driver?</span>{' '}
            <span className="text-muted-foreground">Your school will send you a personal invite link.</span>
          </p>
          <div className="flex shrink-0 gap-3">
            <Link
              href="/login"
              className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Log in
            </Link>
            <AppDownloadButton className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
              Get the app
            </AppDownloadButton>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
