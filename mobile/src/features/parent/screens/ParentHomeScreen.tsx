import { useState } from 'react'
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Bell, Bus, CalendarClock, CalendarX, MapPin, Megaphone, Navigation, School, TriangleAlert } from 'lucide-react-native'
import { LivePill } from '@/components/brand/LivePill'
import { RouteLine } from '@/components/brand/RouteLine'
import { SignatureCard } from '@/components/brand/SignatureCard'
import { Banner } from '@/components/primitives/Banner'
import { Button } from '@/components/primitives/Button'
import { Card } from '@/components/primitives/Card'
import { Icon } from '@/components/primitives/Icon'
import { IconButton } from '@/components/primitives/IconButton'
import { ListRow, ListSection } from '@/components/primitives/List'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { StatusText } from '@/components/primitives/StatusText'
import { Txt } from '@/components/primitives/Txt'
import { ChildSwitcher } from '@/features/parent/components/ChildSwitcher'
import { CHILD_STATUS } from '@/features/parent/components/childStatus'
import { ReportAbsenceSheet } from '@/features/parent/components/ReportAbsenceSheet'
import { useParentContext } from '@/features/parent/context/ParentDataContext'
import { reasonLabel } from '@/lib/absence'
import { dayLabel, dayPhrase, longDate, timeLabel, whenLabel } from '@/lib/dates'
import { cardText, RIDES_LABEL } from '@/lib/runs'
import { routes } from '@/lib/navigation/routes'
import { gutter, space, useTheme } from '@/lib/theme'

export function ParentHomeScreen() {
  const router = useRouter()
  const t = useTheme()
  const {
    loading,
    error,
    children,
    child,
    selectChild,
    statusFor,
    status,
    card,
    attendance,
    today,
    reports,
    announcements,
    busLocation,
    eta,
    reportAbsence,
    cancelAbsence,
    refresh,
  } = useParentContext()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [cancelling, setCancelling] = useState<string | null>(null)

  const first = child?.firstName ?? 'your child'
  const childReports = reports.filter((r) => r.studentId === child?.id)
  const todayReport = childReports.find((r) => r.date === today)
  const record = child && card ? attendance[child.id]?.[card.run] : undefined
  const updates = announcements.filter((a) => !a.busId || a.busId === child?.busId).slice(0, 3)
  const meta = CHILD_STATUS[status]
  const text = card
    ? cardText(card, {
      first,
      busName: child?.busName ?? null,
      eta,
      live: Boolean(busLocation),
      boardedAt: record ? timeLabel(record.at) : undefined,
      droppedAt: record?.droppedAt ? timeLabel(record.droppedAt) : undefined,
      markedAt: record ? timeLabel(record.at) : undefined,
      reportReason: todayReport ? reasonLabel(todayReport.reason) : undefined,
    })
    : null
  // The live pill while the bus is coming or the child is on it.
  const live = Boolean(busLocation) && (card?.kind === 'waiting' || card?.kind === 'on-bus' || card?.kind === 'on-way-home')
  const stopsBefore = card?.target === 'stop' ? (eta?.stopsBefore ?? null) : null

  function confirmCancel(reportId: string, date: string) {
    Alert.alert('Cancel this report?', `The driver will expect ${first} at the stop ${dayPhrase(date, today)}.`, [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Cancel report',
        style: 'destructive',
        onPress: async () => {
          setCancelling(reportId)
          const err = await cancelAbsence(reportId)
          setCancelling(null)
          if (err) Alert.alert('Something went wrong', err)
        },
      },
    ])
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas }} edges={['top']}>
      <ScreenHeader
        brand
        title={children.length > 1 ? 'Today' : (child?.firstName ?? 'Today')}
        subtitle={longDate(today)}
        action={<IconButton icon={Bell} label="Open alerts" onPress={() => router.push(routes.parentNotifications)} />}
      />

      {children.length > 1 && (
        <View style={{ paddingHorizontal: gutter, paddingBottom: space.md }}>
          <ChildSwitcher items={children} selectedId={child?.id ?? null} statusFor={statusFor} onSelect={selectChild} />
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: gutter, paddingTop: space.xs, paddingBottom: space.xxxl, gap: space.xxl }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading && children.length > 0} onRefresh={refresh} tintColor={t.brand} />}
      >
        {error && <Banner text={error} action={<RetryLink onPress={refresh} />} />}

        {loading && children.length === 0 && (
          <Card style={{ alignItems: 'center', paddingVertical: space.xxxl, gap: space.md }}>
            <ActivityIndicator color={t.brand} />
            <Txt variant="subhead" tone="inkSecondary">
              Loading your children…
            </Txt>
          </Card>
        )}

        {child && (
          <>
            {/* Status and arrival time: the navy signature card */}
            <SignatureCard style={{ gap: space.lg }}>
              <View style={{ gap: space.xs }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md }}>
                  <Txt variant="subhead" tone="onNightSecondary" numberOfLines={1} style={{ flex: 1 }}>
                    {child.busName ?? 'No bus'} · {text?.context}
                  </Txt>
                  {live ? <LivePill onNight /> : <StatusText label={meta.label} tone={meta.tone} onNight />}
                </View>
                <Txt variant="display" tone="onNight" numberOfLines={1} adjustsFontSizeToFit>
                  {text?.big}
                </Txt>
                <Txt variant="body" tone="onNightSecondary">
                  {text?.sub}
                </Txt>
              </View>
              {live && stopsBefore !== null && (
                <RouteLine
                  stops={Math.min(stopsBefore, 5) + 2}
                  reached={1}
                  destination
                  onNight
                  startLabel={child.busName ?? 'Bus'}
                  endLabel="Your stop"
                  accessibilityLabel={stopsBefore === 0 ? 'Your stop is next' : `${stopsBefore} stops before yours`}
                />
              )}
              <Button label="Track the bus" icon={Navigation} variant="onNight" onPress={() => router.push(routes.parentMap)} />
            </SignatureCard>

            <ListSection>
              <ListRow icon={CalendarX} title="Report an absence" accessory="chevron" onPress={() => setSheetOpen(true)} />
              <ListRow icon={CalendarClock} title="Past rides" value={first} accessory="chevron" onPress={() => router.push(routes.parentHistory)} />
            </ListSection>

            {childReports.length > 0 && (
              <ListSection title="Staying home">
                {childReports.map((r) => (
                  <ListRow
                    key={r.id}
                    title={dayLabel(r.date, today)}
                    subtitle={`${RIDES_LABEL[r.runs]} · ${reasonLabel(r.reason)}${r.note ? ` · ${r.note}` : ''}`}
                    accessory={
                      <Pressable onPress={() => confirmCancel(r.id, r.date)} disabled={cancelling === r.id} hitSlop={10} accessibilityRole="button">
                        <Txt variant="subhead" tone={cancelling === r.id ? 'inkTertiary' : 'brand'}>
                          {cancelling === r.id ? 'Cancelling…' : 'Cancel'}
                        </Txt>
                      </Pressable>
                    }
                  />
                ))}
              </ListSection>
            )}

            <ListSection title={`${first}'s bus`}>
              <ListRow icon={Bus} title="Bus" value={child.busName ?? 'Not assigned'} />
              <ListRow icon={MapPin} title="Stop" value={child.homeAddress} />
              <ListRow icon={School} title="School" value={child.schoolName ?? '—'} />
            </ListSection>

            <ListSection title="Updates">
              {updates.length === 0 ? (
                <ListRow title="No updates from the driver or school yet." />
              ) : (
                updates.map((u) => (
                  <View key={u.id} style={{ flexDirection: 'row', gap: space.md, padding: space.lg }}>
                    <Icon icon={u.type === 'warn' ? TriangleAlert : Megaphone} size={20} color={u.type === 'warn' ? t.warningText : t.inkSecondary} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Txt variant="body">{u.body}</Txt>
                      <Txt variant="caption" tone="inkSecondary">
                        {u.from} · {whenLabel(u.createdAt, today)}
                      </Txt>
                    </View>
                  </View>
                ))
              )}
              {announcements.length > 0 && <ListRow title="All updates" accessory="chevron" onPress={() => router.push(routes.parentNotifications)} />}
            </ListSection>
          </>
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

export function RetryLink({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button">
      <Txt variant="subhead" tone="dangerText">
        Retry
      </Txt>
    </Pressable>
  )
}
