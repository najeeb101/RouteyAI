import type { Metadata } from 'next'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Platform Admin',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <DashboardShell
      section="admin"
      place="Platform admin"
      userName={(user?.user_metadata?.full_name as string | undefined)?.trim() || 'Platform admin'}
      userEmail={user?.email ?? ''}
    >
      {children}
    </DashboardShell>
  )
}
