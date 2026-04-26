import { cn } from '@/lib/utils'

interface StatsCardProps {
  label: string
  value: string
  sub?: string
  color?: string
  icon: React.ReactNode
}

export function StatsCard({ label, value, sub, color = '#1E3A8A', icon }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-5">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs font-medium text-[#64748B] mb-1">{label}</div>
          <div className="text-3xl font-bold leading-none mb-1.5" style={{ color }}>{value}</div>
          {sub && <div className="text-[11px] text-[#94A3B8]">{sub}</div>}
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: color + '15' }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}
