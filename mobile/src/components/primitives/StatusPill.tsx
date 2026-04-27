import { Text, View } from 'react-native'
import { colors } from '@/lib/colors'

type StatusPillProps = {
  label: string
  tone?: 'success' | 'info' | 'warning' | 'danger'
}

const toneColor = {
  success: colors.success,
  info: colors.info,
  warning: colors.warning,
  danger: colors.danger,
}

const toneBg = {
  success: 'rgba(16,185,129,0.18)',
  info: 'rgba(59,130,246,0.18)',
  warning: 'rgba(245,158,11,0.18)',
  danger: 'rgba(239,68,68,0.18)',
}

export function StatusPill({ label, tone = 'success' }: StatusPillProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: toneBg[tone],
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: toneColor[tone] }} />
      <Text style={{ color: toneColor[tone], fontFamily: 'Inter_700Bold', fontSize: 11 }}>{label}</Text>
    </View>
  )
}
