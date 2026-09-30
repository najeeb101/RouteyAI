import { useEffect, useMemo, useRef, useState, type ElementRef } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Mapbox from '@rnmapbox/maps'
import { Ionicons } from '@expo/vector-icons'
import { Banner } from '@/components/primitives/Banner'
import { ChildSwitcher } from '@/features/parent/components/ChildSwitcher'
import { CHILD_STATUS } from '@/features/parent/components/childStatus'
import { useParentContext } from '@/features/parent/context/ParentDataContext'
import { colors } from '@/lib/colors'
import { timeLabel } from '@/lib/dates'
import { boundsOf, decodePolyline } from '@/lib/geo'

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '')

const DOHA: [number, number] = [51.531, 25.2854]
/** Space the card at the bottom and the chips at the top take up, so the camera frames the route between them. */
const CARD_SPACE = 250

/**
 * Full-screen live map: the bus follows GPS updates, the child's stop is marked, and the card at the bottom
 * shows the arrival time and how many stops are left. Other children's stops are deliberately not drawn.
 */
export function ParentMapScreen() {
  const insets = useSafeAreaInsets()
  const { loading, error, children, child, selectChild, statusFor, status, attendance, routePoints, childPoint, encodedPolyline, busLocation, etaMinutes, stopsBefore } =
    useParentContext()
  const camera = useRef<ElementRef<typeof Mapbox.Camera>>(null)
  const [following, setFollowing] = useState(true)

  const line = useMemo<Array<[number, number]>>(
    () => (encodedPolyline ? decodePolyline(encodedPolyline) : routePoints.map((p) => [p.lng, p.lat])),
    [encodedPolyline, routePoints],
  )
  const bounds = useMemo(
    () => boundsOf(childPoint ? [...line, [childPoint.lng, childPoint.lat]] : line),
    [line, childPoint],
  )
  const topSpace = insets.top + (children.length > 1 ? 76 : 64)

  // Switching child frames their route again.
  useEffect(() => setFollowing(true), [child?.id])

  // Follow the bus while GPS is live; otherwise frame the whole route.
  useEffect(() => {
    if (!following) return
    if (busLocation) {
      camera.current?.setCamera({ centerCoordinate: [busLocation.lng, busLocation.lat], zoomLevel: 15, animationDuration: 900, animationMode: 'easeTo', padding: { paddingTop: topSpace, paddingBottom: CARD_SPACE, paddingLeft: 0, paddingRight: 0 } })
    } else if (bounds) {
      camera.current?.fitBounds(bounds.ne, bounds.sw, [topSpace + 20, 40, CARD_SPACE + 20, 40], 900)
    }
  }, [busLocation, bounds, following, topSpace])

  const meta = CHILD_STATUS[status]
  const record = child ? attendance[child.id] : undefined
  const first = child?.firstName ?? 'Your child'
  let headline = 'Not started'
  let detail = `${child?.busName ?? 'The bus'} hasn't started the route yet`
  if (status === 'boarded') {
    headline = 'On the bus'
    detail = record ? `Boarded at ${timeLabel(record.at)}` : `${first} is on the bus`
  } else if (status === 'absent') {
    headline = 'Absent today'
    detail = 'Marked absent by the driver'
  } else if (status === 'reported') {
    headline = 'Staying home'
    detail = 'You reported this absence'
  } else if (status === 'no-bus') {
    headline = 'No bus yet'
    detail = 'Your school hasn’t assigned a bus'
  } else if (etaMinutes !== null) {
    headline = etaMinutes <= 1 ? 'Arriving now' : `${etaMinutes} min away`
    detail = stopsBefore === null || stopsBefore === 0 ? 'Your stop is next' : `${stopsBefore} stop${stopsBefore === 1 ? '' : 's'} before yours`
  } else if (busLocation) {
    headline = 'On the way'
    detail = 'Waiting for the next GPS update'
  }

  const lineColor = child?.busColor ?? colors.primary

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Mapbox.MapView
        style={{ flex: 1 }}
        styleURL={Mapbox.StyleURL.Street}
        scaleBarEnabled={false}
        logoPosition={{ bottom: CARD_SPACE - 30, left: 12 }}
        attributionPosition={{ bottom: CARD_SPACE - 30, right: 12 }}
        onCameraChanged={(state) => {
          if (state.gestures.isGestureActive) setFollowing(false)
        }}
      >
        <Mapbox.Camera ref={camera} defaultSettings={{ centerCoordinate: DOHA, zoomLevel: 11 }} />

        {line.length > 1 && (
          <Mapbox.ShapeSource id="route" shape={{ type: 'Feature', geometry: { type: 'LineString', coordinates: line }, properties: {} }}>
            <Mapbox.LineLayer id="route-casing" style={{ lineColor: '#FFFFFF', lineWidth: 9, lineCap: 'round', lineJoin: 'round' }} />
            <Mapbox.LineLayer id="route-line" aboveLayerID="route-casing" style={{ lineColor, lineWidth: 5, lineCap: 'round', lineJoin: 'round' }} />
          </Mapbox.ShapeSource>
        )}

        {childPoint && (
          <Mapbox.MarkerView id="child-stop" coordinate={[childPoint.lng, childPoint.lat]} anchor={{ x: 0.5, y: 1 }} allowOverlap>
            <View style={{ alignItems: 'center' }}>
              <View style={{ backgroundColor: colors.dark, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 4 }}>
                <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 11 }}>{first}&apos;s stop</Text>
              </View>
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.warning, borderWidth: 3, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', ...markerShadow }}>
                <Ionicons name="home" size={14} color="#FFFFFF" />
              </View>
            </View>
          </Mapbox.MarkerView>
        )}

        {busLocation && (
          <Mapbox.MarkerView id="bus" coordinate={[busLocation.lng, busLocation.lat]} allowOverlap>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${lineColor}33`, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: lineColor, borderWidth: 3, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', ...markerShadow }}>
                <Ionicons name="bus" size={14} color="#FFFFFF" />
              </View>
            </View>
          </Mapbox.MarkerView>
        )}
      </Mapbox.MapView>

      {/* Top: child chips and GPS state */}
      <View style={{ position: 'absolute', top: insets.top + 10, left: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ flex: 1 }}>
          {children.length > 1 ? (
            <ChildSwitcher items={children} selectedId={child?.id ?? null} statusFor={statusFor} onSelect={selectChild} variant="light" />
          ) : (
            <View style={floatingPill}>
              <Ionicons name="navigate" size={15} color={colors.primary} />
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: colors.dark }}>Live map</Text>
            </View>
          )}
        </View>
        <View style={floatingPill}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: busLocation ? colors.success : colors.subtle }} />
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: colors.dark }}>{busLocation ? 'GPS live' : 'No GPS'}</Text>
        </View>
      </View>

      {/* Recenter */}
      {!following && (
        <TouchableOpacity
          onPress={() => setFollowing(true)}
          accessibilityLabel={busLocation ? 'Follow the bus' : 'Show the whole route'}
          style={{ position: 'absolute', right: 16, bottom: CARD_SPACE - 4, width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', ...markerShadow }}
        >
          <Ionicons name="locate" size={22} color={colors.primary} />
        </TouchableOpacity>
      )}

      {/* Bottom card */}
      <View
        style={{
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 12,
          backgroundColor: colors.surface,
          borderRadius: 24,
          padding: 18,
          gap: 14,
          shadowColor: colors.dark,
          shadowOpacity: 0.18,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 10,
        }}
      >
        {error && <Banner text={error} />}
        {loading && !child ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 }}>
            <ActivityIndicator color={colors.primary} />
            <Text style={{ fontFamily: 'Inter_500Medium', color: colors.muted }}>Loading the route…</Text>
          </View>
        ) : child ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 24, color: colors.dark, letterSpacing: -0.6 }}>{headline}</Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.muted, marginTop: 2 }}>{detail}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: meta.bg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                <Ionicons name={meta.icon} size={13} color={meta.color} />
                <Text style={{ color: meta.color, fontSize: 12, fontFamily: 'Inter_700Bold' }}>{meta.label}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <InfoTile icon="bus-outline" label="Bus" value={child.busName ?? 'Not assigned'} />
              <InfoTile icon="home-outline" label="Stop" value={child.homeAddress} />
            </View>
          </>
        ) : null}
      </View>
    </View>
  )
}

function InfoTile({ icon, label, value }: { icon: 'bus-outline' | 'home-outline'; label: string; value: string }) {
  return (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.background, borderRadius: 14, padding: 10 }}>
      <Ionicons name={icon} size={18} color={colors.primaryLight} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 10.5, color: colors.subtle, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</Text>
        <Text style={{ fontSize: 13, color: colors.dark, fontFamily: 'Inter_700Bold' }} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  )
}

const markerShadow = {
  shadowColor: '#000000',
  shadowOpacity: 0.25,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
  elevation: 4,
}

const floatingPill = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  alignSelf: 'flex-start' as const,
  gap: 7,
  backgroundColor: '#FFFFFF',
  paddingHorizontal: 14,
  height: 40,
  borderRadius: 20,
  shadowColor: colors.dark,
  shadowOpacity: 0.12,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 3 },
  elevation: 3,
}
