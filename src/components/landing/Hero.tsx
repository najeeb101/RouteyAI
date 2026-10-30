import Image from 'next/image'
import { HeroPhones } from '@/components/landing/HeroPhones'
import { WordReveal } from '@/components/landing/WordReveal'
import { MAP_IMAGES } from '@/components/landing/optimizeDemoData'

const fadeUp = 'animate-fade-up motion-reduce:animate-none'

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* A real street map of Doha behind the product. The dark image only loads once the dark theme shows it. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Image
          src={MAP_IMAGES.light}
          alt=""
          fill
          priority
          sizes="100vw"
          quality={70}
          className="object-cover object-[40%_50%] dark:hidden"
        />
        <Image src={MAP_IMAGES.dark} alt="" fill sizes="100vw" quality={70} className="hidden object-cover object-[40%_50%] dark:block" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/65 lg:via-background/85 lg:to-background/20" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl 2xl:max-w-[88rem] items-center gap-12 px-4 pb-16 pt-28 sm:px-6 lg:min-h-[min(100svh,860px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:pb-14 lg:pt-24">
        <div className="max-w-[35rem] 2xl:max-w-[40rem]">
          <p className={`text-sm font-semibold text-primary ${fadeUp}`}>For schools in Qatar</p>
          <h1 className="mt-4 font-display text-[2.6rem] font-bold leading-[1.02] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-[4.1rem] 2xl:text-[4.75rem]">
            <WordReveal text="Plan every school bus route. Track every bus live." delayMs={80} />
          </h1>
          <p
            className={`mt-6 max-w-[30rem] text-lg leading-relaxed text-muted-foreground ${fadeUp}`}
            style={{ animationDelay: '300ms' }}
          >
            RouteyAI plans routes from your students&apos; home addresses, guides drivers stop by stop, and shows
            parents the bus live.
          </p>
          <div className={`mt-9 flex flex-wrap items-center gap-3 ${fadeUp}`} style={{ animationDelay: '420ms' }}>
            <a
              href="#demo"
              className="rounded-full bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-[0_12px_28px_-12px_hsl(var(--primary)/0.7)] transition-[transform,background-color] duration-200 hover:bg-primary/90 active:scale-[0.98]"
            >
              Book a demo
            </a>
            <a
              href="#how-it-works"
              className="rounded-full border border-foreground/15 bg-background/80 px-6 py-3.5 text-[15px] font-semibold text-foreground transition-[transform,background-color] duration-200 hover:bg-background active:scale-[0.98]"
            >
              How it works
            </a>
          </div>
          <p className={`mt-6 text-sm text-muted-foreground ${fadeUp}`} style={{ animationDelay: '520ms' }}>
            The screens on this page are drawn from the real apps. The names, streets and times in them are examples.
          </p>
        </div>

        <HeroPhones />
      </div>
    </section>
  )
}
