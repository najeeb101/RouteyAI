import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LiveMapPreview } from '@/components/route/LiveMapPreview'
import { RouteTimeline } from '@/components/route/RouteTimeline'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { StatusPill } from '@/components/primitives/StatusPill'
import { driverProfile, routeStops } from '@/data/demoRoute'
import { colors } from '@/lib/colors'

export function ParentMapScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        back
        title="Live Tracking"
        subtitle={`${driverProfile.bus} / ${driverProfile.route}`}
        action={<StatusPill label="Live" />}
      />

      <LiveMapPreview compact />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: colors.dark, marginBottom: 12 }}>Route Progress</Text>
        <RouteTimeline stops={routeStops} showHomeBadge />
      </ScrollView>
    </SafeAreaView>
  )
}
