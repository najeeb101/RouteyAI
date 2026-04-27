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

export function ParentNotificationsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Notifications" subtitle={`Updates about ${parentChild.name.split(' ')[0]}`} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 10 }} showsVerticalScrollIndicator={false}>
        {parentUpdates.map(notification => (
          <Card key={notification.id} style={{ flexDirection: 'row', gap: 12, padding: 14 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: typeBg[notification.type],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: typeColor[notification.type] }} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3, gap: 10 }}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: colors.dark, flex: 1 }}>
                  {notification.title}
                </Text>
                <Text style={{ fontSize: 11, color: colors.subtle, fontFamily: 'Inter_400Regular' }}>{notification.time}</Text>
              </View>
              <Text style={{ fontSize: 12, color: colors.muted, fontFamily: 'Inter_400Regular', lineHeight: 17 }}>
                {notification.body}
              </Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}
