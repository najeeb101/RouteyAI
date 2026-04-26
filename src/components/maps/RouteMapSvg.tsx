interface RouteMapSvgProps {
  activeStopName?: string
}

export function RouteMapSvg({ activeStopName }: RouteMapSvgProps) {
  return (
    <div className="relative flex-1 overflow-hidden" style={{ minHeight: 0 }}>
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} viewBox="0 0 390 270" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="routeGlow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Land */}
        <rect width="390" height="270" fill="#F0EBE3"/>
        {/* Parks */}
        <rect x="260" y="0" width="130" height="90" fill="#C8DFBB" opacity="0.7"/>
        <rect x="0" y="180" width="80" height="90" fill="#C8DFBB" opacity="0.6"/>
        {/* Water */}
        <path d="M320 220 Q355 200 390 210 L390 270 L300 270 Z" fill="#A8D4E6" opacity="0.8"/>

        {/* Blocks */}
        <rect x="6"   y="6"   width="58" height="52" rx="3" fill="#E0D8CF"/>
        <rect x="6"   y="76"  width="58" height="40" rx="3" fill="#DDD5CC"/>
        <rect x="92"  y="6"   width="44" height="30" rx="3" fill="#DDD5CC"/>
        <rect x="92"  y="52"  width="44" height="50" rx="3" fill="#E0D8CF"/>
        <rect x="162" y="6"   width="52" height="42" rx="3" fill="#DDD5CC"/>
        <rect x="162" y="64"  width="52" height="44" rx="3" fill="#E0D8CF"/>
        <rect x="228" y="6"   width="22" height="52" rx="3" fill="#DDD5CC"/>
        <rect x="266" y="96"  width="44" height="36" rx="3" fill="#DDD5CC"/>
        <rect x="322" y="96"  width="60" height="36" rx="3" fill="#DDD5CC"/>

        {/* Secondary streets */}
        <line x1="0" y1="64"  x2="390" y2="64"  stroke="#E8E0D6" strokeWidth="5"/>
        <line x1="0" y1="116" x2="390" y2="116" stroke="#E8E0D6" strokeWidth="5"/>
        <line x1="0" y1="172" x2="390" y2="172" stroke="#E8E0D6" strokeWidth="5"/>
        <line x1="68"  y1="0" x2="68"  y2="270" stroke="#E8E0D6" strokeWidth="5"/>
        <line x1="318" y1="0" x2="318" y2="270" stroke="#E8E0D6" strokeWidth="5"/>

        {/* Primary arterials */}
        <line x1="0" y1="116" x2="390" y2="116" stroke="#FFFFFF" strokeWidth="12"/>
        <line x1="154" y1="0" x2="154" y2="270" stroke="#FFFFFF" strokeWidth="12"/>
        {/* Center dashes */}
        <line x1="0" y1="116" x2="390" y2="116" stroke="#E8C96A" strokeWidth="1.2" strokeDasharray="12 10" opacity="0.5"/>
        <line x1="154" y1="0" x2="154" y2="270" stroke="#E8C96A" strokeWidth="1.2" strokeDasharray="12 10" opacity="0.5"/>
        {/* Road labels */}
        <text x="80"  y="112" fontSize="8" fill="#A09080" fontWeight="600" letterSpacing="0.03em">C-Ring Road</text>
        <text x="158" y="30"  fontSize="8" fill="#A09080" fontWeight="600" letterSpacing="0.03em" transform="rotate(90,158,30)">Lusail Blvd</text>

        {/* Completed route */}
        <path d="M10 116 Q68 116 68 64 Q68 20 130 20 Q154 20 154 64" stroke="#10B981" strokeWidth="5" fill="none" strokeLinecap="round" filter="url(#routeGlow)" opacity="0.9"/>
        {/* Upcoming route */}
        <path d="M154 64 Q154 116 210 116 Q252 116 252 64 Q252 20 318 20 Q355 20 380 50" stroke="#3B82F6" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="10 6" opacity="0.85"/>

        {/* Completed stops */}
        <circle cx="68" cy="64" r="7" fill="#10B981" stroke="#fff" strokeWidth="2.5"/>
        <path d="M65 64 l2 2 l4-4" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <circle cx="130" cy="20" r="7" fill="#10B981" stroke="#fff" strokeWidth="2.5"/>
        <path d="M127 20 l2 2 l4-4" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

        {/* Active stop */}
        <circle cx="154" cy="64" r="12" fill="#3B82F6" opacity="0.18"/>
        <circle cx="154" cy="64" r="8" fill="#3B82F6" stroke="#fff" strokeWidth="2.5"/>
        <circle cx="154" cy="64" r="3" fill="#fff"/>

        {/* Upcoming stops */}
        <circle cx="252" cy="64" r="6" fill="#fff" stroke="#94A3B8" strokeWidth="2"/>
        <circle cx="318" cy="20" r="6" fill="#fff" stroke="#94A3B8" strokeWidth="2"/>

        {/* Bus marker */}
        <g transform="translate(138,90)">
          <ellipse cx="0" cy="16" rx="14" ry="4" fill="rgba(0,0,0,0.12)"/>
          <rect x="-13" y="-12" width="26" height="18" rx="5" fill="#1E3A8A"/>
          <rect x="-9" y="-9" width="7" height="6" rx="1.5" fill="#38BDF8" opacity="0.9"/>
          <rect x="2" y="-9" width="7" height="6" rx="1.5" fill="#38BDF8" opacity="0.9"/>
          <circle cx="-7" cy="7" r="3.5" fill="#0F172A" stroke="#fff" strokeWidth="1.2"/>
          <circle cx="7" cy="7" r="3.5" fill="#0F172A" stroke="#fff" strokeWidth="1.2"/>
          <path d="M0 -14 l4 5 l-4 -2 l-4 2 Z" fill="#38BDF8"/>
        </g>

        {/* Turn indicator */}
        <g transform="translate(154,64)">
          <rect x="14" y="-10" width="44" height="22" rx="5" fill="#0F172A" opacity="0.82"/>
          <text x="36" y="5" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="700">→ 0.4 km</text>
        </g>
      </svg>

      {/* Compass */}
      <div className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm border border-black/[0.06]">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1 L8.2 6 L7 5.2 L5.8 6 Z" fill="#EF4444"/>
          <path d="M7 13 L8.2 8 L7 8.8 L5.8 8 Z" fill="#94A3B8"/>
          <circle cx="7" cy="7" r="1.5" fill="#0F172A"/>
        </svg>
      </div>

      {/* Scale */}
      <div className="absolute bottom-1.5 left-2 flex items-center gap-1">
        <div className="w-9 h-0.5 bg-[#0F172A] rounded opacity-30" />
        <span className="text-[8px] text-[#94A3B8] font-medium">200 m</span>
      </div>
    </div>
  )
}
