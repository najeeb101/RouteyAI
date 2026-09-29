import { BarChart3, Bell, ClipboardCheck, MapPin, Route, Zap } from 'lucide-react'
import { SectionHeading } from '@/components/landing/SectionHeading'

const FEATURES = [
  {
    icon: Route,
    title: 'AI Route Optimization',
    desc: 'K-Means clustering and nearest-neighbor ordering, built on real road travel times, keep every route short and every bus within capacity.',
  },
  {
    icon: MapPin,
    title: 'Real-Time Tracking',
    desc: 'The driver’s phone shares the bus location every 10 seconds. Parents and admins see it move live on the map.',
  },
  {
    icon: ClipboardCheck,
    title: 'Digital Attendance',
    desc: 'Drivers mark each student Boarded or Absent with one tap. Parents are notified straight away.',
  },
  {
    icon: Bell,
    title: 'Announcements & Alerts',
    desc: 'Send updates to one bus or the whole fleet. Parents also get an alert when the bus is getting close.',
  },
  {
    icon: Zap,
    title: 'Smart Placement',
    desc: 'New students are assigned to the nearest bus with free seats, and the route recalculates automatically.',
  },
  {
    icon: BarChart3,
    title: 'Fleet Analytics',
    desc: 'See capacity, student counts and active buses across your whole fleet at a glance.',
  },
]

export function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 mb-24 scroll-mt-24">
      <SectionHeading title="Everything your school needs" subtitle="From the first stop to drop-off at the gate." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="group bg-white dark:bg-slate-900 rounded-3xl border border-[#E2E8F0] dark:border-slate-800 shadow-sm p-6 hover:shadow-lg dark:hover:shadow-none hover:border-[#BFDBFE] dark:hover:border-blue-500 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-[#EFF6FF] dark:bg-slate-800 rounded-2xl flex items-center justify-center text-[#1E3A8A] dark:text-blue-400 mb-5 group-hover:scale-110 group-hover:bg-[#1E3A8A] dark:group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
              <Icon size={22} strokeWidth={1.75} />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
