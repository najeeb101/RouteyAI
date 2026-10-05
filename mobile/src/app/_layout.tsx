import { Slot } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter'
import { SchibstedGrotesk_700Bold } from '@expo-google-fonts/schibsted-grotesk'
import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'
import * as SplashScreen from 'expo-splash-screen'
import { registerForPushNotifications } from '@/lib/push'
import { supabase } from '@/lib/supabase'
// Defines the driver's background GPS task; it has to exist before the OS hands it a location.
import '@/features/driver/gpsTask'

// Keep the splash screen up until the fonts are ready, so the first screen draws in Inter.
SplashScreen.preventAutoHideAsync()

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    // Headings and big numbers, the landing page's display face (lib/theme).
    SchibstedGrotesk_700Bold,
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

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Slot />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
