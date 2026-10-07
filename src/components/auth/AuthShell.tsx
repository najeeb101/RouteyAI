import { RouteyLogo } from '@/components/RouteyLogo'
import { Rise } from '@/components/dashboard/Rise'

/**
 * The sign-in screens' frame (the app's login on night blue): the logo and name on top, then a white card that rises in.
 * A soft blue glow drifts behind it, as on the dashboard's navy card.
 */
export function AuthShell({ subtitle, children }: { subtitle: string; children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[400px]">
      <Rise className="mb-6 flex flex-col items-center text-center">
        <RouteyLogo size={56} variant="white" />
        <p className="mt-3 font-display text-[26px] font-bold leading-8 tracking-[-0.02em] text-white">
          Routey<span className="text-live">AI</span>
        </p>
        <p className="mt-1 text-sm text-white/70">{subtitle}</p>
      </Rise>
      <Rise step={1} className="rounded-[20px] bg-white p-6 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.5)] sm:p-7">
        {children}
      </Rise>
    </div>
  )
}

/** The card's heading and the line under it. */
export function AuthHeading({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h1 className="font-display text-[22px] font-bold leading-7 tracking-[-0.01em] text-ink">{title}</h1>
      {children && <p className="mt-1 text-sm text-ink-2">{children}</p>}
    </div>
  )
}
