import type { PropsWithChildren } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg'
import { radius, space, useTheme } from '@/lib/theme'

/**
 * The one navy card per screen (the driver's current stop, the parent's arrival time, the finished route), so each
 * screen has a RouteyAI moment instead of being white throughout. Text on it uses the onNight tones and buttons the
 * onNight variant.
 */
export function SignatureCard({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  const t = useTheme()
  return (
    <View style={[{ backgroundColor: t.night, borderRadius: radius.lg, padding: space.xl, overflow: 'hidden' }, style]}>
      <NightGlow />
      {children}
    </View>
  )
}

/** A soft blue glow from the top right of a navy surface, behind the content. */
export function NightGlow() {
  const t = useTheme()
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="glow" cx="100%" cy="0%" rx="85%" ry="95%" fx="100%" fy="0%">
            <Stop offset="0" stopColor={t.nightGlow} stopOpacity={0.55} />
            <Stop offset="1" stopColor={t.nightGlow} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#glow)" />
      </Svg>
    </View>
  )
}

/** Where the motif's line runs, in its own 210 × 150 box: place it so this height lines up with what it points at. */
export const ROUTE_MOTIF_LINE_Y = 88

/**
 * The logo's idea drawn large as decoration on the login panel: a route that fades in, passes a stop ring and turns up
 * to a second one, blue to cyan.
 */
export function RouteMotif({ scale = 1, opacity = 0.5, style }: { scale?: number; opacity?: number; style?: ViewStyle }) {
  const t = useTheme()
  return (
    <Svg width={210 * scale} height={150 * scale} viewBox="0 0 210 150" style={[{ opacity }, style]} pointerEvents="none">
      <Defs>
        <LinearGradient id="route" x1="0" y1="0" x2="210" y2="0" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={t.routeStart} stopOpacity={0} />
          <Stop offset="0.4" stopColor={t.routeStart} stopOpacity={1} />
          <Stop offset="1" stopColor={t.routeEnd} stopOpacity={1} />
        </LinearGradient>
      </Defs>
      <Path d="M0 88 H112 M136 88 C160 86 176 66 179 38" stroke="url(#route)" strokeWidth={7} strokeLinecap="round" fill="none" />
      <Circle cx={124} cy={88} r={12} stroke="url(#route)" strokeWidth={7} fill="none" />
      <Circle cx={180} cy={26} r={12} stroke="url(#route)" strokeWidth={7} fill="none" />
    </Svg>
  )
}
