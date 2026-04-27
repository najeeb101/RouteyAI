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
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" glyph="H" focused={focused} /> }} />
      <Tabs.Screen name="map" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Map" glyph="M" focused={focused} /> }} />
      <Tabs.Screen
        name="notifications"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Alerts" glyph="A" focused={focused} activeColor={colors.info} /> }}
      />
    </Tabs>
  )
}
