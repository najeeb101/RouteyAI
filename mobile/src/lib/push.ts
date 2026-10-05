import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { supabase } from '@/lib/supabase'
import { storage } from '@/lib/storage'

/** Set when the user turns notifications off in Account, so the app doesn't turn them back on at the next launch. */
const OPT_OUT_KEY = 'routeyai.push-opt-out'

export async function isPushOptedOut(): Promise<boolean> {
  try {
    return (await storage.getItem(OPT_OUT_KEY)) === '1'
  } catch {
    return false
  }
}

/** The Account screen switch: saves the choice, then saves or clears the token. Returns whether push is now on. */
export async function setPushEnabled(enabled: boolean): Promise<boolean> {
  try {
    if (enabled) await storage.removeItem(OPT_OUT_KEY)
    else await storage.setItem(OPT_OUT_KEY, '1')
  } catch {
    // The choice still applies for this session.
  }
  if (!enabled) {
    await clearPushToken()
    return false
  }
  return registerForPushNotifications({ force: true })
}

/**
 * Asks for permission and saves this phone's Expo push token for the signed-in user (unless they turned push off).
 * Returns false when notifications can't be turned on (simulator, permission denied, no EAS project yet).
 */
export async function registerForPushNotifications({ force = false }: { force?: boolean } = {}): Promise<boolean> {
  if (!Device.isDevice) return false
  if (!force && (await isPushOptedOut())) return false

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
  if (finalStatus !== 'granted') return false

  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined
  if (!projectId || projectId === 'REPLACE_WITH_EAS_PROJECT_ID') return false

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId })
    if (!token) return false
    // user_roles has no UPDATE policy for parents and drivers; this RPC only touches the caller's push_token.
    const { error } = await supabase.rpc('set_push_token', { p_token: token })
    return !error
  } catch {
    return false
  }
}

/** Stops push notifications to this account (used by the settings switch and on sign out). */
export async function clearPushToken(): Promise<boolean> {
  const { error } = await supabase.rpc('set_push_token', { p_token: null })
  return !error
}

/** Whether the signed-in account currently has a push token saved. */
export async function hasPushToken(): Promise<boolean> {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return false
  const { data, error } = await supabase.from('user_roles').select('push_token').eq('user_id', auth.user.id).maybeSingle()
  if (error) return false
  return Boolean((data as { push_token?: string | null } | null)?.push_token)
}
