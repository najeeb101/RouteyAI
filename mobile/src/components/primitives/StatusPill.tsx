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
  success: 'rgba(16,185,129,0.14)',
  info: 'rgba(59,130,246,0.14)',
  warning: 'rgba(245,158,11,0.14)',
  danger: 'rgba(239,68,68,0.14)',
}

const toneBorder = {
  success: 'rgba(16,185,129,0.3)',
  info: 'rgba(59,130,246,0.3)',
  warning: 'rgba(245,158,11,0.3)',
  danger: 'rgba(239,68,68,0.3)',
}

export function StatusPill({ label, tone = 'success' }: StatusPillProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: toneBg[tone],
        borderWidth: 1,
        borderColor: toneBorder[tone],
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: toneColor[tone],
          // Pulse indicator for "Live" status
          ...(label === 'Live' ? { shadowColor: toneColor[tone], shadowOpacity: 0.8, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } } : {}),
        }}
      />
      <Text style={{ color: toneColor[tone], fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.3 }}>{label}</Text>
    </View>
  )
}
