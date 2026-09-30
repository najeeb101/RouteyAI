import Link from 'next/link'
import { BellRing, Clock, ListOrdered, MapPin, Megaphone, MessageSquare, Radio, UserCheck, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppDownloadButton } from '@/components/landing/AppDownloadButton'
import { AppShowcase } from '@/components/landing/AppShowcase'
import { DriverAppScreen } from '@/components/landing/DriverAppScreen'
import { ParentAppScreen } from '@/components/landing/ParentAppScreen'
import { SectionHeading } from '@/components/landing/SectionHeading'
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
    desc: 'Drivers see each stop in the planned order and check students in as they board.',
    features: [
      { icon: ListOrdered, text: 'Stops in the planned order, next pickup first' },
      { icon: UserCheck, text: 'One tap to mark a student boarded or absent' },
      { icon: Radio, text: 'Shares the bus location every 10 seconds' },
      { icon: MessageSquare, text: 'Messages from the school office' },
    ],
    showcase: { photo: PHOTOS.driver, objectPosition: '70% 50%', phone: <DriverAppScreen />, phoneSide: 'left' },
  },
  {
    role: 'For parents',
    title: 'Where the bus is, and when it will arrive',
    desc: 'Parents follow their child’s bus and hear straight away when their child gets on.',
    features: [
      { icon: MapPin, text: 'The bus on a map while the route is running' },
      { icon: Clock, text: 'Arrival time for their stop, and an alert when the bus is close' },
      { icon: BellRing, text: 'A notification when their child boards or is marked absent' },
      { icon: Megaphone, text: 'Announcements from the school and the driver' },
    ],
    showcase: { photo: PHOTOS.parent, objectPosition: '12% 40%', phone: <ParentAppScreen />, phoneSide: 'right' },
  },
]

export function MobileAppsSection() {
  return (
    <section id="apps" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-16 sm:px-6 md:py-24">
      <SectionHeading
        title="Apps for drivers and parents"
        intro="Free for drivers and parents. Coming soon to the App Store and Google Play."
      />

      <div className="space-y-20 md:space-y-16">
        {APPS.map((app, i) => (
          <div key={app.role} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className={cn(i % 2 === 1 && 'lg:order-2')}>
              <AppShowcase {...app.showcase} />
            </div>
            <div className={cn(i % 2 === 1 && 'lg:order-1')}>
              <p className="text-sm font-semibold text-primary-light">{app.role}</p>
              <h3 className="mt-2 text-balance text-2xl font-bold tracking-tight text-primary md:text-3xl">{app.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">{app.desc}</p>
              <ul className="mt-7 space-y-4">
                {app.features.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-4 text-[15px] font-medium text-foreground">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Icon size={19} />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 flex flex-col gap-4 rounded-2xl bg-muted/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[15px] text-foreground">
          <span className="font-semibold">Parent or driver?</span>{' '}
          <span className="text-muted-foreground">Your school will send you a personal invite link.</span>
        </p>
        <div className="flex shrink-0 gap-3">
          <Link
            href="/login"
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Log in
          </Link>
          <AppDownloadButton className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
            Get the app
          </AppDownloadButton>
        </div>
      </div>
    </section>
  )
}
