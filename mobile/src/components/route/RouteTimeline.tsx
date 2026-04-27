import { Text, View } from 'react-native'
import { colors } from '@/lib/colors'
import type { RouteStop } from '@/types/route'

type RouteTimelineProps = {
  stops: RouteStop[]
  showHomeBadge?: boolean
}

export function RouteTimeline({ stops, showHomeBadge = false }: RouteTimelineProps) {
  return (
    <View>
      {stops.map((stop, index) => (
        <View key={stop.id} style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ alignItems: 'center', width: 24 }}>
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: stop.done ? colors.success : stop.current ? colors.info : colors.surface,
                borderWidth: stop.done || stop.current ? 0 : 1.5,
                borderColor: stop.isSchool ? colors.primary : colors.border,
              }}
            >
              {stop.done && <Text style={{ color: '#FFFFFF', fontSize: 11 }}>OK</Text>}
              {stop.current && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' }} />}
              {stop.isSchool && !stop.done && !stop.current && (
                <Text style={{ fontSize: 10, color: colors.primary, fontFamily: 'Inter_800ExtraBold' }}>S</Text>
              )}
            </View>
            {index < stops.length - 1 && (
              <View
                style={{
                  width: 2,
                  flex: 1,
                  marginVertical: 2,
                  minHeight: 28,
                  backgroundColor: stop.done ? colors.success : colors.border,
                }}
              />
            )}
          </View>

          <View style={{ flex: 1, paddingBottom: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: 'Inter_600SemiBold',
                      color: stop.done ? colors.muted : stop.current ? colors.primary : colors.subtle,
                    }}
                  >
                    {stop.name}
                  </Text>
                  {showHomeBadge && stop.isHome && (
                    <View style={{ backgroundColor: colors.infoBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ fontSize: 9, fontFamily: 'Inter_700Bold', color: colors.primary }}>YOUR STOP</Text>
                    </View>
                  )}
                </View>
                {stop.students.length > 0 && (
                  <Text style={{ fontSize: 11, color: colors.subtle, fontFamily: 'Inter_400Regular', marginTop: 2 }}>
                    {stop.students.length} student{stop.students.length === 1 ? '' : 's'}
                  </Text>
                )}
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: stop.current ? 'Inter_700Bold' : 'Inter_400Regular',
                  color: stop.done ? colors.success : stop.current ? colors.info : colors.subtle,
                }}
              >
                {stop.eta}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  )
}
