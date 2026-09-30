import Image from 'next/image'
import { Check } from 'lucide-react'
import { PHOTOS } from '@/components/landing/photos'

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-primary">
      <Image
        src={PHOTOS.doha.src}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-[60%_60%]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-primary/85 lg:bg-transparent lg:bg-gradient-to-r lg:from-primary lg:from-35% lg:via-primary/75 lg:to-primary/10"
      />

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 md:pb-28 md:pt-24 lg:pb-32">
        <div className="max-w-xl">
          <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
            Plan your school bus routes and track every bus live
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-white/85">
            RouteyAI is route planning and tracking software for schools in Qatar. Enter your students&apos; home
            addresses and it plans a route for every bus. Drivers follow the pickup list on their phone, and parents see
            the bus on a map and get a notification when their child boards.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#demo"
              className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-white/90"
            >
              Book a demo
            </a>
            <a
              href="#how-it-works"
              className="rounded-md border border-white/40 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              How it works
            </a>
          </div>
          <p className="mt-6 text-sm text-white/70">
            Web dashboard for school staff. Driver and parent apps for iOS and Android are coming soon.
          </p>
        </div>
      </div>

      {/* A parent notification, shown over the photo on wide screens */}
      <div
        aria-hidden="true"
        className="absolute bottom-16 right-[7%] hidden w-[270px] items-center gap-3 rounded-2xl bg-white/95 p-3.5 shadow-xl backdrop-blur lg:flex"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-white">
          <Check size={18} strokeWidth={3} />
        </span>
        <span className="min-w-0 text-sm leading-snug">
          <span className="block font-semibold text-foreground">Aisha boarded Bus 3</span>
          <span className="text-muted-foreground">6:58 · Al Sadd stop</span>
        </span>
      </div>
    </section>
  )
}
