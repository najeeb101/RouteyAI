import { useMemo, useState, type PropsWithChildren } from 'react'
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native'
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
import { confirm } from '@/lib/confirm'
import { timeLabel } from '@/lib/dates'
import { routes } from '@/lib/navigation/routes'
import { RUN_LABEL } from '@/lib/runs'
import { gutter, space, useTheme } from '@/lib/theme'

export function DriverHomeScreen() {
  const router = useRouter()
  const t = useTheme()
  const { loading, error, profile, run, runState, stops, marks, counts, totalStudents, reported, reportedIds, busCapacity, routeChanged, trip, refresh } = useDriverContext()
  const [delayOpen, setDelayOpen] = useState(false)

  const morning = run === 'morning'
  const runName = morning ? 'morning' : 'afternoon'
  const homeStops = stops.filter((s) => !s.school).length
  const currentStop = stops.find((stop) => stop.current) ?? stops[0]
  const nextStop = stops.find((stop) => !stop.done && !stop.current)
  const stopsDone = stops.filter((s) => s.done).length
  const allDone = stopsDone === stops.length && stops.length > 0
  const currentIndex = currentStop ? stops.indexOf(currentStop) : 0
  const onNight = trip.status === 'active'
  const onBoardNow = morning ? counts.rode : counts.onBoard.length
  const seatsPct = busCapacity > 0 ? Math.min(100, Math.round((onBoardNow / busCapacity) * 100)) : 0
  const doneForToday = runState.phase === 'ended' && trip.status !== 'done'

  // Which stop each reported student is on, for the "won't ride" list.
  const stopOf = useMemo(() => {
    const map = new Map<string, { stop: string; name: string }>()
    for (const stop of stops) if (!stop.school) for (const s of stop.students) map.set(s.id, { stop: stop.name, name: s.name })
    return map
  }, [stops])
  const reportedList = [...reported.values()].filter((r) => reportedIds.has(r.studentId) && stopOf.has(r.studentId))

  // What's left to do at the current stop.
  const left = currentStop?.students.filter((s) => {
    const m = marks.get(s.id)
    if (currentStop.school || morning) return m === undefined && !reportedIds.has(s.id)
    return m === 'boarded'
  }).length ?? 0
  const leftText = !currentStop
    ? 'Ask your school to set up the route'
    : left === 0
      ? currentStop.school ? 'Everyone is checked in' : morning ? 'Everyone here is checked in' : 'Everyone here is dropped off'
      : currentStop.school ? `${left} to board` : morning ? `${left} to check in` : `${left} to drop off`

  function confirmEnd() {
    const end = () => trip.end(counts)
    if (morning) {
      confirm(
        'End the morning run?',
        `${counts.rode} on board will be marked as arrived at school, and their parents are told.${counts.notChecked > 0 ? ` ${counts.notChecked} not checked in yet.` : ''}`,
        [{ text: 'Keep driving', style: 'cancel' }, { text: 'End run', style: 'destructive', onPress: end }],
      )
      return
    }
    // Ending the afternoon is a safety check: nobody should still be on the bus.
    if (counts.onBoard.length > 0) {
      const names = counts.onBoard.map((s) => s.name).join(', ')
      confirm(
        'Still on the bus',
        `${names} ${counts.onBoard.length === 1 ? 'was' : 'were'} never dropped off. If you end anyway, the school sees them flagged and parents aren't told they're home.`,
        [
          { text: 'Go to Route', onPress: () => router.push(routes.driverRoute) },
          { text: 'End anyway', style: 'destructive', onPress: end },
          { text: 'Keep driving', style: 'cancel' },
        ],
      )
      return
    }
    confirm('End the afternoon run?', 'Parents stop seeing the bus on the map.', [
      { text: 'Keep driving', style: 'cancel' },
      { text: 'End run', style: 'destructive', onPress: end },
    ])
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas }} edges={['top']}>
      <ScreenHeader
        brand
        title={profile?.busName ?? (loading ? 'Loading…' : 'No bus assigned')}
        subtitle={`${RUN_LABEL[run]} · ${homeStops} stops · ${totalStudents} students`}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: gutter, paddingTop: space.xs, paddingBottom: space.xxxl, gap: space.xxl }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading && stops.length > 0} onRefresh={refresh} tintColor={t.brand} />}
      >
        {error && <Banner text={error} />}
        {trip.gpsError && <Banner text={trip.gpsError} tone="warning" />}
        {routeChanged && trip.status === 'idle' && <Banner tone="info" text="Your route changed since your last run. Check the stop list before you start." />}

        {trip.status === 'done' && profile && trip.summary && <TripSummary busName={profile.busName} summary={trip.summary} onDone={trip.reset} />}

        {doneForToday && (
          <SignatureCard style={{ gap: space.xs }}>
            <Txt variant="title" tone="onNight">
              Done for today
            </Txt>
            <Txt variant="body" tone="onNightSecondary">
              Both runs are finished. The morning run starts here tomorrow.
            </Txt>
          </SignatureCard>
        )}

        {trip.status === 'idle' && !doneForToday && profile && (
          <SignatureCard style={{ gap: space.lg }}>
            <View style={{ gap: space.xs, paddingRight: space.xxxl }}>
              <Txt variant="title" tone="onNight">
                Ready for the {runName} run?
              </Txt>
              <Txt variant="body" tone="onNightSecondary">
                {morning ? 'Parents see the bus on the map once you start.' : 'Board everyone at school, then drop them off stop by stop.'}
              </Txt>
            </View>
            <Button label={`Start ${runName} run`} icon={Play} variant="onNight" onPress={trip.start} loading={trip.busy} haptic />
          </SignatureCard>
        )}

        {trip.status !== 'done' && !doneForToday && (
          <>
            {/* Current stop: the navy signature card while the run is going */}
            {loading && stops.length === 0 ? (
              <Card style={{ alignItems: 'center', paddingVertical: space.xxl }}>
                <ActivityIndicator color={t.brand} />
              </Card>
            ) : (
              <CurrentStopCard onNight={onNight}>
                <View style={{ gap: space.xs }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md }}>
                    <Txt variant="subhead" tone={onNight ? 'onNightSecondary' : 'inkSecondary'}>
                      {currentStop?.school ? 'At school' : allDone ? 'Last stop' : 'Current stop'}
                    </Txt>
                    {onNight && <LivePill onNight />}
                  </View>
                  <Txt variant="largeTitle" tone={onNight ? 'onNight' : 'ink'} numberOfLines={2}>
                    {currentStop?.name ?? 'No stops assigned'}
                  </Txt>
                  <Txt variant="body" tone={onNight ? 'onNightSecondary' : 'inkSecondary'}>
                    {leftText}
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
                  label={currentStop?.school ? 'Board students' : morning ? 'Check in students' : 'Drop off students'}
                  icon={ListChecks}
                  variant={onNight ? 'onNight' : 'secondary'}
                  onPress={() => router.push(routes.driverRoute)}
                  disabled={!currentStop}
                />
              </CurrentStopCard>
            )}

            {/* Progress on this run */}
            <Card style={{ gap: space.md }}>
              {morning ? (
                <>
                  <Stat value={String(counts.rode)} suffix={`/${totalStudents}`} label="boarded" />
                  <ProgressBar value={counts.rode} total={totalStudents} />
                </>
              ) : (
                <>
                  <Stat value={String(counts.droppedOff)} suffix={`/${counts.rode}`} label="dropped off" />
                  <ProgressBar value={counts.droppedOff} total={Math.max(1, counts.rode)} />
                </>
              )}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.lg }}>
                {!morning && <StatusText label={`${counts.onBoard.length} on board`} tone={counts.onBoard.length > 0 ? 'success' : 'neutral'} />}
                <StatusText label={`${counts.absent} absent`} tone={counts.absent > 0 ? 'danger' : 'neutral'} />
                <StatusText label={`${counts.reported} reported`} tone={counts.reported > 0 ? 'warning' : 'neutral'} />
                <StatusText label={`${onBoardNow}/${busCapacity} seats`} tone={seatsPct > 90 ? 'danger' : 'neutral'} />
              </View>
            </Card>

            {/* Reported absences for this run */}
            {reportedList.length > 0 && (
              <ListSection title={`${reportedList.length} student${reportedList.length === 1 ? '' : 's'} won't ride this ${morning ? 'morning' : 'afternoon'}`}>
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

        {trip.status === 'active' && <Button label={`End ${runName} run`} icon={Flag} variant="destructive" onPress={confirmEnd} disabled={trip.busy} haptic />}
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

/** The navy signature card while the run is going, a plain card before it starts. */
function CurrentStopCard({ onNight, children }: PropsWithChildren<{ onNight: boolean }>) {
  return onNight ? <SignatureCard style={{ gap: space.lg }}>{children}</SignatureCard> : <Card style={{ gap: space.lg }}>{children}</Card>
}
