import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const tones = {
  danger: { bg: '#FEF2F2', border: '#FECACA', color: '#B91C1C', icon: 'alert-circle' as const },
  warning: { bg: '#FFFBEB', border: '#FDE68A', color: '#92400E', icon: 'warning' as const },
  info: { bg: '#EFF6FF', border: '#BFDBFE', color: '#1E40AF', icon: 'information-circle' as const },
  success: { bg: '#ECFDF5', border: '#A7F3D0', color: '#065F46', icon: 'checkmark-circle' as const },
}

/** One-line status or error message, with an optional action on the right. */
export function Banner({ text, tone = 'danger', action }: { text: string; tone?: keyof typeof tones; action?: ReactNode }) {
  const t = tones[tone]
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: t.bg,
        borderWidth: 1,
        borderColor: t.border,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}
    >
      <Ionicons name={t.icon} size={18} color={t.color} />
      <Text style={{ flex: 1, color: t.color, fontSize: 12.5, fontFamily: 'Inter_600SemiBold', lineHeight: 18 }}>{text}</Text>
      {action}
    </View>
  )
}
