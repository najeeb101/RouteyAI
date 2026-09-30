import type { ComponentProps } from 'react'
import type { Ionicons } from '@expo/vector-icons'

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

export const ABSENCE_REASONS: { value: AbsenceReason; label: string; icon: ComponentProps<typeof Ionicons>['name'] }[] = [
  { value: 'sick', label: 'Sick', icon: 'medkit-outline' },
  { value: 'appointment', label: 'Appointment', icon: 'calendar-outline' },
  { value: 'travel', label: 'Travelling', icon: 'airplane-outline' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
]

export function reasonLabel(reason: AbsenceReason): string {
  return ABSENCE_REASONS.find((r) => r.value === reason)?.label ?? 'Other'
}

export function toAbsenceReport(row: AbsenceReportRow): AbsenceReport {
  return { id: row.id, studentId: row.student_id, date: row.date, reason: row.reason, note: row.note, createdAt: row.created_at }
}
