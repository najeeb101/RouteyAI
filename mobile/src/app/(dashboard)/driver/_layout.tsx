import { Tabs } from 'expo-router'
import { Bus, CircleUser, ListOrdered, MessageSquare } from 'lucide-react-native'
import { TabIcon } from '@/components/navigation/TabIcon'
import { tabBarStyle } from '@/components/navigation/tabBarStyle'
import { DriverDataProvider } from '@/features/driver/context/DriverDataContext'
import { useTheme } from '@/lib/theme'

export default function DriverLayout() {
  const t = useTheme()
  return (
    <DriverDataProvider>
      <Tabs screenOptions={{ headerShown: false, tabBarStyle: tabBarStyle(t), tabBarShowLabel: false, sceneStyle: { backgroundColor: t.canvas } }}>
        <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" icon={Bus} focused={focused} /> }} />
        <Tabs.Screen name="route" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Route" icon={ListOrdered} focused={focused} /> }} />
        <Tabs.Screen name="messages" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Messages" icon={MessageSquare} focused={focused} /> }} />
        <Tabs.Screen name="account" options={{ tabBarIcon: ({ focused }) => <TabIcon label="Account" icon={CircleUser} focused={focused} /> }} />
      </Tabs>
    </DriverDataProvider>
  )
}
