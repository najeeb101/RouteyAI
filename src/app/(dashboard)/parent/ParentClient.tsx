'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { RouteyLogo } from '@/components/RouteyLogo'
import type { RouteWaypoint } from '@/types/database'
import type { ParentChildData, ParentBusStudent } from './page'

type Props = {
  child: ParentChildData | null
  waypoints: RouteWaypoint[]
  busStudents: ParentBusStudent[]
  attendanceStatus: 'boarded' | 'absent' | null
  busId: string | null
}

type BusPos = { x: number; y: number }

type TimelineStop = {
  key: string
  label: string
  isChild: boolean
  isSchool: boolean
  done: boolean
  current: boolean
}

export default function ParentClient({ child, waypoints, busStudents, attendanceStatus, busId }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [busPos, setBusPos] = useState<BusPos>({ x: 200, y: 65 })
  const [liveStatus, setLiveStatus] = useState(attendanceStatus)

  // Animated bus position simulation
  useEffect(() => {
    const t = setInterval(() => {
      setBusPos(prev => ({
        x: Math.max(30, Math.min(450, prev.x + (Math.random() - 0.5) * 5)),
        y: Math.max(10, Math.min(200, prev.y + (Math.random() - 0.5) * 5)),
      }))
    }, 2000)
    return () => clearInterval(t)
  }, [])

  // Realtime: attendance updates for this child (driver tapping Board)
  useEffect(() => {
    if (!child?.id) return
    const channel = supabase
      .channel(`attendance-parent-${child.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance', filter: `student_id=eq.${child.id}` },
        (payload) => {
          const status = (payload.new as { status?: string })?.status
          if (status === 'boarded' || status === 'absent') setLiveStatus(status)
        },
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [child?.id, supabase])

  const initials = child
    ? child.name.split(' ').map(n => n[0] ?? '').join('').slice(0, 2).toUpperCase()
    : '?'

  // Build timeline from real route waypoints
  const sortedWaypoints = [...waypoints].sort((a, b) => a.stop_order - b.stop_order)
  const childStopOrder = child?.stop_order ?? null

  const timelineStops: TimelineStop[] = [
    ...sortedWaypoints.map(wp => {
      const student = busStudents.find(s => s.id === wp.student_id)
      const isChild = wp.student_id === child?.id
      // Mark stops up to and including child's stop as done when child has boarded
      const done = liveStatus === 'boarded' && childStopOrder !== null
        ? wp.stop_order <= childStopOrder
        : false
      const current = liveStatus !== 'boarded' && childStopOrder !== null && wp.stop_order === childStopOrder
      return {
        key: wp.student_id,
        label: student?.home_address ?? `Stop ${wp.stop_order}`,
        isChild,
        isSchool: false,
        done,
        current,
      }
    }),
    { key: 'school', label: 'School (Drop-off)', isChild: false, isSchool: true, done: false, current: false },
  ]

  // ── No child linked ───────────────────────────────────────────────────────
  if (!child) {
    return (
      <div className="max-w-[480px] mx-auto min-h-screen flex flex-col">
        <div className="bg-[#0F172A] px-4 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <RouteyLogo size={22} variant="gradient" />
            <span className="text-sm font-extrabold tracking-tight">
              <span className="text-white">Routey</span>
              <span className="text-[#00D4FF]">AI</span>
            </span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4 pb-16">
          <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" strokeWidth="1.5" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <div>
            <p className="text-base font-bold text-[#0F172A] mb-1">No child linked yet</p>
            <p className="text-sm text-[#64748B] max-w-[280px]">
              Ask your school admin to generate an invite link and share it with you.
            </p>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/login'); router.refresh() }}
            className="mt-2 text-sm text-[#64748B] underline underline-offset-2"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  // ── Full tracking UI ──────────────────────────────────────────────────────
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
          <div className="text-[11px] text-white/40">Good morning</div>
        </div>

        {/* Child info bar */}
        <div className="bg-white/[0.08] rounded-xl px-3.5 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1E3A8A] border-2 border-[#3B82F6] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-[15px] leading-tight">{child.name}</div>
            <div className="text-white/50 text-[11px]">
              {child.bus_name ? `Bus ${child.bus_name}` : 'Bus not assigned'}
            </div>
          </div>
          <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
            liveStatus === 'boarded' ? 'bg-[#10B981]/20'
            : liveStatus === 'absent' ? 'bg-[#EF4444]/20'
            : 'bg-white/10'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              liveStatus === 'boarded' ? 'bg-[#10B981]'
              : liveStatus === 'absent' ? 'bg-[#EF4444]'
              : 'bg-white/40'
            }`} />
            <span className={`text-[11px] font-bold ${
              liveStatus === 'boarded' ? 'text-[#10B981]'
              : liveStatus === 'absent' ? 'text-[#EF4444]'
              : 'text-white/60'
            }`}>
              {liveStatus === 'boarded' ? 'Boarded' : liveStatus === 'absent' ? 'Absent' : 'Awaiting'}
            </span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative bg-[#e8edf2] overflow-hidden" style={{ height: 220 }}>
        <svg width="100%" height="220" viewBox="0 0 480 220" preserveAspectRatio="xMidYMid slice">
          <rect width="480" height="220" fill="#e8edf2" />
          {[80, 160, 240, 320, 400].map(x => (
            <line key={x} x1={x} y1="0" x2={x} y2="220" stroke="#d1d9e0" strokeWidth={x === 240 ? 10 : 6} />
          ))}
          {[60, 130, 190].map(y => (
            <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="#d1d9e0" strokeWidth={y === 130 ? 10 : 6} />
          ))}
          {[[85,65,70,60],[165,65,70,60],[245,65,70,60],[325,65,70,60],[85,135,70,50],[165,135,70,50],[325,135,70,50],[405,135,70,50]].map(([x,y,w,h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx="3" fill="#cdd7e0" opacity="0.55" />
          ))}
          <path d="M30 130 Q80 130 80 65 Q80 10 160 10 Q240 10 240 65 Q240 130 320 130 Q400 130 400 65 Q400 10 450 35"
            stroke="#3B82F6" strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.6" strokeDasharray="7 3" />
          <path d="M30 130 Q80 130 80 65 Q80 10 160 10"
            stroke="#1E3A8A" strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.9" />
          <g transform="translate(30,130)">
            <circle r="9" fill="#10B981" stroke="#fff" strokeWidth="2.5" />
            <text textAnchor="middle" y="4" fontSize="9" fill="#fff" fontWeight="700">H</text>
          </g>
          <circle cx="160" cy="10" r="7" fill="#10B981" stroke="#fff" strokeWidth="2" />
          <circle cx="240" cy="65" r="9" fill="#3B82F6" stroke="#fff" strokeWidth="2.5" />
          <circle cx="320" cy="130" r="7" fill="#CBD5E1" stroke="#fff" strokeWidth="2" />
          <g transform="translate(450,35)">
            <circle r="12" fill="#1E3A8A" stroke="#fff" strokeWidth="2.5" />
            <rect x="-6" y="-5" width="12" height="10" rx="1" fill="#fff" opacity="0.9" />
            <rect x="-3.5" y="-5" width="7" height="2.5" rx="1" fill="#1E3A8A" />
          </g>
          <g transform={`translate(${busPos.x},${busPos.y})`} style={{ transition: 'transform 2s ease' }}>
            <circle r="15" fill={child.bus_color} stroke="#fff" strokeWidth="3" />
            <text textAnchor="middle" y="5" fontSize="10" fill="#fff" fontWeight="700">
              {child.bus_name ?? '#'}
            </text>
          </g>
          <text x="478" y="218" textAnchor="end" fontSize="8" fill="#94A3B8">Map simulation</text>
        </svg>
        <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 text-[11px] font-bold text-[#10B981]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse block" />
          Live
        </div>
        <div className="absolute bottom-2.5 left-2.5 bg-[#1E3A8A]/90 backdrop-blur-sm rounded-lg px-3 py-1.5">
          <div className="text-[10px] text-white/60 font-semibold uppercase tracking-wide">ETA to School</div>
          <div className="text-[#00D4FF] font-bold text-sm">En route</div>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 pb-6 flex flex-col gap-4">
        {/* Bus info */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-4">
          <div className="text-xs font-bold text-[#0F172A] mb-3">Bus & Route</div>
          <div className="grid grid-cols-2 gap-3">
            {([
              ['Bus', child.bus_name ? `Bus ${child.bus_name}` : '—'],
              ['Stops', waypoints.length > 0 ? `${waypoints.length} stops` : '—'],
              ['Your stop', child.stop_order != null ? `Stop ${child.stop_order}` : '—'],
              ['Status', liveStatus === 'boarded' ? 'On board' : liveStatus === 'absent' ? 'Absent today' : 'Awaiting pick-up'],
            ] as const).map(([l, v]) => (
              <div key={l} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2.5">
                <div className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wide mb-0.5">{l}</div>
                <div className="text-[13px] font-semibold text-[#0F172A]">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Route timeline */}
        {timelineStops.length > 1 ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-4">
            <div className="text-xs font-bold text-[#0F172A] mb-3">Route Progress</div>
            <div className="flex flex-col gap-0">
              {timelineStops.map((stop, i) => (
                <div key={stop.key} className="flex items-start gap-3">
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
                    {i < timelineStops.length - 1 && (
                      <div className="w-0.5 h-8 mt-0.5" style={{ background: stop.done ? '#10B981' : '#E2E8F0' }} />
                    )}
                  </div>
                  <div className="flex-1 pb-6 pt-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="text-[13px] font-semibold"
                        style={{ color: stop.current ? '#1E3A8A' : stop.done ? '#0F172A' : '#94A3B8' }}
                      >
                        {stop.label}
                      </span>
                      {stop.isChild && (
                        <span className="text-[10px] bg-[#EFF6FF] text-[#1E3A8A] font-bold px-1.5 py-0.5 rounded-full">
                          YOUR STOP
                        </span>
                      )}
                      {stop.isSchool && (
                        <span className="text-[10px] bg-[#F0FDF4] text-[#059669] font-bold px-1.5 py-0.5 rounded-full">
                          SCHOOL
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 text-center">
            <p className="text-sm text-[#94A3B8]">Route not generated yet — ask your school admin to run route optimization.</p>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push('/login'); router.refresh() }}
          className="w-full bg-[#0F172A] text-white rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  )
}
