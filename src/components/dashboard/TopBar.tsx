'use client'

import { usePathname } from 'next/navigation'

const LABELS: Record<string, string> = {
  '/school': 'Overview',
  '/school/routes': 'Routes',
  '/school/students': 'Students',
  '/school/buses': 'Fleet',
  '/school/analytics': 'Analytics',
}

export function TopBar() {
  const pathname = usePathname()
  const label = LABELS[pathname] ?? 'Dashboard'

  return (
    <header className="h-14 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 shrink-0">
      <span className="text-[15px] font-semibold text-[#0F172A]">{label}</span>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative w-8 h-8 flex items-center justify-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
        </button>

        {/* User badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
          <div className="w-7 h-7 rounded-full bg-[#1E3A8A] flex items-center justify-center text-xs font-bold text-white">
            SA
          </div>
          <div>
            <div className="text-xs font-semibold text-[#0F172A] leading-none">School Admin</div>
            <div className="text-[10px] text-[#94A3B8] leading-none mt-0.5">admin@alnour.edu.qa</div>
          </div>
        </div>
      </div>
    </header>
  )
}
