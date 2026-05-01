import { Slot } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter'
import { View, Text, ActivityIndicator, Platform } from 'react-native'
import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { supabase } from '@/lib/supabase'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

async function registerForPushNotifications(): Promise<void> {
  if (!Device.isDevice) return

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    })
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }
  if (finalStatus !== 'granted') return

  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined
  if (!projectId || projectId === 'REPLACE_WITH_EAS_PROJECT_ID') return

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId })
    const { data: { user } } = await supabase.auth.getUser()
    if (user && token) {
      await supabase.from('user_roles')
        .update({ push_token: token })
        .eq('user_id', user.id)
    }
  } catch {
    // Push token registration is non-critical — fail silently
  }
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) registerForPushNotifications()
    })
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
