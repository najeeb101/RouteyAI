import { useMemo, useState, type PropsWithChildren } from 'react'
import { ActivityIndicator, Alert, RefreshControl, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Clock, Flag, ListChecks, ListOrdered, MessageSquare, Play } from 'lucide-react-native'
import { LivePill } from '@/components/brand/LivePill'
import { RouteLine } from '@/components/brand/RouteLine'
import { SignatureCard } from '@/components/brand/SignatureCard'
import { Avatar } from '@/components/primitives/Avatar'
import { Banner } from '@/components/primitives/Banner'
import { Button } from '@/components/primitives/Button'
import { Card } from '@/components/primitives/Card'
import { ListRow, ListSection } from '@/components/primitives/List'
import { ProgressBar } from '@/components/primitives/ProgressBar'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { Stat } from '@/components/primitives/Stat'
import { StatusText } from '@/components/primitives/StatusText'
import { Txt } from '@/components/primitives/Txt'
import { DelaySheet } from '@/features/driver/components/DelaySheet'
import { TripSummary } from '@/features/driver/components/TripSummary'
import { useDriverContext } from '@/features/driver/context/DriverDataContext'
import { reasonLabel } from '@/lib/absence'
import { timeLabel } from '@/lib/dates'
import { routes } from '@/lib/navigation/routes'
import { gutter, space, useTheme } from '@/lib/theme'

export function DriverHomeScreen() {
  const router = useRouter()
  const t = useTheme()
  const { loading, error, profile, stops, totalStudents, boardedIds, absentIds, reported, reportedIds, busCapacity, trip, refresh } = useDriverContext()
  const [delayOpen, setDelayOpen] = useState(false)

  const boarded = boardedIds.size
  const currentStop = stops.find((stop) => stop.current) ?? stops[0]
  const nextStop = stops.find((stop) => !stop.done && !stop.current)
  const stopsDone = stops.filter((s) => s.done).length
  const allDone = stopsDone === stops.length && stops.length > 0
  const currentIndex = currentStop ? stops.indexOf(currentStop) : 0
  const onNight = trip.status === 'active'
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
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas }} edges={['top']}>
      <ScreenHeader
        brand
        title={profile?.busName ?? (loading ? 'Loading…' : 'No bus assigned')}
        subtitle={`Morning run · ${stops.length} stops · ${totalStudents} students`}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: gutter, paddingTop: space.xs, paddingBottom: space.xxxl, gap: space.xxl }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading && stops.length > 0} onRefresh={refresh} tintColor={t.brand} />}
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
          <SignatureCard style={{ gap: space.lg }}>
            <View style={{ gap: space.xs, paddingRight: space.xxxl }}>
              <Txt variant="title" tone="onNight">
                Ready for the morning run?
              </Txt>
              <Txt variant="body" tone="onNightSecondary">
                Parents see the bus on the map once you start.
              </Txt>
            </View>
            <Button label="Start route" icon={Play} variant="onNight" onPress={trip.start} loading={trip.busy} haptic />
          </SignatureCard>
        )}

        {trip.status !== 'done' && (
          <>
            {/* Current stop: the navy signature card while the route is running */}
            {loading && stops.length === 0 ? (
              <Card style={{ alignItems: 'center', paddingVertical: space.xxl }}>
                <ActivityIndicator color={t.brand} />
              </Card>
            ) : (
              <CurrentStopCard onNight={trip.status === 'active'}>
                <View style={{ gap: space.xs }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md }}>
                    <Txt variant="subhead" tone={onNight ? 'onNightSecondary' : 'inkSecondary'}>
                      {allDone ? 'Last stop' : 'Current stop'}
                    </Txt>
                    {onNight && <LivePill onNight />}
                  </View>
                  <Txt variant="largeTitle" tone={onNight ? 'onNight' : 'ink'} numberOfLines={2}>
                    {currentStop?.name ?? 'No stops assigned'}
                  </Txt>
                  <Txt variant="body" tone={onNight ? 'onNightSecondary' : 'inkSecondary'}>
                    {waitingAtCurrent > 0 ? `${waitingAtCurrent} to check in` : currentStop ? 'Everyone here is checked in' : 'Ask your school to set up the route'}
                    {nextStop ? ` · then ${nextStop.name}` : ''}
                  </Txt>
                </View>
                {stops.length > 1 && (
                  <RouteLine
                    stops={stops.length}
                    reached={stopsDone}
                    current={allDone ? undefined : currentIndex}
                    onNight={onNight}
                    startLabel={allDone ? `All ${stops.length} stops done` : `Stop ${currentIndex + 1} of ${stops.length}`}
                    endLabel={onNight ? (trip.lastFixAt ? `Location sent ${timeLabel(trip.lastFixAt)}` : 'Finding your location…') : undefined}
                    accessibilityLabel={`${stopsDone} of ${stops.length} stops done`}
                  />
                )}
                <Button
                  label="Check in students"
                  icon={ListChecks}
                  variant={onNight ? 'onNight' : 'secondary'}
                  onPress={() => router.push(routes.driverRoute)}
                  disabled={!currentStop}
                />
              </CurrentStopCard>
            )}

            {/* Boarding progress */}
            <Card style={{ gap: space.md }}>
              <Stat value={String(boarded)} suffix={`/${totalStudents}`} label="boarded" />
              <ProgressBar value={boarded} total={totalStudents} />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.lg }}>
                <StatusText label={`${absentIds.size} absent`} tone={absentIds.size > 0 ? 'danger' : 'neutral'} />
                <StatusText label={`${reportedIds.size} reported`} tone={reportedIds.size > 0 ? 'warning' : 'neutral'} />
                <StatusText label={`${boarded}/${busCapacity} seats`} tone={seatsPct > 90 ? 'danger' : 'neutral'} />
              </View>
            </Card>

            {/* Reported absences */}
            {reportedList.length > 0 && (
              <ListSection title={`${reportedList.length} student${reportedList.length === 1 ? '' : 's'} won't ride today`}>
                {reportedList.map((r) => {
                  const info = stopOf.get(r.studentId)
                  return (
                    <ListRow
                      key={r.id}
                      leading={<Avatar name={info?.name ?? '?'} size={32} />}
                      title={info?.name ?? 'Student'}
                      subtitle={`${info?.stop} · ${reasonLabel(r.reason)}${r.note ? ` · ${r.note}` : ''}`}
                      value="Parent"
                    />
                  )
                })}
              </ListSection>
            )}

            <ListSection>
              <ListRow icon={Clock} title="Running late" subtitle="Tell all parents on the bus" accessory="chevron" onPress={() => setDelayOpen(true)} />
              <ListRow icon={MessageSquare} title="Messages" subtitle="School and parents" accessory="chevron" onPress={() => router.push(routes.driverMessages)} />
              <ListRow icon={ListOrdered} title="Full route and students" value={`${stopsDone} of ${stops.length} stops`} accessory="chevron" onPress={() => router.push(routes.driverRoute)} />
            </ListSection>
          </>
        )}

        {trip.status === 'active' && <Button label="End route" icon={Flag} variant="destructive" onPress={confirmEnd} disabled={trip.busy} haptic />}
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

/** The navy signature card while the route runs, a plain card before it starts. */
function CurrentStopCard({ onNight, children }: PropsWithChildren<{ onNight: boolean }>) {
  return onNight ? <SignatureCard style={{ gap: space.lg }}>{children}</SignatureCard> : <Card style={{ gap: space.lg }}>{children}</Card>
}
