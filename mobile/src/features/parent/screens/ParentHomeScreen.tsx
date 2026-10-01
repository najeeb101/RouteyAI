import { useState, type ComponentProps } from 'react'
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Banner } from '@/components/primitives/Banner'
import { Card } from '@/components/primitives/Card'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { ChildSwitcher } from '@/features/parent/components/ChildSwitcher'
import { CHILD_STATUS } from '@/features/parent/components/childStatus'
import { ReportAbsenceSheet } from '@/features/parent/components/ReportAbsenceSheet'
import { useParentContext } from '@/features/parent/context/ParentDataContext'
import { reasonLabel } from '@/lib/absence'
import { colors } from '@/lib/colors'
import { dayLabel, dayPhrase, greeting, timeLabel, whenLabel } from '@/lib/dates'
import { routes } from '@/lib/navigation/routes'

type IconName = ComponentProps<typeof Ionicons>['name']

export function ParentHomeScreen() {
  const router = useRouter()
  const {
    loading,
    error,
    parentName,
    children,
    child,
    selectChild,
    statusFor,
    status,
    attendance,
    today,
    reports,
    announcements,
    busLocation,
    etaMinutes,
    stopsBefore,
    reportAbsence,
    cancelAbsence,
    refresh,
  } = useParentContext()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [cancelling, setCancelling] = useState<string | null>(null)

  const first = child?.firstName ?? 'your child'
  const record = child ? attendance[child.id] : undefined
  const childReports = reports.filter((r) => r.studentId === child?.id)
  const todayReport = childReports.find((r) => r.date === today)
  const updates = announcements.filter((a) => !a.busId || a.busId === child?.busId).slice(0, 3)
  const meta = CHILD_STATUS[status]

  let big = 'Not started'
  let sub = `${child?.busName ?? 'The bus'} hasn't started the route yet.`
  let label = 'Arriving at your stop'
  if (status === 'boarded') {
    label = 'Today'
    big = 'On the bus'
    sub = record ? `${first} boarded at ${timeLabel(record.at)}.` : `${first} is on the bus.`
  } else if (status === 'absent') {
    label = 'Today'
    big = 'Absent'
    sub = record ? `The driver marked ${first} absent at ${timeLabel(record.at)}.` : `${first} was marked absent.`
  } else if (status === 'reported') {
    label = 'Today'
    big = 'Staying home'
    sub = `You told the driver ${first} won't ride today${todayReport ? ` (${reasonLabel(todayReport.reason).toLowerCase()})` : ''}.`
  } else if (status === 'no-bus') {
    label = 'Today'
    big = 'No bus yet'
    sub = `Your school hasn't put ${first} on a bus yet.`
  } else if (etaMinutes !== null) {
    big = etaMinutes <= 1 ? 'Arriving' : `${etaMinutes} min`
    sub = stopsBefore === null || stopsBefore === 0 ? 'Your stop is next.' : `${stopsBefore} stop${stopsBefore === 1 ? '' : 's'} before yours.`
  } else if (busLocation) {
    sub = 'Waiting for the next GPS update.'
  }

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScreenHeader
        subtitle={parentName ? `${greeting()}, ${parentName.split(' ')[0]}` : greeting()}
        action={
          <TouchableOpacity onPress={() => router.push(routes.parentNotifications)} accessibilityLabel="Open alerts" style={headerButton}>
            <Ionicons name="notifications-outline" size={19} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      {children.length > 0 && (
        <View style={{ backgroundColor: colors.dark, paddingHorizontal: 16, paddingBottom: 16 }}>
          <ChildSwitcher items={children} selectedId={child?.id ?? null} statusFor={statusFor} onSelect={selectChild} />
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading && children.length > 0} onRefresh={refresh} tintColor={colors.primary} />}
      >
        {error && <Banner text={error} action={<RetryLink onPress={refresh} />} />}

        {loading && children.length === 0 && (
          <Card style={{ alignItems: 'center', paddingVertical: 28, gap: 10 }}>
            <ActivityIndicator color={colors.primary} />
            <Text style={{ fontSize: 13, color: colors.muted, fontFamily: 'Inter_500Medium' }}>Loading your children…</Text>
          </Card>
        )}

        {child && (
          <>
            {/* Status and ETA */}
            <View style={heroCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <Text style={heroLabel} numberOfLines={1}>
                  {label} · {child.busName ?? 'No bus'}
                </Text>
                {busLocation && status === 'waiting' && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success }} />
                    <Text style={{ color: '#FFFFFF', fontSize: 10.5, fontFamily: 'Inter_700Bold', letterSpacing: 0.8 }}>LIVE</Text>
                  </View>
                )}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginTop: 6 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.accent, fontFamily: 'Inter_800ExtraBold', fontSize: 34, letterSpacing: -1 }} numberOfLines={1}>
                    {big}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13, fontFamily: 'Inter_500Medium', marginTop: 2, lineHeight: 18 }}>{sub}</Text>
                </View>
                <TouchableOpacity onPress={() => router.push(routes.parentMap)} accessibilityLabel="Open the live map" style={trackButton}>
                  <Ionicons name="navigate" size={20} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 11, marginTop: 3 }}>Track</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick actions */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <ActionTile icon="calendar-outline" title="Report absence" caption="Tell the driver ahead" onPress={() => setSheetOpen(true)} />
              <ActionTile icon="time-outline" title="Trip history" caption={`${first}'s past rides`} onPress={() => router.push(routes.parentHistory)} />
            </View>

            {/* Reported absences still to come */}
            {childReports.length > 0 && (
              <Card style={{ padding: 0, overflow: 'hidden' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 }}>
                  <Ionicons name="home-outline" size={16} color="#B45309" />
                  <Text style={cardTitle}>Staying home</Text>
                </View>
                {childReports.map((r) => (
                  <View key={r.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 11, borderTopWidth: 1, borderTopColor: colors.borderLight }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13.5, color: colors.dark }}>{dayLabel(r.date, today)}</Text>
                      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.muted, marginTop: 1 }} numberOfLines={1}>
                        {reasonLabel(r.reason)}
                        {r.note ? ` · ${r.note}` : ''}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => confirmCancel(r.id, r.date)}
                      disabled={cancelling === r.id}
                      style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}
                    >
                      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: colors.muted }}>{cancelling === r.id ? 'Cancelling…' : 'Cancel'}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </Card>
            )}

            {/* Route details */}
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={cardTitle}>{first}&apos;s bus</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: meta.bg, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 }}>
                  <Ionicons name={meta.icon} size={12} color={meta.color} />
                  <Text style={{ color: meta.color, fontSize: 11, fontFamily: 'Inter_700Bold' }}>{meta.label}</Text>
                </View>
              </View>
              <DetailRow icon="bus-outline" label="Bus" value={child.busName ?? 'Not assigned'} />
              <DetailRow icon="location-outline" label="Pickup" value={child.homeAddress} />
              <DetailRow icon="school-outline" label="School" value={child.schoolName ?? '—'} last />
            </Card>

            {/* Updates */}
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={cardTitle}>Updates</Text>
                {announcements.length > 0 && (
                  <TouchableOpacity onPress={() => router.push(routes.parentNotifications)}>
                    <Text style={{ fontSize: 12.5, color: colors.primaryLight, fontFamily: 'Inter_700Bold' }}>See all</Text>
                  </TouchableOpacity>
                )}
              </View>
              {updates.length === 0 ? (
                <Text style={{ fontSize: 13, color: colors.subtle, fontFamily: 'Inter_400Regular' }}>No updates from the driver or school yet.</Text>
              ) : (
                <View style={{ gap: 12 }}>
                  {updates.map((u) => (
                    <View key={u.id} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                      <Ionicons
                        name={u.type === 'warn' ? 'warning' : 'megaphone-outline'}
                        size={16}
                        color={u.type === 'warn' ? colors.warning : colors.info}
                        style={{ marginTop: 1 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, color: colors.dark, fontFamily: 'Inter_500Medium', lineHeight: 19 }}>{u.body}</Text>
                        <Text style={{ fontSize: 11, color: colors.subtle, fontFamily: 'Inter_400Regular', marginTop: 2 }}>
                          {u.from} · {whenLabel(u.createdAt, today)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </Card>
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

function ActionTile({ icon, title, caption, onPress }: { icon: IconName; title: string; caption: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
        gap: 10,
      }}
    >
      <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: colors.infoBg, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={19} color={colors.primaryLight} />
      </View>
      <View>
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: colors.dark }}>{title}</Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.muted, marginTop: 2 }} numberOfLines={1}>
          {caption}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

function DetailRow({ icon, label, value, last = false }: { icon: IconName; label: string; value: string; last?: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.borderLight,
      }}
    >
      <Ionicons name={icon} size={17} color={colors.subtle} />
      <Text style={{ fontSize: 13, color: colors.muted, fontFamily: 'Inter_500Medium', width: 58 }}>{label}</Text>
      <Text style={{ fontSize: 13, color: colors.dark, fontFamily: 'Inter_600SemiBold', flex: 1, textAlign: 'right' }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  )
}

export function RetryLink({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={8}>
      <Text style={{ color: '#B91C1C', fontFamily: 'Inter_700Bold', fontSize: 12.5 }}>Retry</Text>
    </TouchableOpacity>
  )
}

const headerButton = {
  width: 38,
  height: 38,
  borderRadius: 12,
  backgroundColor: 'rgba(255,255,255,0.1)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
}

const heroCard = {
  backgroundColor: colors.primary,
  borderRadius: 22,
  padding: 18,
  shadowColor: colors.primary,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 16,
  elevation: 6,
}

const heroLabel = {
  flex: 1,
  color: 'rgba(255,255,255,0.7)',
  fontSize: 10.5,
  fontFamily: 'Inter_700Bold',
  textTransform: 'uppercase' as const,
  letterSpacing: 1.1,
}

const trackButton = {
  backgroundColor: 'rgba(255,255,255,0.14)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.12)',
  borderRadius: 16,
  width: 66,
  height: 62,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
}

const cardTitle = { fontFamily: 'Inter_700Bold' as const, fontSize: 14.5, color: colors.dark }
