import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Check } from 'lucide-react-native'
import { Banner } from '@/components/primitives/Banner'
import { Button } from '@/components/primitives/Button'
import { Chip } from '@/components/primitives/Chip'
import { Icon } from '@/components/primitives/Icon'
import { SegmentedControl } from '@/components/primitives/SegmentedControl'
import { SheetLabel, SheetModal } from '@/components/primitives/SheetModal'
import { TextField } from '@/components/primitives/TextField'
import { Txt } from '@/components/primitives/Txt'
import { ABSENCE_REASONS, type AbsenceReason, type AbsenceReport } from '@/lib/absence'
import { dayLabel, dayPhrase, upcomingSchoolDays } from '@/lib/dates'
import { radius, space, useTheme } from '@/lib/theme'
import type { ParentChildProfile, TodayAttendance } from '@/features/parent/screens/useParentData'

type ReportAbsenceSheetProps = {
  visible: boolean
  onClose: () => void
  items: ParentChildProfile[]
  initialChildId: string | null
  reports: AbsenceReport[]
  attendance: Record<string, TodayAttendance>
  today: string
  onSubmit: (input: { studentId: string; dates: string[]; reason: AbsenceReason; note: string }) => Promise<string | null>
}

/** Lets a parent tell the driver and school ahead of time that a child won't ride on one or more days. */
export function ReportAbsenceSheet({ visible, onClose, items, initialChildId, reports, attendance, today, onSubmit }: ReportAbsenceSheetProps) {
  const t = useTheme()
  const [childId, setChildId] = useState<string | null>(initialChildId)
  const [dates, setDates] = useState<string[]>([])
  const [reason, setReason] = useState<AbsenceReason>('sick')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState<string[] | null>(null)

  // Start fresh each time the sheet opens.
  useEffect(() => {
    if (!visible) return
    setChildId(initialChildId ?? items[0]?.id ?? null)
    setDates([])
    setReason('sick')
    setNote('')
    setError(null)
    setSent(null)
  }, [visible, initialChildId, items])

  const child = items.find((c) => c.id === childId) ?? null
  const days = upcomingSchoolDays(8, today)

  function dayState(date: string): { disabled: boolean; caption?: string } {
    if (!child) return { disabled: true }
    if (reports.some((r) => r.studentId === child.id && r.date === date)) return { disabled: true, caption: 'Reported' }
    if (date === today && attendance[child.id]) return { disabled: true, caption: attendance[child.id]?.status === 'boarded' ? 'On the bus' : 'Marked' }
    return { disabled: false }
  }

  function toggleDate(date: string) {
    setDates((prev) => (prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date].sort()))
  }

  async function submit() {
    if (!child || dates.length === 0) return
    setSaving(true)
    setError(null)
    const err = await onSubmit({ studentId: child.id, dates, reason, note })
    setSaving(false)
    if (err) setError(err)
    else setSent(dates)
  }

  if (sent && child) {
    return (
      <SheetModal visible={visible} title="Absence reported" onClose={onClose} footer={<Button label="Done" onPress={onClose} />}>
        <View style={{ alignItems: 'center', gap: space.md, paddingVertical: space.md }}>
          <View style={{ width: 56, height: 56, borderRadius: radius.full, backgroundColor: t.successTint, alignItems: 'center', justifyContent: 'center' }}>
            <Icon icon={Check} size={28} color={t.successText} strokeWidth={2.25} />
          </View>
          <Txt variant="headline" align="center">
            {child.firstName} is staying home {sent.length === 1 ? dayPhrase(sent[0] ?? '', today) : `on ${sent.length} days`}
          </Txt>
          <Txt variant="body" tone="inkSecondary" align="center">
            The driver sees this on the route and won&apos;t wait at your stop. You can cancel it from Home or History until the day starts.
          </Txt>
        </View>
      </SheetModal>
    )
  }

  return (
    <SheetModal
      visible={visible}
      title="Report an absence"
      subtitle="Let the driver know your child won't ride, so the bus doesn't wait at your stop."
      onClose={onClose}
      footer={
        <Button
          label={dates.length === 0 ? 'Pick a day' : `Report ${dates.length} day${dates.length === 1 ? '' : 's'}`}
          disabled={dates.length === 0 || saving}
          loading={saving}
          onPress={submit}
        />
      }
    >
      {items.length > 1 && (
        <View>
          <SheetLabel>Child</SheetLabel>
          <SegmentedControl
            segments={items.map((c) => ({ key: c.id, label: c.firstName }))}
            value={childId}
            onChange={(id) => {
              setChildId(id)
              setDates([])
            }}
            onSurface
          />
        </View>
      )}

      <View>
        <SheetLabel>Which days?</SheetLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {days.map((date) => {
            const state = dayState(date)
            return (
              <Chip
                key={date}
                label={dayLabel(date, today)}
                caption={state.caption}
                selected={dates.includes(date)}
                disabled={state.disabled}
                onPress={() => toggleDate(date)}
              />
            )
          })}
        </View>
      </View>

      <View>
        <SheetLabel>Reason</SheetLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {ABSENCE_REASONS.map((r) => (
            <Chip key={r.value} label={r.label} selected={reason === r.value} onPress={() => setReason(r.value)} />
          ))}
        </View>
      </View>

      <TextField label="Note for the school (optional)" value={note} onChangeText={setNote} placeholder="For example: back on Thursday" maxLength={200} multiline />

      {error && <Banner text={error} />}
    </SheetModal>
  )
}
