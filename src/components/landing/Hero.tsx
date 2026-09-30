import { ArrowRight } from 'lucide-react'
import { HeroRouteMap } from '@/components/landing/HeroRouteMap'
import { Reveal } from '@/components/landing/Reveal'
import { WordReveal } from '@/components/landing/WordReveal'

const FACTS = [
  { value: '10 s', label: 'GPS updates while a route runs' },
  { value: '1 click', label: 'to re-optimize every route' },
  { value: 'Every stop', label: 'boarding alerts sent to parents' },
]

export function Hero() {
  return (
    <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-28">
      <div>
        <Reveal>
          <p className="mb-6 text-sm font-medium text-muted-foreground">
            School transport platform <span className="text-border">/</span> Qatar
          </p>
        </Reveal>
        <h1 className="text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.035em] text-foreground sm:text-6xl lg:text-[4.1rem]">
          <WordReveal text="School buses, planned by AI" />{' '}
          <WordReveal text="and tracked live." className="text-primary" delay={0.3} />
        </h1>
        <Reveal delay={0.45}>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Add your students&apos; home addresses. RouteyAI builds the routes, drivers share their location every
            10&nbsp;seconds, and parents get a notification the moment their child boards.
          </p>
        </Reveal>
        <Reveal delay={0.55}>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <a
              href="#demo"
              className="group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Book a demo
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
            <a
              href="#how-it-works"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-foreground"
            >
              <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]">
                See how it works
              </span>
              <ArrowRight size={15} className="text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.65}>
          <dl className="mt-12 grid max-w-xl grid-cols-3 divide-x divide-border border-y border-border">
            {FACTS.map(fact => (
              <div key={fact.value} className="px-3 py-4 first:pl-0 sm:px-4">
                <dt className="sr-only">{fact.label}</dt>
                <dd>
                  <span className="block text-lg font-semibold tracking-tight text-foreground sm:text-xl">{fact.value}</span>
                  <span className="mt-1 block text-[12px] leading-snug text-muted-foreground sm:text-[13px]">{fact.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      <Reveal delay={0.2}>
        <HeroRouteMap />
      </Reveal>
    </section>
  )
}
