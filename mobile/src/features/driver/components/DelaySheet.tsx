import { useEffect, useState } from 'react'
import { Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Banner } from '@/components/primitives/Banner'
import { Chip } from '@/components/primitives/Chip'
import { PrimaryButton } from '@/components/primitives/PrimaryButton'
import { SheetLabel, SheetModal } from '@/components/primitives/SheetModal'
import { colors } from '@/lib/colors'
import { supabase } from '@/lib/supabase'

const MINUTES = [5, 10, 15, 20, 30] as const

type DelaySheetProps = {
  visible: boolean
  onClose: () => void
  busId: string
  busName: string
  schoolId: string
  onSent: () => void
}

/** One tap tells every parent on the route the bus is late (an announcement; the push goes out automatically). */
export function DelaySheet({ visible, onClose, busId, busName, schoolId, onSent }: DelaySheetProps) {
  const [minutes, setMinutes] = useState<number>(10)
  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!visible) return
    setMinutes(10)
    setNote('')
    setError(null)
    setSent(false)
  }, [visible])

  const message = `${busName} is running about ${minutes} minutes late.${note.trim() ? ` ${note.trim()}` : ''}`

  async function send() {
    setSending(true)
    setError(null)
    const { data: auth } = await supabase.auth.getUser()
    const { error: err } = await supabase.from('announcements').insert({
      school_id: schoolId,
      bus_id: busId,
      sender_id: auth.user?.id ?? null,
      message,
    })
    setSending(false)
    if (err) {
      setError('Could not send. Check your connection and try again.')
      return
    }
    setSent(true)
    onSent()
  }

  if (sent) {
    return (
      <SheetModal visible={visible} title="Parents told" onClose={onClose} footer={<PrimaryButton label="Done" onPress={onClose} />}>
        <View style={{ alignItems: 'center', gap: 12, paddingVertical: 12 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.successBg, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="checkmark" size={34} color={colors.successMid} />
          </View>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: colors.dark, textAlign: 'center' }}>Every parent on {busName} got your message</Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.muted, textAlign: 'center' }}>&ldquo;{message}&rdquo;</Text>
        </View>
      </SheetModal>
    )
  }

  return (
    <SheetModal
      visible={visible}
      title="Running late?"
      subtitle={`Parents on ${busName} get a notification, so nobody waits outside for long.`}
      onClose={onClose}
      footer={<PrimaryButton label="Tell parents" icon="send" onPress={send} loading={sending} disabled={sending} />}
    >
      <View>
        <SheetLabel>About how late?</SheetLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {MINUTES.map((m) => (
            <Chip key={m} label={`${m} min`} selected={minutes === m} onPress={() => setMinutes(m)} />
          ))}
        </View>
      </View>

      <View>
        <SheetLabel>Add a reason (optional)</SheetLabel>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="For example: heavy traffic on Al Waab Street"
          placeholderTextColor={colors.subtle}
          maxLength={120}
          style={{
            height: 48,
            borderWidth: 1.5,
            borderColor: colors.border,
            borderRadius: 14,
            paddingHorizontal: 14,
            fontSize: 14,
            fontFamily: 'Inter_400Regular',
            color: colors.dark,
          }}
        />
      </View>

      <View style={{ backgroundColor: colors.background, borderRadius: 16, padding: 14, gap: 6 }}>
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 11, color: colors.subtle, textTransform: 'uppercase', letterSpacing: 0.8 }}>Parents will see</Text>
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.dark, lineHeight: 20 }}>{message}</Text>
      </View>

      {error && <Banner text={error} />}
    </SheetModal>
  )
}
