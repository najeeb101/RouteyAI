import { useEffect, useState } from 'react'
import { Alert, Linking, ScrollView, Switch, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { Bell, FileText, LogOut, Shield, Trash, type LucideIcon } from 'lucide-react-native'
import { Avatar } from '@/components/primitives/Avatar'
import { Card } from '@/components/primitives/Card'
import { ListRow, ListSection } from '@/components/primitives/List'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { Txt } from '@/components/primitives/Txt'
import { routes } from '@/lib/navigation/routes'
import { clearPushToken, hasPushToken, isPushOptedOut, setPushEnabled } from '@/lib/push'
import { supabase } from '@/lib/supabase'
import { gutter, space, useTheme } from '@/lib/theme'
import { stopBackgroundGps } from '@/features/driver/gpsTask'

/** A detail row: an icon (or, for a person, their initials) with a label and a value or subtitle. */
export type AccountRow = { icon?: LucideIcon; person?: string; label: string; value?: string; subtitle?: string }
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

/** Profile, notification switch, legal links and sign out (iOS Settings style). Shared by the parent and driver apps. */
export function AccountScreen({ role, name, email, sections, notificationHint }: AccountScreenProps) {
  const router = useRouter()
  const t = useTheme()
  const [pushOn, setPushOn] = useState<boolean | null>(null)
  const [pushBusy, setPushBusy] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  // Required by the App Store and Google Play. The school's records (children, bus) stay; see 0015_delete_account.sql.
  function deleteAccount() {
    Alert.alert(
      'Delete your account?',
      `This permanently deletes your RouteyAI account and signs you out. ${
        role === 'parent'
          ? 'Your children stay registered with the school, and it can invite you again.'
          : 'Your bus and route stay with the school.'
      } This can’t be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true)
            await stopBackgroundGps().catch(() => {})
            const { error } = await supabase.rpc('delete_my_account')
            if (error) {
              setDeleting(false)
              Alert.alert('Couldn’t delete your account', 'Check your connection and try again.')
              return
            }
            await supabase.auth.signOut()
            router.replace(routes.login)
          },
        },
      ],
    )
  }

  const displayName = name ?? (role === 'parent' ? 'Parent' : 'Driver')

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas }} edges={['top']}>
      <ScreenHeader title="Account" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: gutter, paddingTop: space.xs, paddingBottom: space.xxxl, gap: space.xxl }} showsVerticalScrollIndicator={false}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
          <Avatar name={name ?? email ?? '?'} size={56} tone="brand" />
          <View style={{ flex: 1, gap: 2 }}>
            <Txt variant="title" numberOfLines={1}>
              {displayName}
            </Txt>
            <Txt variant="subhead" tone="inkSecondary" numberOfLines={1}>
              {email ?? (role === 'parent' ? 'Parent account' : 'Driver account')}
            </Txt>
          </View>
        </Card>

        {sections.map((section) => (
          <ListSection key={section.title} title={section.title}>
            {section.rows.map((row, i) => (
              <ListRow
                key={`${row.label}-${i}`}
                icon={row.icon}
                leading={row.person ? <Avatar name={row.person} size={32} /> : undefined}
                title={row.label}
                subtitle={row.subtitle}
                value={row.value}
              />
            ))}
          </ListSection>
        ))}

        <ListSection title="Notifications" footer={notificationHint}>
          <ListRow
            icon={Bell}
            title="Push notifications"
            accessory={
              <Switch
                value={pushOn ?? false}
                onValueChange={togglePush}
                disabled={pushOn === null || pushBusy}
                trackColor={{ true: t.brand, false: t.separator }}
                thumbColor={t.surface}
                accessibilityLabel="Push notifications"
              />
            }
          />
        </ListSection>

        <ListSection
          title="Help and legal"
          footer={
            role === 'parent'
              ? 'Questions about a pickup, a stop or your child’s bus? Contact your school’s transport office.'
              : 'Questions about your bus or route? Contact your school’s transport office.'
          }
        >
          <ListRow icon={Shield} title="Privacy policy" accessory="external" onPress={() => Linking.openURL(`${SITE_URL}/privacy`)} />
          <ListRow icon={FileText} title="Terms of use" accessory="external" onPress={() => Linking.openURL(`${SITE_URL}/terms`)} />
        </ListSection>

        <ListSection>
          <ListRow icon={LogOut} title="Sign out" destructive onPress={signOut} />
          <ListRow icon={Trash} title={deleting ? 'Deleting account…' : 'Delete account'} destructive onPress={deleting ? undefined : deleteAccount} />
        </ListSection>

        <Txt variant="caption" tone="inkTertiary" align="center">
          RouteyAI {Constants.expoConfig?.version ?? ''}
        </Txt>
      </ScrollView>
    </SafeAreaView>
  )
}
