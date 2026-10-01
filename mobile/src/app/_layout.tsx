import { Slot } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter'
import { View, Text, ActivityIndicator } from 'react-native'
import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'
import { registerForPushNotifications } from '@/lib/push'
import { supabase } from '@/lib/supabase'
// Defines the driver's background GPS task; it has to exist before the OS hands it a location.
import '@/features/driver/gpsTask'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  })

  // Save this phone's push token whenever someone is signed in (on launch and right after logging in).
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) registerForPushNotifications()
    })
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') registerForPushNotifications()
    })
    return () => data.subscription.unsubscribe()
  }, [])

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A', gap: 16 }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            backgroundColor: '#1E3A8A',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#00D4FF',
            shadowOpacity: 0.4,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 6 },
          }}
        >
          <Text style={{ fontSize: 34 }}>🚌</Text>
        </View>
        <ActivityIndicator color="#00D4FF" size="small" />
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Slot />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
