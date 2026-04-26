'use client'

import { useState } from 'react'
import { FleetMapSvg } from '@/components/maps/FleetMapSvg'

const ROUTES = [
  { id:1, name:'Route A', bus:'Bus #3',  stops:12, students:28, status:'active',    color:'#3B82F6', pct:58 },
  { id:2, name:'Route B', bus:'Bus #7',  stops:9,  students:35, status:'active',    color:'#10B981', pct:75 },
  { id:3, name:'Route C', bus:'Bus #12', stops:7,  students:18, status:'scheduled', color:'#F59E0B', pct:45 },
  { id:4, name:'Route D', bus:'Bus #5',  stops:14, students:40, status:'active',    color:'#8B5CF6', pct:88 },
]

type Route = (typeof ROUTES)[number]

const STATUS_STYLE = {
  active:    { bg: '#D1FAE5', text: '#059669' },
  scheduled: { bg: '#FEF3C7', text: '#D97706' },
  idle:      { bg: '#F1F5F9', text: '#64748B' },
} as const

type RouteStatus = keyof typeof STATUS_STYLE

export default function RoutesPage() {
  const [selected, setSelected] = useState<Route | null>(null)

  return (
    <div className="p-7 max-w-[1280px]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] leading-tight">Route Management</h1>
          <p className="text-sm text-[#64748B] mt-0.5">4 routes · AI-optimized</p>
        </div>
        <button className="flex items-center gap-2 bg-[#1E3A8A] text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-[#1e40af] transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Optimize All Routes
        </button>
      </div>

      <div className="grid grid-cols-[340px_1fr] gap-5">
        {/* Route list */}
        <div className="flex flex-col gap-3">
          {ROUTES.map(r => {
            const ss = STATUS_STYLE[r.status as RouteStatus] ?? STATUS_STYLE.idle
            return (
              <div
                key={r.id}
                onClick={() => setSelected(r)}
                className="bg-white rounded-2xl border shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-4 cursor-pointer transition-all hover:shadow-md"
                style={{ borderColor: selected?.id === r.id ? r.color : '#E2E8F0', borderWidth: 1.5 }}
              >
                <div className="flex justify-between items-start mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.color }} />
                    <span className="text-[15px] font-bold text-[#0F172A]">{r.name}</span>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: ss.bg, color: ss.text }}>
                    {r.status}
                  </span>
                </div>
                <div className="text-xs text-[#64748B] mb-2.5">{r.bus} · {r.stops} stops · {r.students} students</div>
                <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${r.pct}%`, background: r.color }} />
                </div>
                <div className="text-[11px] text-[#94A3B8] mt-1">{r.pct}% capacity</div>
              </div>
            )
          })}
        </div>

        {/* Detail panel */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-5">
          {selected ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-[#0F172A]">{selected.name} — Detail</span>
                <div className="flex gap-2">
                  <button className="bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] rounded-lg px-3.5 py-1.5 text-xs font-medium">Edit</button>
                  <button className="bg-[#FEF2F2] text-[#EF4444] border border-[#FEE2E2] rounded-lg px-3.5 py-1.5 text-xs font-medium">Recalculate</button>
                </div>
              </div>
              <div className="flex flex-col" style={{ minHeight: 320 }}>
                <FleetMapSvg />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[['Stops', selected.stops], ['Students', selected.students], ['Capacity', `${selected.pct}%`]].map(([l, v]) => (
                  <div key={l} className="bg-[#F8FAFC] rounded-xl p-3 text-center border border-[#E2E8F0]">
                    <div className="text-xl font-bold text-[#0F172A]">{v}</div>
                    <div className="text-[11px] text-[#64748B]">{l}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-72 text-[#94A3B8]">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" className="mb-3 opacity-40">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
              </svg>
              <span className="text-sm">Select a route to view details</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
