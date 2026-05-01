import { Text, View } from 'react-native'
import { colors } from '@/lib/colors'

type TabIconProps = {
  label: string
  icon: string  // emoji or unicode icon
  focused: boolean
  activeColor?: string
}

export function TabIcon({ label, icon, focused, activeColor = colors.primary }: TabIconProps) {
  const color = focused ? activeColor : colors.subtle

  return (
    <View style={{ alignItems: 'center', gap: 3, minWidth: 54 }}>
      {focused && (
        <View
          style={{
            position: 'absolute',
            top: -8,
            width: 24,
            height: 3,
            borderRadius: 2,
            backgroundColor: activeColor,
          }}
        />
      )}
      <Text
        style={{
          fontSize: 22,
          color: focused ? activeColor : colors.subtle,
          opacity: focused ? 1 : 0.55,
        }}
      >
        {icon}
      </Text>
      <Text
        style={{
          fontSize: 10,
          color,
          fontFamily: focused ? 'Inter_700Bold' : 'Inter_500Medium',
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </View>
  )
}
