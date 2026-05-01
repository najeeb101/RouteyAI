import { useEffect } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { useDriverData } from '@/features/driver/hooks/useDriverData'
import { colors } from '@/lib/colors'
import { supabase } from '@/lib/supabase'
import type { RouteUpdateType } from '@/types/route'

const typeMeta: Record<RouteUpdateType, { color: string; bg: string; border: string; icon: string }> = {
  warn:  { color: colors.warning, bg: '#FFFBEB', border: 'rgba(245,158,11,0.2)',  icon: '⚠️' },
  info:  { color: colors.info,    bg: '#EFF6FF', border: 'rgba(59,130,246,0.2)',  icon: 'ℹ️' },
  ok:    { color: colors.success, bg: '#F0FDF4', border: 'rgba(16,185,129,0.2)', icon: '✅' },
}

export function DriverMessagesScreen() {
  const { loading, error, profile, messages, refresh } = useDriverData()

  useEffect(() => {
    if (!profile?.busId) return
    const channel = supabase
      .channel(`driver-announcements-${profile.busId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => refresh())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [profile?.busId, refresh])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Messages" subtitle={`From ${profile?.schoolName ?? 'School'} Admin`} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 10 }} showsVerticalScrollIndicator={false}>
        {error && (
          <View style={{ borderColor: '#FECACA', borderWidth: 1, backgroundColor: '#FEF2F2', borderRadius: 14, padding: 14 }}>
            <Text style={{ color: '#B91C1C', fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>{error}</Text>
          </View>
        )}

        {loading && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 16 }}>
            <Text style={{ fontSize: 13, color: colors.subtle, fontFamily: 'Inter_500Medium' }}>Loading messages...</Text>
          </View>
        )}

        {!loading && messages.map(message => {
          const meta = typeMeta[message.type]
          return (
            <View
              key={message.id}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                overflow: 'hidden',
                shadowColor: colors.dark,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
                elevation: 1,
              }}
            >
              <View style={{ height: 3, backgroundColor: meta.color }} />
              <View style={{ padding: 14, flexDirection: 'row', gap: 12 }}>
                <View style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: meta.bg,
                  borderWidth: 1,
                  borderColor: meta.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Text style={{ fontSize: 16 }}>{meta.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5, gap: 8 }}>
                    <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 13, color: colors.dark, flex: 1 }}>{message.from}</Text>
                    <Text style={{ fontSize: 11, color: colors.subtle, fontFamily: 'Inter_400Regular', flexShrink: 0 }}>{message.time}</Text>
                  </View>
                  <Text style={{ fontSize: 13, color: colors.muted, fontFamily: 'Inter_400Regular', lineHeight: 19 }}>{message.body}</Text>
                </View>
              </View>
            </View>
          )
        })}

        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          {!loading && (
            <Text style={{ fontSize: 12, color: colors.subtle, fontFamily: 'Inter_400Regular' }}>
              {messages.length === 0 ? 'No messages yet' : `${messages.length} message${messages.length === 1 ? '' : 's'} total`}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
