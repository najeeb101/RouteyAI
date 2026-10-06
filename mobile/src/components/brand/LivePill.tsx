import { useEffect, useRef } from 'react'
import { AccessibilityInfo, Animated, Easing, View, type ViewStyle } from 'react-native'
import { Txt } from '@/components/primitives/Txt'
import { floatingShadow, radius, space, useTheme } from '@/lib/theme'

/** A cyan dot with a ring that pulses outwards, like the landing page's live bus tag. Still when Reduce Motion is on. */
export function LiveDot({ size = 8 }: { size?: number }) {
  const t = useTheme()
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    let cancelled = false
    let loop: Animated.CompositeAnimation | undefined
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduce) => {
        if (cancelled || reduce) return
        loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true }))
        loop.start()
      })
      .catch(() => {})
    return () => {
      cancelled = true
      loop?.stop()
    }
  }, [pulse])

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: radius.full,
          backgroundColor: t.live,
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
          transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] }) }],
        }}
      />
      <View style={{ width: size, height: size, borderRadius: radius.full, backgroundColor: t.live }} />
    </View>
  )
}

/**
 * "Live" with a pulsing dot. On the canvas or the map it is a small navy pill (the landing page's bus tag); on the navy
 * signature card it is just the dot and the word.
 */
export function LivePill({ label = 'Live', onNight = false, floating = false, style }: { label?: string; onNight?: boolean; floating?: boolean; style?: ViewStyle }) {
  const t = useTheme()
  return (
    <View
      accessible
      accessibilityLabel={label}
      style={[
        { flexDirection: 'row', alignItems: 'center', gap: space.sm, alignSelf: 'flex-start' },
        onNight ? null : { backgroundColor: t.night, paddingLeft: space.md, paddingRight: space.md + 2, height: floating ? 44 : 30, borderRadius: radius.full },
        floating ? floatingShadow : null,
        style,
      ]}
    >
      <LiveDot />
      <Txt variant="subhead" tone="onNight">
        {label}
      </Txt>
    </View>
  )
}
