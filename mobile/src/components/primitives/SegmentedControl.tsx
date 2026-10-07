import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { Txt } from '@/components/primitives/Txt'
import { fonts, minTouch, radius, space, useTheme } from '@/lib/theme'

export type Segment<K extends string> = { key: K; label: string; leading?: ReactNode }

/** Two to four mutually exclusive choices in one track (iOS segmented control). */
export function SegmentedControl<K extends string>({ segments, value, onChange, onSurface = false }: { segments: Segment<K>[]; value: K | null; onChange: (key: K) => void; onSurface?: boolean }) {
  const t = useTheme()
  return (
    <View style={{ flexDirection: 'row', padding: 3, gap: 3, borderRadius: radius.md, backgroundColor: onSurface ? t.canvas : t.separator }}>
      {segments.map((s) => {
        const selected = s.key === value
        return (
          <Pressable
            key={s.key}
            onPress={() => onChange(s.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={{
              flex: 1,
              minHeight: minTouch - 6,
              borderRadius: radius.md - 3,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: space.xs + 2,
              paddingHorizontal: space.sm,
              backgroundColor: selected ? t.surfaceRaised : 'transparent',
              borderWidth: selected ? 1 : 0,
              borderColor: t.separator,
            }}
          >
            {s.leading}
            <Txt variant="subhead" color={selected ? t.ink : t.inkSecondary} numberOfLines={1} style={selected ? { fontFamily: fonts.semibold } : undefined}>
              {s.label}
            </Txt>
          </Pressable>
        )
      })}
    </View>
  )
}
