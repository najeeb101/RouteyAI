import { RefreshControl, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Banner } from '@/components/primitives/Banner'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { useParentContext } from '@/features/parent/context/ParentDataContext'
import type { ParentAnnouncement } from '@/features/parent/screens/useParentData'
import { colors } from '@/lib/colors'
import { localDateKey, whenLabel } from '@/lib/dates'

/** Updates from drivers and the school for all of the parent's children, newest first. */
export function ParentNotificationsScreen() {
  const { loading, error, children, announcements, today, refresh } = useParentContext()
  const todays = announcements.filter((a) => localDateKey(new Date(a.createdAt)) === today)
  const earlier = announcements.filter((a) => localDateKey(new Date(a.createdAt)) !== today)
  const names = children.length > 1 ? children.map((c) => c.firstName).join(' and ') : children[0]?.firstName

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScreenHeader title="Alerts" subtitle={names ? `Updates about ${names}` : 'Updates'} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading && announcements.length > 0} onRefresh={refresh} tintColor={colors.primary} />}
      >
        {error && <Banner text={error} />}

        {!loading && announcements.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 48, gap: 10, paddingHorizontal: 24 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.infoBg, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="notifications-outline" size={28} color={colors.primaryLight} />
            </View>
            <Text style={{ fontSize: 15, color: colors.dark, fontFamily: 'Inter_700Bold' }}>No updates yet</Text>
            <Text style={{ fontSize: 13, color: colors.muted, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 19 }}>
              Messages from the driver and the school show up here, for example if the bus is running late.
            </Text>
          </View>
        )}

        {todays.length > 0 && <GroupLabel>Today</GroupLabel>}
        {todays.map((a) => (
          <AlertCard key={a.id} item={a} today={today} />
        ))}
        {earlier.length > 0 && <GroupLabel>Earlier</GroupLabel>}
        {earlier.map((a) => (
          <AlertCard key={a.id} item={a} today={today} />
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

function GroupLabel({ children }: { children: string }) {
  return (
    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: colors.subtle, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 6, marginLeft: 4 }}>
      {children}
    </Text>
  )
}

function AlertCard({ item, today }: { item: ParentAnnouncement; today: string }) {
  const warn = item.type === 'warn'
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 12,
        padding: 14,
        backgroundColor: colors.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: warn ? '#FDE68A' : colors.border,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: warn ? colors.warningBg : colors.infoBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={warn ? 'time' : item.busId ? 'bus' : 'school'} size={19} color={warn ? '#B45309' : colors.primaryLight} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
          <Text style={{ flex: 1, fontFamily: 'Inter_700Bold', fontSize: 13.5, color: colors.dark }} numberOfLines={1}>
            {item.from}
          </Text>
          <Text style={{ fontSize: 11.5, color: colors.subtle, fontFamily: 'Inter_500Medium' }}>{whenLabel(item.createdAt, today)}</Text>
        </View>
        <Text style={{ fontSize: 13, color: colors.muted, fontFamily: 'Inter_400Regular', lineHeight: 19, marginTop: 3 }}>{item.body}</Text>
      </View>
    </View>
  )
}
