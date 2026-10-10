import type { Metadata } from 'next'
import { displayFont } from '@/components/landing/fonts'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Sign In',
  robots: { index: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(displayFont.variable, 'relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-night p-4 font-sans')}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-40 -z-10 h-[28rem] w-[36rem] rounded-full bg-night-glow/50 blur-3xl animate-[glow-drift_14s_ease-in-out_infinite_alternate] motion-reduce:animate-none"
      />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-32 -z-10 h-80 w-[28rem] rounded-full bg-night-glow/30 blur-3xl" />
      <main id="main-content" tabIndex={-1} className="flex w-full justify-center focus:outline-none">
        {children}
      </main>
    </div>
  )
}
