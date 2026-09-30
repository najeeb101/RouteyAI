import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { addDays, localDateKey } from '@/lib/dates'
import { toAbsenceReport, type AbsenceReport, type AbsenceReportRow } from '@/lib/absence'

/** How far back the History tab looks. */
export const HISTORY_DAYS = 30

export type HistoryDay = {
  date: string
  /** What the driver recorded at the stop, if anything. */
  attendance: { status: 'boarded' | 'absent'; at: string } | null
  /** The parent's report for that day, if any. */
  report: AbsenceReport | null
}

type AttendanceRow = { date: string; status: 'boarded' | 'absent' | null; created_at: string }

/** One child's past rides and absences, newest first. Reports for today and later come from the parent context. */
export function useChildHistory(childId: string | null) {
  const [days, setDays] = useState<HistoryDay[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!childId) return setDays([])
    setLoading(true)
    setError(null)
    const today = localDateKey()
    const from = addDays(today, -HISTORY_DAYS)
    const [attendanceRes, reportsRes] = await Promise.all([
      supabase.from('attendance').select('date, status, created_at').eq('student_id', childId).gte('date', from).lte('date', today),
      supabase
        .from('absence_reports')
        .select('id, student_id, date, reason, note, created_at')
        .eq('student_id', childId)
        .gte('date', from)
        .lte('date', today),
    ])
    setLoading(false)
    if (attendanceRes.error || reportsRes.error) {
      setError('Could not load the history. Pull down to try again.')
      return
    }

    const byDate = new Map<string, HistoryDay>()
    const dayFor = (date: string) => {
      let day = byDate.get(date)
      if (!day) byDate.set(date, (day = { date, attendance: null, report: null }))
      return day
    }
    for (const row of (attendanceRes.data ?? []) as AttendanceRow[]) {
      if (row.status) dayFor(row.date).attendance = { status: row.status, at: row.created_at }
    }
    for (const row of (reportsRes.data ?? []) as AbsenceReportRow[]) dayFor(row.date).report = toAbsenceReport(row)
    setDays([...byDate.values()].sort((a, b) => b.date.localeCompare(a.date)))
  }, [childId])

  useEffect(() => {
    load()
  }, [load])

  return { days, loading, error, reload: load }
}
