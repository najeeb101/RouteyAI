import { ArrowLeft, Check, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppMapSnippet } from '@/components/landing/AppMapSnippet'
import { PhoneFrame } from '@/components/landing/PhoneFrame'

const CURRENT_STOP = [
  { initials: 'OK', name: 'Omar K.', grade: 'Grade 4', boarded: true },
  { initials: 'MS', name: 'Maryam S.', grade: 'Grade 2', boarded: false },
]

/** The driver app's route screen, redrawn from mobile/src/features/driver/screens/DriverRouteScreen.tsx. */
export function DriverAppScreen({ className }: { className?: string }) {
  return (
    <PhoneFrame
      time="6:52"
      className={className}
      label="Driver app: Route 3 with 5 of 12 students boarded, and the current stop showing one student boarded and one waiting"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 bg-slate-900 px-4 pb-3 pt-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-white">
          <ArrowLeft size={14} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-extrabold text-white">Route 3 · Al Waab</p>
          <p className="text-[10px] text-white/70">Bus 3 · Tap to check in</p>
        </div>
      </div>

      {/* Map */}
      <div className="relative h-[132px] border-b border-slate-200">
        <AppMapSnippet
          route="M 22 34 H 58 V 82 H 150 V 58 H 212 V 20"
          stops={[[22, 34], [58, 60], [104, 82], [150, 70], [212, 58], [212, 20]]}
          bus={[120, 82]}
        />
        <div className="absolute inset-x-2.5 bottom-2 flex items-center justify-between rounded-xl bg-slate-900/85 px-3 py-1.5 text-[10px]">
          <span className="font-bold text-white">Route 3 · 6 stops</span>
          <span className="flex items-center gap-1 text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            Active
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-[11px]">
          <Users size={13} className="text-slate-500" />
          <span className="font-bold">5/12</span>
          <span className="text-slate-500">boarded</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
            <span className="block h-full w-[42%] rounded-full bg-primary" />
          </span>
          <span className="rounded-md bg-primary-light/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">42%</span>
        </span>
      </div>

      {/* Stops */}
      <div className="space-y-2 p-2.5">
        <div className="flex items-center gap-2.5 rounded-2xl border border-secondary/60 bg-secondary/10 px-3 py-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-white">
            <Check size={11} strokeWidth={3.5} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold text-slate-600">Villa 12, Al Waab St</p>
            <p className="text-[9px] text-slate-600">2/2 boarded</p>
          </div>
          <span className="text-[10px] font-bold text-emerald-700">6:41</span>
        </div>

        <div className="overflow-hidden rounded-2xl border-[1.5px] border-primary-light bg-white">
          <div className="flex items-center gap-2.5 bg-primary-light/10 px-3 py-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-light">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold">Al Furousiya St</p>
              <p className="text-[9px] text-primary">1/2 boarded</p>
            </div>
            <span className="text-right text-[10px] font-bold leading-tight text-primary">
              6:52
              <span className="block text-[8px] font-semibold">Now</span>
            </span>
          </div>
          {CURRENT_STOP.map(student => (
            <div key={student.name} className="flex items-center gap-2 border-t border-slate-100 px-3 py-2">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full border text-[9px] font-bold',
                  student.boarded ? 'border-secondary/30 bg-secondary/15 text-emerald-700' : 'border-primary-light/30 bg-primary-light/10 text-primary'
                )}
              >
                {student.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn('text-[10.5px] font-semibold', student.boarded ? 'text-slate-600' : 'text-slate-900')}>{student.name}</p>
                <p className="text-[9px] text-slate-500">{student.grade}</p>
              </div>
              {student.boarded ? (
                <span className="rounded-lg border border-secondary/30 bg-secondary/15 px-2 py-1 text-[9px] font-bold text-emerald-700">
                  ✓ Boarded
                </span>
              ) : (
                <span className="flex gap-1">
                  <span className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-600">Board</span>
                  <span className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-600">Absent</span>
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3 py-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500">3</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold">Al Luqta St</p>
            <p className="text-[9px] text-slate-500">0/3 boarded</p>
          </div>
          <span className="text-[10px] font-bold text-slate-500">7:01</span>
        </div>

        <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3 py-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500">4</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold">Villa 8, Al Sadd</p>
            <p className="text-[9px] text-slate-500">0/2 boarded</p>
          </div>
          <span className="text-[10px] font-bold text-slate-500">7:09</span>
        </div>
      </div>
    </PhoneFrame>
  )
}
