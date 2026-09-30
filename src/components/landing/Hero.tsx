import { HeroRouteMap } from '@/components/landing/HeroRouteMap'
import { WordReveal } from '@/components/landing/WordReveal'

const fadeUp = 'animate-fade-up motion-reduce:animate-none'

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:pb-24 md:pt-16 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
      <div>
        <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight text-primary sm:text-5xl">
          <WordReveal text="Plan your school bus routes and track every bus live" />
        </h1>
        <p className={`mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground ${fadeUp}`} style={{ animationDelay: '250ms' }}>
          RouteyAI is route planning and tracking software for schools in Qatar. Enter your students&apos; home addresses
          and it plans a route for every bus. Drivers follow the pickup list on their phone, and parents see the bus on a
          map and get a notification when their child boards.
        </p>
        <div className={`mt-8 flex flex-wrap gap-3 ${fadeUp}`} style={{ animationDelay: '350ms' }}>
          <a
            href="#demo"
            className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Book a demo
          </a>
          <a
            href="#how-it-works"
            className="rounded-md border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            How it works
          </a>
        </div>
        <p className={`mt-6 text-sm text-muted-foreground ${fadeUp}`} style={{ animationDelay: '450ms' }}>
          Web dashboard for school staff. Driver and parent apps for iOS and Android are coming soon.
        </p>
      </div>

      <div className={fadeUp} style={{ animationDelay: '250ms' }}>
        <HeroRouteMap />
      </div>
    </section>
  )
}
