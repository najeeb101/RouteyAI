import { Text, View } from 'react-native'
import { colors } from '@/lib/colors'

type MetricCardProps = {
  label: string
  value: string
  color?: string
  icon?: string
}

export function MetricCard({ label, value, color = colors.primary, icon }: MetricCardProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        shadowColor: colors.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View style={{ height: 3, backgroundColor: color }} />
      <View style={{ padding: 12, alignItems: 'center', gap: 3 }}>
        {icon && <Text style={{ fontSize: 16, marginBottom: 1 }}>{icon}</Text>}
        <Text style={{ fontSize: 22, fontFamily: 'Inter_800ExtraBold', color, letterSpacing: -0.5 }}>
          {value}
        </Text>
        <Text
          style={{
            fontSize: 9,
            color: colors.subtle,
            fontFamily: 'Inter_600SemiBold',
            textTransform: 'uppercase',
            letterSpacing: 0.6,
            textAlign: 'center',
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  )
}
