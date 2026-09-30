import { Check, MapPin } from 'lucide-react'
import { AppDownloadButton } from '@/components/landing/AppDownloadButton'
import { PhoneShowcase } from '@/components/landing/PhoneShowcase'
import { SectionHeading } from '@/components/landing/SectionHeading'
import { ROUTE_COLORS } from '@/components/landing/routeColors'

const APPS = [
  {
    role: 'For drivers',
    title: 'Pick up. Check in. Repeat.',
    desc: 'An ordered pickup list, one-tap student check-ins, and messages from school — built for one-handed use.',
    features: [
      'Next pickup card in optimized stop order',
      'Digital student check-in at every stop',
      'Live GPS broadcast to parents during the route',
      'Instant broadcast alerts from school',
    ],
    phone: {
      src: '/assets/mockups/driver-app.png',
      alt: 'RouteyAI driver app showing the next pickup and route progress',
      tone: 'dark' as const,
    },
    card: (
      <div className="text-[12px]">
        <p className="text-muted-foreground">Next pickup · stop 4 of 9</p>
        <p className="mt-1 font-semibold text-foreground">Omar K.</p>
        <p className="flex items-center gap-1 text-muted-foreground">
          <MapPin size={11} /> Villa 12, Al Waab
        </p>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-primary/15">
          <div className="h-full w-[44%] rounded-full bg-primary" />
        </div>
      </div>
    ),
  },
  {
    role: 'For parents',
    title: 'Know where your child is. Always.',
    desc: 'Live bus location, boarding confirmation, and a real-time ETA — before your child even gets on the bus.',
    features: [
      'Live bus location on an interactive map',
      'Boarding and absence confirmations',
      'Live ETA to your child’s stop',
      'Push alerts and school announcements',
    ],
    phone: {
      src: '/assets/mockups/parent-app.png',
      alt: 'RouteyAI parent app showing the live bus on a map',
      tone: 'light' as const,
    },
    card: (
      <div className="flex items-start gap-2.5 text-[12px]">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
          <Check size={13} strokeWidth={3} />
        </span>
        <div>
          <p className="font-semibold text-foreground">Aisha boarded</p>
          <p className="text-muted-foreground">
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ backgroundColor: ROUTE_COLORS[0] }} />
            Bus 1 · 6:58 · ETA 7:24
          </p>
        </div>
      </div>
    ),
  },
]

export function MobileAppsSection() {
  return (
    <section id="apps" className="mx-auto mb-24 max-w-6xl scroll-mt-24 px-4 sm:px-6 md:mb-32">
      <SectionHeading
        index="04"
        label="Mobile apps · coming soon"
        title="One app in every driver’s and parent’s pocket"
        subtitle="Free for drivers and parents. Live tracking, digital attendance and instant updates."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {APPS.map((app, i) => (
          <article key={app.role} className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="border-b border-border bg-muted/40 bg-map-grid">
              <PhoneShowcase
                src={app.phone.src}
                alt={app.phone.alt}
                tone={app.phone.tone}
                card={app.card}
                cardSide={i === 0 ? 'right' : 'left'}
              />
            </div>
            <div className="p-6 md:p-7">
              <p className="text-[13px] font-medium text-primary">{app.role}</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{app.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{app.desc}</p>
              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {app.features.map(feature => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                    <Check size={15} className="mt-0.5 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex gap-2">
                <AppDownloadButton className="rounded-md border border-border px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted">
                  App Store · soon
                </AppDownloadButton>
                <AppDownloadButton className="rounded-md border border-border px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted">
                  Google Play · soon
                </AppDownloadButton>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
