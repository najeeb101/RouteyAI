import { View, type DimensionValue } from 'react-native'
import { radius, useTheme } from '@/lib/theme'

/** Thin progress bar: brand colour, success colour once complete. */
export function ProgressBar({ value, total, color, height = 6 }: { value: number; total: number; color?: string; height?: number }) {
  const t = useTheme()
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0
  const width: DimensionValue = `${pct}%`
  return (
    <View style={{ height, backgroundColor: t.separator, borderRadius: radius.full, overflow: 'hidden' }}>
      <View style={{ height: '100%', width, backgroundColor: pct === 100 ? t.success : (color ?? t.brand), borderRadius: radius.full }} />
    </View>
  )
}
