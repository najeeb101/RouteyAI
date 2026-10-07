import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DriverClient from './DriverClient'

export type DriverBusData = { id: string; name: string; color: string; school_id: string }
export type DriverStudentData = { id: string; name: string; home_address: string; stop_order: number | null }
export type DriverAnnouncementData = { id: string; message: string; created_at: string }

export default async function DriverPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // A driver drives one bus; like start_run, the first one assigned.
  const { data: bus, error: busErr } = await supabase
    .from('buses')
    .select('id, name, color, school_id')
    .eq('driver_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (busErr) console.error('Driver page:', busErr.message)

  if (!bus) {
    return <DriverClient bus={null} students={[]} announcements={[]} schoolName={null} />
  }

  const [studentsRes, annRes, schoolRes] = await Promise.all([
    supabase.from('students').select('id, name, home_address, stop_order').eq('bus_id', bus.id),
    supabase
      .from('announcements')
      .select('id, message, created_at')
      .eq('school_id', bus.school_id)
      .or(`bus_id.eq.${bus.id},bus_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('schools').select('name').eq('id', bus.school_id).maybeSingle(),
  ])
  for (const { error } of [studentsRes, annRes, schoolRes]) {
    if (error) console.error('Driver page:', error.message)
  }

  return (
    <DriverClient
      bus={bus}
      students={(studentsRes.data ?? []) as DriverStudentData[]}
      announcements={(annRes.data ?? []) as DriverAnnouncementData[]}
      schoolName={schoolRes.data?.name ?? null}
    />
  )
}
