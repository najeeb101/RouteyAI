import { useMemo } from 'react'
import { Text, View } from 'react-native'
import type { DimensionValue } from 'react-native'
import { colors } from '@/lib/colors'
import { routeStops } from '@/data/demoRoute'

type LiveMapPreviewProps = {
  compact?: boolean
}

export function LiveMapPreview({ compact = false }: LiveMapPreviewProps) {
  const activeIndex = useMemo(() => routeStops.findIndex(stop => stop.current), [])
  const markerLeft: DimensionValue = activeIndex >= 0 ? `${20 + activeIndex * 14}%` : '48%'

  return (
    <View
      style={{
        height: compact ? 220 : 280,
        backgroundColor: '#E8EEF6',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <View style={{ position: 'absolute', left: -40, right: -40, top: 72, height: 90, transform: [{ rotate: '-10deg' }] }}>
        <View style={{ height: 18, backgroundColor: '#CBD5E1', borderRadius: 18 }} />
        <View style={{ height: 4, backgroundColor: '#FFFFFF', marginTop: -11, marginHorizontal: 24, borderRadius: 4 }} />
      </View>

      <View style={{ position: 'absolute', left: 32, right: 32, top: 92, height: 4, backgroundColor: colors.primary, borderRadius: 4 }} />

      {routeStops.map((stop, index) => (
        <View
          key={stop.id}
          style={{
            position: 'absolute',
            left: `${14 + index * 17}%`,
            top: index % 2 === 0 ? 84 : 126,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: stop.current ? 18 : 12,
              height: stop.current ? 18 : 12,
              borderRadius: 9,
              backgroundColor: stop.done ? colors.success : stop.isSchool ? colors.primary : colors.surface,
              borderWidth: stop.current ? 4 : 2,
              borderColor: stop.current ? colors.info : colors.primary,
            }}
          />
        </View>
      ))}

      <View
        style={{
          position: 'absolute',
          left: markerLeft,
          top: 64,
          backgroundColor: colors.primary,
          borderRadius: 14,
          paddingHorizontal: 12,
          paddingVertical: 7,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.18,
          shadowRadius: 10,
          elevation: 4,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_800ExtraBold', fontSize: 12 }}>BUS #3</Text>
      </View>

      <View
        style={{
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 12,
          backgroundColor: 'rgba(15,23,42,0.88)',
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, fontFamily: 'Inter_500Medium' }}>ETA to school</Text>
        <Text style={{ color: colors.accent, fontFamily: 'Inter_700Bold', fontSize: 14 }}>8:10 AM / ~19 min</Text>
      </View>
    </View>
  )
}
