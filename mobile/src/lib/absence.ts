import type { ReportRuns } from '@/lib/runs'

export type AbsenceReason = 'sick' | 'appointment' | 'travel' | 'other'

/** A parent's report that a child won't ride on a day (table `absence_reports`): both rides, or one of them. */
export type AbsenceReport = {
  id: string
  studentId: string
  date: string
  runs: ReportRuns
  reason: AbsenceReason
  note: string | null
  createdAt: string
}

export type AbsenceReportRow = {
  id: string
  student_id: string
  date: string
  runs?: ReportRuns | null
  reason: AbsenceReason
  note: string | null
  created_at: string
}

export const ABSENCE_REASONS: { value: AbsenceReason; label: string }[] = [
  { value: 'sick', label: 'Sick' },
  { value: 'appointment', label: 'Appointment' },
  { value: 'travel', label: 'Travelling' },
  { value: 'other', label: 'Other' },
]

export function reasonLabel(reason: AbsenceReason): string {
  return ABSENCE_REASONS.find((r) => r.value === reason)?.label ?? 'Other'
}

/** The columns every absence report query selects. */
export const ABSENCE_REPORT_COLUMNS = 'id, student_id, date, runs, reason, note, created_at'

export function toAbsenceReport(row: AbsenceReportRow): AbsenceReport {
  return { id: row.id, studentId: row.student_id, date: row.date, runs: row.runs ?? 'both', reason: row.reason, note: row.note, createdAt: row.created_at }
}
