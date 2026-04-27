import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Card } from '@/components/primitives/Card'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { StatusPill } from '@/components/primitives/StatusPill'
import { driverProfile, parentChild, parentUpdates } from '@/data/demoRoute'
import { colors } from '@/lib/colors'
import { routes } from '@/lib/navigation/routes'
import type { RouteUpdateType } from '@/types/route'

const typeColor: Record<RouteUpdateType, string> = {
  ok: colors.success,
  info: colors.info,
  warn: colors.warning,
}

export function ParentHomeScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        subtitle="Good morning"
        action={
          <TouchableOpacity
            onPress={() => router.push(routes.parentNotifications)}
            accessibilityLabel="Open notifications"
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: 'rgba(255,255,255,0.1)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontFamily: 'Inter_800ExtraBold' }}>!</Text>
          </TouchableOpacity>
        }
      />

      <View style={{ backgroundColor: colors.dark, paddingHorizontal: 20, paddingBottom: 16 }}>
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: 14,
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.primary,
              borderWidth: 2,
              borderColor: colors.info,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 15 }}>{parentChild.initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 15 }}>{parentChild.name}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.48)', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 }}>
              {parentChild.grade} / {parentChild.bus}
            </Text>
          </View>
          <StatusPill label={parentChild.status} />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: 18,
            padding: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: 10,
                fontFamily: 'Inter_600SemiBold',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: 4,
              }}
            >
              ETA to School
            </Text>
            <Text style={{ color: colors.accent, fontFamily: 'Inter_800ExtraBold', fontSize: 28 }}>8:10 AM</Text>
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 }}>
              About 19 minutes away
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push(routes.parentMap)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.16)',
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 12,
              alignItems: 'center',
              minWidth: 86,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_800ExtraBold', fontSize: 18 }}>MAP</Text>
            <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 11, marginTop: 2 }}>Live</Text>
          </TouchableOpacity>
        </View>

        <Card>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: colors.dark, marginBottom: 12 }}>Route Info</Text>
          <View style={{ gap: 8 }}>
            {[
              ['Bus', parentChild.bus],
              ['Route', `${parentChild.route} / Morning`],
              ['Driver', driverProfile.name],
              ['School', driverProfile.school],
            ].map(([label, value]) => (
              <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16 }}>
                <Text style={{ fontSize: 13, color: colors.subtle, fontFamily: 'Inter_400Regular' }}>{label}</Text>
                <Text style={{ fontSize: 13, color: colors.dark, fontFamily: 'Inter_600SemiBold', flex: 1, textAlign: 'right' }}>
                  {value}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: colors.dark, marginBottom: 12 }}>Today&apos;s Updates</Text>
          <View style={{ gap: 10 }}>
            {parentUpdates.slice(0, 3).map(update => (
              <View key={update.id} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: typeColor[update.type], marginTop: 4 }} />
                <Text style={{ width: 52, fontSize: 11, color: colors.subtle, fontFamily: 'Inter_400Regular' }}>{update.time}</Text>
                <Text style={{ flex: 1, fontSize: 12, color: colors.dark, fontFamily: 'Inter_400Regular', lineHeight: 17 }}>{update.body}</Text>
              </View>
            ))}
          </View>
        </Card>

        <TouchableOpacity
          style={{
            backgroundColor: colors.dark,
            borderRadius: 18,
            padding: 16,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 14 }}>Contact Driver</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}
