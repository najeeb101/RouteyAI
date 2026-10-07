import { cn } from '@/lib/utils'
import { Rise } from './Rise'

/**
 * The one navy card per page, the dashboard's RouteyAI moment (the app's SignatureCard and the landing page's navy
 * bands): night blue with a soft glow from the top right that drifts slowly. Text on it is white or white/70.
 */
export function SignatureCard({ step = 0, className, children }: { step?: number; className?: string; children: React.ReactNode }) {
  return (
    <Rise step={step} className={cn('relative isolate overflow-hidden rounded-[20px] bg-night p-6 text-white', className)}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 -z-10 h-80 w-[28rem] rounded-full bg-night-glow/60 blur-3xl animate-[glow-drift_14s_ease-in-out_infinite_alternate] motion-reduce:animate-none"
      />
      {children}
    </Rise>
  )
}
