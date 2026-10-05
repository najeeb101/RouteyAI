import type { PropsWithChildren } from 'react'
import { View, type ViewStyle } from 'react-native'
import { floatingShadow, radius, space, useTheme } from '@/lib/theme'

type CardProps = PropsWithChildren<{ style?: ViewStyle }>

/** A flat white card on the grey canvas: no border, no shadow. */
export function Card({ children, style }: CardProps) {
  const t = useTheme()
  return <View style={[{ backgroundColor: t.surface, borderRadius: radius.md, padding: space.lg }, style]}>{children}</View>
}

/** A card floating over the map (bottom card, chips): larger radius and the app's one shadow. */
export function FloatingCard({ children, style }: CardProps) {
  const t = useTheme()
  return <View style={[{ backgroundColor: t.surface, borderRadius: radius.lg, padding: space.lg }, floatingShadow, style]}>{children}</View>
}
