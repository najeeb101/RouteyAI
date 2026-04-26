'use client'

import { useState } from 'react'
import { RouteyLogo } from '@/components/RouteyLogo'

const STOPS = [
  {
    id: 1,
    name: 'Lusail Blvd',
    eta: '7:38 AM',
    done: true,
    students: [
      { id: 1, name: 'Aisha Rahman',  grade: 'G4', checked: true  },
      { id: 2, name: 'Yusuf Al-Ali',  grade: 'G8', checked: true  },
    ],
  },
  {
    id: 2,
    name: 'West Bay',
    eta: '7:44 AM',
    done: true,
    students: [
      { id: 3, name: 'Tariq Hassan',  grade: 'G6', checked: true  },
    ],
  },
  {
    id: 3,
    name: 'C-Ring Rd',
    eta: '7:51 AM',
    done: false,
    current: true,
    students: [
      { id: 4, name: 'Hana Zayed',    grade: 'G5', checked: false },
      { id: 5, name: 'Bilal Saleh',   grade: 'G3', checked: false },
    ],
  },
  {
    id: 4,
    name: 'Al Waab St',
    eta: '7:58 AM',
    done: false,
    students: [
      { id: 6, name: 'Omar Khalil',   grade: 'G5', checked: false },
    ],
  },
  {
    id: 5,
    name: 'Al Nour School',
    eta: '8:10 AM',
    done: false,
    isSchool: true,
    students: [],
  },
]

type TripStatus = 'idle' | 'active' | 'done'

export default function DriverPage() {
  const [tripStatus, setTripStatus] = useState<TripStatus>('active')
  const [checked, setChecked] = useState<Set<number>>(new Set([1, 2, 3]))
  const [alertOpen, setAlertOpen] = useState(false)

  const totalStudents = STOPS.flatMap(s => s.students).length
  const boardedCount = checked.size
  const currentStop = STOPS.find(s => s.current)

  function toggleChecked(studentId: number) {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(studentId) ? next.delete(studentId) : next.add(studentId)
      return next
    })
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
          <button
            onClick={() => setAlertOpen(true)}
            className="relative w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#EF4444] rounded-full" />
          </button>
        </div>

        {/* Bus + route info */}
        <div className="bg-white/[0.08] rounded-xl px-3.5 py-3 flex items-center justify-between">
          <div>
            <div className="text-white font-bold text-lg leading-tight">Bus #3 — Route A</div>
            <div className="text-white/50 text-xs mt-0.5">Mohammed Al-Rashid · Morning Run</div>
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
          {/* Grid roads */}
          {[80, 160, 240, 320, 400].map(x => (
            <line key={x} x1={x} y1="0" x2={x} y2="210" stroke="#d1d9e0" strokeWidth={x === 240 ? 10 : 6} />
          ))}
          {[60, 120, 180].map(y => (
            <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="#d1d9e0" strokeWidth={y === 120 ? 10 : 6} />
          ))}
          {/* Blocks */}
          {[
            [85,65,70,50],[165,65,70,50],[245,65,70,50],[325,65,70,50],
            [85,130,70,44],[165,130,70,44],[325,130,70,44],[405,130,70,44],
          ].map(([x,y,w,h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx="3" fill="#cdd7e0" opacity="0.55" />
          ))}
          {/* Route A path */}
          <path
            d="M30 120 Q80 120 80 60 Q80 10 160 10 Q240 10 240 60 Q240 120 320 120 Q400 120 400 60 Q400 10 450 30"
            stroke="#3B82F6" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.9"
          />
          {/* Completed path segment */}
          <path
            d="M30 120 Q80 120 80 60 Q80 10 160 10 Q240 10 240 60"
            stroke="#1E3A8A" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.9"
          />
          {/* Stop dots */}
          <circle cx="30"  cy="120" r="7" fill="#10B981" stroke="#fff" strokeWidth="2.5" />
          <circle cx="160" cy="10"  r="7" fill="#10B981" stroke="#fff" strokeWidth="2.5" />
          <circle cx="240" cy="60"  r="10" fill="#3B82F6" stroke="#fff" strokeWidth="2.5" />
          <circle cx="320" cy="120" r="7" fill="#CBD5E1" stroke="#fff" strokeWidth="2.5" />
          {/* School */}
          <g transform="translate(450,30)">
            <circle r="12" fill="#1E3A8A" stroke="#fff" strokeWidth="2.5"/>
            <rect x="-6" y="-5" width="12" height="10" rx="1" fill="#fff" opacity="0.9"/>
            <rect x="-3.5" y="-5" width="7" height="2.5" rx="1" fill="#1E3A8A"/>
          </g>
          {/* Current bus */}
          <g transform="translate(240,60)">
            <circle r="15" fill="#3B82F6" stroke="#fff" strokeWidth="3"/>
            <text textAnchor="middle" y="5" fontSize="11" fill="#fff" fontWeight="700">#3</text>
          </g>
          <text x="478" y="208" textAnchor="end" fontSize="8" fill="#94A3B8">Map simulation</text>
        </svg>
        {/* Live badge */}
        <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 text-[11px] font-bold text-[#10B981]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse block" />
          Live
        </div>
        {/* Progress */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center justify-between">
          <span className="text-[11px] text-[#64748B]">{boardedCount}/{totalStudents} boarded</span>
          <div className="flex-1 mx-3 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div className="h-full bg-[#3B82F6] rounded-full" style={{ width: `${(boardedCount / totalStudents) * 100}%` }} />
          </div>
          <span className="text-[11px] font-bold text-[#1E3A8A]">{Math.round((boardedCount / totalStudents) * 100)}%</span>
        </div>
      </div>

      {/* Next stop banner */}
      {currentStop && (
        <div className="mx-4 -mt-3 z-10 relative bg-[#1E3A8A] rounded-xl px-4 py-3 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[10px] text-white/50 font-semibold uppercase tracking-wide mb-0.5">Next Stop</div>
            <div className="text-white font-bold text-base">{currentStop.name}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-white/50 font-semibold uppercase tracking-wide mb-0.5">ETA</div>
            <div className="text-[#00D4FF] font-bold text-base">{currentStop.eta}</div>
          </div>
        </div>
      )}

      {/* Stops + student check-in */}
      <div className="flex-1 px-4 pt-4 pb-6 flex flex-col gap-3">
        {STOPS.map(stop => (
          <div
            key={stop.id}
            className="bg-white rounded-2xl border shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] overflow-hidden"
            style={{ borderColor: stop.current ? '#3B82F6' : stop.done ? '#E2E8F0' : '#E2E8F0', borderWidth: stop.current ? 1.5 : 1 }}
          >
            {/* Stop header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ background: stop.current ? '#EFF6FF' : stop.isSchool ? '#F0FDF4' : 'white' }}
            >
              <div className="flex items-center gap-2.5">
                {stop.done ? (
                  <div className="w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                ) : stop.isSchool ? (
                  <div className="w-6 h-6 rounded-full bg-[#1E3A8A] flex items-center justify-center shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                ) : stop.current ? (
                  <div className="w-6 h-6 rounded-full bg-[#3B82F6] flex items-center justify-center shrink-0">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-[#CBD5E1] shrink-0" />
                )}
                <div>
                  <div className="text-sm font-bold text-[#0F172A]">{stop.name}</div>
                  {stop.students.length > 0 && (
                    <div className="text-[11px] text-[#64748B]">{stop.students.length} student{stop.students.length !== 1 ? 's' : ''}</div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-[#64748B]">{stop.eta}</div>
                {stop.done && <div className="text-[10px] text-[#10B981] font-bold">Done</div>}
                {stop.current && <div className="text-[10px] text-[#3B82F6] font-bold">Now</div>}
              </div>
            </div>

            {/* Student list */}
            {stop.students.length > 0 && (
              <div className="divide-y divide-[#F1F5F9]">
                {stop.students.map(student => {
                  const isChecked = checked.has(student.id)
                  const initials = student.name.split(' ').map((n: string) => n[0]).join('')
                  return (
                    <div key={student.id} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[12px] font-bold text-[#1E3A8A] shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-[#0F172A]">{student.name}</div>
                        <div className="text-[11px] text-[#94A3B8]">{student.grade}</div>
                      </div>
                      <button
                        onClick={() => !stop.done && toggleChecked(student.id)}
                        disabled={stop.done}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
                        style={{
                          background: isChecked ? '#D1FAE5' : '#FEF3C7',
                          color: isChecked ? '#059669' : '#D97706',
                          cursor: stop.done ? 'default' : 'pointer',
                        }}
                      >
                        {isChecked ? (
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

            {stop.isSchool && (
              <div className="px-4 py-3 text-[12px] text-[#64748B] italic">Drop-off destination</div>
            )}
          </div>
        ))}
      </div>

      {/* Notification modal */}
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
            <div className="flex flex-col gap-3">
              {[
                { from: 'School Admin', msg: 'Route D is at capacity. Please proceed on schedule.', time: '7:52 AM', color: '#F59E0B' },
                { from: 'School Admin', msg: 'Sara Al-Farsi (Bus #7) marked absent by parent.', time: '7:44 AM', color: '#EF4444' },
              ].map((n, i) => (
                <div key={i} className="flex gap-3 items-start bg-[#F8FAFC] rounded-xl px-3.5 py-3 border border-[#E2E8F0]">
                  <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: n.color }} />
                  <div className="flex-1">
                    <div className="flex justify-between mb-0.5">
                      <span className="text-[12px] font-bold text-[#0F172A]">{n.from}</span>
                      <span className="text-[11px] text-[#94A3B8]">{n.time}</span>
                    </div>
                    <div className="text-[12px] text-[#64748B]">{n.msg}</div>
                  </div>
                </div>
              ))}
            </div>
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
