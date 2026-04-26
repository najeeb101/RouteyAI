'use client'

import { useState, useEffect } from 'react'
import { RouteyLogo } from '@/components/RouteyLogo'

const CHILD = {
  name: 'Aisha Rahman',
  grade: 'Grade 4',
  bus: 'Bus #3',
  route: 'Route A — Morning',
  driver: 'Mohammed Al-Rashid',
  school: 'Al Nour International School',
}

const STOPS_TIMELINE = [
  { id: 1, name: 'Lusail Blvd (Your Stop)',  time: '7:42 AM', done: true,  isHome: true  },
  { id: 2, name: 'West Bay',                 time: '7:38 AM', done: true,  isHome: false },
  { id: 3, name: 'C-Ring Rd',               time: '7:51 AM', done: false, current: true, isHome: false },
  { id: 4, name: 'Al Waab St',              time: '7:58 AM', done: false, isHome: false },
  { id: 5, name: 'Al Nour School',          time: '8:10 AM', done: false, isSchool: true, isHome: false },
]

const UPDATES = [
  { time: '7:42 AM', msg: 'Aisha boarded Bus #3 at Lusail Blvd', type: 'ok'   },
  { time: '7:31 AM', msg: 'Bus #3 started morning route',        type: 'info' },
]

const UPDATE_COLOR: Record<string, string> = {
  ok: '#10B981', info: '#3B82F6', warn: '#F59E0B',
}

type BusPos = { x: number; y: number }

function ParentMapSvg({ busPos }: { busPos: BusPos }) {
  return (
    <div className="relative bg-[#e8edf2] rounded-2xl overflow-hidden" style={{ height: 220 }}>
      <svg width="100%" height="220" viewBox="0 0 480 220" preserveAspectRatio="xMidYMid slice">
        <rect width="480" height="220" fill="#e8edf2" />
        {[80, 160, 240, 320, 400].map(x => (
          <line key={x} x1={x} y1="0" x2={x} y2="220" stroke="#d1d9e0" strokeWidth={x === 240 ? 10 : 6} />
        ))}
        {[60, 130, 190].map(y => (
          <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="#d1d9e0" strokeWidth={y === 130 ? 10 : 6} />
        ))}
        {[
          [85,65,70,60],[165,65,70,60],[245,65,70,60],[325,65,70,60],
          [85,135,70,50],[165,135,70,50],[325,135,70,50],[405,135,70,50],
        ].map(([x,y,w,h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="3" fill="#cdd7e0" opacity="0.55" />
        ))}
        {/* Route path (full) */}
        <path
          d="M30 130 Q80 130 80 65 Q80 10 160 10 Q240 10 240 65 Q240 130 320 130 Q400 130 400 65 Q400 10 450 35"
          stroke="#3B82F6" strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.6" strokeDasharray="7 3"
        />
        {/* Completed segment */}
        <path
          d="M30 130 Q80 130 80 65 Q80 10 160 10"
          stroke="#1E3A8A" strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.9"
        />
        {/* Home stop */}
        <g transform="translate(30,130)">
          <circle r="9" fill="#10B981" stroke="#fff" strokeWidth="2.5"/>
          <text textAnchor="middle" y="4" fontSize="9" fill="#fff" fontWeight="700">H</text>
        </g>
        {/* Done stop */}
        <circle cx="160" cy="10" r="7" fill="#10B981" stroke="#fff" strokeWidth="2" />
        {/* Current stop */}
        <circle cx="240" cy="65" r="9" fill="#3B82F6" stroke="#fff" strokeWidth="2.5" />
        {/* Future stops */}
        <circle cx="320" cy="130" r="7" fill="#CBD5E1" stroke="#fff" strokeWidth="2" />
        {/* School */}
        <g transform="translate(450,35)">
          <circle r="12" fill="#1E3A8A" stroke="#fff" strokeWidth="2.5"/>
          <rect x="-6" y="-5" width="12" height="10" rx="1" fill="#fff" opacity="0.9"/>
          <rect x="-3.5" y="-5" width="7" height="2.5" rx="1" fill="#1E3A8A"/>
        </g>
        {/* Bus */}
        <g transform={`translate(${busPos.x},${busPos.y})`} style={{ transition: 'transform 2s ease' }}>
          <circle r="15" fill="#3B82F6" stroke="#fff" strokeWidth="3"/>
          <text textAnchor="middle" y="5" fontSize="10" fill="#fff" fontWeight="700">#3</text>
        </g>
        <text x="478" y="218" textAnchor="end" fontSize="8" fill="#94A3B8">Map simulation</text>
      </svg>
      {/* Live badge */}
      <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 text-[11px] font-bold text-[#10B981]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse block" />
        Live
      </div>
      {/* ETA badge */}
      <div className="absolute bottom-2.5 left-2.5 bg-[#1E3A8A]/90 backdrop-blur-sm rounded-lg px-3 py-1.5">
        <div className="text-[10px] text-white/60 font-semibold uppercase tracking-wide">ETA to School</div>
        <div className="text-[#00D4FF] font-bold text-sm">8:10 AM · ~19 min</div>
      </div>
    </div>
  )
}

export default function ParentPage() {
  const [busPos, setBusPos] = useState<BusPos>({ x: 200, y: 65 })

  useEffect(() => {
    const t = setInterval(() => {
      setBusPos(prev => ({
        x: prev.x + (Math.random() - 0.5) * 5,
        y: prev.y + (Math.random() - 0.5) * 5,
      }))
    }, 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="max-w-[480px] mx-auto min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="bg-[#0F172A] px-4 pt-4 pb-3 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <RouteyLogo size={22} variant="gradient" />
            <span className="text-sm font-extrabold tracking-tight">
              <span className="text-white">Routey</span>
              <span className="text-[#00D4FF]">AI</span>
            </span>
          </div>
          <div className="text-[11px] text-white/40">Good morning, Parent</div>
        </div>

        {/* Child info */}
        <div className="bg-white/[0.08] rounded-xl px-3.5 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1E3A8A] border-2 border-[#3B82F6] flex items-center justify-center text-white font-bold text-sm shrink-0">
            AR
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-[15px] leading-tight">{CHILD.name}</div>
            <div className="text-white/50 text-[11px]">{CHILD.grade} · {CHILD.bus}</div>
          </div>
          {/* Status pill */}
          <div className="flex items-center gap-1.5 bg-[#10B981]/20 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full" />
            <span className="text-[#10B981] text-[11px] font-bold">Boarded</span>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 pb-6 flex flex-col gap-4">
        {/* Map */}
        <ParentMapSvg busPos={busPos} />

        {/* Bus & driver info */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-4">
          <div className="text-xs font-bold text-[#0F172A] mb-3">Bus & Driver</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Bus', CHILD.bus],
              ['Route', 'Route A'],
              ['Driver', CHILD.driver],
              ['School', 'Al Nour Int\'l'],
            ].map(([l, v]) => (
              <div key={l} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2.5">
                <div className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wide mb-0.5">{l}</div>
                <div className="text-[13px] font-semibold text-[#0F172A]">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stop timeline */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-4">
          <div className="text-xs font-bold text-[#0F172A] mb-3">Route Progress</div>
          <div className="flex flex-col gap-0">
            {STOPS_TIMELINE.map((stop, i) => (
              <div key={stop.id} className="flex items-start gap-3">
                {/* Line + dot */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: stop.done ? '#10B981' : stop.current ? '#3B82F6' : '#CBD5E1',
                      background: stop.done ? '#10B981' : stop.current ? '#3B82F6' : 'white',
                    }}
                  >
                    {stop.done && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {stop.current && <span className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                    {stop.isSchool && !stop.done && !stop.current && (
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                    )}
                  </div>
                  {i < STOPS_TIMELINE.length - 1 && (
                    <div className="w-0.5 h-8 mt-0.5" style={{ background: stop.done ? '#10B981' : '#E2E8F0' }} />
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 pb-6 pt-0.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span
                        className="text-[13px] font-semibold"
                        style={{ color: stop.current ? '#1E3A8A' : stop.done ? '#0F172A' : '#94A3B8' }}
                      >
                        {stop.name}
                      </span>
                      {stop.isHome && (
                        <span className="ml-1.5 text-[10px] bg-[#EFF6FF] text-[#1E3A8A] font-bold px-1.5 py-0.5 rounded-full">YOUR STOP</span>
                      )}
                    </div>
                    <span className="text-[11px]" style={{ color: stop.current ? '#3B82F6' : stop.done ? '#10B981' : '#94A3B8', fontWeight: stop.current ? 700 : 400 }}>
                      {stop.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent updates */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-4">
          <div className="text-xs font-bold text-[#0F172A] mb-3">Today&apos;s Updates</div>
          <div className="flex flex-col gap-2.5">
            {UPDATES.map((u, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: UPDATE_COLOR[u.type] }} />
                <span className="text-[11px] text-[#94A3B8] shrink-0 w-12">{u.time}</span>
                <span className="text-[12px] text-[#0F172A]">{u.msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact driver button */}
        <button className="w-full bg-[#0F172A] text-white rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.22 2.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
          </svg>
          Contact Driver
        </button>
      </div>
    </div>
  )
}
