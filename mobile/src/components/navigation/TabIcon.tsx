import type { ComponentProps } from 'react'
import { Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/lib/colors'

type IconName = ComponentProps<typeof Ionicons>['name']

type TabIconProps = {
  label: string
  /** Ionicons name; the filled version is used when the tab is active. */
  icon: IconName
  activeIcon?: IconName
  focused: boolean
  activeColor?: string
  /** Small count bubble, e.g. unread alerts. */
  badge?: number
}

export function TabIcon({ label, icon, activeIcon, focused, activeColor = colors.primary, badge = 0 }: TabIconProps) {
  const color = focused ? activeColor : colors.subtle

  return (
    <View style={{ alignItems: 'center', gap: 3, minWidth: 58 }}>
      <View
        style={{
          width: 44,
          height: 30,
          borderRadius: 15,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: focused ? `${activeColor}14` : 'transparent',
        }}
      >
        <Ionicons name={focused ? (activeIcon ?? icon) : icon} size={21} color={color} />
        {badge > 0 && (
          <View
            style={{
              position: 'absolute',
              top: -2,
              right: 4,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              paddingHorizontal: 4,
              backgroundColor: colors.danger,
              borderWidth: 2,
              borderColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 8, fontFamily: 'Inter_800ExtraBold' }}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        )}
      </View>
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
