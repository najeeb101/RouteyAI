import { useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { Check, MapPinned, X, type LucideIcon } from 'lucide-react-native'
import { Banner } from '@/components/primitives/Banner'
import { Card } from '@/components/primitives/Card'
import { Icon } from '@/components/primitives/Icon'
import { MapPlaceholder } from '@/components/primitives/MapPlaceholder'
import { ProgressBar } from '@/components/primitives/ProgressBar'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { StatusText } from '@/components/primitives/StatusText'
import { Txt } from '@/components/primitives/Txt'
import { useDriverContext } from '@/features/driver/context/DriverDataContext'
import { reasonLabel } from '@/lib/absence'
import { localDateKey } from '@/lib/dates'
import { boundsOf, decodePolyline } from '@/lib/geo'
import { Mapbox } from '@/lib/mapbox'
import { mapStyleJSON, ROUTE_LINE } from '@/lib/mapStyle'
import { supabase } from '@/lib/supabase'
import { floatingShadow, fonts, gutter, radius, space, useTheme, type Palette } from '@/lib/theme'

export function DriverRouteScreen() {
  const t = useTheme()
  const { loading, error, profile, stops, boardedIds, setBoardedIds, absentIds, setAbsentIds, reported, reportedIds, routePoints, encodedPolyline, trip } = useDriverContext()
  const [savingId, setSavingId] = useState<string | null>(null)
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'
  const mapCoordinates = useMemo(
    () => (encodedPolyline ? decodePolyline(encodedPolyline) : routePoints.map((point) => [point.lng, point.lat] as [number, number])),
    [encodedPolyline, routePoints],
  )
  const mapCenter = mapCoordinates[0] ?? [51.531, 25.2854]
  const mapBounds = useMemo(() => boundsOf(mapCoordinates), [mapCoordinates])
  const totalStudents = stops.reduce((sum, s) => sum + s.students.length, 0)
  const boardedCount = boardedIds.size

  async function markStudent(id: string, status: 'boarded' | 'absent') {
    if (!profile || savingId) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    const today = localDateKey()
    const wasBoarded = boardedIds.has(id)
    const wasAbsent = absentIds.has(id)
    const isUnmarking = (status === 'boarded' && wasBoarded) || (status === 'absent' && wasAbsent)

    setSavingId(id)
    // Optimistic update
    setBoardedIds((prev) => { const n = new Set(prev); if (status === 'boarded' && !isUnmarking) n.add(id); else n.delete(id); return n })
    setAbsentIds((prev) => { const n = new Set(prev); if (status === 'absent' && !isUnmarking) n.add(id); else n.delete(id); return n })

    try {
      // Always delete existing record first to avoid duplicates
      await supabase.from('attendance').delete()
        .eq('student_id', id).eq('bus_id', profile.busId).eq('date', today)
      if (!isUnmarking) {
        const { error } = await supabase.from('attendance')
          .insert({ student_id: id, bus_id: profile.busId, status, date: today })
        if (error) throw error
      }
    } catch {
      // Revert optimistic update
      setBoardedIds((prev) => { const n = new Set(prev); if (wasBoarded) n.add(id); else n.delete(id); return n })
      setAbsentIds((prev) => { const n = new Set(prev); if (wasAbsent) n.add(id); else n.delete(id); return n })
    } finally {
      setSavingId(null)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas }} edges={['top']}>
      <ScreenHeader title="Route" subtitle={`${profile?.busName ?? 'Your bus'} · ${stops.length} stops · tap Board or Absent at each stop`} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: gutter, paddingTop: space.xs, paddingBottom: space.xxxl, gap: space.lg }} showsVerticalScrollIndicator={false}>
        {error && <Banner text={error} />}

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

            <View style={[{ position: 'absolute', left: space.md, bottom: space.md, backgroundColor: t.surface, borderRadius: radius.md, paddingHorizontal: space.md, height: 36, justifyContent: 'center' }, floatingShadow]}>
              <StatusText
                label={trip.status === 'active' ? 'Live' : trip.status === 'done' ? 'Finished' : 'Not started'}
                tone={trip.status === 'active' ? 'live' : trip.status === 'done' ? 'success' : 'neutral'}
              />
            </View>
          </View>
        )}

        {/* Progress */}
        {!loading && totalStudents > 0 && (
          <Card style={{ gap: space.md }}>
            <Txt variant="headline">
              {boardedCount} of {totalStudents} boarded
            </Txt>
            <ProgressBar value={boardedCount} total={totalStudents} />
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

        {stops.map((stop, index) => {
          // Students reported absent by a parent count as done, so the driver can skip a stop where nobody is waiting.
          const stopDone = Boolean(stop.done)
          const isCurrent = Boolean(stop.current) && !stopDone
          const staying = stop.students.filter((s) => reportedIds.has(s.id)).length
          const boardedHere = stop.students.filter((s) => boardedIds.has(s.id)).length

          return (
            <View key={stop.id} style={{ backgroundColor: t.surface, borderRadius: radius.md, overflow: 'hidden', borderWidth: isCurrent ? 1.5 : 0, borderColor: t.brand }}>
              {/* Stop header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg }}>
                <StopBadge index={index} done={stopDone} current={isCurrent} />
                <View style={{ flex: 1, gap: 1 }}>
                  <Txt variant="headline" tone={stopDone ? 'inkSecondary' : 'ink'} numberOfLines={1}>
                    {stop.name}
                  </Txt>
                  {stop.students.length > 0 && (
                    <Txt variant="subhead" tone="inkSecondary" style={{ fontFamily: fonts.regular }}>
                      {boardedHere} of {stop.students.length} boarded
                      {staying > 0 ? ` · ${staying} staying home` : ''}
                    </Txt>
                  )}
                </View>
                <Txt variant="subhead" tone={stopDone ? 'successText' : isCurrent ? 'brand' : 'inkTertiary'}>
                  {stopDone ? 'Done' : isCurrent ? 'Now' : `Stop ${index + 1}`}
                </Txt>
              </View>

              {/* Student rows */}
              {stop.students.map((student) => {
                const isBoarded = boardedIds.has(student.id)
                const isAbsent = absentIds.has(student.id)
                const report = !isBoarded && !isAbsent ? reported.get(student.id) : undefined
                const isSaving = savingId === student.id
                return (
                  <View
                    key={student.id}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md, borderTopWidth: 1, borderTopColor: t.separator, opacity: isSaving ? 0.6 : 1 }}
                  >
                    <View style={{ flex: 1, gap: 1 }}>
                      <Txt variant="bodyMedium" tone={isBoarded || isAbsent || report ? 'inkSecondary' : 'ink'} numberOfLines={2}>
                        {student.name}
                      </Txt>
                      {report && (
                        <Txt variant="caption" tone="warningText" numberOfLines={1}>
                          Staying home · {reasonLabel(report.reason)}
                        </Txt>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', gap: space.xs + 2 }}>
                      <MarkButton label="Board" icon={Check} active={isBoarded} tone="success" disabled={isSaving} onPress={() => markStudent(student.id, 'boarded')} />
                      <MarkButton label="Absent" icon={X} active={isAbsent} tone="danger" disabled={isSaving} onPress={() => markStudent(student.id, 'absent')} />
                    </View>
                  </View>
                )
              })}
            </View>
          )
        })}
      </ScrollView>
    </SafeAreaView>
  )
}

function StopBadge({ index, done, current }: { index: number; done: boolean; current: boolean }) {
  const t = useTheme()
  return (
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: done ? t.success : current ? t.brand : t.canvas,
      }}
    >
      {done ? (
        <Icon icon={Check} size={16} color={t.onBrand} strokeWidth={2.5} />
      ) : (
        <Txt variant="subhead" tone={current ? 'onBrand' : 'inkSecondary'} style={{ fontFamily: fonts.semibold }}>
          {index + 1}
        </Txt>
      )}
    </View>
  )
}

/** Board / Absent: outlined until chosen, then filled with the status colour. Tap again to undo. Labels stay the same so the buttons don't change width. */
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
      })}
    >
      <Icon icon={icon} size={16} color={active ? t[ink] : t.inkSecondary} strokeWidth={2.25} />
      <Txt variant="subhead" color={active ? t[ink] : t.ink}>
        {label}
      </Txt>
    </Pressable>
  )
}
