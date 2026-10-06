import { Text, type TextProps, type TextStyle } from 'react-native'
import { type, useTheme, type Palette, type TextVariant } from '@/lib/theme'

type Tone = Extract<
  keyof Palette,
  'ink' | 'inkSecondary' | 'inkTertiary' | 'brand' | 'onBrand' | 'successText' | 'warningText' | 'dangerText' | 'infoText' | 'onNight' | 'onNightSecondary' | 'onNightTertiary'
>

type TxtProps = TextProps & {
  variant?: TextVariant
  /** A palette colour. */
  tone?: Tone
  /** A colour from data, such as the bus's route colour. Wins over tone. */
  color?: string
  align?: TextStyle['textAlign']
}

/**
 * All text in the app. Follows the phone's text size setting up to 1.3×, so layouts hold at large sizes.
 * See lib/theme for the variants.
 */
export function Txt({ variant = 'body', tone = 'ink', color, align, style, ...props }: TxtProps) {
  const t = useTheme()
  return (
    <Text
      maxFontSizeMultiplier={1.3}
      {...props}
      style={[type[variant], { color: color ?? t[tone] }, align ? { textAlign: align } : null, style]}
    />
  )
}
