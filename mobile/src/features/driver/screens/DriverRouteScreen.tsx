import { useMemo, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { driverProfile, routeStops } from '@/data/demoRoute'
import { colors } from '@/lib/colors'

export function DriverRouteScreen() {
  const initialChecked = useMemo(
    () => routeStops.flatMap(stop => (stop.done ? stop.students.map(student => student.id) : [])),
    [],
  )
  const [checked, setChecked] = useState<Set<number>>(new Set(initialChecked))

  function toggleChecked(id: number) {
    setChecked(previous => {
      const next = new Set(previous)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        back
        title={`${driverProfile.route} - All Stops`}
        subtitle={`${driverProfile.bus} / Tap students to check in`}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 10 }} showsVerticalScrollIndicator={false}>
        {routeStops.map(stop => (
          <View
            key={stop.id}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 18,
              borderWidth: stop.current ? 1.5 : 1,
              borderColor: stop.current ? colors.info : colors.border,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 14,
                backgroundColor: stop.current ? colors.infoBg : stop.isSchool ? colors.successBg : colors.surface,
                gap: 10,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: stop.done ? colors.success : stop.current ? colors.info : stop.isSchool ? colors.primary : 'transparent',
                    borderWidth: stop.done || stop.current || stop.isSchool ? 0 : 2,
                    borderColor: colors.border,
                  }}
                >
                  {stop.done && <Text style={{ color: '#FFFFFF', fontSize: 10, fontFamily: 'Inter_800ExtraBold' }}>OK</Text>}
                  {stop.current && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' }} />}
                  {stop.isSchool && <Text style={{ color: '#FFFFFF', fontSize: 10, fontFamily: 'Inter_800ExtraBold' }}>S</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: stop.done ? colors.muted : colors.dark }}>
                    {stop.name}
                  </Text>
                  {stop.students.length > 0 && (
                    <Text style={{ fontSize: 11, color: colors.subtle, fontFamily: 'Inter_400Regular' }}>
                      {stop.students.length} student{stop.students.length === 1 ? '' : 's'}
                    </Text>
                  )}
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 12, fontFamily: 'Inter_600SemiBold', color: stop.current ? colors.info : colors.subtle }}>
                  {stop.eta}
                </Text>
                {stop.done && <Text style={{ fontSize: 10, color: colors.success, fontFamily: 'Inter_600SemiBold' }}>Done</Text>}
                {stop.current && <Text style={{ fontSize: 10, color: colors.info, fontFamily: 'Inter_600SemiBold' }}>Now</Text>}
              </View>
            </View>

            {stop.students.map(student => {
              const isChecked = checked.has(student.id)
              return (
                <View
                  key={student.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderTopWidth: 1,
                    borderTopColor: '#F1F5F9',
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: colors.infoBg,
                      borderWidth: 1,
                      borderColor: '#BFDBFE',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_700Bold', color: colors.primary }}>{student.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontFamily: 'Inter_600SemiBold', color: colors.dark }}>{student.name}</Text>
                    <Text style={{ fontSize: 11, color: colors.subtle, fontFamily: 'Inter_400Regular' }}>{student.grade}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => !stop.done && toggleChecked(student.id)}
                    disabled={stop.done}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRadius: 8,
                      backgroundColor: isChecked ? colors.successBg : colors.warningBg,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_600SemiBold', color: isChecked ? '#059669' : '#D97706' }}>
                      {isChecked ? 'Boarded' : 'Board'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            })}

            {stop.isSchool && (
              <Text
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 12,
                  color: colors.subtle,
                  fontFamily: 'Inter_400Regular',
                  fontStyle: 'italic',
                  borderTopWidth: 1,
                  borderTopColor: '#F1F5F9',
                }}
              >
                Drop-off destination
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}
