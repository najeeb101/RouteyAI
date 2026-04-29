'use client'

import { motion } from 'framer-motion'
import { Shield, Users, Map, Cpu, Zap, Plus, Check } from 'lucide-react'

export function AdminOrchestrator() {
  return (
    <section id="orchestrator" className="max-w-6xl mx-auto px-6 mb-24 scroll-mt-24">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-full px-4 py-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-5 uppercase tracking-wide shadow-sm">
          <Cpu size={12} />
          AI-Driven Mission Control
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] dark:text-white tracking-tight mb-4">
          The Intelligent <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Orchestrator.</span>
        </h2>
        <p className="text-[#64748B] dark:text-slate-400 text-lg max-w-2xl mx-auto">
          The system does the heavy lifting. You manage the students, and our AI handles the geometry, clustering, and route optimization.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Real-ish Dashboard Preview */}
        <div className="lg:col-span-8 group relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-blue-500/5 overflow-hidden">
            {/* Dashboard Header Bar */}
            <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                </div>
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 bg-blue-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                   <Zap size={10} fill="currentColor" />
                   Optimize All Routes
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Stats Mock */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Total Students', value: '842', color: 'text-blue-600', sub: 'Geocoded & Active' },
                  { label: 'AI Clusters', value: '14', color: 'text-indigo-600', sub: 'Geographically Optimized' },
                  { label: 'Fleet Efficiency', value: '22%', color: 'text-emerald-600', sub: 'Fuel Costs Saved' },
                ].map((s, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</div>
                    <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Main Area Mock */}
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 md:col-span-7">
                  <div className="bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800/50 p-4 h-[300px] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Map size={14} className="text-blue-500" />
                        AI Route Clustering
                      </span>
                      <div className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">K-Means Active</div>
                    </div>
                    {/* Placeholder for map */}
                    <div className="flex-1 rounded-xl bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                       <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:20px_20px]" />
                       {/* Mock cluster groups */}
                       <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-500/10 border border-blue-500/30 -translate-x-1/2 -translate-y-1/2" />
                       <div className="absolute top-3/4 left-2/3 w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/30 -translate-x-1/2 -translate-y-1/2" />
                       
                       {/* Center dots */}
                       <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                       <div className="absolute top-3/4 left-2/3 w-2 h-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />
                    </div>
                  </div>
                </div>
                <div className="col-span-12 md:col-span-5">
                   <div className="bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800/50 p-4 h-[300px] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Zap size={14} className="text-amber-500" />
                        Smart Placement
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 animate-pulse">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-blue-600">NEW STUDENT ADDED</span>
                          <span className="text-[9px] font-medium text-blue-500">Auto-placing...</span>
                        </div>
                        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Najeeb Al-Kaabi</div>
                        <div className="text-[9px] text-slate-500">West Bay, Tower 4</div>
                      </div>
                      
                      <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                              <Check size={12} className="text-emerald-600" />
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Student Placed</div>
                              <div className="text-[9px] text-slate-500">Assigned to West Bay Cluster #3</div>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature List */}
        <div className="lg:col-span-4 space-y-6 pt-4">
          {[
            {
              icon: <Zap className="text-amber-500" size={20} />,
              title: "Smart Placement",
              desc: "Add a student, and the AI automatically finds the nearest bus with capacity. No manual zone drawing needed."
            },
            {
              icon: <Cpu className="text-blue-500" size={20} />,
              title: "AI Route Clustering",
              desc: "K-Means algorithms group students geographically. Routes emerge naturally from where your students live."
            },
            {
              icon: <Shield className="text-emerald-500" size={20} />,
              title: "Effortless Dispatch",
              desc: "Once routes are optimized, simply assign a driver to each bus. They instantly see their dynamic manifest."
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{feature.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
