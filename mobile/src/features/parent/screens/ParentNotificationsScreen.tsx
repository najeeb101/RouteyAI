import { RefreshControl, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Bell, Bus, Clock, School } from 'lucide-react-native'
import { Banner } from '@/components/primitives/Banner'
import { Icon } from '@/components/primitives/Icon'
import { ListSection } from '@/components/primitives/List'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { Txt } from '@/components/primitives/Txt'
import { useParentContext } from '@/features/parent/context/ParentDataContext'
import type { ParentAnnouncement } from '@/features/parent/screens/useParentData'
import { localDateKey, whenLabel } from '@/lib/dates'
import { gutter, space, useTheme } from '@/lib/theme'

/** Updates from drivers and the school for all of the parent's children, newest first. */
export function ParentNotificationsScreen() {
  const t = useTheme()
  const { loading, error, children, announcements, today, refresh } = useParentContext()
  const todays = announcements.filter((a) => localDateKey(new Date(a.createdAt)) === today)
  const earlier = announcements.filter((a) => localDateKey(new Date(a.createdAt)) !== today)
  const names = children.length > 1 ? children.map((c) => c.firstName).join(' and ') : children[0]?.firstName

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas }} edges={['top']}>
      <ScreenHeader title="Alerts" subtitle={names ? `Updates about ${names}` : 'Updates'} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: gutter, paddingTop: space.xs, paddingBottom: space.xxxl, gap: space.xxl }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading && announcements.length > 0} onRefresh={refresh} tintColor={t.brand} />}
      >
        {error && <Banner text={error} />}

        {!loading && announcements.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: space.huge, gap: space.sm, paddingHorizontal: space.xxl }}>
            <Icon icon={Bell} size={32} color={t.inkTertiary} />
            <Txt variant="headline">No updates yet</Txt>
            <Txt variant="body" tone="inkSecondary" align="center">
              Messages from the driver and the school show up here, for example if the bus is running late.
            </Txt>
          </View>
        )}

        {todays.length > 0 && (
          <ListSection title="Today">
            {todays.map((a) => (
              <AlertRow key={a.id} item={a} today={today} />
            ))}
          </ListSection>
        )}
        {earlier.length > 0 && (
          <ListSection title="Earlier">
            {earlier.map((a) => (
              <AlertRow key={a.id} item={a} today={today} />
            ))}
          </ListSection>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function AlertRow({ item, today }: { item: ParentAnnouncement; today: string }) {
  const t = useTheme()
  const warn = item.type === 'warn'
  return (
    <View style={{ flexDirection: 'row', gap: space.md, padding: space.lg }}>
      <Icon icon={warn ? Clock : item.busId ? Bus : School} size={21} color={warn ? t.warningText : t.inkSecondary} />
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: space.md }}>
          <Txt variant="bodyMedium" numberOfLines={1} style={{ flex: 1 }}>
            {item.from}
          </Txt>
          <Txt variant="caption" tone="inkSecondary">
            {whenLabel(item.createdAt, today)}
          </Txt>
        </View>
        <Txt variant="body" tone="inkSecondary">
          {item.body}
        </Txt>
      </View>
    </View>
  )
}
