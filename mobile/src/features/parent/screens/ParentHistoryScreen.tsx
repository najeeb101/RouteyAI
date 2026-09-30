import { useEffect, useState, type ComponentProps } from 'react'
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Banner } from '@/components/primitives/Banner'
import { Card } from '@/components/primitives/Card'
import { PrimaryButton } from '@/components/primitives/PrimaryButton'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { ChildSwitcher } from '@/features/parent/components/ChildSwitcher'
import { ReportAbsenceSheet } from '@/features/parent/components/ReportAbsenceSheet'
import { useParentContext } from '@/features/parent/context/ParentDataContext'
import { HISTORY_DAYS, useChildHistory, type HistoryDay } from '@/features/parent/screens/useChildHistory'
import { reasonLabel } from '@/lib/absence'
import { colors } from '@/lib/colors'
import { dayLabel, timeLabel } from '@/lib/dates'

type IconName = ComponentProps<typeof Ionicons>['name']

/** Past rides and absences for the selected child, plus absences already reported for the coming days. */
export function ParentHistoryScreen() {
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
  const rides = days.filter((d) => d.attendance?.status === 'boarded').length
  const absences = days.filter((d) => d.attendance?.status === 'absent' || (d.report && !d.attendance)).length
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScreenHeader title="History" subtitle={`${first}'s rides over the last ${HISTORY_DAYS} days`} />
      {children.length > 1 && (
        <View style={{ backgroundColor: colors.dark, paddingHorizontal: 16, paddingBottom: 16 }}>
          <ChildSwitcher items={children} selectedId={child?.id ?? null} statusFor={statusFor} onSelect={selectChild} />
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 28 }}
        refreshControl={<RefreshControl refreshing={loading && days.length > 0} onRefresh={reload} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {error && <Banner text={error} />}

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Stat value={rides} label="Rides" color={colors.successMid} />
          <Stat value={absences} label="Absent" color={colors.danger} />
          <Stat value={reported} label="Reported by you" color="#B45309" />
        </View>

        <Card style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="calendar-outline" size={16} color={colors.primaryLight} />
            <Text style={cardTitle}>Coming up</Text>
          </View>
          {upcoming.length === 0 ? (
            <Text style={{ fontSize: 13, color: colors.muted, fontFamily: 'Inter_400Regular', lineHeight: 19 }}>
              No absences reported. If {first} won&apos;t ride on a coming day, let the driver know here.
            </Text>
          ) : (
            upcoming.map((r) => (
              <View key={r.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13.5, color: colors.dark }}>{dayLabel(r.date, today)}</Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.muted }} numberOfLines={1}>
                    Staying home · {reasonLabel(r.reason)}
                    {r.note ? ` · ${r.note}` : ''}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => confirmCancel(r.id, r.date)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: colors.muted }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
          <PrimaryButton label="Report an absence" icon="add" onPress={() => setSheetOpen(true)} />
        </Card>

        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: colors.subtle, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 6, marginLeft: 4 }}>
          Past days
        </Text>
        {loading && days.length === 0 ? (
          <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
            <ActivityIndicator color={colors.primary} />
          </Card>
        ) : days.length === 0 ? (
          <Card style={{ alignItems: 'center', gap: 8, paddingVertical: 26 }}>
            <Ionicons name="time-outline" size={28} color={colors.subtle} />
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: colors.dark }}>Nothing yet</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.muted, textAlign: 'center' }}>
              Each ride shows up here once the driver checks {first} in.
            </Text>
          </Card>
        ) : (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {days.map((day, i) => (
              <HistoryRow key={day.date} day={day} today={today} first={first} last={i === days.length - 1} />
            ))}
          </Card>
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

function HistoryRow({ day, today, first, last }: { day: HistoryDay; today: string; first: string; last: boolean }) {
  let icon: IconName = 'help-circle'
  let color: string = colors.muted
  let bg: string = colors.borderLight
  let title = 'No record'
  let detail = ''
  if (day.attendance?.status === 'boarded') {
    icon = 'checkmark'
    color = colors.successMid
    bg = colors.successBg
    title = 'Rode the bus'
    detail = `Boarded at ${timeLabel(day.attendance.at)}`
  } else if (day.report) {
    icon = 'home'
    color = '#B45309'
    bg = colors.warningBg
    title = 'Stayed home'
    detail = `You reported it · ${reasonLabel(day.report.reason)}`
  } else if (day.attendance?.status === 'absent') {
    icon = 'close'
    color = colors.danger
    bg = colors.dangerBg
    title = 'Absent'
    detail = `${first} wasn't at the stop · marked ${timeLabel(day.attendance.at)}`
  }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.borderLight }}>
      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={17} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13.5, color: colors.dark }}>{title}</Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.muted, marginTop: 1 }} numberOfLines={1}>
          {detail}
        </Text>
      </View>
      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.subtle }}>{dayLabel(day.date, today)}</Text>
    </View>
  )
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, paddingVertical: 12, paddingHorizontal: 10, alignItems: 'center' }}>
      <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 22, color, letterSpacing: -0.5 }}>{value}</Text>
      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10.5, color: colors.subtle, textAlign: 'center', marginTop: 2 }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  )
}

const cardTitle = { fontFamily: 'Inter_700Bold' as const, fontSize: 14.5, color: colors.dark }
