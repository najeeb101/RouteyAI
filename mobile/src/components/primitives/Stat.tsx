import { View } from 'react-native'
import { Txt } from '@/components/primitives/Txt'
import { space } from '@/lib/theme'

/** A big number with a label under it ("5" "/11" over "boarded"). `md` fits three across a card. */
export function Stat({ value, suffix, label, color, align = 'left', size = 'lg', onNight = false }: { value: string; suffix?: string; label: string; color?: string; align?: 'left' | 'center'; size?: 'lg' | 'md'; onNight?: boolean }) {
  return (
    <View style={{ alignItems: align === 'center' ? 'center' : 'flex-start', gap: space.xs - 2 }}>
      <Txt variant={size === 'lg' ? 'display' : 'largeTitle'} tone={onNight ? 'onNight' : 'ink'} color={color} style={size === 'md' ? { fontVariant: ['tabular-nums'] } : undefined}>
        {value}
        {suffix && (
          <Txt variant="title" tone={onNight ? 'onNightSecondary' : 'inkSecondary'}>
            {suffix}
          </Txt>
        )}
      </Txt>
      <Txt variant="subhead" tone={onNight ? 'onNightSecondary' : 'inkSecondary'}>
        {label}
      </Txt>
    </View>
  )
}
