import { Tabs } from 'expo-router'
import { Bell, CalendarClock, CircleUser, House, Navigation } from 'lucide-react-native'
import { TabIcon } from '@/components/navigation/TabIcon'
import { tabBarStyle } from '@/components/navigation/tabBarStyle'
import { ParentDataProvider } from '@/features/parent/context/ParentDataContext'
import { useTheme } from '@/lib/theme'

export default function ParentLayout() {
  const t = useTheme()
  return (
    <ParentDataProvider>
      <Tabs screenOptions={{ headerShown: false, tabBarStyle: tabBarStyle(t), tabBarShowLabel: false, sceneStyle: { backgroundColor: t.canvas } }}>
        <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" icon={House} focused={focused} /> }} />
        <Tabs.Screen name="map" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Track" icon={Navigation} focused={focused} /> }} />
        <Tabs.Screen name="history" options={{ tabBarIcon: ({ focused }) => <TabIcon label="History" icon={CalendarClock} focused={focused} /> }} />
        <Tabs.Screen name="notifications" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Alerts" icon={Bell} focused={focused} /> }} />
        <Tabs.Screen name="account" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Account" icon={CircleUser} focused={focused} /> }} />
      </Tabs>
    </ParentDataProvider>
  )
}
