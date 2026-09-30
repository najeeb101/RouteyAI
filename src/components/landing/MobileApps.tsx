import Link from 'next/link'
import { AppDownloadButton } from '@/components/landing/AppDownloadButton'
import { PhoneFrame } from '@/components/landing/PhoneFrame'
import { SectionHeading } from '@/components/landing/SectionHeading'

const APPS = [
  {
    role: 'Drivers',
    desc: 'The driver app shows the route in order and records who got on the bus.',
    features: [
      'The next pickup, with the student’s name and address',
      'Stops in the planned order',
      'One tap to mark a student boarded or absent',
      'Shares the bus location every 10 seconds during the route',
      'Messages from the school office',
    ],
    phone: { src: '/assets/mockups/driver-app.png', alt: 'RouteyAI driver app showing the next pickup and route progress', tone: 'dark' as const },
  },
  {
    role: 'Parents',
    desc: 'The parent app shows where their child’s bus is and when it will arrive.',
    features: [
      'The bus on a map while the route is running',
      'Arrival time for their child’s stop',
      'A notification when their child boards or is marked absent',
      'An alert when the bus is getting close',
      'Announcements from the school and the driver',
    ],
    phone: { src: '/assets/mockups/parent-app.png', alt: 'RouteyAI parent app showing the bus on a map', tone: 'light' as const },
  },
]

export function MobileAppsSection() {
  return (
    <section id="apps" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-16 sm:px-6 md:py-24">
      <SectionHeading
        title="Apps for drivers and parents"
        intro="Free for drivers and parents. Coming soon to the App Store and Google Play."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {APPS.map(app => (
          <article key={app.role} className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex justify-center border-b border-border bg-muted/60 py-8">
              <PhoneFrame {...app.phone} />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-primary">{app.role}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{app.desc}</p>
              <ul className="mt-5 space-y-2.5">
                {app.features.map(feature => (
                  <li key={feature} className="flex gap-3 text-[15px] leading-snug text-foreground">
                    <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-lg border border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[15px] text-foreground">
          <span className="font-semibold">Parent or driver?</span>{' '}
          <span className="text-muted-foreground">Your school will send you a personal invite link.</span>
        </p>
        <div className="flex shrink-0 gap-3">
          <Link
            href="/login"
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
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
