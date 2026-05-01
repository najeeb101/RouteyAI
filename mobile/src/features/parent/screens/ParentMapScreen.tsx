import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Mapbox from '@rnmapbox/maps'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { StatusPill } from '@/components/primitives/StatusPill'
import { colors } from '@/lib/colors'
import { useParentData } from './useParentData'

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '')

function decodePolyline(encoded: string): Array<[number, number]> {
  let index = 0; let lat = 0; let lng = 0
  const coordinates: Array<[number, number]> = []
  while (index < encoded.length) {
    let shift = 0; let result = 0; let byte: number
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5 } while (byte >= 0x20)
    const dLat = (result & 1) ? ~(result >> 1) : (result >> 1); lat += dLat
    shift = 0; result = 0
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5 } while (byte >= 0x20)
    const dLng = (result & 1) ? ~(result >> 1) : (result >> 1); lng += dLng
    coordinates.push([lng / 1e5, lat / 1e5])
  }
  return coordinates
}

const attendanceTone: Record<string, { label: string; color: string; bg: string }> = {
  boarded:  { label: 'On Bus',   color: colors.success, bg: colors.successBg },
  absent:   { label: 'Absent',   color: colors.danger,  bg: colors.dangerBg },
  pending:  { label: 'Waiting',  color: colors.warning, bg: colors.warningBg },
}

export function ParentMapScreen() {
  const { loading, error, child, routePoints, encodedPolyline, busLocation, attendanceStatus } = useParentData()
  const mapCoordinates = encodedPolyline
    ? decodePolyline(encodedPolyline)
    : routePoints.map((p) => [p.lng, p.lat] as [number, number])
  const mapCenter = busLocation ? [busLocation.lng, busLocation.lat] as [number, number] : (mapCoordinates[0] ?? [51.531, 25.2854])
  const childPoint = child ? routePoints.find((p) => p.studentId === child.id) : undefined
  const statusInfo = attendanceTone[attendanceStatus ?? 'pending'] ?? attendanceTone.pending

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        back
        title="Live Tracking"
        subtitle={`${child?.busName ?? 'Bus'} · Morning Route`}
        action={<StatusPill label={busLocation ? 'Live' : 'Waiting'} tone={busLocation ? 'success' : 'warning'} />}
      />

      {/* Map — with floating overlay */}
      <View style={{ height: 300, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Mapbox.MapView style={{ flex: 1 }} styleURL={Mapbox.StyleURL.Street}>
          <Mapbox.Camera centerCoordinate={mapCenter} zoomLevel={11} animationMode="flyTo" animationDuration={800} />

          {mapCoordinates.length > 0 && (
            <Mapbox.ShapeSource id="parent-route-line" shape={{ type: 'Feature', geometry: { type: 'LineString', coordinates: mapCoordinates }, properties: {} }}>
              <Mapbox.LineLayer id="parent-route-line-layer" style={{ lineColor: colors.primary, lineWidth: 4, lineOpacity: 0.85, lineCap: 'round', lineJoin: 'round' }} />
            </Mapbox.ShapeSource>
          )}

          {routePoints.length > 0 && (
            <Mapbox.ShapeSource
              id="parent-route-stops"
              shape={{ type: 'FeatureCollection', features: routePoints.map((p) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [p.lng, p.lat] }, properties: {} })) }}
            >
              <Mapbox.CircleLayer id="parent-route-stops-layer" style={{ circleRadius: 5, circleColor: colors.primaryLight, circleStrokeColor: '#FFFFFF', circleStrokeWidth: 2 }} />
            </Mapbox.ShapeSource>
          )}

          {childPoint && (
            <Mapbox.PointAnnotation id="child-stop" coordinate={[childPoint.lng, childPoint.lat]}>
              <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: colors.warning, borderWidth: 2.5, borderColor: '#FFFFFF', shadowColor: colors.warning, shadowOpacity: 0.5, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } }} />
            </Mapbox.PointAnnotation>
          )}

          {busLocation && (
            <Mapbox.PointAnnotation id="bus-live" coordinate={[busLocation.lng, busLocation.lat]}>
              <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: child?.busColor ?? colors.primary, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}>
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontFamily: 'Inter_800ExtraBold' }}>{child?.busName ?? 'BUS'}</Text>
              </View>
            </Mapbox.PointAnnotation>
          )}
        </Mapbox.MapView>

        {/* Floating info strip at bottom of map */}
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
            gap: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 16 }}>🚌</Text>
            <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 13 }}>
              {child?.busName ?? 'Bus'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: busLocation ? colors.success : colors.warning }} />
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_500Medium', fontSize: 12 }}>
              {busLocation ? 'GPS Live' : 'Locating...'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>
        {error && (
          <View style={{ borderColor: '#FECACA', borderWidth: 1, backgroundColor: '#FEF2F2', borderRadius: 14, padding: 14, flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 16 }}>❌</Text>
            <Text style={{ color: '#B91C1C', fontSize: 12, fontFamily: 'Inter_600SemiBold', flex: 1 }}>{error}</Text>
          </View>
        )}

        {loading && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16 }}>
            <Text style={{ fontFamily: 'Inter_500Medium', color: colors.subtle }}>Loading live data...</Text>
          </View>
        )}

        {!loading && (
          <>
            {/* Child status card */}
            <View style={infoCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: colors.dark }}>{child?.name ?? 'Your Child'}</Text>
                <View style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: statusInfo.bg }}>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: statusInfo.color }}>{statusInfo.label}</Text>
                </View>
              </View>

              <View style={{ gap: 10 }}>
                <InfoRow icon="🚌" label="Bus" value={child?.busName ?? 'Unassigned'} />
                <InfoRow icon="📍" label="GPS" value={busLocation ? 'Live tracking active' : 'Waiting for GPS updates'} valueColor={busLocation ? colors.success : colors.subtle} />
                <InfoRow icon="🛑" label="Stops" value={`${routePoints.length} on this route`} />
              </View>
            </View>

            {/* Legend */}
            <View style={{ ...infoCard, flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
              <LegendItem color={colors.primary} label="Route" />
              <LegendItem color={colors.warning} label="Your stop" />
              <LegendItem color={child?.busColor ?? colors.primary} label="Bus" />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function InfoRow({ icon, label, value, valueColor }: { icon: string; label: string; value: string; valueColor?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Text style={{ fontSize: 15, width: 22, textAlign: 'center' }}>{icon}</Text>
      <Text style={{ fontSize: 12, color: colors.subtle, fontFamily: 'Inter_500Medium', width: 52 }}>{label}</Text>
      <Text style={{ fontSize: 13, color: valueColor ?? colors.dark, fontFamily: 'Inter_600SemiBold', flex: 1 }}>{value}</Text>
    </View>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <Text style={{ fontSize: 12, color: colors.muted, fontFamily: 'Inter_500Medium' }}>{label}</Text>
    </View>
  )
}

const infoCard = {
  backgroundColor: colors.surface,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: colors.border,
  padding: 16,
  shadowColor: colors.dark,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
}
