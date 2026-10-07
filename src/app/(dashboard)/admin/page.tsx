import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, School } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ActionButton } from '@/components/dashboard/ActionButton'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Panel } from '@/components/dashboard/Panel'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { StatusText } from '@/components/dashboard/StatusText'

export const metadata: Metadata = {
  title: 'Platform overview',
}

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

const joined = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })

export default async function AdminOverviewPage() {
  const supabase = createClient()

  const [statsResult, schoolsResult] = await Promise.all([
    supabase.rpc('get_platform_stats'),
    supabase.rpc('get_schools_with_admins'),
  ])
  for (const { error } of [statsResult, schoolsResult]) {
    if (error) console.error('Platform overview:', error.message)
  }

  const stats = statsResult.data as PlatformStats | null
  const schools = (schoolsResult.data ?? []) as SchoolRow[]
  const waiting = schools.filter((s) => !s.admin_name).length

  return (
    <>
      <PageHeader
        title="Platform overview"
        subtitle="Every school on RouteyAI"
        actions={
          <Link href="/admin/schools">
            <ActionButton><Plus />Add school</ActionButton>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard step={1} label="Schools" value={stats?.school_count ?? 0} sub={waiting > 0 ? `${waiting} waiting for an admin` : 'Each has an admin'} subTone={waiting > 0 ? 'warning' : 'neutral'} />
        <StatsCard step={2} label="Buses" value={stats?.bus_count ?? 0} sub="Across all schools" />
        <StatsCard step={3} label="Students" value={stats?.student_count ?? 0} sub="Across all schools" />
        <StatsCard step={4} label="School admins" value={stats?.admin_count ?? 0} sub="With an account" />
      </div>

      <Panel
        step={5}
        className="mt-4"
        title="Schools"
        subtitle={schools.length > 5 ? `The 5 newest of ${schools.length}` : undefined}
        action={<Link href="/admin/schools"><ActionButton variant="plain" size="sm">Manage all</ActionButton></Link>}
        bodyClassName="p-0 pt-2"
      >
        {schools.length === 0 ? (
          <EmptyState icon={School} title="No schools yet" className="py-10" action={<Link href="/admin/schools"><ActionButton><Plus />Add the first school</ActionButton></Link>}>
            Add a school, then send its admin an invite link.
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="text-left text-[13px] text-ink-2">
                  <th className="px-5 py-3 font-medium">School</th>
                  <th className="px-3 py-3 font-medium">Admin</th>
                  <th className="px-3 py-3 text-right font-medium">Buses</th>
                  <th className="px-3 py-3 text-right font-medium">Students</th>
                  <th className="px-5 py-3 text-right font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {schools.slice(0, 5).map((s) => (
                  <tr key={s.id} className="border-t border-line">
                    <td className="px-5 py-3">
                      <p className="text-sm font-semibold text-ink">{s.name}</p>
                      <p className="text-[13px] text-ink-2">{s.address}</p>
                    </td>
                    <td className="px-3 py-3 text-[13px]">
                      {s.admin_name ? <span className="text-ink">{s.admin_name}</span> : <StatusText tone="warning">Waiting for an admin</StatusText>}
                    </td>
                    <td className="px-3 py-3 text-right text-[13px] tabular-nums text-ink">{s.bus_count}</td>
                    <td className="px-3 py-3 text-right text-[13px] tabular-nums text-ink">{s.student_count}</td>
                    <td className="px-5 py-3 text-right text-[13px] text-ink-2">{joined(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  )
}
