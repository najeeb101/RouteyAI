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
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
          shadowColor: colors.dark,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}
