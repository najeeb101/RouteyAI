import { useMemo, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Card } from '@/components/primitives/Card'
import { MetricCard } from '@/components/primitives/MetricCard'
import { ProgressBar } from '@/components/primitives/ProgressBar'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { StatusPill } from '@/components/primitives/StatusPill'
import { driverProfile, routeStops } from '@/data/demoRoute'
import { colors } from '@/lib/colors'
import { routes } from '@/lib/navigation/routes'
import type { TripStatus } from '@/types/route'

export function DriverHomeScreen() {
  const router = useRouter()
  const [tripStatus, setTripStatus] = useState<TripStatus>('active')
  const boarded = 5
  const totalStudents = useMemo(() => routeStops.reduce((total, stop) => total + stop.students.length, 0), [])
  const currentStop = routeStops.find(stop => stop.current) ?? routeStops[0]
  const nextStop = routeStops.find(stop => !stop.done && !stop.current && !stop.isSchool) ?? routeStops[routeStops.length - 1]

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        subtitle="Driver Portal"
        action={
          tripStatus === 'idle' ? (
            <TouchableOpacity
              onPress={() => setTripStatus('active')}
              style={{ backgroundColor: colors.success, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 }}
            >
              <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 13 }}>Start Trip</Text>
            </TouchableOpacity>
          ) : tripStatus === 'active' ? (
            <TouchableOpacity
              onPress={() => setTripStatus('done')}
              style={{ backgroundColor: colors.danger, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 }}
            >
              <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 13 }}>End Trip</Text>
            </TouchableOpacity>
          ) : (
            <StatusPill label="Completed" tone="info" />
          )
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
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 16 }}>
              {driverProfile.bus} - {driverProfile.route}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.48)', fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 }}>
              {driverProfile.name} / {driverProfile.run}
            </Text>
          </View>
          {tripStatus === 'active' && <StatusPill label="Live" />}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: colors.dark }}>Boarding Progress</Text>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: colors.primary }}>
              {boarded}/{totalStudents}
            </Text>
          </View>
          <ProgressBar value={boarded} total={totalStudents} />
          <Text style={{ fontSize: 11, color: colors.subtle, marginTop: 6, fontFamily: 'Inter_400Regular' }}>
            {totalStudents - boarded} students remaining
          </Text>
        </Card>

        <View style={{ backgroundColor: colors.primary, borderRadius: 18, padding: 16 }}>
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
            Current Stop
          </Text>
          <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_800ExtraBold', fontSize: 20, marginBottom: 2 }}>
            {currentStop.name}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 12 }}>
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter_400Regular', fontSize: 12, flex: 1 }}>
              {currentStop.students.length} students waiting
            </Text>
            <TouchableOpacity
              onPress={() => router.push(routes.driverRoute)}
              style={{ backgroundColor: 'rgba(255,255,255,0.16)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 }}
            >
              <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 12 }}>Check In</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 10, color: colors.subtle, fontFamily: 'Inter_600SemiBold', marginBottom: 3 }}>NEXT STOP</Text>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: colors.dark }}>{nextStop.name}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 10, color: colors.subtle, fontFamily: 'Inter_600SemiBold', marginBottom: 3 }}>ETA</Text>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 15, color: colors.info }}>{nextStop.eta}</Text>
          </View>
        </Card>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <MetricCard label="Stops Done" value="2/5" color={colors.success} />
          <MetricCard label="Absent" value="0" color={colors.danger} />
          <MetricCard label="ETA School" value="8:10" color={colors.primary} />
        </View>

        <TouchableOpacity
          onPress={() => router.push(routes.driverRoute)}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: colors.dark }}>View Full Route & Students</Text>
          <Text style={{ color: colors.primary, fontSize: 18, fontFamily: 'Inter_800ExtraBold' }}>{'>'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}
