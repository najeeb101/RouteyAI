import { Text, View } from 'react-native'
import { Card } from '@/components/primitives/Card'
import { colors } from '@/lib/colors'

type MetricCardProps = {
  label: string
  value: string
  color?: string
}

export function MetricCard({ label, value, color = colors.primary }: MetricCardProps) {
  return (
    <Card style={{ flex: 1, alignItems: 'center', padding: 12, borderRadius: 14 }}>
      <Text style={{ fontSize: 20, fontFamily: 'Inter_800ExtraBold', color }}>{value}</Text>
      <Text style={{ fontSize: 10, color: colors.subtle, fontFamily: 'Inter_500Medium', marginTop: 2, textAlign: 'center' }}>
        {label}
      </Text>
    </Card>
  )
}
