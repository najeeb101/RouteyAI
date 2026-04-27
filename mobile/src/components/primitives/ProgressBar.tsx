import { View } from 'react-native'
import type { DimensionValue } from 'react-native'
import { colors } from '@/lib/colors'

type ProgressBarProps = {
  value: number
  total: number
}

export function ProgressBar({ value, total }: ProgressBarProps) {
  const width: DimensionValue = total > 0 ? `${Math.min(100, Math.round((value / total) * 100))}%` : '0%'

  return (
    <View style={{ height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
      <View style={{ height: '100%', width, backgroundColor: colors.primary, borderRadius: 4 }} />
    </View>
  )
}
