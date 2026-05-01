import { useEffect, useRef, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as Location from 'expo-location'
import { MetricCard } from '@/components/primitives/MetricCard'
import { ProgressBar } from '@/components/primitives/ProgressBar'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { StatusPill } from '@/components/primitives/StatusPill'
import { useDriverData } from '@/features/driver/hooks/useDriverData'
import { colors } from '@/lib/colors'
import { routes } from '@/lib/navigation/routes'
import { supabase } from '@/lib/supabase'
import type { TripStatus } from '@/types/route'

export function DriverHomeScreen() {
  const router = useRouter()
  const { loading, error, profile, stops, totalStudents, boardedIds } = useDriverData()
  const [tripStatus, setTripStatus] = useState<TripStatus>('idle')
  const [gpsError, setGpsError] = useState<string | null>(null)
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const boarded = boardedIds.size
  const currentStop = stops.find(stop => stop.current) ?? stops[0]
  const nextStop = stops.find(stop => !stop.done && !stop.current) ?? stops[stops.length - 1]
  const stopsDone = stops.filter(s => s.done).length

  async function sendCurrentLocation() {
    if (!profile?.busId) return
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
    const point = `SRID=4326;POINT(${position.coords.longitude} ${position.coords.latitude})`
    const { error } = await supabase.from('bus_locations').insert({
      bus_id: profile.busId,
      location: point,
      heading: position.coords.heading ?? null,
      speed: position.coords.speed ?? null,
    })
    if (error) throw error
  }

  async function startTrip() {
    if (!profile?.busId) return
    setGpsError(null)
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      setGpsError('Location permission is required to start GPS broadcasting.')
      return
    }
    const { error } = await supabase.from('buses').update({ is_active: true }).eq('id', profile.busId)
    if (error) { setGpsError('Failed to start trip. Please try again.'); return }
    setTripStatus('active')
    try { await sendCurrentLocation() } catch { setGpsError('Unable to fetch location. GPS will retry.') }
  }

  async function stopTrip() {
    if (!profile?.busId) return
    const { error } = await supabase.from('buses').update({ is_active: false }).eq('id', profile.busId)
    if (error) { setGpsError('Failed to end trip. Please try again.'); return }
    setTripStatus('done')
    if (locationIntervalRef.current) { clearInterval(locationIntervalRef.current); locationIntervalRef.current = null }
  }

  useEffect(() => {
    if (tripStatus !== 'active' || !profile?.busId) {
      if (locationIntervalRef.current) { clearInterval(locationIntervalRef.current); locationIntervalRef.current = null }
      return
    }
    locationIntervalRef.current = setInterval(async () => {
      try { await sendCurrentLocation(); setGpsError(null) } catch { setGpsError('GPS update failed. Retrying...') }
    }, 10000)
    return () => { if (locationIntervalRef.current) { clearInterval(locationIntervalRef.current); locationIntervalRef.current = null } }
  }, [tripStatus, profile?.busId])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        subtitle="Driver Portal"
        action={
          tripStatus === 'idle' ? (
            <TouchableOpacity onPress={startTrip} style={actionBtn(colors.success)}>
              <Text style={actionBtnText}>▶  Start</Text>
            </TouchableOpacity>
          ) : tripStatus === 'active' ? (
            <TouchableOpacity onPress={stopTrip} style={actionBtn(colors.danger)}>
              <Text style={actionBtnText}>■  End Trip</Text>
            </TouchableOpacity>
          ) : (
            <StatusPill label="Completed" tone="info" />
          )
        }
      />

      {(error || gpsError) && (
        <View style={{ paddingHorizontal: 16, paddingTop: 10, gap: 6 }}>
          {error && <AlertBanner text={error} tone="danger" />}
          {gpsError && <AlertBanner text={gpsError} tone="warning" />}
        </View>
      )}

      {/* Bus/Route identity strip */}
      <View style={{ backgroundColor: colors.dark, paddingHorizontal: 20, paddingBottom: 16 }}>
        <View style={busStrip}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_800ExtraBold', fontSize: 15, letterSpacing: -0.2 }}>
              {profile?.busName ?? 'Unassigned'}{' '}
              <Text style={{ color: colors.accentMid, fontFamily: 'Inter_700Bold', fontSize: 13 }}>
                {profile?.routeName ?? 'Route'}
              </Text>
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 }}>
              {profile?.driverName ?? 'Driver'} · Morning Run
            </Text>
          </View>
          {tripStatus === 'active' && <StatusPill label="Live" />}
          {tripStatus === 'done' && <StatusPill label="Done" tone="info" />}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>

        {/* Boarding progress */}
        <View style={sectionCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={sectionTitle}>Boarding Progress</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
              <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: colors.primary, letterSpacing: -0.5 }}>{boarded}</Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.subtle }}>/{totalStudents}</Text>
            </View>
          </View>
          <ProgressBar value={boarded} total={totalStudents} height={10} />
          <Text style={{ fontSize: 11, color: colors.subtle, marginTop: 8, fontFamily: 'Inter_400Regular' }}>
            {totalStudents - boarded > 0
              ? `${totalStudents - boarded} student${totalStudents - boarded === 1 ? '' : 's'} not yet boarded`
              : 'All students boarded ✓'}
          </Text>
        </View>

        {/* Current stop hero */}
        {loading ? (
          <View style={{ ...sectionCard, alignItems: 'center', paddingVertical: 24 }}>
            <Text style={{ fontSize: 13, color: colors.subtle, fontFamily: 'Inter_500Medium' }}>Loading route data...</Text>
          </View>
        ) : (
          <View style={{ borderRadius: 20, overflow: 'hidden' }}>
            <View style={{ height: 3, backgroundColor: colors.accentMid }} />
            <View style={{ backgroundColor: colors.primary, padding: 18 }}>
              <Text style={dimLabel}>CURRENT STOP</Text>
              <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_800ExtraBold', fontSize: 22, letterSpacing: -0.5, marginBottom: 4 }}>
                {currentStop?.name ?? 'No stops assigned'}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_400Regular', fontSize: 12, marginBottom: 14 }}>
                {currentStop?.students.length ?? 0} students waiting · ETA {currentStop?.eta ?? '--:--'}
              </Text>
              <TouchableOpacity onPress={() => router.push(routes.driverRoute)} style={checkInBtn}>
                <Text style={{ color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 13 }}>Check In Students  →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Next stop */}
        <View style={{ ...sectionCard, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ ...dimLabel, color: colors.subtle }}>NEXT STOP</Text>
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: colors.dark, marginTop: 2 }}>
              {nextStop?.name ?? '—'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ ...dimLabel, color: colors.subtle }}>ETA</Text>
            <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 20, color: colors.info, marginTop: 2, letterSpacing: -0.5 }}>
              {nextStop?.eta ?? '--:--'}
            </Text>
          </View>
        </View>

        {/* Metrics row */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <MetricCard label="Stops Done" value={`${stopsDone}/${stops.length}`} color={colors.success} icon="✓" />
          <MetricCard label="Absent" value="0" color={colors.danger} icon="✕" />
          <MetricCard label="ETA School" value="8:10" color={colors.primary} icon="🏫" />
        </View>

        {/* Full route CTA */}
        <TouchableOpacity onPress={() => router.push(routes.driverRoute)} style={fullRouteBtn}>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: colors.dark }}>View Full Route & Students</Text>
          <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_700Bold', lineHeight: 18 }}>›</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

function AlertBanner({ text, tone }: { text: string; tone: 'danger' | 'warning' }) {
  const isDanger = tone === 'danger'
  return (
    <View style={{
      borderColor: isDanger ? '#FECACA' : '#FDE68A',
      borderWidth: 1,
      backgroundColor: isDanger ? '#FEF2F2' : '#FFFBEB',
      borderRadius: 12,
      padding: 12,
      flexDirection: 'row',
      gap: 8,
      alignItems: 'flex-start',
    }}>
      <Text style={{ fontSize: 13 }}>{isDanger ? '⚠️' : '⚡'}</Text>
      <Text style={{ color: isDanger ? '#B91C1C' : '#92400E', fontSize: 12, fontFamily: 'Inter_600SemiBold', flex: 1 }}>{text}</Text>
    </View>
  )
}

function actionBtn(bg: string) {
  return {
    backgroundColor: bg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  }
}

const actionBtnText = { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 13 }

const busStrip = {
  backgroundColor: 'rgba(255,255,255,0.07)',
  borderRadius: 14,
  padding: 14,
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
  gap: 12,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.06)',
}

const sectionCard = {
  backgroundColor: colors.surface,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: colors.border,
  padding: 16,
  shadowColor: colors.dark,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
}

const sectionTitle = { fontFamily: 'Inter_700Bold' as const, fontSize: 13, color: colors.dark }

const dimLabel = {
  fontSize: 10 as const,
  fontFamily: 'Inter_600SemiBold' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: 0.8 as const,
  color: 'rgba(255,255,255,0.5)' as string,
  marginBottom: 2,
}

const checkInBtn = {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 10,
  alignSelf: 'flex-start' as const,
}

const fullRouteBtn = {
  backgroundColor: colors.surface,
  borderRadius: 20,
  padding: 16,
  borderWidth: 1,
  borderColor: colors.border,
  flexDirection: 'row' as const,
  justifyContent: 'space-between' as const,
  alignItems: 'center' as const,
}
