import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Check, Send } from 'lucide-react-native'
import { Banner } from '@/components/primitives/Banner'
import { Button } from '@/components/primitives/Button'
import { Chip } from '@/components/primitives/Chip'
import { Icon } from '@/components/primitives/Icon'
import { SheetLabel, SheetModal } from '@/components/primitives/SheetModal'
import { TextField } from '@/components/primitives/TextField'
import { Txt } from '@/components/primitives/Txt'
import { supabase } from '@/lib/supabase'
import { radius, space, useTheme } from '@/lib/theme'

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
  const t = useTheme()
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
      <SheetModal visible={visible} title="Parents told" onClose={onClose} footer={<Button label="Done" onPress={onClose} />}>
        <View style={{ alignItems: 'center', gap: space.md, paddingVertical: space.md }}>
          <View style={{ width: 56, height: 56, borderRadius: radius.full, backgroundColor: t.successTint, alignItems: 'center', justifyContent: 'center' }}>
            <Icon icon={Check} size={28} color={t.successText} strokeWidth={2.25} />
          </View>
          <Txt variant="headline" align="center">
            Every parent on {busName} got your message
          </Txt>
          <Txt variant="body" tone="inkSecondary" align="center">
            &ldquo;{message}&rdquo;
          </Txt>
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
      footer={<Button label="Tell parents" icon={Send} onPress={send} loading={sending} disabled={sending} haptic />}
    >
      <View>
        <SheetLabel>About how late?</SheetLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {MINUTES.map((m) => (
            <Chip key={m} label={`${m} min`} selected={minutes === m} onPress={() => setMinutes(m)} />
          ))}
        </View>
      </View>

      <TextField label="Add a reason (optional)" value={note} onChangeText={setNote} placeholder="For example: heavy traffic on Al Waab Street" maxLength={120} />

      <View style={{ backgroundColor: t.canvas, borderRadius: radius.md, padding: space.lg, gap: space.xs }}>
        <Txt variant="subhead" tone="inkSecondary">
          Parents will see
        </Txt>
        <Txt variant="bodyMedium">{message}</Txt>
      </View>

      {error && <Banner text={error} />}
    </SheetModal>
  )
}
