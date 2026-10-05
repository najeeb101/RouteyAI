import { useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CircleCheck, Clock, Megaphone, MessageSquare, Send, type LucideIcon } from 'lucide-react-native'
import { Banner } from '@/components/primitives/Banner'
import { Icon } from '@/components/primitives/Icon'
import { ListSection } from '@/components/primitives/List'
import { ScreenHeader } from '@/components/primitives/ScreenHeader'
import { Txt } from '@/components/primitives/Txt'
import { useDriverContext } from '@/features/driver/context/DriverDataContext'
import { supabase } from '@/lib/supabase'
import { fonts, gutter, minTouch, radius, space, useTheme, type Palette } from '@/lib/theme'
import type { RouteUpdateType } from '@/types/route'

const typeMeta: Record<RouteUpdateType, { icon: LucideIcon; color: keyof Palette }> = {
  warn: { icon: Clock, color: 'warningText' },
  info: { icon: Megaphone, color: 'inkSecondary' },
  ok: { icon: CircleCheck, color: 'successText' },
}

export function DriverMessagesScreen() {
  const t = useTheme()
  const { loading, error, profile, messages, refresh } = useDriverContext()
  const [compose, setCompose] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const canSend = Boolean(compose.trim()) && !sending

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
    <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas }} edges={['top']}>
      <ScreenHeader title="Messages" subtitle={`${profile?.schoolName ?? 'School'} and parents on ${profile?.busName ?? 'your bus'}`} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: gutter, paddingTop: space.xs, paddingBottom: space.xxl, gap: space.lg }} showsVerticalScrollIndicator={false}>
          {error && <Banner text={error} />}

          {loading && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg }}>
              <ActivityIndicator color={t.brand} />
              <Txt variant="body" tone="inkSecondary">
                Loading messages…
              </Txt>
            </View>
          )}

          {!loading && messages.length === 0 && (
            <View style={{ alignItems: 'center', paddingTop: space.huge, gap: space.sm, paddingHorizontal: space.xxl }}>
              <Icon icon={MessageSquare} size={32} color={t.inkTertiary} />
              <Txt variant="headline">No messages yet</Txt>
              <Txt variant="body" tone="inkSecondary" align="center">
                Updates from your school and the ones you send to parents show up here.
              </Txt>
            </View>
          )}

          {!loading && messages.length > 0 && (
            <ListSection>
              {messages.map((message) => {
                const meta = typeMeta[message.type]
                return (
                  <View key={message.id} style={{ flexDirection: 'row', gap: space.md, padding: space.lg }}>
                    <Icon icon={meta.icon} size={21} color={t[meta.color]} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: space.md }}>
                        <Txt variant="bodyMedium" numberOfLines={1} style={{ flex: 1 }}>
                          {message.from}
                        </Txt>
                        <Txt variant="caption" tone="inkSecondary">
                          {message.time}
                        </Txt>
                      </View>
                      <Txt variant="body" tone="inkSecondary">
                        {message.body}
                      </Txt>
                    </View>
                  </View>
                )
              })}
            </ListSection>
          )}
        </ScrollView>

        {/* Compose bar: the driver sends updates to parents on this bus */}
        <View style={{ backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.separator, paddingHorizontal: space.md, paddingVertical: space.sm + 2, gap: space.sm }}>
          {sendError && (
            <Txt variant="caption" tone="dangerText" style={{ paddingHorizontal: space.xs }}>
              {sendError}
            </Txt>
          )}
          <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-end' }}>
            <TextInput
              value={compose}
              onChangeText={setCompose}
              placeholder="Send an update to parents on this bus"
              placeholderTextColor={t.inkTertiary}
              multiline
              maxFontSizeMultiplier={1.3}
              accessibilityLabel="Message to parents"
              style={{
                flex: 1,
                minHeight: minTouch,
                maxHeight: 96,
                backgroundColor: t.canvas,
                borderRadius: radius.md,
                paddingHorizontal: space.md,
                paddingTop: space.md - 1,
                paddingBottom: space.md - 1,
                fontSize: 15,
                fontFamily: fonts.regular,
                color: t.ink,
              }}
            />
            <Pressable
              onPress={sendAnnouncement}
              disabled={!canSend}
              accessibilityRole="button"
              accessibilityLabel="Send"
              style={({ pressed }) => ({
                width: minTouch,
                height: minTouch,
                borderRadius: radius.md,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: canSend ? (pressed ? t.brandPressed : t.brand) : t.separator,
              })}
            >
              {sending ? <ActivityIndicator color={t.inkTertiary} size="small" /> : <Icon icon={Send} size={19} color={canSend ? t.onBrand : t.inkTertiary} strokeWidth={2} />}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
