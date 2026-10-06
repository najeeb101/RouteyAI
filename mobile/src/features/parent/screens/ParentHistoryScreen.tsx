import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CalendarClock, Check, CircleHelp, House, Plus, X, type LucideIcon } from 'lucide-react-native'
import { Banner } from '@/components/primitives/Banner'
import { Card } from '@/components/primitives/Card'
import { Icon } from '@/components/primitives/Icon'
import { ListRow, ListSection } from '@/components/primitives/List'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { Stat } from '@/components/primitives/Stat'
import { Txt } from '@/components/primitives/Txt'
import { ChildSwitcher } from '@/features/parent/components/ChildSwitcher'
import { ReportAbsenceSheet } from '@/features/parent/components/ReportAbsenceSheet'
import { useParentContext } from '@/features/parent/context/ParentDataContext'
import { HISTORY_DAYS, useChildHistory, type HistoryDay } from '@/features/parent/screens/useChildHistory'
import { reasonLabel } from '@/lib/absence'
import { dayLabel, timeLabel } from '@/lib/dates'
import { historyLine, RIDES_LABEL, type Run } from '@/lib/runs'
import { gutter, space, useTheme, type Palette } from '@/lib/theme'

/** Past rides and absences for the selected child, plus absences already reported for the coming days. */
export function ParentHistoryScreen() {
  const t = useTheme()
  const { children, child, selectChild, statusFor, reports, attendance, today, reportAbsence, cancelAbsence } = useParentContext()
  const { days, loading, error, reload } = useChildHistory(child?.id ?? null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // A report sent from Home or this tab shows up here without a manual refresh.
  const reportKey = reports.map((r) => r.id).join(',')
  useEffect(() => {
    reload()
  }, [reportKey, reload])

  const first = child?.firstName ?? 'your child'
  const upcoming = reports.filter((r) => r.studentId === child?.id && r.date > today)
  const runs: Run[] = ['morning', 'afternoon']
  const rides = days.reduce((n, d) => n + runs.filter((r) => d.marks[r]?.status === 'boarded' || d.marks[r]?.status === 'dropped_off').length, 0)
  const absences = days.reduce((n, d) => n + runs.filter((r) => d.marks[r]?.status === 'absent').length, 0)
  const reported = days.filter((d) => d.report).length

  function confirmCancel(reportId: string, date: string) {
    Alert.alert('Cancel this report?', `The driver will expect ${first} at the stop on ${dayLabel(date, today)}.`, [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Cancel report',
        style: 'destructive',
        onPress: async () => {
          const err = await cancelAbsence(reportId)
          if (err) Alert.alert('Something went wrong', err)
        },
      },
    ])
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas }} edges={['top']}>
      <ScreenHeader title="History" subtitle={`${child?.firstName ?? 'Your child'} · last ${HISTORY_DAYS} days`} />
      {children.length > 1 && (
        <View style={{ paddingHorizontal: gutter, paddingBottom: space.md }}>
          <ChildSwitcher items={children} selectedId={child?.id ?? null} statusFor={statusFor} onSelect={selectChild} />
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: gutter, paddingTop: space.xs, paddingBottom: space.xxxl, gap: space.xxl }}
        refreshControl={<RefreshControl refreshing={loading && days.length > 0} onRefresh={reload} tintColor={t.brand} />}
        showsVerticalScrollIndicator={false}
      >
        {error && <Banner text={error} />}

        <Card style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <Stat size="md" value={String(rides)} label="Rides" />
          </View>
          <View style={{ flex: 1 }}>
            <Stat size="md" value={String(absences)} label="Absent" />
          </View>
          <View style={{ flex: 1 }}>
            <Stat size="md" value={String(reported)} label="Reported by you" />
          </View>
        </Card>

        <ListSection title="Coming up" footer={upcoming.length === 0 ? `If ${first} won't ride on a coming day, let the driver know here.` : undefined}>
          {upcoming.map((r) => (
            <ListRow
              key={r.id}
              title={dayLabel(r.date, today)}
              subtitle={`Staying home · ${RIDES_LABEL[r.runs]} · ${reasonLabel(r.reason)}${r.note ? ` · ${r.note}` : ''}`}
              accessory={
                <Pressable onPress={() => confirmCancel(r.id, r.date)} hitSlop={10} accessibilityRole="button">
                  <Txt variant="subhead" tone="brand">
                    Cancel
                  </Txt>
                </Pressable>
              }
            />
          ))}
          <ListRow icon={Plus} title="Report an absence" accent onPress={() => setSheetOpen(true)} />
        </ListSection>

        {loading && days.length === 0 ? (
          <Card style={{ alignItems: 'center', paddingVertical: space.xxl }}>
            <ActivityIndicator color={t.brand} />
          </Card>
        ) : days.length === 0 ? (
          <Card style={{ alignItems: 'center', gap: space.sm, paddingVertical: space.xxl }}>
            <Icon icon={CalendarClock} size={28} color={t.inkTertiary} />
            <Txt variant="headline">Nothing yet</Txt>
            <Txt variant="body" tone="inkSecondary" align="center">
              Each ride shows up here once the driver checks {first} in.
            </Txt>
          </Card>
        ) : (
          <ListSection title="Past days">
            {days.map((day) => (
              <HistoryRow key={day.date} day={day} today={today} />
            ))}
          </ListSection>
        )}
      </ScrollView>

      <ReportAbsenceSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        items={children}
        initialChildId={child?.id ?? null}
        reports={reports}
        attendance={attendance}
        today={today}
        onSubmit={reportAbsence}
      />
    </SafeAreaView>
  )
}

function HistoryRow({ day, today }: { day: HistoryDay; today: string }) {
  const t = useTheme()
  const line = historyLine(day.marks, day.report?.runs ?? null, timeLabel)
  const look: Record<typeof line.tone, { icon: LucideIcon; color: keyof Palette }> = {
    success: { icon: Check, color: 'successText' },
    warning: { icon: House, color: 'warningText' },
    danger: { icon: X, color: 'dangerText' },
    neutral: { icon: CircleHelp, color: 'inkTertiary' },
    none: { icon: CircleHelp, color: 'inkTertiary' },
  }
  const { icon, color } = look[line.tone]
  const detail = day.report && line.tone === 'warning' ? `${line.detail} · ${reasonLabel(day.report.reason)}` : line.detail
  return <ListRow leading={<Icon icon={icon} size={21} color={t[color]} strokeWidth={2} />} title={line.title} subtitle={detail || undefined} value={dayLabel(day.date, today)} />
}
