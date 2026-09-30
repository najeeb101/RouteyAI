import { useMemo, useState, type ComponentProps } from 'react'
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Banner } from '@/components/primitives/Banner'
import { PrimaryButton } from '@/components/primitives/PrimaryButton'
import { ProgressBar } from '@/components/primitives/ProgressBar'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { StatusPill } from '@/components/primitives/StatusPill'
import { DelaySheet } from '@/features/driver/components/DelaySheet'
import { TripSummary } from '@/features/driver/components/TripSummary'
import { useDriverContext } from '@/features/driver/context/DriverDataContext'
import { reasonLabel } from '@/lib/absence'
import { colors } from '@/lib/colors'
import { timeLabel } from '@/lib/dates'
import { routes } from '@/lib/navigation/routes'

type IconName = ComponentProps<typeof Ionicons>['name']

export function DriverHomeScreen() {
  const router = useRouter()
  const { loading, error, profile, stops, totalStudents, boardedIds, absentIds, reported, reportedIds, busCapacity, trip, refresh } = useDriverContext()
  const [delayOpen, setDelayOpen] = useState(false)

  const boarded = boardedIds.size
  const currentStop = stops.find((stop) => stop.current) ?? stops[0]
  const nextStop = stops.find((stop) => !stop.done && !stop.current)
  const stopsDone = stops.filter((s) => s.done).length
  const seatsPct = busCapacity > 0 ? Math.min(100, Math.round((boarded / busCapacity) * 100)) : 0

  // Which stop each reported student is on, for the "won't ride today" list.
  const stopOf = useMemo(() => {
    const map = new Map<string, { stop: string; name: string }>()
    for (const stop of stops) for (const s of stop.students) map.set(s.id, { stop: stop.name, name: s.name })
    return map
  }, [stops])
  const reportedList = [...reported.values()].filter((r) => reportedIds.has(r.studentId) && stopOf.has(r.studentId))
  const waitingAtCurrent = currentStop?.students.filter((s) => !boardedIds.has(s.id) && !absentIds.has(s.id) && !reportedIds.has(s.id)).length ?? 0

  function confirmEnd() {
    const unchecked = totalStudents - boarded - absentIds.size - reportedIds.size
    Alert.alert(
      'End the route?',
      unchecked > 0
        ? `${unchecked} student${unchecked === 1 ? ' is' : 's are'} not checked in yet. Parents stop seeing the bus when you end the route.`
        : 'Parents stop seeing the bus on the map.',
      [
        { text: 'Keep driving', style: 'cancel' },
        { text: 'End route', style: 'destructive', onPress: () => trip.end() },
      ],
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScreenHeader
        subtitle={profile ? `${profile.driverName} · ${profile.schoolName}` : 'Driver'}
        action={
          trip.status === 'active' ? (
            <TouchableOpacity onPress={confirmEnd} disabled={trip.busy} style={headerButton(colors.danger)} accessibilityLabel="End the route">
              <Ionicons name="stop" size={13} color="#FFFFFF" />
              <Text style={headerButtonText}>End route</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Bus strip */}
      <View style={{ backgroundColor: colors.dark, paddingHorizontal: 16, paddingBottom: 16 }}>
        <View style={busStrip}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(56,189,248,0.15)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="bus" size={20} color={colors.accentMid} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_800ExtraBold', fontSize: 15 }}>{profile?.busName ?? (loading ? 'Loading…' : 'No bus assigned')}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11.5, fontFamily: 'Inter_500Medium', marginTop: 2 }}>
              Morning run · {stops.length} stops · {totalStudents} students
            </Text>
          </View>
          {trip.status === 'active' && <StatusPill label="Live" />}
          {trip.status === 'done' && <StatusPill label="Done" tone="info" />}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading && stops.length > 0} onRefresh={refresh} tintColor={colors.primary} />}
      >
        {error && <Banner text={error} />}
        {trip.gpsError && <Banner text={trip.gpsError} tone="warning" />}

        {trip.status === 'done' && profile && (
          <TripSummary
            busName={profile.busName}
            startedAt={trip.startedAt}
            endedAt={trip.endedAt}
            total={totalStudents}
            boarded={boarded}
            absent={absentIds.size}
            reported={reportedIds.size}
            stopsDone={stopsDone}
            stopCount={stops.length}
            onNewRoute={trip.reset}
          />
        )}

        {trip.status === 'idle' && profile && (
          <View style={[card, { gap: 12 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.successBg, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="play" size={20} color={colors.successMid} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 16, color: colors.dark }}>Ready for the morning run?</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12.5, color: colors.muted, marginTop: 2, lineHeight: 18 }}>
                  Parents see the bus on the map once you start.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={trip.start}
              disabled={trip.busy}
              activeOpacity={0.85}
              style={{ height: 54, borderRadius: 16, backgroundColor: colors.success, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {trip.busy ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="navigate" size={18} color="#FFFFFF" />}
              <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_800ExtraBold', fontSize: 16 }}>Start route</Text>
            </TouchableOpacity>
          </View>
        )}

        {trip.status === 'active' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success }} />
            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 12.5, color: colors.muted }}>
              Sharing location with parents{trip.lastFixAt ? ` · last update ${timeLabel(trip.lastFixAt)}` : ''}
            </Text>
          </View>
        )}

        {/* Reported absences */}
        {reportedList.length > 0 && trip.status !== 'done' && (
          <View style={[card, { padding: 0, overflow: 'hidden', borderColor: '#FDE68A' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.warningBg, paddingHorizontal: 16, paddingVertical: 12 }}>
              <Ionicons name="home" size={16} color="#B45309" />
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13.5, color: '#92400E', flex: 1 }}>
                {reportedList.length} student{reportedList.length === 1 ? '' : 's'} won&apos;t ride today
              </Text>
            </View>
            {reportedList.map((r) => {
              const info = stopOf.get(r.studentId)
              return (
                <View key={r.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 11, borderTopWidth: 1, borderTopColor: colors.borderLight }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13.5, color: colors.dark }}>{info?.name}</Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.muted }} numberOfLines={1}>
                      {info?.stop} · {reasonLabel(r.reason)}
                      {r.note ? ` · ${r.note}` : ''}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 11, color: colors.subtle }}>Parent</Text>
                </View>
              )
            })}
          </View>
        )}

        {trip.status !== 'done' && (
          <>
            {/* Boarding progress */}
            <View style={card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={sectionTitle}>Boarding</Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.subtle }}>
                  <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: colors.primary }}>{boarded}</Text>/{totalStudents}
                </Text>
              </View>
              <ProgressBar value={boarded} total={totalStudents} height={10} />
              <View style={{ flexDirection: 'row', gap: 14, marginTop: 12 }}>
                <Legend color={colors.danger} label={`${absentIds.size} absent`} />
                <Legend color={colors.warning} label={`${reportedIds.size} reported`} />
                <Legend color={seatsPct > 90 ? colors.danger : colors.subtle} label={`${boarded}/${busCapacity} seats`} />
              </View>
            </View>

            {/* Current stop */}
            {loading && stops.length === 0 ? (
              <View style={[card, { alignItems: 'center', paddingVertical: 24 }]}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : (
              <View style={{ borderRadius: 22, overflow: 'hidden', backgroundColor: colors.primary }}>
                <View style={{ height: 3, backgroundColor: colors.accentMid }} />
                <View style={{ padding: 18 }}>
                  <Text style={dimLabel}>{stopsDone === stops.length && stops.length > 0 ? 'Last stop' : 'Current stop'}</Text>
                  <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_800ExtraBold', fontSize: 21, letterSpacing: -0.4, marginTop: 2 }} numberOfLines={2}>
                    {currentStop?.name ?? 'No stops assigned'}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_500Medium', fontSize: 12.5, marginTop: 4 }}>
                    {waitingAtCurrent > 0 ? `${waitingAtCurrent} to check in` : currentStop ? 'Everyone here is checked in' : 'Ask your school to set up the route'}
                    {nextStop ? ` · then ${nextStop.name}` : ''}
                  </Text>
                  <TouchableOpacity onPress={() => router.push(routes.driverRoute)} style={checkInBtn}>
                    <Ionicons name="checkbox-outline" size={16} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 13.5 }}>Check in students</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <ActionTile icon="time-outline" title="Running late?" caption="Tell all parents" tint={colors.warning} onPress={() => setDelayOpen(true)} disabled={!profile} />
              <ActionTile icon="chatbubbles-outline" title="Messages" caption="School and parents" tint={colors.primaryLight} onPress={() => router.push(routes.driverMessages)} />
            </View>

            <TouchableOpacity onPress={() => router.push(routes.driverRoute)} style={[card, { flexDirection: 'row', alignItems: 'center', gap: 12 }]} activeOpacity={0.8}>
              <Ionicons name="list" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: colors.dark }}>Full route and students</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.muted, marginTop: 1 }}>
                  {stopsDone} of {stops.length} stops done
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.subtle} />
            </TouchableOpacity>
          </>
        )}

        {trip.status === 'active' && <PrimaryButton label="End route" icon="flag-outline" tone="danger" onPress={confirmEnd} disabled={trip.busy} />}
      </ScrollView>

      {profile && (
        <DelaySheet
          visible={delayOpen}
          onClose={() => setDelayOpen(false)}
          busId={profile.busId}
          busName={profile.busName}
          schoolId={profile.schoolId}
          onSent={refresh}
        />
      )}
    </SafeAreaView>
  )
}

function ActionTile({ icon, title, caption, tint, onPress, disabled = false }: { icon: IconName; title: string; caption: string; tint: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.8} accessibilityRole="button" style={[card, { flex: 1, gap: 10, padding: 14 }]}>
      <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: `${tint}1F`, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={19} color={tint} />
      </View>
      <View>
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: colors.dark }}>{title}</Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.muted, marginTop: 2 }}>{caption}</Text>
      </View>
    </TouchableOpacity>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
      <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.muted }}>{label}</Text>
    </View>
  )
}

function headerButton(bg: string) {
  return {
    backgroundColor: bg,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 12,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  }
}

const headerButtonText = { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 13 }

const busStrip = {
  backgroundColor: 'rgba(255,255,255,0.07)',
  borderRadius: 16,
  padding: 12,
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 12,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.06)',
}

const card = {
  backgroundColor: colors.surface,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: colors.border,
  padding: 16,
}

const sectionTitle = { fontFamily: 'Inter_700Bold' as const, fontSize: 14.5, color: colors.dark }

const dimLabel = {
  fontSize: 10.5,
  fontFamily: 'Inter_700Bold' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
  color: 'rgba(255,255,255,0.6)',
}

const checkInBtn = {
  backgroundColor: '#FFFFFF',
  borderRadius: 14,
  paddingHorizontal: 16,
  height: 44,
  alignSelf: 'flex-start' as const,
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 7,
  marginTop: 14,
}
