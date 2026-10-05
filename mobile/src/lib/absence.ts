export type AbsenceReason = 'sick' | 'appointment' | 'travel' | 'other'

/** A parent's report that a child won't ride on a day (table `absence_reports`). */
export type AbsenceReport = {
  id: string
  studentId: string
  date: string
  reason: AbsenceReason
  note: string | null
  createdAt: string
}

export type AbsenceReportRow = {
  id: string
  student_id: string
  date: string
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

export function toAbsenceReport(row: AbsenceReportRow): AbsenceReport {
  return { id: row.id, studentId: row.student_id, date: row.date, reason: row.reason, note: row.note, createdAt: row.created_at }
}
