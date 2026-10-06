import { Image, View } from 'react-native'
import { Txt } from '@/components/primitives/Txt'
import { space, type as typeScale, useTheme } from '@/lib/theme'

const LOGO = require('../../../assets/splash-icon.png')

/** The RouteyAI "R": a route line with stops, blue to cyan. `tint` draws it in one colour. */
export function BrandMark({ size = 24, tint }: { size?: number; tint?: string }) {
  return <Image source={LOGO} alt="" style={{ width: size, height: size, tintColor: tint }} accessible={false} />
}

/** Logo and name, written like the landing page's nav: "Routey" in ink, "AI" in brand blue (cyan on navy). */
export function BrandLockup({ size = 22, onNight = false }: { size?: number; onNight?: boolean }) {
  const t = useTheme()
  const fontSize = Math.round(size * 0.82)
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }} accessible accessibilityLabel="RouteyAI">
      <BrandMark size={size} />
      <Txt
        variant="title"
        color={onNight ? t.onNight : t.ink}
        style={{ fontSize, lineHeight: Math.round(fontSize * 1.25), letterSpacing: typeScale.title.letterSpacing }}
        maxFontSizeMultiplier={1}
      >
        Routey
        <Txt variant="title" color={onNight ? t.live : t.brand} style={{ fontSize }} maxFontSizeMultiplier={1}>
          AI
        </Txt>
      </Txt>
    </View>
  )
}
