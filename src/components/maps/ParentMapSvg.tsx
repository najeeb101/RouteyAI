interface ParentMapSvgProps {
  status: 'en_route' | 'approaching' | 'arrived'
}

export function ParentMapSvg({ status }: ParentMapSvgProps) {
  const busX = status === 'approaching' ? 195 : status === 'arrived' ? 195 : 120
  const busY = status === 'approaching' ? 310 : status === 'arrived' ? 370 : 200

  return (
    <svg style={{ width:'100%', height:'100%' }} viewBox="0 0 390 700" preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id="pGlow">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id="youGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Land */}
      <rect width="390" height="700" fill="#F0EBE3"/>
      {/* Water */}
      <path d="M310 0 Q340 80 360 200 Q380 350 370 500 Q360 600 310 700 L390 700 L390 0 Z" fill="#A8D4E6" opacity="0.75"/>
      {/* Parks */}
      <rect x="0" y="460" width="88" height="130" fill="#C4DFB4" opacity="0.75"/>
      <rect x="206" y="0" width="80" height="110" fill="#C4DFB4" opacity="0.6"/>

      {/* Blocks */}
      <rect x="6"   y="6"   width="66" height="100" rx="3" fill="#E0D8CF"/>
      <rect x="6"   y="130" width="66" height="110" rx="3" fill="#DDD5CC"/>
      <rect x="6"   y="260" width="66" height="90"  rx="3" fill="#E0D8CF"/>
      <rect x="6"   y="370" width="66" height="80"  rx="3" fill="#DDD5CC"/>
      <rect x="92"  y="6"   width="100" height="100" rx="3" fill="#DDD5CC"/>
      <rect x="92"  y="130" width="100" height="110" rx="3" fill="#E2DAD1"/>
      <rect x="92"  y="260" width="100" height="90"  rx="3" fill="#DDD5CC"/>
      <rect x="92"  y="370" width="100" height="80"  rx="3" fill="#E0D8CF"/>
      <rect x="206" y="130" width="90"  height="100" rx="3" fill="#E0D8CF"/>
      <rect x="206" y="250" width="90"  height="90"  rx="3" fill="#DDD5CC"/>
      <rect x="206" y="360" width="90"  height="90"  rx="3" fill="#E2DAD1"/>
      <rect x="206" y="470" width="90"  height="90"  rx="3" fill="#DDD5CC"/>
      <rect x="206" y="580" width="90"  height="114" rx="3" fill="#E0D8CF"/>

      {/* Secondary streets */}
      <line x1="0" y1="118" x2="310" y2="118" stroke="#E8E0D6" strokeWidth="6"/>
      <line x1="0" y1="248" x2="310" y2="248" stroke="#E8E0D6" strokeWidth="6"/>
      <line x1="0" y1="358" x2="310" y2="358" stroke="#E8E0D6" strokeWidth="6"/>
      <line x1="0" y1="458" x2="310" y2="458" stroke="#E8E0D6" strokeWidth="6"/>
      <line x1="80"  y1="0" x2="80"  y2="700" stroke="#E8E0D6" strokeWidth="6"/>
      <line x1="300" y1="0" x2="300" y2="700" stroke="#E8E0D6" strokeWidth="6"/>

      {/* Primary arterials */}
      <line x1="0" y1="358" x2="390" y2="358" stroke="#FFFFFF" strokeWidth="16"/>
      <line x1="195" y1="0" x2="195" y2="700" stroke="#FFFFFF" strokeWidth="16"/>
      <line x1="0" y1="358" x2="390" y2="358" stroke="#E8C96A" strokeWidth="1.2" strokeDasharray="16 12" opacity="0.45"/>
      <line x1="195" y1="0" x2="195" y2="700" stroke="#E8C96A" strokeWidth="1.2" strokeDasharray="16 12" opacity="0.45"/>
      {/* Labels */}
      <text x="220" y="352" fontSize="9" fill="#A09080" fontWeight="600" letterSpacing="0.04em">C-Ring Road</text>
      <text x="200" y="80" fontSize="9" fill="#A09080" fontWeight="600" letterSpacing="0.04em" transform="rotate(90,200,80)">Lusail Blvd</text>

      {/* Completed route */}
      <path d="M40 118 Q80 118 80 248 Q80 280 120 310 Q160 340 195 358" stroke="#10B981" strokeWidth="6" fill="none" strokeLinecap="round" filter="url(#pGlow)" opacity="0.9"/>
      {/* Upcoming route */}
      <path d="M195 358 Q195 400 195 458 Q195 500 195 540" stroke="#3B82F6" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="12 7" opacity="0.8"/>

      {/* Completed stops */}
      <circle cx="80" cy="200" r="8" fill="#10B981" stroke="#fff" strokeWidth="2.5"/>
      <path d="M77 200 l2 2.5 l4.5-4.5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <circle cx="80" cy="300" r="8" fill="#10B981" stroke="#fff" strokeWidth="2.5"/>
      <path d="M77 300 l2 2.5 l4.5-4.5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round"/>

      {/* Your stop marker */}
      <circle cx="195" cy="458" r="32" fill="url(#youGrad)"/>
      <circle cx="195" cy="458" r="14" fill="#1E3A8A" stroke="#fff" strokeWidth="3"/>
      <text x="195" y="462" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="700">YOU</text>

      {/* Upcoming stop */}
      <circle cx="195" cy="540" r="7" fill="#fff" stroke="#94A3B8" strokeWidth="2"/>

      {/* Bus marker */}
      <g transform={`translate(${busX},${busY})`} style={{ transition: 'transform 1.8s ease' }}>
        <circle r="22" fill="none" stroke="#3B82F6" strokeWidth="2.5" opacity="0.35"/>
        <ellipse cx="0" cy="20" rx="16" ry="5" fill="rgba(0,0,0,0.15)"/>
        <rect x="-15" y="-16" width="30" height="22" rx="6" fill="#1E3A8A"/>
        <rect x="-11" y="-12" width="9" height="7" rx="2" fill="#38BDF8" opacity="0.9"/>
        <rect x="2" y="-12" width="9" height="7" rx="2" fill="#38BDF8" opacity="0.9"/>
        <rect x="-8" y="4" width="16" height="2" rx="1" fill="#fff" opacity="0.3"/>
        <circle cx="-9" cy="9" r="4" fill="#0F172A" stroke="#fff" strokeWidth="1.5"/>
        <circle cx="9" cy="9" r="4" fill="#0F172A" stroke="#fff" strokeWidth="1.5"/>
        <rect x="-10" y="-22" width="20" height="12" rx="4" fill="#fff"/>
        <text textAnchor="middle" y="-13" fontSize="8" fill="#1E3A8A" fontWeight="800">#3</text>
      </g>
    </svg>
  )
}
