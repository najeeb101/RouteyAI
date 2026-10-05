import type { ReactNode } from 'react'
import { View } from 'react-native'
import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from 'lucide-react-native'
import { Icon } from '@/components/primitives/Icon'
import { Txt } from '@/components/primitives/Txt'
import { radius, space, useTheme, type Palette } from '@/lib/theme'

const tones: Record<'danger' | 'warning' | 'info' | 'success', { bg: keyof Palette; ink: keyof Palette; icon: LucideIcon }> = {
  danger: { bg: 'dangerTint', ink: 'dangerText', icon: CircleAlert },
  warning: { bg: 'warningTint', ink: 'warningText', icon: TriangleAlert },
  info: { bg: 'infoTint', ink: 'infoText', icon: Info },
  success: { bg: 'successTint', ink: 'successText', icon: CircleCheck },
}

/** One-line status or error message on a tinted background, with an optional text-button action on the right. */
export function Banner({ text, tone = 'danger', action }: { text: string; tone?: keyof typeof tones; action?: ReactNode }) {
  const t = useTheme()
  const { bg, ink, icon } = tones[tone]
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: t[bg], borderRadius: radius.md, padding: space.md }}>
      <Icon icon={icon} size={18} color={t[ink]} />
      <Txt variant="subhead" color={t[ink]} style={{ flex: 1 }}>
        {text}
      </Txt>
      {action}
    </View>
  )
}
