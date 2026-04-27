import { Text, View } from 'react-native'
import { colors } from '@/lib/colors'

type TabIconProps = {
  label: string
  glyph: string
  focused: boolean
  activeColor?: string
}

export function TabIcon({ label, glyph, focused, activeColor = colors.primary }: TabIconProps) {
  const color = focused ? activeColor : colors.subtle

  return (
    <View style={{ alignItems: 'center', gap: 2, minWidth: 54 }}>
      <Text style={{ fontSize: 16, color, fontFamily: 'Inter_800ExtraBold' }}>{glyph}</Text>
      <Text style={{ fontSize: 10, color, fontFamily: 'Inter_600SemiBold' }}>{label}</Text>
    </View>
  )
}
