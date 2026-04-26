'use client'

import { useState } from 'react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { FleetMapSvg } from '@/components/maps/FleetMapSvg'

const BUSES = [
  { id: 1, num: 3,  driver: 'Mohammed Al-Rashid', capacity: 40, students: 28, status: 'active' },
  { id: 2, num: 7,  driver: 'Fatima Al-Zahra',   capacity: 40, students: 35, status: 'active' },
  { id: 3, num: 12, driver: 'Ahmed Khalil',       capacity: 40, students: 18, status: 'idle'   },
  { id: 4, num: 5,  driver: 'Nora Hassan',        capacity: 40, students: 40, status: 'full'   },
]

const ACTIVITY = [
  { time: '7:55 AM', msg: 'Noor Jaber marked Absent on Bus #12',               type: 'absent' },
  { time: '7:52 AM', msg: 'Route D capacity reached — Bus #5 at 40/40',        type: 'warn'   },
  { time: '7:48 AM', msg: 'Khalid Mansour boarded Bus #5 at Doha Expwy',       type: 'ok'     },
  { time: '7:42 AM', msg: 'Aisha Rahman boarded Bus #3 at Lusail Blvd',        type: 'ok'     },
  { time: '7:31 AM', msg: 'Morning routes started — 3 buses active',           type: 'info'   },
]

const DOT_COLORS: Record<string, string> = {
  absent: '#EF4444', warn: '#F59E0B', ok: '#10B981', info: '#3B82F6',
}

const BUS_DOT: Record<string, string> = {
  active: '#10B981', full: '#F59E0B', idle: '#94A3B8',
}

export default function SchoolOverviewPage() {
  const [announcementOpen, setAnnouncementOpen] = useState(false)

  return (
    <div className="p-7 max-w-[1280px]">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] leading-tight">Good morning, Admin</h1>
          <p className="text-sm text-[#64748B] mt-0.5">Al Nour International School · Sunday, April 26</p>
        </div>
        <button
          onClick={() => setAnnouncementOpen(true)}
          className="flex items-center gap-2 bg-[#1E3A8A] text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[#1e40af]"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          Send Announcement
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatsCard
          label="Active Buses"
          value="3"
          sub="1 idle"
          color="#1E3A8A"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/>
              <path d="M18 18h3s.5-1.7.8-4.3c.3-2.7.2-7.7.2-7.7H2S1.7 7 2 9.7c.3 2.6.8 4.3.8 4.3H5"/>
              <circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
            </svg>
          }
        />
        <StatsCard
          label="Students En Route"
          value="6"
          sub="of 8 today"
          color="#10B981"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.75" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          }
        />
        <StatsCard
          label="Routes Active"
          value="3/4"
          sub="Route C scheduled PM"
          color="#3B82F6"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.75" strokeLinecap="round">
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
              <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
            </svg>
          }
        />
        <StatsCard
          label="Alerts"
          value="1"
          sub="Sara Al-Farsi absent"
          color="#F59E0B"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.75" strokeLinecap="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          }
        />
      </div>

      {/* Map + Fleet side by side */}
      <div className="grid grid-cols-[1fr_300px] gap-5 mb-6">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-5 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-[#0F172A]">Live Fleet Map</span>
            <a href="/school/buses" className="text-xs text-[#64748B] hover:text-[#0F172A]">View All →</a>
          </div>
          <FleetMapSvg />
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-5">
          <div className="text-sm font-bold text-[#0F172A] mb-4">Fleet Status</div>
          <div className="flex flex-col gap-2.5">
            {BUSES.map(b => (
              <div key={b.id} className="flex items-center gap-2.5 py-2.5 border-b border-[#F8FAFC] last:border-0">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: BUS_DOT[b.status] }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-[#0F172A]">Bus #{b.num}</div>
                  <div className="text-[11px] text-[#64748B] truncate">{b.driver}</div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-semibold text-[#0F172A]">
                    {b.students}<span className="text-[#94A3B8] font-normal">/{b.capacity}</span>
                  </div>
                  <div
                    className="text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: BUS_DOT[b.status] }}
                  >
                    {b.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-5">
        <div className="text-sm font-bold text-[#0F172A] mb-4">Recent Activity</div>
        {ACTIVITY.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5 py-2 border-b border-[#F8FAFC] last:border-0">
            <div className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: DOT_COLORS[item.type] }} />
            <span className="text-[12px] text-[#64748B] shrink-0 w-14">{item.time}</span>
            <span className="text-[13px] text-[#0F172A]">{item.msg}</span>
          </div>
        ))}
      </div>

      {/* Announcement modal */}
      {announcementOpen && (
        <div
          className="fixed inset-0 bg-[#0F172A]/45 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setAnnouncementOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-[480px] shadow-[0_20px_60px_-15px_rgb(0_0_0/0.3)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <span className="text-lg font-bold text-[#0F172A]">Send Announcement</span>
              <button onClick={() => setAnnouncementOpen(false)} className="w-7 h-7 bg-[#F1F5F9] rounded-lg flex items-center justify-center text-[#64748B]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Send to</label>
                <select className="w-full border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-sm text-[#0F172A] bg-[#FAFAFA] outline-none">
                  <option>All buses & parents</option>
                  <option>Bus #3 — Route A</option>
                  <option>Bus #7 — Route B</option>
                  <option>Bus #5 — Route D</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Message</label>
                <textarea
                  rows={3}
                  placeholder="Type your announcement…"
                  className="w-full border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-sm text-[#0F172A] bg-[#FAFAFA] outline-none resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end mt-1">
                <button onClick={() => setAnnouncementOpen(false)} className="bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm font-medium">Cancel</button>
                <button onClick={() => setAnnouncementOpen(false)} className="bg-[#1E3A8A] text-white rounded-lg px-4 py-2 text-sm font-semibold">Send</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
