'use client'

import { StatsCard } from '@/components/dashboard/StatsCard'

const SCHOOL_STATS = [
  { name: 'Doha International Academy',   buses: 3, students: 40,  capacity: 120, utilization: 33, color: '#3B82F6' },
  { name: 'Al Nour International School', buses: 4, students: 62,  capacity: 160, utilization: 39, color: '#10B981' },
  { name: 'Lusail STEM Academy',          buses: 2, students: 28,  capacity: 80,  utilization: 35, color: '#F59E0B' },
  { name: 'Education City Primary',       buses: 5, students: 87,  capacity: 200, utilization: 44, color: '#8B5CF6' },
]

const MONTHLY_GROWTH = [
  { month: 'Jan', schools: 1, students: 40  },
  { month: 'Feb', schools: 1, students: 40  },
  { month: 'Mar', schools: 2, students: 102 },
  { month: 'Apr', schools: 4, students: 217 },
]

const MAX_STUDENTS = Math.max(...MONTHLY_GROWTH.map(m => m.students))

export default function AdminAnalyticsPage() {
  const totalStudents = SCHOOL_STATS.reduce((s, x) => s + x.students, 0)
  const totalCapacity = SCHOOL_STATS.reduce((s, x) => s + x.capacity, 0)
  const avgUtilization = Math.round(SCHOOL_STATS.reduce((s, x) => s + x.utilization, 0) / SCHOOL_STATS.length)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">Analytics</h1>
        <p className="text-sm text-[#64748B] mt-0.5">Platform-wide metrics across all schools</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatsCard
          label="Total Schools"
          value="4"
          sub="Active on platform"
        />
        <StatsCard
          label="Total Students"
          value={String(totalStudents)}
          sub={`${totalCapacity} total capacity`}
        />
        <StatsCard
          label="Fleet Utilization"
          value={`${avgUtilization}%`}
          sub="Avg across all schools"
        />
        <StatsCard
          label="Total Buses"
          value="14"
          sub="Across all schools"
        />
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-5 mb-5">
        {/* Student growth chart */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-5">
          <div className="text-sm font-bold text-[#0F172A] mb-1">Student Growth</div>
          <div className="text-[11px] text-[#94A3B8] mb-5">Cumulative students by month</div>
          <div className="flex items-end gap-6 h-40">
            {MONTHLY_GROWTH.map(m => {
              const pct = (m.students / MAX_STUDENTS) * 100
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-[11px] font-semibold text-[#0F172A]">{m.students}</div>
                  <div className="w-full flex items-end" style={{ height: '120px' }}>
                    <div
                      className="w-full rounded-t-lg bg-[#1E3A8A] transition-all duration-500"
                      style={{ height: `${pct}%`, minHeight: '6px' }}
                    />
                  </div>
                  <div className="text-[11px] text-[#94A3B8]">{m.month}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Schools breakdown */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-5">
          <div className="text-sm font-bold text-[#0F172A] mb-1">Per-School Breakdown</div>
          <div className="text-[11px] text-[#94A3B8] mb-5">Students vs. capacity</div>
          <div className="flex flex-col gap-4">
            {SCHOOL_STATS.map(s => (
              <div key={s.name}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-[12px] font-medium text-[#0F172A] truncate max-w-[200px]">{s.name}</span>
                  <span className="text-[11px] text-[#94A3B8] shrink-0 ml-2">{s.students}/{s.capacity}</span>
                </div>
                <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${s.utilization}%`, background: s.color }}
                  />
                </div>
                <div className="text-[10px] text-[#94A3B8] mt-1">{s.utilization}% utilization · {s.buses} bus{s.buses !== 1 ? 'es' : ''}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fleet capacity table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F1F5F9]">
          <span className="text-sm font-bold text-[#0F172A]">Fleet Capacity Overview</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">School</th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">Buses</th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">Students</th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">Capacity</th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">Available</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">Utilization</th>
            </tr>
          </thead>
          <tbody>
            {SCHOOL_STATS.map((s, i) => {
              const available = s.capacity - s.students
              const utilizationColor = s.utilization >= 80 ? '#EF4444' : s.utilization >= 60 ? '#F59E0B' : '#10B981'
              return (
                <tr key={s.name} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="text-[13px] font-medium text-[#0F172A]">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center text-[13px] text-[#0F172A]">{s.buses}</td>
                  <td className="px-4 py-3.5 text-center text-[13px] font-semibold text-[#0F172A]">{s.students}</td>
                  <td className="px-4 py-3.5 text-center text-[13px] text-[#64748B]">{s.capacity}</td>
                  <td className="px-4 py-3.5 text-center text-[13px] font-semibold" style={{ color: available < 20 ? '#F59E0B' : '#10B981' }}>{available}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${s.utilization}%`, background: utilizationColor }} />
                      </div>
                      <span className="text-[12px] font-semibold w-8 text-right" style={{ color: utilizationColor }}>{s.utilization}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
