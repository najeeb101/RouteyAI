'use client'

import { useState } from 'react'

const BUSES = [
  { id: 1, num: 3,  driver: 'Mohammed Al-Rashid', capacity: 40, students: 28, status: 'active', route: 'Route A — Morning'   },
  { id: 2, num: 7,  driver: 'Fatima Al-Zahra',    capacity: 40, students: 35, status: 'active', route: 'Route B — Morning'   },
  { id: 3, num: 12, driver: 'Ahmed Khalil',        capacity: 40, students: 18, status: 'idle',   route: 'Route C — Afternoon' },
  { id: 4, num: 5,  driver: 'Nora Hassan',         capacity: 40, students: 40, status: 'full',   route: 'Route D — Morning'  },
]

const STATUS_STYLE = {
  active: { bg: '#D1FAE5', text: '#059669', label: 'Active' },
  full:   { bg: '#FEF3C7', text: '#D97706', label: 'At capacity' },
  idle:   { bg: '#F1F5F9', text: '#64748B', label: 'Idle' },
} as const

type BusStatus = keyof typeof STATUS_STYLE

function BusIcon({ color = '#1E3A8A' }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/>
      <path d="M18 18h3s.5-1.7.8-4.3c.3-2.7.2-7.7.2-7.7H2S1.7 7 2 9.7c.3 2.6.8 4.3.8 4.3H5"/>
      <circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
    </svg>
  )
}

export default function BusesPage() {
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="p-7 max-w-[1280px]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] leading-tight">Fleet Management</h1>
          <p className="text-sm text-[#64748B] mt-0.5">4 buses registered</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 bg-[#1E3A8A] text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-[#1e40af] transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Bus
        </button>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {BUSES.map(b => {
          const ss = STATUS_STYLE[b.status as BusStatus] ?? STATUS_STYLE.active
          const pct = Math.round((b.students / b.capacity) * 100)
          const barColor = pct > 90 ? '#EF4444' : pct > 70 ? '#F59E0B' : '#10B981'

          return (
            <div key={b.id} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center">
                    <BusIcon color="#1E3A8A" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-[#0F172A]">Bus #{b.num}</div>
                    <div className="text-xs text-[#64748B]">{b.route}</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: ss.bg, color: ss.text }}>
                  {ss.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[['Driver', b.driver], ['Capacity', `${b.students} / ${b.capacity}`]].map(([l, v]) => (
                  <div key={l} className="bg-[#F8FAFC] rounded-lg px-3 py-2.5 border border-[#E2E8F0]">
                    <div className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wide mb-1">{l}</div>
                    <div className="text-[13px] font-semibold text-[#0F172A]">{v}</div>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-[11px] text-[#64748B]">Capacity</span>
                  <span className="text-[11px] font-semibold" style={{ color: barColor }}>{pct}%</span>
                </div>
                <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] rounded-lg py-2 text-[12px] font-medium hover:bg-[#F1F5F9] transition-colors">Edit</button>
                <button className="flex-1 bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] rounded-lg py-2 text-[12px] font-medium hover:bg-[#F1F5F9] transition-colors">View Route</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Bus Modal */}
      {addOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/45 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setAddOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-[480px] shadow-[0_20px_60px_-15px_rgb(0_0_0/0.3)]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <span className="text-lg font-bold text-[#0F172A]">Add New Bus</span>
              <button onClick={() => setAddOpen(false)} className="w-7 h-7 bg-[#F1F5F9] rounded-lg flex items-center justify-center text-[#64748B]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {[
                ['Bus Number / Plate', 'text',   'e.g. 14'],
                ['Capacity',           'number', '40'],
                ['Driver Name',        'text',   ''],
                ['Driver Email',       'email',  'driver@school.edu'],
              ].map(([l, t, p]) => (
                <div key={l}>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">{l}</label>
                  <input type={t} placeholder={p} className="w-full border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-sm text-[#0F172A] bg-[#FAFAFA] outline-none focus:border-[#3B82F6] transition-colors" />
                </div>
              ))}
              <div className="flex gap-2 justify-end mt-1">
                <button onClick={() => setAddOpen(false)} className="bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm font-medium">Cancel</button>
                <button onClick={() => setAddOpen(false)} className="bg-[#1E3A8A] text-white rounded-lg px-4 py-2 text-sm font-semibold">Add Bus</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
