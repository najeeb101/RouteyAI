'use client'

import { useState, useEffect } from 'react'

const ROUTE_COLORS = { 1: '#3B82F6', 2: '#10B981', 3: '#F59E0B', 4: '#8B5CF6' } as const
const ROUTES = [
  { id: 1, name: 'Route A', color: '#3B82F6' },
  { id: 2, name: 'Route B', color: '#10B981' },
  { id: 3, name: 'Route C', color: '#F59E0B' },
  { id: 4, name: 'Route D', color: '#8B5CF6' },
]

type BusPos = { x: number; y: number }

export function FleetMapSvg() {
  const [busPos, setBusPos] = useState<Record<number, BusPos>>({
    1: { x: 170, y: 160 },
    2: { x: 280, y: 220 },
    4: { x: 520, y: 180 },
  })

  useEffect(() => {
    const t = setInterval(() => {
      setBusPos(prev => {
        const routeA = prev[1] ?? { x: 170, y: 160 }
        const routeB = prev[2] ?? { x: 280, y: 220 }
        const routeD = prev[4] ?? { x: 520, y: 180 }

        return {
          1: { x: routeA.x + (Math.random() - 0.5) * 4, y: routeA.y + (Math.random() - 0.5) * 4 },
          2: { x: routeB.x + (Math.random() - 0.5) * 4, y: routeB.y + (Math.random() - 0.5) * 4 },
          4: { x: routeD.x + (Math.random() - 0.5) * 4, y: routeD.y + (Math.random() - 0.5) * 4 },
        }
      })
    }, 1800)
    return () => clearInterval(t)
  }, [])

  const BLOCKS = [
    [88,68,64,54],[168,68,64,54],[248,68,64,54],[328,68,64,54],[408,68,64,54],[488,68,64,54],
    [88,138,64,54],[168,138,64,54],[248,138,64,54],[328,138,64,54],[408,138,64,54],[488,138,64,54],
    [88,208,64,54],[168,208,64,54],[328,208,64,54],[408,208,64,54],[488,208,64,54],
    [88,278,64,54],[168,278,64,54],[248,278,64,54],[328,278,64,54],
  ]

  return (
    <div className="relative flex-1 bg-[#e8edf2] rounded-xl overflow-hidden" style={{ minHeight: 320 }}>
      <svg style={{ width: '100%', height: '100%', minHeight: 320 }} viewBox="0 0 700 380" preserveAspectRatio="xMidYMid slice">
        <rect width="700" height="380" fill="#e8edf2" />
        {[80,160,240,320,400,480,560,640].map(x => (
          <line key={x} x1={x} y1="0" x2={x} y2="380" stroke="#d1d9e0" strokeWidth={x === 320 ? 14 : 8} />
        ))}
        {[60,130,200,270,340].map(y => (
          <line key={y} x1="0" y1={y} x2="700" y2={y} stroke="#d1d9e0" strokeWidth={y === 200 ? 14 : 8} />
        ))}
        {BLOCKS.map(([x,y,w,h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="3" fill="#cdd7e0" opacity="0.55" />
        ))}
        {/* Park */}
        <rect x="248" y="208" width="64" height="54" rx="3" fill="#b8d9b8" opacity="0.7" />
        {/* Route lines */}
        <path d="M40 200 Q80 200 80 130 Q80 60 160 60 Q240 60 240 130 Q240 200 320 200" stroke="#3B82F6" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8"/>
        <path d="M320 200 Q400 200 400 130 Q400 60 480 60 Q560 60 560 130 Q560 200 640 200" stroke="#10B981" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8"/>
        <path d="M80 340 Q80 270 160 270 Q240 270 240 200 Q240 130 320 130" stroke="#F59E0B" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" strokeDasharray="6 3"/>
        <path d="M480 340 Q480 270 560 270 Q640 270 640 200" stroke="#8B5CF6" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8"/>
        {/* School pin */}
        <g transform="translate(320,200)">
          <circle r="16" fill="#1E3A8A" stroke="#fff" strokeWidth="3"/>
          <rect x="-8" y="-7" width="16" height="14" rx="1" fill="#fff" opacity="0.9"/>
          <rect x="-5" y="-7" width="10" height="3" rx="1" fill="#1E3A8A" opacity="0.8"/>
        </g>
        <text x="320" y="230" textAnchor="middle" fontSize="9" fill="#1E3A8A" fontWeight="700">Al Nour School</text>
        {/* Active buses */}
        {([{ id:1, num:3, color:'#3B82F6' },{ id:2, num:7, color:'#10B981' },{ id:4, num:5, color:'#8B5CF6' }] as const).map(b => (
          <g key={b.id} transform={`translate(${busPos[b.id]?.x ?? 170},${busPos[b.id]?.y ?? 160})`} style={{ transition: 'transform 1.8s ease' }}>
            <circle r="16" fill={b.color} stroke="#fff" strokeWidth="2.5"/>
            <text textAnchor="middle" y="5" fontSize="12" fill="#fff" fontWeight="700">#{b.num}</text>
          </g>
        ))}
        {/* Idle bus */}
        <g transform="translate(400,300)">
          <circle r="16" fill="#94A3B8" stroke="#fff" strokeWidth="2.5"/>
          <text textAnchor="middle" y="5" fontSize="12" fill="#fff" fontWeight="700">#12</text>
        </g>
        <text x="690" y="375" textAnchor="end" fontSize="9" fill="#94A3B8">Map simulation</text>
      </svg>

      {/* Legend */}
      <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-2 flex flex-col gap-1.5 border border-[#E2E8F0]/80">
        {ROUTES.map(r => (
          <div key={r.id} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.color }} />
            <span className="text-[11px] text-[#64748B]">{r.name}</span>
          </div>
        ))}
      </div>

      {/* Live badge */}
      <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 text-[11px] font-bold text-[#10B981]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse-ring block" />
        Live
      </div>
    </div>
  )
}
