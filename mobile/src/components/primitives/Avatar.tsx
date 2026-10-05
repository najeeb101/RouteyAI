import { View } from 'react-native'
import { Txt } from '@/components/primitives/Txt'
import { fonts, radius, useTheme } from '@/lib/theme'

/** Initials in a circle, for people (parent, driver, students). */
export function Avatar({ name, size = 40, tone = 'tint' }: { name: string; size?: number; tone?: 'tint' | 'brand' }) {
  const t = useTheme()
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join('') || '?'
  const large = size >= 56
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius.full,
        backgroundColor: tone === 'brand' ? t.brand : t.brandTint,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Txt variant={large ? 'title' : 'subhead'} color={tone === 'brand' ? t.onBrand : t.brand} style={large ? undefined : { fontFamily: fonts.semibold }}>
        {initials}
      </Txt>
    </View>
  )
}
