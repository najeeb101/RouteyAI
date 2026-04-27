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
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" glyph="H" focused={focused} /> }} />
      <Tabs.Screen name="route" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Route" glyph="R" focused={focused} /> }} />
      <Tabs.Screen name="messages" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Messages" glyph="M" focused={focused} /> }} />
    </Tabs>
  )
}
