import { Bell, Bus, ClipboardList, MapPin } from 'lucide-react'
import { AppMapSnippet } from '@/components/landing/AppMapSnippet'
import { PhoneFrame } from '@/components/landing/PhoneFrame'

const UPDATES = [
  { time: '6:44', body: 'Bus 3 has started the morning route.' },
  { time: '6:50', body: 'Early dismissal on Thursday at 12:30.' },
]

/** The parent app's home screen, redrawn from mobile/src/features/parent/screens/ParentHomeScreen.tsx. */
export function ParentAppScreen({ className }: { className?: string }) {
  return (
    <PhoneFrame
      time="6:53"
      className={className}
      label="Parent app: Aisha is waiting for Bus 3, which is 6 minutes from her stop"
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 px-4 pb-2 pt-2">
        <div>
          <p className="text-[15px] font-extrabold text-white">
            Routey<span className="text-accent">AI</span>
          </p>
          <p className="text-[10px] text-white/45">Good morning</p>
        </div>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-white">
          <Bell size={13} />
        </span>
      </div>

      {/* Child */}
      <div className="bg-slate-900 px-4 pb-3.5">
        <div className="flex items-center gap-2.5 rounded-2xl border border-white/5 bg-white/[0.07] p-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-accent bg-primary-light text-[12px] font-extrabold text-white">
            AM
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-bold text-white">Aisha M.</p>
            <p className="text-[9.5px] text-white/45">Bus 3</p>
          </div>
          <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[9px] font-bold text-warning">Waiting</span>
        </div>
      </div>

      <div className="space-y-2 p-2.5">
        {/* ETA */}
        <div className="flex items-center justify-between gap-2 rounded-[18px] bg-primary p-3.5 shadow-[0_8px_18px_-8px_hsl(var(--primary)/0.7)]">
          <div>
            <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-white/60">ETA to your stop</p>
            <p className="text-[26px] font-extrabold leading-tight tracking-tight text-accent">6 min</p>
            <p className="text-[9.5px] text-white/55">Estimated time based on live GPS</p>
          </div>
          <span className="flex flex-col items-center rounded-xl border border-white/10 bg-white/15 px-3 py-2 text-white">
            <MapPin size={15} />
            <span className="mt-0.5 text-[8.5px] font-bold tracking-wider">LIVE</span>
          </span>
        </div>

        {/* Route info with map preview */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="h-[92px] border-b border-slate-100">
            <AppMapSnippet route="M 22 34 H 104 V 82 H 212" stops={[[22, 34], [104, 58]]} bus={[104, 70]} home={[160, 82]} />
          </div>
          <div className="space-y-1.5 px-3 py-2.5 text-[10.5px]">
            <p className="flex items-center gap-1.5 font-bold">
              <Bus size={12} className="text-primary" /> Route Info
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Bus</span>
              <span className="font-semibold">Bus 3</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Stop</span>
              <span className="font-semibold">Villa 8, Al Sadd</span>
            </p>
          </div>
        </div>

        {/* Updates */}
        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[10.5px] font-bold">
            <ClipboardList size={12} className="text-primary" /> Today&apos;s Updates
          </p>
          <ul className="mt-2 space-y-1.5">
            {UPDATES.map(update => (
              <li key={update.time} className="flex gap-2 text-[10px]">
                <span className="w-7 shrink-0 text-slate-400">{update.time}</span>
                <span className="text-slate-800">{update.body}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PhoneFrame>
  )
}
