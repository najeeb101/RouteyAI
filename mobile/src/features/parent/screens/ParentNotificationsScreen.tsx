import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Card } from '@/components/primitives/Card'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { parentChild, parentUpdates } from '@/data/demoRoute'
import { colors } from '@/lib/colors'
import type { RouteUpdateType } from '@/types/route'

const typeColor: Record<RouteUpdateType, string> = {
  ok: colors.success,
  info: colors.info,
  warn: colors.warning,
}

const typeBg: Record<RouteUpdateType, string> = {
  ok: colors.successBg,
  info: colors.infoBg,
  warn: colors.warningBg,
}

const typeIcon: Record<RouteUpdateType, string> = {
  ok: '✅',
  info: 'ℹ️',
  warn: '⚠️',
}

const typeLabel: Record<RouteUpdateType, string> = {
  ok: 'All good',
  info: 'Info',
  warn: 'Warning',
}

export function ParentNotificationsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Notifications" subtitle={`Updates about ${parentChild.name.split(' ')[0]}`} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {parentUpdates.map(notification => (
          <Card key={notification.id} style={{ flexDirection: 'row', gap: 14, padding: 14, alignItems: 'flex-start' }}>
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 13,
                backgroundColor: typeBg[notification.type],
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: typeColor[notification.type] + '33',
              }}
            >
              <Text style={{ fontSize: 20 }}>{typeIcon[notification.type]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, gap: 10, alignItems: 'flex-start' }}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: colors.dark, flex: 1, lineHeight: 18 }}>
                  {notification.title}
                </Text>
                <Text style={{ fontSize: 11, color: colors.subtle, fontFamily: 'Inter_400Regular', marginTop: 1 }}>
                  {notification.time}
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: colors.muted, fontFamily: 'Inter_400Regular', lineHeight: 18 }}>
                {notification.body}
              </Text>
              <View
                style={{
                  marginTop: 8,
                  alignSelf: 'flex-start',
                  backgroundColor: typeBg[notification.type],
                  borderRadius: 6,
                  paddingHorizontal: 7,
                  paddingVertical: 3,
                }}
              >
                <Text style={{ fontSize: 10, fontFamily: 'Inter_600SemiBold', color: typeColor[notification.type] }}>
                  {typeLabel[notification.type]}
                </Text>
              </View>
            </View>
          </Card>
        ))}

        <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 16 }}>
          <Text style={{ fontSize: 12, color: colors.subtle, fontFamily: 'Inter_400Regular' }}>You're all caught up 🎉</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
