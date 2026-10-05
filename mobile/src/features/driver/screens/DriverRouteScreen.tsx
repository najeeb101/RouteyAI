import { useMemo, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Banner } from '@/components/primitives/Banner'
import { MapPlaceholder } from '@/components/primitives/MapPlaceholder'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { useDriverContext } from '@/features/driver/context/DriverDataContext'
import { reasonLabel } from '@/lib/absence'
import { colors } from '@/lib/colors'
import { localDateKey } from '@/lib/dates'
import { boundsOf, decodePolyline } from '@/lib/geo'
import { Mapbox } from '@/lib/mapbox'
import { mapStyleJSON, ROUTE_LINE } from '@/lib/mapStyle'
import { supabase } from '@/lib/supabase'

export function DriverRouteScreen() {
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        back
        title={profile?.routeName ?? 'Route'}
        subtitle={`${stops.length} stops · Tap Board or Absent at each stop`}
      />

      {error && (
        <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
          <Banner text={error} />
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 0 }} showsVerticalScrollIndicator={false}>

        {/* Map */}
        {!loading && mapCoordinates.length > 0 && (
          <View style={{ height: 240, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            {Mapbox ? (
              <Mapbox.MapView style={{ flex: 1 }} styleJSON={mapStyleJSON(scheme)} scaleBarEnabled={false}>
                {mapBounds ? (
                  <Mapbox.Camera bounds={{ ...mapBounds, paddingTop: 30, paddingBottom: 70, paddingLeft: 30, paddingRight: 30 }} animationDuration={0} />
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
                  <Mapbox.CircleLayer id="route-stops-layer" style={{ circleRadius: 5, circleColor: colors.success, circleStrokeColor: '#FFFFFF', circleStrokeWidth: 2 }} />
                </Mapbox.ShapeSource>
              </Mapbox.MapView>
            ) : (
              <MapPlaceholder compact />
            )}

            {/* Floating route info pill */}
            <View
              style={{
                position: 'absolute',
                bottom: 10,
                left: 12,
                right: 12,
                backgroundColor: 'rgba(15,23,42,0.82)',
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="map" size={16} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 13 }}>
                  {profile?.routeName ?? 'Route'} · {stops.length} stops
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: trip.status === 'active' ? colors.success : colors.subtle }} />
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter_500Medium', fontSize: 12 }}>
                  {trip.status === 'active' ? 'Live' : trip.status === 'done' ? 'Finished' : 'Not started'}
                </Text>
              </View>
            </View>
          </View>
        )}


        {/* Progress summary bar */}
        {!loading && totalStudents > 0 && (
          <View
            style={{
              backgroundColor: colors.surface,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              paddingHorizontal: 20,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="people" size={17} color={colors.muted} />
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: colors.dark }}>
                {boardedCount}/{totalStudents}
              </Text>
              <Text style={{ fontSize: 13, color: colors.subtle, fontFamily: 'Inter_400Regular' }}>boarded</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 110, height: 8, backgroundColor: colors.borderLight, borderRadius: 4, overflow: 'hidden' }}>
                <View
                  style={{
                    height: '100%',
                    width: `${totalStudents > 0 ? Math.round((boardedCount / totalStudents) * 100) : 0}%`,
                    backgroundColor: boardedCount === totalStudents ? colors.success : colors.primary,
                    borderRadius: 4,
                  }}
                />
              </View>
              <View
                style={{
                  backgroundColor: boardedCount === totalStudents ? colors.successBg : colors.infoBg,
                  borderRadius: 8,
                  paddingHorizontal: 7,
                  paddingVertical: 3,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Inter_700Bold',
                    fontSize: 11,
                    color: boardedCount === totalStudents ? colors.success : colors.info,
                  }}
                >
                  {totalStudents > 0 ? Math.round((boardedCount / totalStudents) * 100) : 0}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Stops list */}
        <View style={{ padding: 16, gap: 10 }}>
          {loading && (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Ionicons name="hourglass-outline" size={18} color={colors.subtle} />
              <Text style={{ fontSize: 13, color: colors.subtle, fontFamily: 'Inter_500Medium' }}>Loading route data...</Text>
            </View>
          )}

          {!loading && stops.length === 0 && (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 24,
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Ionicons name="map-outline" size={32} color={colors.subtle} />
              <Text style={{ fontSize: 14, color: colors.dark, fontFamily: 'Inter_700Bold' }}>No stops assigned</Text>
              <Text style={{ fontSize: 12, color: colors.subtle, fontFamily: 'Inter_400Regular', textAlign: 'center' }}>
                Contact your school admin to set up your route.
              </Text>
            </View>
          )}

          {stops.map((stop, index) => {
            // Students reported absent by a parent count as done, so the driver can skip a stop where nobody is waiting.
            const stopDone = Boolean(stop.done)
            const isCurrent = Boolean(stop.current) && !stopDone
            const staying = stop.students.filter((s) => reportedIds.has(s.id)).length

            return (
              <View
                key={stop.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 18,
                  borderWidth: isCurrent ? 1.5 : 1,
                  borderColor: isCurrent ? colors.info : stopDone ? colors.success : colors.border,
                  overflow: 'hidden',
                  shadowColor: colors.dark,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  elevation: 1,
                }}
              >
                {/* Stop header */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 14,
                  backgroundColor: isCurrent ? colors.infoBg : stopDone ? colors.successBg : colors.surface,
                  gap: 10,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    {/* Stop number badge */}
                    <View style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: stopDone ? colors.success : isCurrent ? colors.info : colors.borderLight,
                      borderWidth: stopDone || isCurrent ? 0 : 1.5,
                      borderColor: colors.border,
                    }}>
                      {stopDone
                        ? <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        : isCurrent
                          ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' }} />
                          : <Text style={{ color: colors.muted, fontSize: 11, fontFamily: 'Inter_700Bold' }}>{index + 1}</Text>
                      }
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: stopDone ? colors.muted : colors.dark }}>
                        {stop.name}
                      </Text>
                      {stop.students.length > 0 && (
                        <Text style={{ fontSize: 11, color: isCurrent ? colors.info : colors.subtle, fontFamily: 'Inter_400Regular', marginTop: 1 }}>
                          {stop.students.filter(s => boardedIds.has(s.id)).length}/{stop.students.length} boarded
                          {staying > 0 ? ` · ${staying} staying home` : ''}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text style={{ fontSize: 11.5, fontFamily: 'Inter_700Bold', color: stopDone ? colors.successMid : isCurrent ? colors.info : colors.subtle }}>
                    {stopDone ? 'Done' : isCurrent ? 'Now' : `Stop ${index + 1}`}
                  </Text>
                </View>

                {/* Student rows */}
                {stop.students.map((student) => {
                  const isBoarded = boardedIds.has(student.id)
                  const isAbsent = absentIds.has(student.id)
                  const report = !isBoarded && !isAbsent ? reported.get(student.id) : undefined
                  const isSaving = savingId === student.id
                  const rowBg = isBoarded ? 'rgba(16,185,129,0.04)' : isAbsent ? 'rgba(239,68,68,0.04)' : report ? 'rgba(245,158,11,0.06)' : 'transparent'
                  const avatarBg = isBoarded ? colors.successBg : isAbsent ? colors.dangerBg : colors.infoBg
                  const avatarBorder = isBoarded ? 'rgba(16,185,129,0.3)' : isAbsent ? 'rgba(239,68,68,0.3)' : '#BFDBFE'
                  const avatarColor = isBoarded ? colors.success : isAbsent ? colors.danger : colors.primary
                  const nameColor = (isBoarded || isAbsent || report) ? colors.muted : colors.dark
                  return (
                    <View
                      key={student.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 14,
                        paddingVertical: 11,
                        borderTopWidth: 1,
                        borderTopColor: colors.borderLight,
                        gap: 10,
                        backgroundColor: rowBg,
                        opacity: isSaving ? 0.6 : 1,
                      }}
                    >
                      {/* Avatar */}
                      <View style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: avatarBg,
                        borderWidth: 1.5,
                        borderColor: avatarBorder,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: avatarColor }}>
                          {student.initials}
                        </Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontFamily: 'Inter_600SemiBold', color: nameColor }}>
                          {student.name}
                        </Text>
                        {report && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <Ionicons name="home" size={11} color="#B45309" />
                            <Text style={{ fontSize: 11, color: '#B45309', fontFamily: 'Inter_600SemiBold' }} numberOfLines={1}>
                              Staying home · {reasonLabel(report.reason)}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Action buttons */}
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <TouchableOpacity
                          onPress={() => !isSaving && markStudent(student.id, 'boarded')}
                          disabled={isSaving}
                          activeOpacity={0.7}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 16,
                            backgroundColor: isBoarded ? colors.successBg : colors.borderLight,
                            borderWidth: 1,
                            borderColor: isBoarded ? 'rgba(16,185,129,0.3)' : colors.border,
                            minWidth: 64,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: isBoarded ? colors.successMid : colors.muted }}>
                            {isBoarded ? '✓ Boarded' : 'Board'}
                          </Text>
                        </TouchableOpacity>

                        {!isBoarded && (
                          <TouchableOpacity
                            onPress={() => !isSaving && markStudent(student.id, 'absent')}
                            disabled={isSaving}
                            activeOpacity={0.7}
                            style={{
                              paddingHorizontal: 10,
                              paddingVertical: 6,
                              borderRadius: 16,
                              backgroundColor: isAbsent ? colors.dangerBg : colors.borderLight,
                              borderWidth: 1,
                              borderColor: isAbsent ? 'rgba(239,68,68,0.3)' : colors.border,
                              minWidth: 56,
                              alignItems: 'center',
                            }}
                          >
                            <Text style={{ fontSize: 11, fontFamily: 'Inter_700Bold', color: isAbsent ? colors.danger : colors.muted }}>
                              {isAbsent ? '✕ Absent' : 'Absent'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )
                })}
              </View>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
