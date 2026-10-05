import { useEffect, useMemo, useRef, useState, type ElementRef, type ReactNode } from 'react'
import { ActivityIndicator, Pressable, useColorScheme, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Bus, House, LocateFixed } from 'lucide-react-native'
import { Banner } from '@/components/primitives/Banner'
import { FloatingCard } from '@/components/primitives/Card'
import { Icon } from '@/components/primitives/Icon'
import { MapPlaceholder } from '@/components/primitives/MapPlaceholder'
import { StatusText } from '@/components/primitives/StatusText'
import { Txt } from '@/components/primitives/Txt'
import { ChildSwitcher } from '@/features/parent/components/ChildSwitcher'
import { CHILD_STATUS } from '@/features/parent/components/childStatus'
import { useParentContext } from '@/features/parent/context/ParentDataContext'
import { timeLabel } from '@/lib/dates'
import { boundsOf, decodePolyline } from '@/lib/geo'
import { Mapbox } from '@/lib/mapbox'
import { mapStyleJSON, ROUTE_LINE } from '@/lib/mapStyle'
import { floatingShadow, fonts, radius, space, useTheme } from '@/lib/theme'

const DOHA: [number, number] = [51.531, 25.2854]
/** Space the card at the bottom and the chips at the top take up, so the camera frames the route between them. */
const CARD_SPACE = 230

/**
 * Full-screen live map: the bus follows GPS updates, the child's stop is marked, and the card at the bottom
 * shows the arrival time and how many stops are left. Other children's stops are deliberately not drawn.
 */
export function ParentMapScreen() {
  const insets = useSafeAreaInsets()
  const t = useTheme()
  const { loading, error, children, child, selectChild, statusFor, status, attendance, routePoints, childPoint, encodedPolyline, busLocation, etaMinutes, stopsBefore } =
    useParentContext()
  const camera = useRef<ElementRef<NonNullable<typeof Mapbox>['Camera']>>(null)
  const [following, setFollowing] = useState(true)

  const line = useMemo<Array<[number, number]>>(
    () => (encodedPolyline ? decodePolyline(encodedPolyline) : routePoints.map((p) => [p.lng, p.lat])),
    [encodedPolyline, routePoints],
  )
  const bounds = useMemo(
    () => boundsOf(childPoint ? [...line, [childPoint.lng, childPoint.lat]] : line),
    [line, childPoint],
  )
  const topSpace = insets.top + 64

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

  // The map follows the phone's light or dark setting (Google Maps-style palette, see lib/mapStyle).
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'
  const lineColor = child?.busColor ?? ROUTE_LINE[scheme].line

  return (
    <View style={{ flex: 1, backgroundColor: t.canvas }}>
      {Mapbox ? (
        <Mapbox.MapView
          style={{ flex: 1 }}
          styleJSON={mapStyleJSON(scheme)}
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
              <Mapbox.LineLayer id="route-casing" style={{ lineColor: ROUTE_LINE[scheme].casing, lineWidth: 9, lineCap: 'round', lineJoin: 'round' }} />
              <Mapbox.LineLayer id="route-line" aboveLayerID="route-casing" style={{ lineColor, lineWidth: 5, lineCap: 'round', lineJoin: 'round' }} />
            </Mapbox.ShapeSource>
          )}

          {childPoint && (
            <Mapbox.MarkerView id="child-stop" coordinate={[childPoint.lng, childPoint.lat]} anchor={{ x: 0.5, y: 1 }} allowOverlap>
              <View style={{ alignItems: 'center', gap: space.xs }}>
                <View style={[{ backgroundColor: t.surface, borderRadius: radius.sm, paddingHorizontal: space.sm, paddingVertical: 3 }, floatingShadow]}>
                  <Txt variant="caption" style={{ fontFamily: fonts.semibold }}>
                    {first}&apos;s stop
                  </Txt>
                </View>
                <MapPin color={t.ink} icon={House} />
              </View>
            </Mapbox.MarkerView>
          )}

          {busLocation && (
            <Mapbox.MarkerView id="bus" coordinate={[busLocation.lng, busLocation.lat]} allowOverlap>
              <MapPin color={lineColor} icon={Bus} />
            </Mapbox.MarkerView>
          )}
        </Mapbox.MapView>
      ) : (
        <MapPlaceholder />
      )}

      {/* Top: child switcher and GPS state */}
      <View style={{ position: 'absolute', top: insets.top + space.sm, left: space.md, right: space.md, flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <View style={{ flex: 1 }}>
          {children.length > 1 ? (
            <ChildSwitcher items={children} selectedId={child?.id ?? null} statusFor={statusFor} onSelect={selectChild} variant="floating" />
          ) : (
            <FloatingPill>
              <Txt variant="headline">{child?.firstName ?? 'Live map'}</Txt>
            </FloatingPill>
          )}
        </View>
        <FloatingPill>
          <StatusText label={busLocation ? 'Live' : 'No GPS'} tone={busLocation ? 'live' : 'neutral'} />
        </FloatingPill>
      </View>

      {/* Recenter */}
      {!following && (
        <Pressable
          onPress={() => setFollowing(true)}
          accessibilityRole="button"
          accessibilityLabel={busLocation ? 'Follow the bus' : 'Show the whole route'}
          style={({ pressed }) => [
            { position: 'absolute', right: space.lg, bottom: CARD_SPACE, width: 48, height: 48, borderRadius: radius.full, backgroundColor: pressed ? t.canvas : t.surface, alignItems: 'center', justifyContent: 'center' },
            floatingShadow,
          ]}
        >
          <Icon icon={LocateFixed} size={22} color={t.brand} />
        </Pressable>
      )}

      {/* Bottom card */}
      <FloatingCard style={{ position: 'absolute', left: space.md, right: space.md, bottom: space.md, gap: space.lg }}>
        {error && <Banner text={error} />}
        {loading && !child ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm }}>
            <ActivityIndicator color={t.brand} />
            <Txt variant="body" tone="inkSecondary">
              Loading the route…
            </Txt>
          </View>
        ) : child ? (
          <>
            <View style={{ gap: space.xs }}>
              <StatusText label={meta.label} tone={meta.tone} />
              <Txt variant="largeTitle" numberOfLines={1} adjustsFontSizeToFit>
                {headline}
              </Txt>
              <Txt variant="body" tone="inkSecondary">
                {detail}
              </Txt>
            </View>
            <View style={{ height: 1, backgroundColor: t.separator }} />
            <View style={{ flexDirection: 'row', gap: space.lg }}>
              <Detail icon={Bus} value={child.busName ?? 'Not assigned'} />
              <Detail icon={House} value={child.homeAddress} />
            </View>
          </>
        ) : null}
      </FloatingCard>
    </View>
  )
}

function FloatingPill({ children }: { children: ReactNode }) {
  const t = useTheme()
  return (
    <View style={[{ justifyContent: 'center', alignSelf: 'flex-start', backgroundColor: t.surface, paddingHorizontal: space.lg, height: 44, borderRadius: radius.md }, floatingShadow]}>
      {children}
    </View>
  )
}

function Detail({ icon, value }: { icon: typeof Bus; value: string }) {
  const t = useTheme()
  return (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
      <Icon icon={icon} size={18} color={t.inkSecondary} />
      <Txt variant="bodyMedium" numberOfLines={1} style={{ flex: 1 }}>
        {value}
      </Txt>
    </View>
  )
}

/** A white-ringed circle marker with an icon, coloured by the route or the stop. */
function MapPin({ color, icon }: { color: string; icon: typeof Bus }) {
  const t = useTheme()
  return (
    <View style={[{ width: 32, height: 32, borderRadius: radius.full, backgroundColor: color, borderWidth: 3, borderColor: t.surface, alignItems: 'center', justifyContent: 'center' }, floatingShadow]}>
      <Icon icon={icon} size={15} color={t.onBrand} strokeWidth={2.25} />
    </View>
  )
}
