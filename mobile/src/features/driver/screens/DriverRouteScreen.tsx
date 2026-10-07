import { useMemo, useState, type ReactNode } from 'react'
import { ActivityIndicator, Pressable, ScrollView, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { Check, House, MapPinned, School, X, type LucideIcon } from 'lucide-react-native'
import { Banner } from '@/components/primitives/Banner'
import { Card } from '@/components/primitives/Card'
import { Icon } from '@/components/primitives/Icon'
import { MapPlaceholder } from '@/components/primitives/MapPlaceholder'
import { ProgressBar } from '@/components/primitives/ProgressBar'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { LivePill } from '@/components/brand/LivePill'
import { StatusText } from '@/components/primitives/StatusText'
import { Txt, type Tone } from '@/components/primitives/Txt'
import { useDriverContext } from '@/features/driver/context/DriverDataContext'
import type { DriverStop, DriverStudent } from '@/features/driver/hooks/useDriverData'
import { reasonLabel } from '@/lib/absence'
import { boundsOf, decodePolyline } from '@/lib/geo'
import { Mapbox } from '@/lib/mapbox'
import { mapStyleJSON, ROUTE_LINE } from '@/lib/mapStyle'
import type { Mark } from '@/lib/runs'
import { fonts, gutter, radius, space, useFloatingShadow, useTheme, type Palette } from '@/lib/theme'

export function DriverRouteScreen() {
  const t = useTheme()
  const shadow = useFloatingShadow()
  const { loading, error, profile, run, stops, marks, mark, counts, reported, reportedIds, routePoints, encodedPolyline, trip } = useDriverContext()
  const [savingId, setSavingId] = useState<string | null>(null)
  const [markError, setMarkError] = useState<string | null>(null)
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'
  const mapCoordinates = useMemo(
    () => (encodedPolyline ? decodePolyline(encodedPolyline) : routePoints.map((point) => [point.lng, point.lat] as [number, number])),
    [encodedPolyline, routePoints],
  )
  const mapCenter = mapCoordinates[0] ?? [51.531, 25.2854]
  const mapBounds = useMemo(() => boundsOf(mapCoordinates), [mapCoordinates])
  const morning = run === 'morning'
  const canMark = trip.status === 'active'
  const homeStops = stops.filter((s) => !s.school)

  async function markStudent(id: string, status: Mark | null) {
    if (!profile || savingId || !canMark) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    setSavingId(id)
    setMarkError(null)
    const err = await mark(id, status)
    setSavingId(null)
    if (err) setMarkError(err)
  }

  /** Board / Absent: tapping the chosen one again undoes it. */
  const toggle = (student: DriverStudent, status: 'boarded' | 'absent') =>
    markStudent(student.id, marks.get(student.id) === status ? null : status)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas }} edges={['top']}>
      <ScreenHeader
        title="Route"
        subtitle={morning
          ? `${profile?.busName ?? 'Your bus'} · ${homeStops.length} stops · tap Board or Absent at each stop`
          : `${profile?.busName ?? 'Your bus'} · board at school, then drop off at each stop`}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: gutter, paddingTop: space.xs, paddingBottom: space.xxxl, gap: space.lg }} showsVerticalScrollIndicator={false}>
        {error && <Banner text={error} />}
        {markError && <Banner text={markError} />}
        {!loading && !canMark && trip.status !== 'done' && stops.length > 0 && (
          <Banner tone="info" text={`Start the ${morning ? 'morning' : 'afternoon'} run on Home to check students in.`} />
        )}

        {/* Map */}
        {!loading && mapCoordinates.length > 0 && (
          <View style={{ height: 200, borderRadius: radius.md, overflow: 'hidden', backgroundColor: t.surface }}>
            {Mapbox ? (
              <Mapbox.MapView style={{ flex: 1 }} styleJSON={mapStyleJSON(scheme)} scaleBarEnabled={false}>
                {mapBounds ? (
                  <Mapbox.Camera bounds={{ ...mapBounds, paddingTop: 30, paddingBottom: 60, paddingLeft: 30, paddingRight: 30 }} animationDuration={0} />
                ) : (
                  <Mapbox.Camera centerCoordinate={mapCenter} zoomLevel={11} />
                )}
                <Mapbox.ShapeSource id="route-line" shape={{ type: 'Feature', geometry: { type: 'LineString', coordinates: mapCoordinates }, properties: {} }}>
                  <Mapbox.LineLayer id="route-line-casing" style={{ lineColor: ROUTE_LINE[scheme].casing, lineWidth: 7, lineCap: 'round', lineJoin: 'round' }} />
                  <Mapbox.LineLayer id="route-line-layer" aboveLayerID="route-line-casing" style={{ lineColor: ROUTE_LINE[scheme].line, lineWidth: 4, lineCap: 'round', lineJoin: 'round' }} />
                </Mapbox.ShapeSource>
                <Mapbox.ShapeSource
                  id="route-stops"
                  shape={{ type: 'FeatureCollection', features: routePoints.map((p) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [p.lng, p.lat] }, properties: { stopOrder: p.stopOrder } })) }}
                >
                  <Mapbox.CircleLayer id="route-stops-layer" style={{ circleRadius: 5, circleColor: t.brand, circleStrokeColor: t.surface, circleStrokeWidth: 2 }} />
                </Mapbox.ShapeSource>
              </Mapbox.MapView>
            ) : (
              <MapPlaceholder compact />
            )}

            {trip.status === 'active' ? (
              <LivePill style={{ position: 'absolute', left: space.md, bottom: space.md, height: 36 }} floating />
            ) : (
              <View style={[{ position: 'absolute', left: space.md, bottom: space.md, backgroundColor: t.surfaceRaised, borderRadius: radius.md, paddingHorizontal: space.md, height: 36, justifyContent: 'center' }, shadow]}>
                <StatusText label={trip.status === 'done' ? 'Finished' : 'Not started'} tone={trip.status === 'done' ? 'success' : 'neutral'} />
              </View>
            )}
          </View>
        )}

        {/* Progress */}
        {!loading && counts.total > 0 && (
          <Card style={{ gap: space.md }}>
            <Txt variant="headline">
              {morning ? `${counts.rode} of ${counts.total} boarded` : `${counts.droppedOff} of ${counts.rode} dropped off · ${counts.onBoard.length} on board`}
            </Txt>
            <ProgressBar value={morning ? counts.rode : counts.droppedOff} total={morning ? counts.total : Math.max(1, counts.rode)} />
          </Card>
        )}

        {loading && (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <ActivityIndicator color={t.brand} />
            <Txt variant="body" tone="inkSecondary">
              Loading the route…
            </Txt>
          </Card>
        )}

        {!loading && stops.length === 0 && (
          <Card style={{ alignItems: 'center', gap: space.sm, paddingVertical: space.xxl }}>
            <Icon icon={MapPinned} size={30} color={t.inkTertiary} />
            <Txt variant="headline">No stops assigned</Txt>
            <Txt variant="body" tone="inkSecondary" align="center">
              Contact your school admin to set up your route.
            </Txt>
          </Card>
        )}

        {stops.map((stop) => {
          const number = homeStops.indexOf(stop) + 1
          return (
            <StopCard key={stop.id} stop={stop} number={number} summary={stopSummary(stop, morning, marks, reportedIds)}>
              {stop.students.map((student) => {
                const status = marks.get(student.id)
                const report = !status ? reported.get(student.id) : undefined
                const staying = reportedIds.has(student.id)
                const isSaving = savingId === student.id
                const rowProps = { name: student.name, saving: isSaving }

                // Afternoon stops: one Drop off button for children on the bus; everyone else isn't on it.
                if (!morning && !stop.school) {
                  const onBus = status === 'boarded' || status === 'dropped_off'
                  return (
                    <StudentRow
                      key={student.id}
                      {...rowProps}
                      muted={!onBus || status === 'dropped_off'}
                      note={onBus ? undefined : status === 'absent' ? 'Not on the bus · absent at school' : staying ? 'Not on the bus · staying home' : 'Not on the bus'}
                      noteTone={onBus ? undefined : 'inkTertiary'}
                    >
                      {onBus && (
                        <MarkButton
                          label="Drop off"
                          icon={House}
                          active={status === 'dropped_off'}
                          tone="success"
                          disabled={isSaving || !canMark}
                          onPress={() => markStudent(student.id, status === 'dropped_off' ? 'boarded' : 'dropped_off')}
                        />
                      )}
                    </StudentRow>
                  )
                }

                // Morning stops and boarding at school: Board or Absent.
                const boarded = status === 'boarded' || status === 'dropped_off'
                return (
                  <StudentRow
                    key={student.id}
                    {...rowProps}
                    muted={Boolean(status) || staying}
                    note={report && staying ? `Staying home · ${reasonLabel(report.reason)}` : status === 'dropped_off' ? 'At school' : undefined}
                    noteTone="warningText"
                  >
                    <MarkButton label="Board" icon={Check} active={boarded} tone="success" disabled={isSaving || !canMark || status === 'dropped_off'} onPress={() => toggle(student, 'boarded')} />
                    <MarkButton label="Absent" icon={X} active={status === 'absent'} tone="danger" disabled={isSaving || !canMark || status === 'dropped_off'} onPress={() => toggle(student, 'absent')} />
                  </StudentRow>
                )
              })}
            </StopCard>
          )
        })}
      </ScrollView>
    </SafeAreaView>
  )
}

/** The line under a stop's name: how many are checked in, dropped off or staying home. */
function stopSummary(stop: DriverStop, morning: boolean, marks: Map<string, Mark>, reportedIds: Set<string>): string {
  const n = stop.students.length
  const count = (test: (status: Mark | undefined) => boolean) => stop.students.filter((s) => test(marks.get(s.id))).length
  const staying = stop.students.filter((s) => reportedIds.has(s.id)).length
  const stayingText = staying > 0 ? ` · ${staying} staying home` : ''
  if (stop.school) return `${count((m) => m === 'boarded' || m === 'dropped_off')} of ${n} on board${stayingText}`
  if (morning) return `${count((m) => m === 'boarded' || m === 'dropped_off')} of ${n} boarded${stayingText}`
  const onBus = count((m) => m === 'boarded' || m === 'dropped_off')
  return onBus === 0 ? 'Nobody on the bus for this stop' : `${count((m) => m === 'dropped_off')} of ${onBus} dropped off`
}

function StopCard({ stop, number, summary, children }: { stop: DriverStop; number: number; summary: string; children: ReactNode }) {
  const t = useTheme()
  const done = Boolean(stop.done)
  const current = Boolean(stop.current) && !done
  return (
    <View style={{ backgroundColor: t.surface, borderRadius: radius.md, overflow: 'hidden', borderWidth: current ? 1.5 : 0, borderColor: t.brand }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg }}>
        <StopBadge label={stop.school ? undefined : number} done={done} current={current} />
        <View style={{ flex: 1, gap: 1 }}>
          <Txt variant="headline" tone={done ? 'inkSecondary' : 'ink'} numberOfLines={1}>
            {stop.school ? `At school · ${stop.name}` : stop.name}
          </Txt>
          {stop.students.length > 0 && (
            <Txt variant="subhead" tone="inkSecondary" style={{ fontFamily: fonts.regular }}>
              {summary}
            </Txt>
          )}
        </View>
        <Txt variant="subhead" tone={done ? 'successText' : current ? 'brand' : 'inkTertiary'}>
          {done ? 'Done' : current ? 'Now' : stop.school ? 'First' : `Stop ${number}`}
        </Txt>
      </View>
      {children}
    </View>
  )
}

function StudentRow({ name, muted, saving, note, noteTone, children }: {
  name: string
  muted: boolean
  saving: boolean
  note?: string
  noteTone?: Tone
  children?: ReactNode
}) {
  const t = useTheme()
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md, borderTopWidth: 1, borderTopColor: t.separator, opacity: saving ? 0.6 : 1 }}>
      <View style={{ flex: 1, gap: 1 }}>
        <Txt variant="bodyMedium" tone={muted ? 'inkSecondary' : 'ink'} numberOfLines={2}>
          {name}
        </Txt>
        {note && (
          <Txt variant="caption" tone={noteTone ?? 'inkSecondary'} numberOfLines={1}>
            {note}
          </Txt>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: space.xs + 2 }}>{children}</View>
    </View>
  )
}

/** The stop number in a ring (a school icon for the school), like the stops on the logo: filled once done, a heavier brand ring for the current stop. */
function StopBadge({ label, done, current }: { label?: number; done: boolean; current: boolean }) {
  const t = useTheme()
  return (
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: done ? 0 : current ? 3 : 2,
        borderColor: current ? t.brand : t.separator,
        backgroundColor: done ? t.brand : t.surface,
      }}
    >
      {done ? (
        <Icon icon={Check} size={16} color={t.onBrand} strokeWidth={2.5} />
      ) : label === undefined ? (
        <Icon icon={School} size={14} color={current ? t.brand : t.inkSecondary} strokeWidth={2.25} />
      ) : (
        <Txt variant="subhead" tone={current ? 'brand' : 'inkSecondary'} style={{ fontFamily: fonts.semibold }}>
          {label}
        </Txt>
      )}
    </View>
  )
}

/** Board / Absent / Drop off: outlined until chosen, then filled with the status colour. Tap again to undo. Labels stay the same so the buttons don't change width. */
function MarkButton({ label, icon, active, tone, disabled, onPress }: { label: string; icon: LucideIcon; active: boolean; tone: 'success' | 'danger'; disabled: boolean; onPress: () => void }) {
  const t = useTheme()
  const tint: keyof Palette = tone === 'success' ? 'successTint' : 'dangerTint'
  const ink: keyof Palette = tone === 'success' ? 'successText' : 'dangerText'
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.xs,
        height: 40,
        paddingHorizontal: space.md,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: active ? 'transparent' : t.separator,
        backgroundColor: active ? t[tint] : pressed ? t.canvas : t.surface,
        opacity: disabled && !active ? 0.5 : 1,
      })}
    >
      <Icon icon={icon} size={16} color={active ? t[ink] : t.inkSecondary} strokeWidth={2.25} />
      <Txt variant="subhead" color={active ? t[ink] : t.ink}>
        {label}
      </Txt>
    </Pressable>
  )
}
