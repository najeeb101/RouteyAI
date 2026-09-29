import { BellRing, Building2, Eye, Lock } from 'lucide-react'

const POINTS = [
  {
    icon: Building2,
    title: 'Each school’s data stays separate',
    desc: 'Access rules are enforced inside the database itself, so one school can never see another school’s students, buses or routes.',
  },
  {
    icon: Eye,
    title: 'Parents see only their child’s bus',
    desc: 'A parent sees their own child’s bus, stop and attendance — never other students or their addresses.',
  },
  {
    icon: Lock,
    title: 'Drivers see only their route',
    desc: 'Drivers get the manifest for the bus they’re assigned to and nothing else.',
  },
  {
    icon: BellRing,
    title: 'No silent absences',
    desc: 'The moment a student is marked Boarded or Absent, their parent gets a push notification.',
  },
]

export function SafetyPrivacy() {
  return (
    <section id="safety" className="max-w-6xl mx-auto px-4 sm:px-6 mb-24 scroll-mt-24">
      <div className="rounded-[2rem] bg-[#0F172A] dark:bg-slate-900 border border-transparent dark:border-slate-800 px-5 py-12 sm:px-10 md:px-14 md:py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-4 py-1.5 text-[11px] font-bold text-emerald-400 mb-5 uppercase tracking-wide">
            Safety & Privacy
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">Built for children’s data</h2>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Every role sees exactly what it needs, and nothing more.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {POINTS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-6">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                <Icon size={18} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-white mb-1.5">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
