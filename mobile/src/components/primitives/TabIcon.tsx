import { Text, View } from 'react-native'
import { colors } from '@/lib/colors'

type TabIconProps = {
  label: string
  icon: string
  focused: boolean
  activeColor?: string
}

export function TabIcon({ label, icon, focused, activeColor = colors.primary }: TabIconProps) {
  return (
    <View style={{ alignItems: 'center', gap: 3, minWidth: 54, paddingTop: focused ? 0 : 3 }}>
      {focused && (
        <View
          style={{
            position: 'absolute',
            top: -8,
            width: 28,
            height: 3,
            borderRadius: 1.5,
            backgroundColor: activeColor,
          }}
        />
      )}
      <View style={{
        width: 40,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? `${activeColor}18` : 'transparent',
      }}>
        <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{icon}</Text>
      </View>
      <Text
        style={{
          fontSize: 10,
          color: focused ? activeColor : colors.subtle,
          fontFamily: focused ? 'Inter_700Bold' : 'Inter_400Regular',
          letterSpacing: 0.1,
        }}
      >
        {label}
      </Text>
    </View>
  )
}
