import { Tabs } from 'expo-router'
import { TabIcon } from '@/components/navigation/TabIcon'
import { colors } from '@/lib/colors'
import { ParentDataProvider } from '@/features/parent/context/ParentDataContext'
import { tabBarStyle } from '@/components/navigation/tabBarStyle'

export default function ParentLayout() {
  return (
    <ParentDataProvider>
      <Tabs screenOptions={{ headerShown: false, tabBarStyle, tabBarShowLabel: false }}>
        <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" icon="home-outline" activeIcon="home" focused={focused} /> }} />
        <Tabs.Screen name="map" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Track" icon="navigate-outline" activeIcon="navigate" focused={focused} /> }} />
        <Tabs.Screen name="history" options={{ tabBarIcon: ({ focused }) => <TabIcon label="History" icon="time-outline" activeIcon="time" focused={focused} /> }} />
        <Tabs.Screen
          name="notifications"
          options={{ tabBarIcon: ({ focused }) => <TabIcon label="Alerts" icon="notifications-outline" activeIcon="notifications" focused={focused} activeColor={colors.primaryLight} /> }}
        />
        <Tabs.Screen name="account" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Account" icon="person-circle-outline" activeIcon="person-circle" focused={focused} /> }} />
      </Tabs>
    </ParentDataProvider>
  )
}
