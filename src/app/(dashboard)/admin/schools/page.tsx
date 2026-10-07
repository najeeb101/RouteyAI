import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import SchoolsTable from './SchoolsTable'

export const metadata: Metadata = {
  title: 'Schools',
}

export type SchoolRow = {
  id: string
  name: string
  address: string
  created_at: string
  bus_count: number
  student_count: number
  admin_name: string | null
  admin_email: string | null
}

export default async function AdminSchoolsPage() {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_schools_with_admins')
  if (error) console.error('Schools:', error.message)
  return <SchoolsTable initialSchools={(data ?? []) as SchoolRow[]} />
}
