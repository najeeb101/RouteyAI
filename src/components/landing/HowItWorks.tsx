import { Radio, Sparkles, UserPlus, Users } from 'lucide-react'
import { SectionHeading } from '@/components/landing/SectionHeading'

const STEPS = [
  {
    icon: UserPlus,
    title: 'Add your students',
    desc: 'Enter each student’s home address. RouteyAI places it on the map automatically.',
  },
  {
    icon: Sparkles,
    title: 'Optimize routes',
    desc: 'One click groups students by area, assigns buses within capacity, and orders every stop using real road travel times.',
  },
  {
    icon: Users,
    title: 'Invite drivers & parents',
    desc: 'Assign a driver to each bus and send invite links. Everyone signs in to the right view for their role.',
  },
  {
    icon: Radio,
    title: 'Go live',
    desc: 'Drivers start the route and mark attendance. Parents follow the bus live and get notified at every step.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 mb-24 scroll-mt-24">
      <SectionHeading
        eyebrow="How it works"
        title="Live in four steps"
        subtitle="No zones to draw and no routes to plan by hand."
      />
      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STEPS.map(({ icon: Icon, title, desc }, i) => (
          <li
            key={title}
            className="relative rounded-3xl border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-11 h-11 rounded-2xl bg-[#EFF6FF] dark:bg-slate-800 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400">
                <Icon size={20} />
              </div>
              <span className="text-3xl font-black text-slate-100 dark:text-slate-800" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
            <h3 className="text-base font-bold text-[#0F172A] dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">{desc}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
