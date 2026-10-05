import { View } from 'react-native'
import { Txt } from '@/components/primitives/Txt'
import { space } from '@/lib/theme'

/** A big number with a label under it ("5" "/11" over "boarded"). `md` fits three across a card. */
export function Stat({ value, suffix, label, color, align = 'left', size = 'lg' }: { value: string; suffix?: string; label: string; color?: string; align?: 'left' | 'center'; size?: 'lg' | 'md' }) {
  return (
    <View style={{ alignItems: align === 'center' ? 'center' : 'flex-start', gap: space.xs - 2 }}>
      <Txt variant={size === 'lg' ? 'display' : 'largeTitle'} color={color} style={size === 'md' ? { fontVariant: ['tabular-nums'] } : undefined}>
        {value}
        {suffix && (
          <Txt variant="title" tone="inkSecondary">
            {suffix}
          </Txt>
        )}
      </Txt>
      <Txt variant="subhead" tone="inkSecondary">
        {label}
      </Txt>
    </View>
  )
}
