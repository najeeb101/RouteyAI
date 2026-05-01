import { View } from 'react-native'
import type { DimensionValue } from 'react-native'
import { colors } from '@/lib/colors'

type ProgressBarProps = {
  value: number
  total: number
  color?: string
  height?: number
}

export function ProgressBar({ value, total, color = colors.primary, height = 8 }: ProgressBarProps) {
  const width: DimensionValue = total > 0 ? `${Math.min(100, Math.round((value / total) * 100))}%` : '0%'
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0

  // Color changes as progress increases: low=danger, mid=warning, high=success
  const fillColor = pct === 100 ? colors.success : pct >= 60 ? colors.primaryLight : color

  return (
    <View
      style={{
        height,
        backgroundColor: colors.borderLight,
        borderRadius: height / 2,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: '100%',
          width,
          backgroundColor: fillColor,
          borderRadius: height / 2,
          shadowColor: fillColor,
          shadowOpacity: 0.4,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 0 },
        }}
      />
    </View>
  )
}
