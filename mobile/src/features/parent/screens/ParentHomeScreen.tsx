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

const typeIcon: Record<RouteUpdateType, string> = {
  ok: '✅',
  info: 'ℹ️',
  warn: '⚠️',
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
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 17 }}>🔔</Text>
          </TouchableOpacity>
        }
      />

      {/* Child banner */}
      <View style={{ backgroundColor: colors.dark, paddingHorizontal: 20, paddingBottom: 18 }}>
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.07)',
            borderRadius: 16,
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.06)',
          }}
        >
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: colors.primaryLight,
              borderWidth: 2.5,
              borderColor: colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_800ExtraBold', fontSize: 16 }}>{parentChild.initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 15 }}>{parentChild.name}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 }}>
              {parentChild.grade} · {parentChild.bus}
            </Text>
          </View>
          <StatusPill label={parentChild.status} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ETA Hero Card */}
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: 22,
            padding: 18,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: 10,
                fontFamily: 'Inter_700Bold',
                textTransform: 'uppercase',
                letterSpacing: 1.2,
                marginBottom: 5,
              }}
            >
              📍 ETA to School
            </Text>
            <Text style={{ color: colors.accent, fontFamily: 'Inter_800ExtraBold', fontSize: 32, letterSpacing: -1 }}>8:10 AM</Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 3 }}>
              About 19 minutes away
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push(routes.parentMap)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.14)',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 14,
              alignItems: 'center',
              minWidth: 80,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <Text style={{ fontSize: 22 }}>📍</Text>
            <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 11, marginTop: 4, letterSpacing: 0.5 }}>LIVE</Text>
          </TouchableOpacity>
        </View>

        {/* Route Info Card */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Text style={{ fontSize: 16 }}>🚌</Text>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: colors.dark }}>Route Info</Text>
          </View>
          <View style={{ gap: 10 }}>
            {([
              ['Bus', parentChild.bus],
              ['Route', `${parentChild.route} / Morning`],
              ['Driver', driverProfile.name],
              ['School', driverProfile.school],
            ] as [string, string][]).map(([label, value]) => (
              <View
                key={label}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: 16,
                  paddingVertical: 6,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderLight,
                }}
              >
                <Text style={{ fontSize: 13, color: colors.subtle, fontFamily: 'Inter_500Medium' }}>{label}</Text>
                <Text style={{ fontSize: 13, color: colors.dark, fontFamily: 'Inter_600SemiBold', flex: 1, textAlign: 'right' }}>
                  {value}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Today's Updates */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Text style={{ fontSize: 16 }}>📋</Text>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: colors.dark }}>Today's Updates</Text>
          </View>
          <View style={{ gap: 12 }}>
            {parentUpdates.slice(0, 3).map(update => (
              <View key={update.id} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 14, marginTop: -1 }}>{typeIcon[update.type]}</Text>
                <Text style={{ width: 46, fontSize: 11, color: colors.subtle, fontFamily: 'Inter_500Medium' }}>{update.time}</Text>
                <Text style={{ flex: 1, fontSize: 12, color: colors.dark, fontFamily: 'Inter_400Regular', lineHeight: 18 }}>
                  {update.body}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Contact Driver Button */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.dark,
            borderRadius: 20,
            padding: 16,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            shadowColor: colors.dark,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <Text style={{ fontSize: 18 }}>📞</Text>
          <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 0.2 }}>Contact Driver</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}
