const ROUTES = [
  { id:1, name:'Route A', color:'#3B82F6', pct:58 },
  { id:2, name:'Route B', color:'#10B981', pct:75 },
  { id:3, name:'Route C', color:'#F59E0B', pct:45 },
  { id:4, name:'Route D', color:'#8B5CF6', pct:88 },
]

const DAYS = ['Mon','Tue','Wed','Thu','Sun']
const ATTENDANCE = [94, 97, 91, 98, 95]
const MAX_A = Math.max(...ATTENDANCE)

export default function AnalyticsPage() {
  return (
    <div className="p-7 max-w-[1280px]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] leading-tight">Analytics</h1>
          <p className="text-sm text-[#64748B] mt-0.5">This week · April 20–26</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        {[
          ['Avg Attendance', '95.0%', '#10B981'],
          ['On-Time Rate',   '91.2%', '#1E3A8A'],
          ['Avg Ride Time',  '24 min', '#3B82F6'],
        ].map(([l, v, c]) => (
          <div key={l} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-5">
            <div className="text-xs font-medium text-[#64748B] mb-1.5">{l}</div>
            <div className="text-3xl font-bold" style={{ color: c }}>{v}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Attendance bar chart */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-5">
          <div className="text-sm font-bold text-[#0F172A] mb-4">Weekly Attendance</div>
          <div className="flex items-end gap-3 h-40 pb-1">
            {ATTENDANCE.map((value, i) => (
              <div key={DAYS[i] ?? i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[11px] text-[#64748B] font-semibold">{value}%</span>
                <div className="w-full bg-[#EFF6FF] rounded-md overflow-hidden flex-1 flex items-end">
                  <div
                    className="w-full rounded-md min-h-[8px] transition-all duration-300"
                    style={{ height: `${(value / MAX_A) * 100}%`, background: '#1E3A8A' }}
                  />
                </div>
                <span className="text-[11px] text-[#94A3B8]">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Capacity utilization */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-5">
          <div className="text-sm font-bold text-[#0F172A] mb-4">Route Capacity</div>
          <div className="flex flex-col gap-4">
            {ROUTES.map(r => (
              <div key={r.id}>
                <div className="flex justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                    <span className="text-[13px] font-medium text-[#0F172A]">{r.name}</span>
                  </div>
                  <span className="text-[13px] font-semibold text-[#64748B]">{r.pct}%</span>
                </div>
                <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
