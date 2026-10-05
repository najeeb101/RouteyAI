import { View } from 'react-native'
import { Txt } from '@/components/primitives/Txt'
import { radius, space, useTheme, type Palette } from '@/lib/theme'

export type StatusTone = 'success' | 'warning' | 'danger' | 'live' | 'neutral'

/** The dot colour for each tone, also used by the child switcher. */
export const STATUS_DOT: Record<StatusTone, keyof Palette> = { success: 'success', warning: 'warning', danger: 'danger', live: 'live', neutral: 'inkTertiary' }
const ink: Record<StatusTone, keyof Palette> = { success: 'successText', warning: 'warningText', danger: 'dangerText', live: 'ink', neutral: 'inkSecondary' }
const tint: Partial<Record<StatusTone, keyof Palette>> = { warning: 'warningTint', danger: 'dangerTint' }

/**
 * A coloured dot and a word ("On time", "Absent"). Only states that need attention get a tinted background, and only
 * with `emphasis`, so most of the screen stays calm.
 */
export function StatusText({ label, tone = 'neutral', emphasis = false }: { label: string; tone?: StatusTone; emphasis?: boolean }) {
  const t = useTheme()
  const bg = emphasis ? tint[tone] : undefined
  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'center', gap: space.xs + 2, alignSelf: 'flex-start' },
        bg ? { backgroundColor: t[bg], paddingHorizontal: space.sm, paddingVertical: space.xs - 1, borderRadius: radius.sm } : null,
      ]}
    >
      <View style={{ width: 7, height: 7, borderRadius: radius.full, backgroundColor: t[STATUS_DOT[tone]] }} />
      <Txt variant="subhead" color={t[ink[tone]]}>
        {label}
      </Txt>
    </View>
  )
}
