import Image from 'next/image'
import { HeroPhones } from '@/components/landing/HeroPhones'
import { WordReveal } from '@/components/landing/WordReveal'
import { MAP_IMAGES } from '@/components/landing/optimizeDemoData'

const fadeUp = 'animate-fade-up motion-reduce:animate-none'

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-brand text-white">
      {/*
        The brand blue, lit from behind the phones, the same in light and dark. The real street map of Doha sits on top
        as a faint texture: its dark ground disappears under `screen` and only the streets add light.
      */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-brand via-brand-bright to-brand-bright" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_75%_45%,rgba(56,189,248,0.45),transparent_70%)]" />
        <Image
          src={MAP_IMAGES.dark}
          alt=""
          fill
          priority
          sizes="100vw"
          quality={70}
          className="object-cover object-[40%_50%] opacity-50 mix-blend-screen [mask-image:linear-gradient(to_right,transparent_38%,black_75%)]"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl 2xl:max-w-[88rem] items-center gap-12 px-4 pb-20 pt-28 sm:px-6 lg:min-h-[min(100svh,860px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:pb-20 lg:pt-24">
        <div className="max-w-[35rem] 2xl:max-w-[40rem]">
          <p className={`text-sm font-semibold text-white/80 ${fadeUp}`}>For schools in Qatar</p>
          <h1 className="mt-4 font-display text-[2.6rem] font-bold leading-[1.02] tracking-[-0.03em] text-white sm:text-6xl lg:text-[4.1rem] 2xl:text-[4.75rem]">
            <WordReveal text="Plan every school bus route. Track every bus live." delayMs={80} />
          </h1>
          <p
            className={`mt-6 max-w-[30rem] text-lg leading-relaxed text-white/85 ${fadeUp}`}
            style={{ animationDelay: '300ms' }}
          >
            RouteyAI plans routes from your students&apos; home addresses, guides drivers stop by stop, and shows
            parents the bus live.
          </p>
          <div className={`mt-9 flex flex-wrap items-center gap-3 ${fadeUp}`} style={{ animationDelay: '420ms' }}>
            <a
              href="#demo"
              className="rounded-full bg-white px-6 py-3.5 text-[15px] font-semibold text-brand shadow-[0_14px_32px_-14px_rgba(10,20,48,0.8)] transition-[transform,background-color] duration-200 hover:bg-white/90 focus-visible:outline-white active:scale-[0.98]"
            >
              Book a demo
            </a>
            <a
              href="#how-it-works"
              className="rounded-full border border-white/35 px-6 py-3.5 text-[15px] font-semibold text-white transition-[transform,background-color] duration-200 hover:bg-white/10 focus-visible:outline-white active:scale-[0.98]"
            >
              How it works
            </a>
          </div>
          <p className={`mt-6 text-sm text-white/75 ${fadeUp}`} style={{ animationDelay: '520ms' }}>
            The screens on this page are drawn from the real apps. The names, streets and times in them are examples.
          </p>
        </div>

        <HeroPhones />
      </div>
    </section>
  )
}
