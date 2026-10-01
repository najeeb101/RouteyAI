import { useEffect, useState, type ComponentProps } from 'react'
import { Alert, Linking, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { Ionicons } from '@expo/vector-icons'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { colors } from '@/lib/colors'
import { routes } from '@/lib/navigation/routes'
import { clearPushToken, hasPushToken, isPushOptedOut, setPushEnabled } from '@/lib/push'
import { supabase } from '@/lib/supabase'
import { stopBackgroundGps } from '@/features/driver/gpsTask'

type IconName = ComponentProps<typeof Ionicons>['name']

export type AccountRow = { icon: IconName; label: string; value: string }
export type AccountSection = { title: string; rows: AccountRow[] }

const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL ?? 'https://routeyai.vercel.app'

type AccountScreenProps = {
  role: 'parent' | 'driver'
  name: string | null
  email: string | null
  /** Role-specific details, e.g. the parent's children or the driver's bus. */
  sections: AccountSection[]
  /** What push notifications are used for, shown under the switch. */
  notificationHint: string
}

/** Profile, notification switch, legal links and sign out. Shared by the parent and driver apps. */
export function AccountScreen({ role, name, email, sections, notificationHint }: AccountScreenProps) {
  const router = useRouter()
  const [pushOn, setPushOn] = useState<boolean | null>(null)
  const [pushBusy, setPushBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([hasPushToken(), isPushOptedOut()]).then(([token, optedOut]) => {
      if (!cancelled) setPushOn(token && !optedOut)
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function togglePush(next: boolean) {
    setPushBusy(true)
    const on = await setPushEnabled(next)
    setPushBusy(false)
    setPushOn(on)
    if (next && !on) {
      Alert.alert(
        'Notifications are off',
        'Allow notifications for RouteyAI in your phone settings, then turn this on again.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open settings', onPress: () => Linking.openSettings() },
        ],
      )
    }
  }

  function signOut() {
    Alert.alert('Sign out?', 'You will stop getting notifications on this phone until you sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await clearPushToken()
          // A driver signing out mid-route: the GPS can't send without a session, so stop it.
          await stopBackgroundGps().catch(() => {})
          await supabase.auth.signOut()
          router.replace(routes.login)
        },
      },
    ])
  }

  const initials = (name ?? email ?? '?')
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScreenHeader title="Account" subtitle={role === 'parent' ? 'Parent account' : 'Driver account'} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={[card, { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 }]}>
          <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_800ExtraBold', fontSize: 18 }}>{initials || '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 17, color: colors.dark }} numberOfLines={1}>
              {name ?? (role === 'parent' ? 'Parent' : 'Driver')}
            </Text>
            {email && (
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.muted, marginTop: 2 }} numberOfLines={1}>
                {email}
              </Text>
            )}
          </View>
        </View>

        {sections.map((section) => (
          <Section key={section.title} title={section.title}>
            {section.rows.map((row, i) => (
              <Row key={`${row.label}-${i}`} icon={row.icon} label={row.label} value={row.value} last={i === section.rows.length - 1} />
            ))}
          </Section>
        ))}

        <Section title="Notifications">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
            <IconBadge icon="notifications-outline" />
            <View style={{ flex: 1 }}>
              <Text style={rowLabel}>Push notifications</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.muted, marginTop: 2, lineHeight: 17 }}>{notificationHint}</Text>
            </View>
            <Switch
              value={pushOn ?? false}
              onValueChange={togglePush}
              disabled={pushOn === null || pushBusy}
              trackColor={{ true: colors.primaryLight, false: colors.border }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Push notifications"
            />
          </View>
        </Section>

        <Section title="Help and legal">
          <LinkRow icon="shield-checkmark-outline" label="Privacy policy" onPress={() => Linking.openURL(`${SITE_URL}/privacy`)} />
          <LinkRow icon="document-text-outline" label="Terms of use" onPress={() => Linking.openURL(`${SITE_URL}/terms`)} />
          <View style={{ flexDirection: 'row', gap: 12, padding: 14, borderTopWidth: 1, borderTopColor: colors.borderLight }}>
            <IconBadge icon="help-buoy-outline" />
            <Text style={{ flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.muted, lineHeight: 19 }}>
              {role === 'parent'
                ? 'Questions about a pickup, a stop or your child’s bus? Contact your school’s transport office.'
                : 'Questions about your bus or route? Contact your school’s transport office.'}
            </Text>
          </View>
        </Section>

        <TouchableOpacity
          onPress={signOut}
          activeOpacity={0.8}
          accessibilityRole="button"
          style={{ height: 52, borderRadius: 16, borderWidth: 1.5, borderColor: '#FECACA', backgroundColor: '#FEF2F2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <Ionicons name="log-out-outline" size={19} color={colors.danger} />
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: colors.danger }}>Sign out</Text>
        </TouchableOpacity>

        <Text style={{ textAlign: 'center', fontFamily: 'Inter_400Regular', fontSize: 11.5, color: colors.subtle }}>
          RouteyAI {Constants.expoConfig?.version ?? ''}
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: colors.subtle, textTransform: 'uppercase', letterSpacing: 0.8, marginLeft: 4 }}>{title}</Text>
      <View style={[card, { overflow: 'hidden' }]}>{children}</View>
    </View>
  )
}

function Row({ icon, label, value, last }: AccountRow & { last: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.borderLight }}>
      <IconBadge icon={icon} />
      <Text style={[rowLabel, { flexShrink: 0 }]}>{label}</Text>
      <Text style={{ flex: 1, textAlign: 'right', fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.muted }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  )
}

function LinkRow({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} accessibilityRole="link" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
      <IconBadge icon={icon} />
      <Text style={[rowLabel, { flex: 1 }]}>{label}</Text>
      <Ionicons name="open-outline" size={16} color={colors.subtle} />
    </TouchableOpacity>
  )
}

function IconBadge({ icon }: { icon: IconName }) {
  return (
    <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: colors.infoBg, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={17} color={colors.primaryLight} />
    </View>
  )
}

const card = {
  backgroundColor: colors.surface,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: colors.border,
}

const rowLabel = { fontFamily: 'Inter_600SemiBold' as const, fontSize: 14, color: colors.dark }
