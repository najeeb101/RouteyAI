import { Tabs } from 'expo-router'
import { TabIcon } from '@/components/navigation/TabIcon'
import { colors } from '@/lib/colors'

export default function ParentLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 76,
          paddingBottom: 12,
          paddingTop: 10,
          shadowColor: colors.dark,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" icon="🏠" focused={focused} /> }} />
      <Tabs.Screen name="map" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Track" icon="📍" focused={focused} activeColor={colors.info} /> }} />
      <Tabs.Screen
        name="notifications"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Alerts" icon="🔔" focused={focused} activeColor={colors.warning} /> }}
      />
    </Tabs>
  )
}
