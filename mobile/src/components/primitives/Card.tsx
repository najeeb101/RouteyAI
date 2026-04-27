import type { PropsWithChildren } from 'react'
import { View, type ViewStyle } from 'react-native'
import { colors } from '@/lib/colors'

type CardProps = PropsWithChildren<{
  style?: ViewStyle
}>

export function Card({ children, style }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}
