import Image from 'next/image'
import { HeroLiveCards } from '@/components/landing/HeroLiveCards'
import { WordReveal } from '@/components/landing/WordReveal'
import { PHOTOS } from '@/components/landing/photos'

const fadeUp = 'animate-fade-up motion-reduce:animate-none'

/** Width / height of the hero photo, used to size the box that covers the hero exactly like `object-cover`. */
const PHOTO_RATIO = 1.791

export function Hero() {
  return (
    <section className="relative isolate flex flex-col overflow-hidden lg:block lg:h-[min(100svh,960px)] lg:min-h-[700px]">
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-6 pt-24 sm:px-6 sm:pt-28 lg:flex lg:h-full lg:items-center lg:pb-10 lg:pt-16">
        <div className="max-w-[35rem]">
          <p className={`text-sm font-semibold text-primary ${fadeUp}`}>For schools in Qatar</p>
          <h1 className="mt-4 font-display text-[2.6rem] font-bold leading-[1.02] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-[4.1rem]">
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
        </div>
      </div>

      {/* Photo: under the text on phones, behind everything from lg up. */}
      <div className="relative h-[46svh] min-h-[320px] [--photo-h:max(130cqh,calc(100cqw/1.791))] [container-type:size] lg:absolute lg:[--photo-h:max(100cqh,calc(100cqw/1.791))] lg:inset-0 lg:-z-10 lg:h-auto lg:min-h-0">
        <div className="absolute inset-0 overflow-hidden">
          {/*
            A box with the photo's own ratio that covers the area, so the bus tag stays pinned to the bus at any size.
            On phones it is 130% of the area's height and shifted up, which frames the bus in the middle.
          */}
          <div
            className="absolute left-1/2 top-[-27.5%] -translate-x-[70%] lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"
            style={{ width: `calc(var(--photo-h) * ${PHOTO_RATIO})`, height: 'var(--photo-h)' }}
          >
            <div className="absolute inset-0 lg:animate-hero-zoom lg:motion-reduce:animate-none">
              <Image
                src={PHOTOS.hero.src}
                alt={PHOTOS.hero.alt}
                fill
                priority
                sizes="(min-width: 1024px) 115vw, 150vw"
                quality={80}
                className="object-cover"
              />
            </div>
            <BusTag />
          </div>
        </div>

        {/* Soft washes: keep the headline readable and blend the photo into the page in both themes. */}
        <div aria-hidden="true" className="absolute inset-0 hidden dark:block bg-brand-ink/45" />
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden lg:block"
          style={{
            background:
              'linear-gradient(90deg, hsl(var(--background) / 0.94) 0%, hsl(var(--background) / 0.78) 30%, hsl(var(--background) / 0) 58%)',
          }}
        />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent lg:h-28 lg:from-background/70" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent lg:h-40" />

        <HeroLiveCards />
      </div>
    </section>
  )
}

/** Live label pinned above the bus in the photo. */
function BusTag() {
  return (
    <div
      className="absolute left-[70.5%] top-[45.5%] -translate-x-1/2 -translate-y-full animate-fade-up motion-reduce:animate-none"
      style={{ animationDelay: '900ms' }}
    >
      <div className="flex items-center gap-2 rounded-full bg-brand-ink/90 py-1.5 pl-2 pr-3.5 text-[13px] font-semibold text-white shadow-lg ring-1 ring-white/15">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-accent motion-reduce:animate-none" />
          <span className="relative h-2.5 w-2.5 rounded-full bg-accent" />
        </span>
        Bus 3 <span className="font-normal text-white/70">on route</span>
      </div>
      <span aria-hidden="true" className="mx-auto block h-3 w-px bg-brand-ink/80" />
    </div>
  )
}
