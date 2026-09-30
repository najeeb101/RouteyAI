import { useState } from 'react'
import { ScrollView, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { useDriverContext } from '@/features/driver/context/DriverDataContext'
import { colors } from '@/lib/colors'
import { supabase } from '@/lib/supabase'
import type { RouteUpdateType } from '@/types/route'

const typeMeta: Record<RouteUpdateType, { color: string; bg: string; border: string; icon: 'time' | 'megaphone-outline' | 'checkmark-circle' }> = {
  warn:  { color: colors.warning, bg: '#FFFBEB', border: 'rgba(245,158,11,0.2)',  icon: 'time' },
  info:  { color: colors.info,    bg: '#EFF6FF', border: 'rgba(59,130,246,0.2)',  icon: 'megaphone-outline' },
  ok:    { color: colors.success, bg: '#F0FDF4', border: 'rgba(16,185,129,0.2)', icon: 'checkmark-circle' },
}

export function DriverMessagesScreen() {
  const { loading, error, profile, messages, refresh } = useDriverContext()
  const [compose, setCompose] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  async function sendAnnouncement() {
    const text = compose.trim()
    if (!text || !profile) return
    setSending(true)
    setSendError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('announcements').insert({
        school_id: profile.schoolId,
        bus_id: profile.busId,
        sender_id: user?.id ?? null,
        message: text,
      })
      if (error) throw error
      setCompose('')
      refresh()
    } catch {
      setSendError('Failed to send. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Messages" subtitle={`${profile?.schoolName ?? 'School'} and parents on ${profile?.busName ?? 'your bus'}`} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
                  <Ionicons name={meta.icon} size={17} color={meta.color} />
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

      {/* Compose bar — driver sends announcements to parents on this bus */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          padding: 12,
          gap: 8,
        }}
      >
        {sendError && (
          <Text style={{ fontSize: 11, color: colors.danger, fontFamily: 'Inter_500Medium', paddingHorizontal: 4 }}>{sendError}</Text>
        )}
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end' }}>
          <TextInput
            value={compose}
            onChangeText={setCompose}
            placeholder="Send update to parents on this bus…"
            placeholderTextColor={colors.subtle}
            multiline
            style={{
              flex: 1,
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 10,
              fontSize: 13,
              fontFamily: 'Inter_400Regular',
              color: colors.dark,
              maxHeight: 80,
            }}
          />
          <TouchableOpacity
            onPress={sendAnnouncement}
            disabled={!compose.trim() || sending}
            activeOpacity={0.8}
            style={{
              backgroundColor: compose.trim() && !sending ? colors.primary : colors.borderLight,
              borderRadius: 14,
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name={sending ? 'ellipsis-horizontal' : 'send'} size={18} color={compose.trim() && !sending ? '#FFFFFF' : colors.subtle} />
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
