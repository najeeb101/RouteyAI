import { Tabs } from 'expo-router'
import { TabIcon } from '@/components/navigation/TabIcon'
import { colors } from '@/lib/colors'

export default function DriverLayout() {
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
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" icon="🚌" focused={focused} /> }} />
      <Tabs.Screen name="route" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Route" icon="🗺️" focused={focused} activeColor={colors.info} /> }} />
      <Tabs.Screen name="messages" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Messages" icon="💬" focused={focused} activeColor={colors.success} /> }} />
    </Tabs>
  )
}
