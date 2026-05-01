'use client'
import { motion } from 'framer-motion'

const RA = "M 55,35 C 90,35 110,65 135,95 C 155,120 200,145 250,160 C 268,165 280,168 290,170"
const RB = "M 510,50 C 480,65 455,85 430,105 C 395,128 360,148 325,160 C 308,165 298,168 290,170"
const RC = "M 75,282 C 110,270 145,252 175,235 C 205,218 235,200 258,185 C 272,178 282,173 290,170"
const RD = "M 500,35 C 472,58 445,80 415,105 C 385,128 350,148 318,162 C 304,166 296,169 290,170"

const STOPS = [
  { cx: 55,  cy: 35,  color: '#3B82F6' },
  { cx: 135, cy: 95,  color: '#3B82F6' },
  { cx: 200, cy: 145, color: '#3B82F6' },
  { cx: 510, cy: 50,  color: '#10B981' },
  { cx: 430, cy: 105, color: '#10B981' },
  { cx: 360, cy: 148, color: '#10B981' },
  { cx: 75,  cy: 280, color: '#F59E0B' },
  { cx: 175, cy: 235, color: '#F59E0B' },
  { cx: 500, cy: 35,  color: '#8B5CF6' },
  { cx: 415, cy: 105, color: '#8B5CF6' },
]

const BUSES = [
  { id: 5,  route: 'Route C', color: '#F59E0B', students: 14, capacity: 20, eta: '3 min',  progress: 88, status: 'arriving' as const },
  { id: 3,  route: 'Route A', color: '#3B82F6', students: 18, capacity: 24, eta: '7 min',  progress: 62, status: 'on-time'  as const },
  { id: 7,  route: 'Route B', color: '#10B981', students: 22, capacity: 24, eta: '12 min', progress: 48, status: 'on-time'  as const },
  { id: 12, route: 'Route D', color: '#8B5CF6', students: 9,  capacity: 24, eta: '19 min', progress: 28, status: 'delayed'  as const },
]

const BLOCKS = [
  [65,10,55,40],[135,10,55,40],[265,10,55,40],[335,10,55,40],[395,10,55,40],[455,10,55,40],
  [65,55,55,40],[135,55,55,40],[265,55,55,40],[335,55,55,40],[395,55,55,40],[455,55,55,40],
  [65,110,55,30],[135,110,55,30],[265,110,55,30],[335,110,55,30],[395,110,55,30],[455,110,55,30],
  [65,160,55,30],[135,160,55,30],[335,160,55,30],[395,160,55,30],[455,160,55,30],
  [65,200,55,30],[135,200,55,30],[335,200,55,30],[395,200,55,30],[455,200,55,30],
]

const NAV_ICONS = [
  { active: true,  d: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" },
  { active: false, d: "M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6zM9 3v15M15 6v15" },
  { active: false, d: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" },
  { active: false, d: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" },
  { active: false, d: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" },
]

export function DashboardPreview() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-3xl shadow-[0_24px_70px_-30px_rgb(15_23_42/0.35)] ring-1 ring-white/70 dark:shadow-[0_24px_70px_-30px_rgb(0_0_0/0.6)] dark:ring-slate-700/40 overflow-hidden select-none">

      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#F1F5F9] dark:border-slate-800 bg-[#FAFAFA] dark:bg-slate-950 shrink-0">
        {['#FF5F57','#FEBC2E','#28C840'].map(c => (
          <div key={c} className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c }} />
        ))}
        <div className="ml-3 flex items-center gap-2 bg-[#F1F5F9] dark:bg-slate-800 rounded-md h-5 px-2.5 max-w-[320px] flex-1">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span className="text-[9px] text-[#94A3B8] dark:text-slate-500 truncate">app.routeyai.com/school/dashboard</span>
        </div>
      </div>

      {/* Dashboard body */}
      <div className="flex" style={{ height: 468 }}>

        {/* Sidebar */}
        <div className="w-12 bg-[#0F172A] flex flex-col items-center pt-3 pb-4 gap-1 shrink-0">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          {NAV_ICONS.map((item, i) => (
            <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${item.active ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={item.active ? 'white' : '#64748B'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.d}/>
              </svg>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col bg-[#F1F5F9] dark:bg-[#0d1625] min-w-0">

          {/* Top bar */}
          <div className="h-10 bg-white dark:bg-slate-950 border-b border-[#E8EDF2] dark:border-slate-800 flex items-center px-4 gap-3 shrink-0">
            <span className="text-[12px] font-bold text-[#0F172A] dark:text-white">Fleet Overview</span>
            <span className="text-[10px] text-[#94A3B8]">Al Nour International School</span>
            <div className="flex-1"/>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
              <span className="text-[9px] font-bold text-emerald-500">LIVE</span>
              <span className="text-[9px] text-[#94A3B8] ml-1">Updated just now</span>
            </div>
            <div className="flex items-center gap-2 pl-3 border-l border-[#E8EDF2] dark:border-slate-800">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[8px] text-white font-bold">SA</div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 p-2.5 shrink-0">
            {[
              { label: 'Active Buses',      value: '4',     sub: 'of 6 in fleet',       color: '#3B82F6' },
              { label: 'Students En Route', value: '63',    sub: 'route capacity: 92',   color: '#10B981' },
              { label: 'On-Time Rate',      value: '94%',   sub: '+2% this week',       color: '#8B5CF6' },
              { label: 'Next Arrival',      value: '3 min', sub: 'Bus #5 - Route C',     color: '#F59E0B' },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-slate-800/80 rounded-xl p-2.5 border border-[#E8EDF2] dark:border-slate-700/60 shadow-sm">
                <div className="text-[8px] font-semibold uppercase tracking-wide text-[#94A3B8] mb-1">{s.label}</div>
                <div className="text-[16px] font-extrabold leading-none mb-0.5" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[8px] text-[#94A3B8]">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Map + panel */}
          <div className="flex gap-2 px-2.5 pb-2.5 flex-1 min-h-0">

            {/* Map */}
            <div className="flex-1 rounded-xl overflow-hidden relative bg-[#0f172a] min-h-0">
              <svg width="100%" height="100%" viewBox="0 0 520 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect width="520" height="300" fill="#0f172a"/>

                {/* Gulf water */}
                <path d="M0,242 Q130,228 260,244 Q390,260 520,248 L520,300 L0,300Z" fill="#0a1e35" opacity="0.85"/>

                {/* Minor road grid */}
                {[60,120,180,240,300,360,420,480].map(x=>(
                  <line key={`v${x}`} x1={x} y1="0" x2={x} y2="258" stroke="#162032" strokeWidth="1.5"/>
                ))}
                {[50,100,150,200,250].map(y=>(
                  <line key={`h${y}`} x1="0" y1={y} x2="520" y2={y} stroke="#162032" strokeWidth="1.5"/>
                ))}

                {/* Major arteries */}
                <line x1="0" y1="150" x2="520" y2="150" stroke="#1e3a5f" strokeWidth="4.5"/>
                <line x1="260" y1="0" x2="260" y2="262" stroke="#1e3a5f" strokeWidth="4.5"/>
                <line x1="0" y1="75"  x2="520" y2="75"  stroke="#1e3a5f" strokeWidth="2.5"/>
                <line x1="130" y1="0" x2="130" y2="262" stroke="#1e3a5f" strokeWidth="2.5"/>
                <line x1="390" y1="0" x2="390" y2="262" stroke="#1e3a5f" strokeWidth="2.5"/>

                {/* City blocks */}
                {BLOCKS.map(([x,y,w,h],i)=>(
                  <rect key={i} x={x} y={y} width={w} height={h} rx="2" fill="#162840" opacity="0.8"/>
                ))}

                {/* Route glow halos */}
                <path d={RA} stroke="#3B82F6" strokeWidth="9" fill="none" opacity="0.13" strokeLinecap="round"/>
                <path d={RB} stroke="#10B981" strokeWidth="9" fill="none" opacity="0.13" strokeLinecap="round"/>
                <path d={RC} stroke="#F59E0B" strokeWidth="9" fill="none" opacity="0.13" strokeLinecap="round"/>
                <path d={RD} stroke="#8B5CF6" strokeWidth="9" fill="none" opacity="0.13" strokeLinecap="round"/>

                {/* Animated dashed route lines */}
                <motion.path 
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, delay: 0.5 }}
                  d={RA} stroke="#3B82F6" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="7 5"
                />
                <motion.path 
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, delay: 0.7 }}
                  d={RB} stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="7 5"
                />
                <motion.path 
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, delay: 0.9 }}
                  d={RC} stroke="#F59E0B" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="7 5"
                />
                <motion.path 
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, delay: 1.1 }}
                  d={RD} stroke="#8B5CF6" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="7 5"
                />

                {/* Stop pins */}
                {STOPS.map((s,i)=>(
                  <g key={i} transform={`translate(${s.cx},${s.cy})`}>
                    <circle r="5" fill="#0f172a" stroke={s.color} strokeWidth="1.5"/>
                    <circle r="2.5" fill={s.color}/>
                  </g>
                ))}

                {/* School marker + pulse ring */}
                <motion.circle 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 1.1, 1], opacity: 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  cx="290" cy="170" r="16" fill="#1E3A8A" stroke="white" strokeWidth="2.5"
                />
                <text x="290" y="167" textAnchor="middle" fontSize="6.5" fill="white" fontWeight="700" letterSpacing="0.4">AL NOUR</text>
                <text x="290" y="176" textAnchor="middle" fontSize="5.5" fill="rgba(255,255,255,0.65)">SCHOOL</text>

                {/* Bus #3 — Route A */}
                <g>
                  <circle r="13" fill="#3B82F6" opacity="0">
                    <animate attributeName="r"      values="11;19;11" dur="1.6s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.25;0;0.25" dur="1.6s" repeatCount="indefinite"/>
                  </circle>
                  <circle r="11" fill="#3B82F6" stroke="white" strokeWidth="2.5"/>
                  <text textAnchor="middle" y="4" fontSize="8" fill="white" fontWeight="700">#3</text>
                  <animateMotion dur="9s" repeatCount="indefinite" path={RA}/>
                </g>

                {/* Bus #7 — Route B */}
                <g>
                  <circle r="11" fill="#10B981" stroke="white" strokeWidth="2.5"/>
                  <text textAnchor="middle" y="4" fontSize="8" fill="white" fontWeight="700">#7</text>
                  <animateMotion dur="13s" repeatCount="indefinite" begin="-5s" path={RB}/>
                </g>

                {/* Bus #5 — Route C (arriving — faster pulse) */}
                <g>
                  <circle r="13" fill="#F59E0B" opacity="0">
                    <animate attributeName="r"      values="11;20;11" dur="0.9s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.3;0;0.3" dur="0.9s" repeatCount="indefinite"/>
                  </circle>
                  <circle r="11" fill="#F59E0B" stroke="white" strokeWidth="2.5"/>
                  <text textAnchor="middle" y="4" fontSize="8" fill="white" fontWeight="700">#5</text>
                  <animateMotion dur="6s" repeatCount="indefinite" begin="-1s" path={RC}/>
                </g>

                {/* Bus #12 — Route D */}
                <g>
                  <circle r="11" fill="#8B5CF6" stroke="white" strokeWidth="2.5"/>
                  <text textAnchor="middle" y="4" fontSize="8" fill="white" fontWeight="700">#12</text>
                  <animateMotion dur="11s" repeatCount="indefinite" begin="-8s" path={RD}/>
                </g>

                <text x="516" y="296" textAnchor="end" fontSize="7" fill="#1e3a5f">© RouteyAI Maps</text>
              </svg>

              {/* Route legend overlay */}
              <div className="absolute top-2 left-2 bg-[#0a1220]/90 backdrop-blur-sm rounded-lg px-2.5 py-2 border border-slate-700/50">
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Routes</div>
                {[['A','#3B82F6'],['B','#10B981'],['C','#F59E0B'],['D','#8B5CF6']].map(([n,c])=>(
                  <div key={n} className="flex items-center gap-1.5 mb-1 last:mb-0">
                    <div className="w-4 h-[2px] rounded-full" style={{ background: c }}/>
                    <span className="text-[8px] text-slate-400">Route {n}</span>
                  </div>
                ))}
              </div>

              {/* Live badge */}
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#0a1220]/90 backdrop-blur-sm rounded-full px-2 py-1 border border-slate-700/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                <span className="text-[8px] font-bold text-emerald-400">Live</span>
              </div>
            </div>

            {/* Bus list panel */}
            <div className="w-44 bg-white dark:bg-slate-800/80 rounded-xl border border-[#E8EDF2] dark:border-slate-700/60 flex flex-col overflow-hidden shadow-sm shrink-0">
              <div className="px-3 py-2 border-b border-[#F1F5F9] dark:border-slate-700/60 shrink-0">
                <div className="text-[10px] font-bold text-[#0F172A] dark:text-white">Active Fleet</div>
                <div className="text-[9px] text-[#94A3B8]">4 buses - 63 students</div>
              </div>

              <div className="overflow-auto flex-1">
                {BUSES.map(b => (
                  <div key={b.id} className={`px-3 py-2.5 border-b border-[#F8FAFC] dark:border-slate-700/30 last:border-0 cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-slate-700/40 transition-colors ${b.status === 'arriving' ? 'bg-amber-50/60 dark:bg-amber-900/10' : ''}`}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0" style={{ background: b.color }}>
                        #{b.id}
                      </div>
                      <span className="text-[10px] font-semibold text-[#0F172A] dark:text-white">{b.route}</span>
                    </div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[7.5px] font-bold px-1.5 py-0.5 rounded-full ${
                        b.status === 'arriving' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                        b.status === 'delayed'  ? 'bg-red-100   text-red-600   dark:bg-red-900/40   dark:text-red-400'   :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                      }`}>
                        {b.status === 'arriving' ? 'Arriving' : b.status === 'delayed' ? 'Delayed' : 'On time'}
                      </span>
                      <span className="text-[11px] font-extrabold text-[#0F172A] dark:text-white">{b.eta}</span>
                    </div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[8px] text-[#94A3B8]">{b.students}/{b.capacity} students</span>
                    </div>
                    <div className="h-1 bg-[#F1F5F9] dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${b.progress}%`, background: b.color }}/>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-3 py-2 border-t border-[#F1F5F9] dark:border-slate-700/60 shrink-0">
                <div className="w-full text-[9px] font-bold text-[#1E3A8A] dark:text-blue-400 bg-[#EFF6FF] dark:bg-blue-950/40 rounded-lg py-1.5 text-center">
                  View All Buses {'->'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

