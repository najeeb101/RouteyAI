import { Tabs } from 'expo-router'
import { TabIcon } from '@/components/navigation/TabIcon'
import { tabBarStyle } from '@/components/navigation/tabBarStyle'
import { DriverDataProvider } from '@/features/driver/context/DriverDataContext'

export default function DriverLayout() {
  return (
    <DriverDataProvider>
      <Tabs screenOptions={{ headerShown: false, tabBarStyle, tabBarShowLabel: false }}>
        <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" icon="bus-outline" activeIcon="bus" focused={focused} /> }} />
        <Tabs.Screen name="route" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Route" icon="list-outline" activeIcon="list" focused={focused} /> }} />
        <Tabs.Screen name="messages" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Messages" icon="chatbubbles-outline" activeIcon="chatbubbles" focused={focused} /> }} />
        <Tabs.Screen name="account" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Account" icon="person-circle-outline" activeIcon="person-circle" focused={focused} /> }} />
      </Tabs>
    </DriverDataProvider>
  )
}
