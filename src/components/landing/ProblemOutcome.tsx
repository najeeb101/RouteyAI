import { ArrowRight, Check, X } from 'lucide-react'
import { SectionHeading } from '@/components/landing/SectionHeading'

const ROWS = [
  {
    before: 'Routes planned by hand in spreadsheets and maps',
    after: 'Routes generated from student addresses in one click',
  },
  {
    before: 'Parents calling the school asking where the bus is',
    after: 'Parents see the live bus and ETA on their phone',
  },
  {
    before: 'Paper attendance lists on every bus',
    after: 'One-tap attendance, with parents notified instantly',
  },
  {
    before: 'A new student means re-planning routes',
    after: 'Smart Placement assigns them to the nearest bus with space',
  },
]

export function ProblemOutcome() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-24">
      <SectionHeading
        eyebrow="Why RouteyAI"
        title="School transport, without the guesswork"
        subtitle="Most schools still run buses on spreadsheets, phone calls and paper lists. RouteyAI replaces all three."
      />
      <div className="rounded-3xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_auto_1fr] gap-4 px-6 py-3 bg-[#F8FAFC] dark:bg-slate-800/40 border-b border-[#E2E8F0] dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">
          <span>Today</span>
          <span className="w-5" />
          <span>With RouteyAI</span>
        </div>
        <ul className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
          {ROWS.map(row => (
            <li key={row.before} className="grid md:grid-cols-[1fr_auto_1fr] gap-2 md:gap-4 items-center px-5 md:px-6 py-4">
              <span className="flex items-start gap-2.5 text-sm text-[#64748B] dark:text-slate-400">
                <X size={16} className="mt-0.5 shrink-0 text-red-400" />
                {row.before}
              </span>
              <ArrowRight size={16} className="hidden md:block text-slate-300 dark:text-slate-600" />
              <span className="flex items-start gap-2.5 text-sm font-semibold text-[#0F172A] dark:text-white">
                <Check size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                {row.after}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
