import Link from 'next/link'
import { RouteyLogo } from '@/components/RouteyLogo'

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
        <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
      </svg>
    ),
    title: 'AI Route Optimization',
    desc: 'K-Means clustering + TSP heuristics minimize ride times and fuel costs across all routes.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    title: 'Real-Time Tracking',
    desc: 'Live GPS updates every 2 seconds via Supabase Realtime. Parents always know where their child is.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    title: 'Smart Attendance',
    desc: 'Drivers check students in at every stop. Absences notify parents and admins instantly.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
    ),
    title: 'Instant Alerts',
    desc: 'Broadcast announcements to drivers and parents. Delay, route change, or emergency — everyone knows.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    title: 'Multi-Role Dashboard',
    desc: 'Purpose-built views for school admins, drivers, and parents — each seeing only what they need.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Role-Based Security',
    desc: 'Row-level security enforced at the database layer. School data stays strictly isolated.',
  },
]

const ROLES = [
  {
    role: 'School Admin',
    color: '#1E3A8A',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    desc: 'Fleet overview, route optimization, student roster, and analytics — all in one desktop dashboard.',
    href: '/school',
  },
  {
    role: 'Driver',
    color: '#059669',
    bg: '#F0FDF4',
    border: '#A7F3D0',
    desc: 'Mobile-first app for route navigation, per-stop student check-in, and real-time school messages.',
    href: '/driver',
  },
  {
    role: 'Parent',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    desc: 'Live bus tracking, boarding confirmation, ETA updates, and one-tap driver contact.',
    href: '/parent',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RouteyLogo size={26} variant="gradient" />
            <span className="text-base font-extrabold tracking-tight">
              <span className="text-[#0F172A]">Routey</span>
              <span className="text-[#1E3A8A]">AI</span>
            </span>
          </div>
          <Link
            href="/login"
            className="bg-[#1E3A8A] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1e40af] transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full px-4 py-1.5 text-[12px] font-bold text-[#1E3A8A] mb-6 uppercase tracking-wide">
          <span className="w-1.5 h-1.5 bg-[#1E3A8A] rounded-full" />
          Built for Qatar&apos;s Private Schools
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-tight mb-5">
          Smart routing.<br />
          <span className="text-[#1E3A8A]">Real-time tracking.</span><br />
          Peace of mind.
        </h1>
        <p className="text-lg text-[#64748B] max-w-xl mx-auto mb-8 leading-relaxed">
          AI-powered school bus management — from route optimization to live GPS tracking and parent alerts.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/login"
            className="bg-[#1E3A8A] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#1e40af] transition-colors shadow-sm"
          >
            Get Started
          </Link>
          <Link
            href="/school"
            className="bg-white text-[#0F172A] border border-[#E2E8F0] px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#F8FAFC] transition-colors"
          >
            View Demo →
          </Link>
        </div>
      </section>

      {/* Map illustration */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <div className="bg-white border border-[#E2E8F0] rounded-3xl shadow-[0_8px_40px_-12px_rgb(0_0_0/0.12)] overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#F1F5F9]">
            {['#FF5F57','#FEBC2E','#28C840'].map(c => (
              <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
            ))}
            <span className="ml-2 text-[11px] text-[#94A3B8]">RouteyAI — Fleet Overview</span>
          </div>
          <div className="relative bg-[#e8edf2]" style={{ height: 320 }}>
            <svg width="100%" height="320" viewBox="0 0 900 320" preserveAspectRatio="xMidYMid slice">
              <rect width="900" height="320" fill="#e8edf2"/>
              {[100,200,300,400,500,600,700,800].map(x => (
                <line key={x} x1={x} y1="0" x2={x} y2="320" stroke="#d1d9e0" strokeWidth={x===450?14:7}/>
              ))}
              {[80,160,240].map(y => (
                <line key={y} x1="0" y1={y} x2="900" y2={y} stroke="#d1d9e0" strokeWidth={y===160?14:7}/>
              ))}
              {[
                [105,85,85,65],[205,85,85,65],[305,85,85,65],[505,85,85,65],[605,85,85,65],[705,85,85,65],
                [105,170,85,60],[205,170,85,60],[305,170,85,60],[505,170,85,60],[605,170,85,60],[705,170,85,60],
              ].map(([x,y,w,h],i) => (
                <rect key={i} x={x} y={y} width={w} height={h} rx="4" fill="#cdd7e0" opacity="0.55"/>
              ))}
              <rect x="405" y="85" width="85" height="65" rx="4" fill="#b8d9b8" opacity="0.7"/>
              {/* Route lines */}
              <path d="M50 160 Q100 160 100 80 Q100 20 200 20 Q300 20 300 80 Q300 160 450 160" stroke="#3B82F6" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.85"/>
              <path d="M450 160 Q600 160 600 80 Q600 20 700 20 Q800 20 800 80 Q800 160 860 160" stroke="#10B981" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.85"/>
              <path d="M100 300 Q100 240 200 240 Q300 240 300 160 Q300 80 450 80" stroke="#F59E0B" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.85" strokeDasharray="8 4"/>
              <path d="M700 300 Q700 240 800 240 Q860 240 860 160" stroke="#8B5CF6" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.85"/>
              {/* School */}
              <g transform="translate(450,160)">
                <circle r="20" fill="#1E3A8A" stroke="#fff" strokeWidth="3.5"/>
                <rect x="-10" y="-9" width="20" height="18" rx="1.5" fill="#fff" opacity="0.9"/>
                <rect x="-6" y="-9" width="12" height="4" rx="1" fill="#1E3A8A"/>
              </g>
              <text x="450" y="196" textAnchor="middle" fontSize="11" fill="#1E3A8A" fontWeight="700">Al Nour School</text>
              {/* Buses */}
              {[{cx:200,cy:20,c:'#3B82F6',n:3},{cx:300,cy:160,c:'#10B981',n:7},{cx:700,cy:160,c:'#8B5CF6',n:5}].map(b=>(
                <g key={b.n} transform={`translate(${b.cx},${b.cy})`}>
                  <circle r="18" fill={b.c} stroke="#fff" strokeWidth="3"/>
                  <text textAnchor="middle" y="6" fontSize="13" fill="#fff" fontWeight="700">#{b.n}</text>
                </g>
              ))}
              <g transform="translate(550,240)">
                <circle r="18" fill="#94A3B8" stroke="#fff" strokeWidth="3"/>
                <text textAnchor="middle" y="6" fontSize="13" fill="#fff" fontWeight="700">#12</text>
              </g>
              <text x="895" y="316" textAnchor="end" fontSize="9" fill="#94A3B8">Map simulation</text>
            </svg>
            {/* Legend overlay */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-[#E2E8F0]/80">
              <div className="text-[10px] font-bold text-[#0F172A] mb-2 uppercase tracking-wide">Active Routes</div>
              {[['Route A','#3B82F6'],['Route B','#10B981'],['Route C','#F59E0B'],['Route D','#8B5CF6']].map(([n,c])=>(
                <div key={n} className="flex items-center gap-2 mb-1 last:mb-0">
                  <div className="w-2.5 h-2.5 rounded-full" style={{background:c}}/>
                  <span className="text-[11px] text-[#64748B]">{n}</span>
                </div>
              ))}
            </div>
            {/* Live badge */}
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5 text-[11px] font-bold text-[#10B981] border border-[#E2E8F0]/80">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse block"/>
              Live
            </div>
          </div>
        </div>
      </section>

      {/* Role previews */}
      <section className="max-w-6xl mx-auto px-6 mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mb-3">Three roles. One platform.</h2>
          <p className="text-[#64748B] text-base">Purpose-built experience for every stakeholder in your school&apos;s transport system.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ROLES.map(r => (
            <Link
              key={r.role}
              href={r.href}
              className="group bg-white rounded-2xl border shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-6 hover:shadow-md transition-all"
              style={{ borderColor: r.border }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-sm font-extrabold"
                style={{ background: r.bg, color: r.color }}
              >
                {r.role[0]}
              </div>
              <div className="text-base font-bold text-[#0F172A] mb-2">{r.role}</div>
              <p className="text-sm text-[#64748B] leading-relaxed mb-4">{r.desc}</p>
              <div className="text-[12px] font-bold" style={{ color: r.color }}>
                View demo →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mb-3">Everything your school needs</h2>
          <p className="text-[#64748B] text-base">From the first stop to drop-off at the gate.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-5">
              <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center text-[#1E3A8A] mb-4">
                {f.icon}
              </div>
              <div className="text-sm font-bold text-[#0F172A] mb-1.5">{f.title}</div>
              <p className="text-[13px] text-[#64748B] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0F172A] py-16 mb-0">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">Ready to modernize your fleet?</h2>
          <p className="text-white/50 text-base mb-8">Get your school set up in under a day. No hardware required.</p>
          <Link
            href="/login"
            className="inline-block bg-[#1E3A8A] text-white px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-[#1e40af] transition-colors shadow-lg"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] border-t border-white/[0.07] py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RouteyLogo size={20} variant="gradient" />
            <span className="text-sm font-bold text-white/60">RouteyAI</span>
          </div>
          <span className="text-[12px] text-white/30">© 2026 RouteyAI. Built for Qatar.</span>
        </div>
      </footer>
    </main>
  )
}
