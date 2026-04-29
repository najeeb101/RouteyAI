'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RouteyLogo } from '@/components/RouteyLogo'
import { createClient } from '@/lib/supabase/client'
import type { DriverBusData, DriverStopData, DriverAnnouncementData } from './page'

type Props = {
  bus: DriverBusData | null
  stops: DriverStopData[]
  attendedIds: string[]
  announcements: DriverAnnouncementData[]
  schoolName: string | null
}

type TripStatus = 'idle' | 'active' | 'done'

function formatETA(offsetMin: number): string {
  const total = 7 * 60 + 30 + offsetMin
  const h = Math.floor(total / 60)
  const m = total % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function DriverClient({ bus, stops, attendedIds: initialAttendedIds, announcements, schoolName }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [tripStatus, setTripStatus] = useState<TripStatus>('idle')
  const [boardedIds, setBoardedIds] = useState<Set<string>>(new Set(initialAttendedIds))
  const [alertOpen, setAlertOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  const totalStudents = stops.flatMap(s => s.students).length
  const boardedCount = boardedIds.size

  const stopsWithState = stops.map(stop => ({
    ...stop,
    done: stop.students.length > 0 && stop.students.every(s => boardedIds.has(s.id)),
  }))
  const currentStop = tripStatus === 'active'
    ? stopsWithState.find(s => !s.done && s.students.length > 0)
    : undefined

  async function toggleAttendance(studentId: string) {
    if (!bus || toggling) return
    const today = new Date().toISOString().split('T')[0]
    const wasBoarded = boardedIds.has(studentId)

    setToggling(studentId)
    setBoardedIds(prev => {
      const next = new Set(prev)
      wasBoarded ? next.delete(studentId) : next.add(studentId)
      return next
    })

    if (wasBoarded) {
      await supabase.from('attendance')
        .delete()
        .eq('student_id', studentId)
        .eq('bus_id', bus.id)
        .eq('date', today)
    } else {
      await supabase.from('attendance')
        .insert({ student_id: studentId, bus_id: bus.id, status: 'boarded', date: today })
    }
    setToggling(null)
  }

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (!bus) {
    return (
      <div className="max-w-[480px] mx-auto min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#EFF6FF] flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round">
              <rect x="1" y="3" width="15" height="13" rx="2"/>
              <path d="M16 8h4l3 3v4h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          <div className="text-lg font-bold text-[#0F172A] mb-1">No bus assigned</div>
          <div className="text-sm text-[#64748B] mb-6">
            Your account hasn&apos;t been assigned to a bus yet. Contact your school admin.
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="bg-[#1E3A8A] text-white rounded-xl px-6 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

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
          <div className="flex items-center gap-2">
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center disabled:opacity-60"
              title="Sign out"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
            <button
              onClick={() => setAlertOpen(true)}
              className="relative w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              {announcements.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#EF4444] rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Bus info */}
        <div className="bg-white/[0.08] rounded-xl px-3.5 py-3 flex items-center justify-between">
          <div>
            <div className="text-white font-bold text-lg leading-tight">{bus.name}</div>
            <div className="text-white/50 text-xs mt-0.5">{schoolName ?? 'School'} · Morning Run</div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {tripStatus === 'idle' && (
              <button
                onClick={() => setTripStatus('active')}
                className="bg-[#10B981] text-white rounded-lg px-3.5 py-1.5 text-xs font-bold"
              >
                Start Trip
              </button>
            )}
            {tripStatus === 'active' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
                  <span className="text-[#10B981] text-[11px] font-bold uppercase tracking-wide">Live</span>
                </div>
                <button
                  onClick={() => setTripStatus('done')}
                  className="bg-[#EF4444] text-white rounded-lg px-3.5 py-1.5 text-xs font-bold"
                >
                  End Trip
                </button>
              </>
            )}
            {tripStatus === 'done' && (
              <span className="bg-[#1E3A8A] text-white rounded-lg px-3.5 py-1.5 text-xs font-bold">
                Completed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="relative bg-[#e8edf2] overflow-hidden" style={{ height: 210 }}>
        <svg width="100%" height="210" viewBox="0 0 480 210" preserveAspectRatio="xMidYMid slice">
          <rect width="480" height="210" fill="#e8edf2" />
          {[80, 160, 240, 320, 400].map(x => (
            <line key={x} x1={x} y1="0" x2={x} y2="210" stroke="#d1d9e0" strokeWidth={x === 240 ? 10 : 6} />
          ))}
          {[60, 120, 180].map(y => (
            <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="#d1d9e0" strokeWidth={y === 120 ? 10 : 6} />
          ))}
          {([
            [85,65,70,50],[165,65,70,50],[245,65,70,50],[325,65,70,50],
            [85,130,70,44],[165,130,70,44],[325,130,70,44],[405,130,70,44],
          ] as [number,number,number,number][]).map(([x,y,w,h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx="3" fill="#cdd7e0" opacity="0.55" />
          ))}
          <path
            d="M30 120 Q80 120 80 60 Q80 10 160 10 Q240 10 240 60 Q240 120 320 120 Q400 120 400 60 Q400 10 450 30"
            stroke={bus.color} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.9"
          />
          <circle cx="30"  cy="120" r="7" fill="#10B981" stroke="#fff" strokeWidth="2.5" />
          <circle cx="160" cy="10"  r="7" fill="#10B981" stroke="#fff" strokeWidth="2.5" />
          <circle cx="240" cy="60"  r="10" fill={bus.color} stroke="#fff" strokeWidth="2.5" />
          <circle cx="320" cy="120" r="7" fill="#CBD5E1" stroke="#fff" strokeWidth="2.5" />
          <g transform="translate(450,30)">
            <circle r="12" fill="#1E3A8A" stroke="#fff" strokeWidth="2.5"/>
            <rect x="-6" y="-5" width="12" height="10" rx="1" fill="#fff" opacity="0.9"/>
            <rect x="-3.5" y="-5" width="7" height="2.5" rx="1" fill="#1E3A8A"/>
          </g>
          <g transform="translate(240,60)">
            <circle r="15" fill={bus.color} stroke="#fff" strokeWidth="3"/>
            <text textAnchor="middle" y="5" fontSize="10" fill="#fff" fontWeight="700">
              {bus.name.replace('Bus ', '#')}
            </text>
          </g>
          <text x="478" y="208" textAnchor="end" fontSize="8" fill="#94A3B8">Map simulation</text>
        </svg>
        <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 text-[11px] font-bold text-[#10B981]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse block" />
          Live
        </div>
        {totalStudents > 0 && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center justify-between">
            <span className="text-[11px] text-[#64748B]">{boardedCount}/{totalStudents} boarded</span>
            <div className="flex-1 mx-3 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3B82F6] rounded-full transition-all"
                style={{ width: `${(boardedCount / totalStudents) * 100}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-[#1E3A8A]">
              {Math.round((boardedCount / totalStudents) * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Next stop banner */}
      {currentStop && (
        <div className="mx-4 -mt-3 z-10 relative bg-[#1E3A8A] rounded-xl px-4 py-3 flex items-center justify-between shadow-lg">
          <div className="min-w-0 flex-1 mr-4">
            <div className="text-[10px] text-white/50 font-semibold uppercase tracking-wide mb-0.5">Next Stop</div>
            <div className="text-white font-bold text-base truncate">{currentStop.home_address}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] text-white/50 font-semibold uppercase tracking-wide mb-0.5">ETA</div>
            <div className="text-[#00D4FF] font-bold text-base">{formatETA(currentStop.eta_offset_min)}</div>
          </div>
        </div>
      )}

      {/* No students state */}
      {stops.length === 0 && (
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <div className="text-sm font-semibold text-[#64748B] mb-1">No students assigned to this bus</div>
            <div className="text-xs text-[#94A3B8]">Contact your school admin to add students.</div>
          </div>
        </div>
      )}

      {/* Stops + student check-in */}
      {stops.length > 0 && (
        <div className="flex-1 px-4 pt-4 pb-6 flex flex-col gap-3">
          {stopsWithState.map((stop, idx) => {
            const isCurrent = currentStop?.stop_order === stop.stop_order
            return (
              <div
                key={stop.stop_order}
                className="bg-white rounded-2xl border shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] overflow-hidden"
                style={{
                  borderColor: isCurrent ? '#3B82F6' : '#E2E8F0',
                  borderWidth: isCurrent ? 1.5 : 1,
                }}
              >
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ background: isCurrent ? '#EFF6FF' : 'white' }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {stop.done ? (
                      <div className="w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    ) : isCurrent ? (
                      <div className="w-6 h-6 rounded-full bg-[#3B82F6] flex items-center justify-center shrink-0">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-[#CBD5E1] flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-[#94A3B8]">{idx + 1}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#0F172A] truncate">{stop.home_address}</div>
                      {stop.students.length > 0 && (
                        <div className="text-[11px] text-[#64748B]">
                          {stop.students.length} student{stop.students.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="text-xs font-semibold text-[#64748B]">{formatETA(stop.eta_offset_min)}</div>
                    {stop.done && <div className="text-[10px] text-[#10B981] font-bold">Done</div>}
                    {isCurrent && <div className="text-[10px] text-[#3B82F6] font-bold">Now</div>}
                  </div>
                </div>

                {stop.students.length > 0 && (
                  <div className="divide-y divide-[#F1F5F9]">
                    {stop.students.map(student => {
                      const isBoarded = boardedIds.has(student.id)
                      const isTogglingThis = toggling === student.id
                      const initials = student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
                      return (
                        <div key={student.id} className="flex items-center gap-3 px-4 py-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[12px] font-bold text-[#1E3A8A] shrink-0">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-semibold text-[#0F172A]">{student.name}</div>
                          </div>
                          <button
                            onClick={() => tripStatus === 'active' && !stop.done && toggleAttendance(student.id)}
                            disabled={tripStatus !== 'active' || isTogglingThis}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-60"
                            style={{
                              background: isBoarded ? '#D1FAE5' : '#FEF3C7',
                              color: isBoarded ? '#059669' : '#D97706',
                              cursor: tripStatus !== 'active' ? 'default' : 'pointer',
                            }}
                          >
                            {isBoarded ? (
                              <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Boarded
                              </>
                            ) : (
                              <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                </svg>
                                Board
                              </>
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          {/* School destination */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[#F0FDF4]">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#1E3A8A] flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0F172A]">{schoolName ?? 'School'}</div>
                  <div className="text-[11px] text-[#64748B]">Drop-off destination</div>
                </div>
              </div>
              <div className="text-xs font-semibold text-[#64748B]">
                {stops.length > 0 ? formatETA((stops[stops.length - 1]?.eta_offset_min ?? 0) + 10) : '—'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Announcements modal */}
      {alertOpen && (
        <div
          className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-sm flex items-end justify-center z-50"
          onClick={() => setAlertOpen(false)}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-w-[480px] p-5 pb-8 shadow-[0_-20px_60px_-15px_rgb(0_0_0/0.3)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-5" />
            <div className="text-base font-bold text-[#0F172A] mb-4">Messages from School</div>
            {announcements.length === 0 ? (
              <div className="text-center py-6 text-sm text-[#94A3B8]">No messages yet</div>
            ) : (
              <div className="flex flex-col gap-3">
                {announcements.map(ann => (
                  <div key={ann.id} className="flex gap-3 items-start bg-[#F8FAFC] rounded-xl px-3.5 py-3 border border-[#E2E8F0]">
                    <div className="w-2 h-2 rounded-full shrink-0 mt-1.5 bg-[#3B82F6]" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-0.5">
                        <span className="text-[12px] font-bold text-[#0F172A]">School Admin</span>
                        <span className="text-[11px] text-[#94A3B8]">{formatTime(ann.created_at)}</span>
                      </div>
                      <div className="text-[12px] text-[#64748B]">{ann.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setAlertOpen(false)}
              className="mt-4 w-full bg-[#0F172A] text-white rounded-xl py-3 text-sm font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
