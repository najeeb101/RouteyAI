import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Card } from '@/components/primitives/Card'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { driverMessages, driverProfile } from '@/data/demoRoute'
import { colors } from '@/lib/colors'
import type { RouteUpdateType } from '@/types/route'

const typeColor: Record<RouteUpdateType, string> = {
  warn: colors.warning,
  info: colors.info,
  ok: colors.success,
}

export function DriverMessagesScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Messages" subtitle={`From ${driverProfile.school} Admin`} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 10 }} showsVerticalScrollIndicator={false}>
        {driverMessages.map(message => (
          <Card key={message.id} style={{ flexDirection: 'row', gap: 12, padding: 14 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: typeColor[message.type], marginTop: 5 }} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, gap: 10 }}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: colors.dark }}>{message.from}</Text>
                <Text style={{ fontSize: 11, color: colors.subtle, fontFamily: 'Inter_400Regular' }}>{message.time}</Text>
              </View>
              <Text style={{ fontSize: 13, color: colors.muted, fontFamily: 'Inter_400Regular', lineHeight: 18 }}>{message.body}</Text>
            </View>
          </Card>
        ))}

        <View style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 12, color: colors.subtle, fontFamily: 'Inter_400Regular' }}>No more messages</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
