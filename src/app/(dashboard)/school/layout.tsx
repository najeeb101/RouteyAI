import type { Metadata } from 'next'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'School Dashboard',
}

export default async function SchoolLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: school, error } = await supabase.rpc('get_school_info')
  if (error) console.error('School layout:', error.message)
  const info = school as { name?: string } | null

  return (
    <DashboardShell
      section="school"
      place={info?.name ?? 'Your school'}
      userName={(user?.user_metadata?.full_name as string | undefined)?.trim() || 'School admin'}
      userEmail={user?.email ?? ''}
    >
      {children}
    </DashboardShell>
  )
}
