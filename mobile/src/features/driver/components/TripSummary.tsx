import { Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Banner } from '@/components/primitives/Banner'
import { PrimaryButton } from '@/components/primitives/PrimaryButton'
import { colors } from '@/lib/colors'
import { durationLabel, timeLabel } from '@/lib/dates'

type TripSummaryProps = {
  busName: string
  startedAt: Date | null
  endedAt: Date | null
  total: number
  boarded: number
  absent: number
  reported: number
  stopsDone: number
  stopCount: number
  onNewRoute: () => void
}

/** Shown after the driver ends the route: times, who rode, who didn't, and anyone never checked in. */
export function TripSummary({ busName, startedAt, endedAt, total, boarded, absent, reported, stopsDone, stopCount, onNewRoute }: TripSummaryProps) {
  const notChecked = Math.max(0, total - boarded - absent - reported)

  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
      <View style={{ backgroundColor: colors.successMid, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="flag" size={22} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_800ExtraBold', fontSize: 20, letterSpacing: -0.4 }}>Route complete</Text>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Inter_500Medium', fontSize: 12.5, marginTop: 2 }}>
            {busName}
            {startedAt && endedAt ? ` · ${timeLabel(startedAt)} to ${timeLabel(endedAt)} · ${durationLabel(endedAt.getTime() - startedAt.getTime())}` : ''}
          </Text>
        </View>
      </View>

      <View style={{ padding: 16, gap: 14 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Figure value={`${boarded}/${total}`} label="Rode the bus" color={colors.successMid} />
          <Figure value={String(absent)} label="Absent at stop" color={colors.danger} />
          <Figure value={String(reported)} label="Reported by parents" color="#B45309" />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="location-outline" size={16} color={colors.subtle} />
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.muted }}>
            {stopsDone} of {stopCount} stops completed
          </Text>
        </View>
        {notChecked > 0 && (
          <Banner
            tone="warning"
            text={`${notChecked} student${notChecked === 1 ? ' was' : 's were'} never checked in. Let the school know if they rode.`}
          />
        )}
        <PrimaryButton label="Start a new route" icon="refresh" onPress={onNewRoute} />
      </View>
    </View>
  )
}

function Figure({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center' }}>
      <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 20, color, letterSpacing: -0.4 }}>{value}</Text>
      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10.5, color: colors.subtle, textAlign: 'center', marginTop: 2 }}>{label}</Text>
    </View>
  )
}
