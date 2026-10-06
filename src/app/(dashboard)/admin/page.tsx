import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/dashboard/StatsCard'

type SchoolRow = {
  id: string
  name: string
  address: string
  created_at: string
  bus_count: number
  student_count: number
  admin_name: string | null
  admin_email: string | null
}

type PlatformStats = {
  school_count: number
  bus_count: number
  student_count: number
  admin_count: number
}

export default async function AdminOverviewPage() {
  const supabase = createClient()

  const [statsResult, schoolsResult] = await Promise.all([
    supabase.rpc('get_platform_stats'),
    supabase.rpc('get_schools_with_admins'),
  ])

  const stats = statsResult.data as PlatformStats | null
  const schools = (schoolsResult.data ?? []) as SchoolRow[]

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] leading-tight">Platform Overview</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            RouteyAI · All schools ·{' '}
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link
          href="/admin/schools"
          className="flex items-center gap-2 bg-[#1E3A8A] text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[#1e40af]"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add School
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatsCard
          label="Total Schools"
          value={String(stats?.school_count ?? '—')}
          sub={`${schools.length} registered`}
        />
        <StatsCard
          label="Total Buses"
          value={String(stats?.bus_count ?? '—')}
          sub="Across all schools"
        />
        <StatsCard
          label="Total Students"
          value={String(stats?.student_count ?? '—')}
          sub="Across all schools"
        />
        <StatsCard
          label="School Admins"
          value={String(stats?.admin_count ?? '—')}
          sub="All verified"
        />
      </div>

      {/* Schools table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)]">
        <div className="flex justify-between items-center px-5 py-4 border-b border-[#F1F5F9]">
          <span className="text-sm font-bold text-[#0F172A]">Schools</span>
          <Link href="/admin/schools" className="text-xs text-[#64748B] hover:text-[#0F172A]">Manage all →</Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#F1F5F9]">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">School</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">Admin</th>
              <th className="text-center px-3 py-3 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">Buses</th>
              <th className="text-center px-3 py-3 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">Students</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">Joined</th>
            </tr>
          </thead>
          <tbody>
            {schools.slice(0, 5).map((s, i) => (
              <tr key={s.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}>
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-[#0F172A] text-[13px]">{s.name}</div>
                  <div className="text-[11px] text-[#94A3B8]">{s.address}</div>
                </td>
                <td className="px-5 py-3.5 text-[13px] text-[#64748B]">{s.admin_name ?? '—'}</td>
                <td className="px-3 py-3.5 text-center text-[13px] font-semibold text-[#0F172A]">{s.bus_count}</td>
                <td className="px-3 py-3.5 text-center text-[13px] font-semibold text-[#0F172A]">{s.student_count}</td>
                <td className="px-5 py-3.5 text-[12px] text-[#94A3B8]">
                  {new Date(s.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
            {schools.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-[#94A3B8]">
                  No schools yet.{' '}
                  <Link href="/admin/schools" className="text-[#3B82F6] hover:underline">Add the first one →</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
