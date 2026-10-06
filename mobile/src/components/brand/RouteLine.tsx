import { View } from 'react-native'
import { Txt } from '@/components/primitives/Txt'
import { radius, space, useTheme } from '@/lib/theme'

type RouteLineProps = {
  /** Number of stops drawn. Long routes are capped so the dots stay readable. */
  stops: number
  /** How many stops from the start are reached (filled). */
  reached: number
  /** The stop the bus is at now, drawn as a larger ring. */
  current?: number
  /** Ring the last stop (the parent's stop, the school). */
  destination?: boolean
  onNight?: boolean
  startLabel?: string
  endLabel?: string
  accessibilityLabel: string
}

const MAX_STOPS = 12

/** Stops on a line, like the rings on the logo and the landing page's arrival card: reached stops filled, the rest hollow. */
export function RouteLine({ stops, reached, current, destination = false, onNight = false, startLabel, endLabel, accessibilityLabel }: RouteLineProps) {
  const t = useTheme()
  const count = Math.max(2, Math.min(stops, MAX_STOPS))
  const scale = stops > MAX_STOPS ? count / stops : 1
  const filled = Math.round(reached * scale)
  const at = current === undefined ? undefined : Math.min(count - 1, Math.round(current * scale))
  const on = onNight ? t.live : t.brand
  const off = onNight ? t.nightLine : t.separator
  const hole = onNight ? t.night : t.surface

  return (
    <View accessible accessibilityLabel={accessibilityLabel} style={{ gap: space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', height: 16 }}>
        {Array.from({ length: count }, (_, i) => {
          const isEnd = destination && i === count - 1
          const isCurrent = i === at
          const size = isCurrent || isEnd ? 14 : 10
          const done = i < filled && !isCurrent
          return (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', flex: i < count - 1 ? 1 : 0 }}>
              <View
                style={{
                  width: size,
                  height: size,
                  borderRadius: radius.full,
                  borderWidth: isCurrent || isEnd ? 3 : 2,
                  borderColor: done || isCurrent || isEnd ? on : off,
                  backgroundColor: done ? on : hole,
                }}
              />
              {i < count - 1 && <View style={{ flex: 1, height: 2, marginHorizontal: 2, borderRadius: 1, backgroundColor: i < filled - 1 || (at !== undefined && i < at) ? on : off }} />}
            </View>
          )
        })}
      </View>
      {(startLabel || endLabel) && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.md }}>
          <Txt variant="caption" tone={onNight ? 'onNightSecondary' : 'inkSecondary'} numberOfLines={1} style={{ flexShrink: 1 }}>
            {startLabel}
          </Txt>
          <Txt variant="caption" tone={onNight ? 'onNightSecondary' : 'inkSecondary'} numberOfLines={1} style={{ flexShrink: 1, textAlign: 'right' }}>
            {endLabel}
          </Txt>
        </View>
      )}
    </View>
  )
}
