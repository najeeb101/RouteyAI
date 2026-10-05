import { View } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import { Icon } from '@/components/primitives/Icon'
import { Txt } from '@/components/primitives/Txt'
import { fonts, radius, space, useTheme } from '@/lib/theme'

type TabIconProps = {
  label: string
  icon: LucideIcon
  focused: boolean
  /** Small count bubble, e.g. unread alerts. */
  badge?: number
}

/** Tab bar item: Lucide icon over a label, brand colour and a heavier stroke when active. No bubble. */
export function TabIcon({ label, icon, focused, badge = 0 }: TabIconProps) {
  const t = useTheme()
  const color = focused ? t.brand : t.inkTertiary

  return (
    <View style={{ alignItems: 'center', gap: space.xs - 1, minWidth: 64 }}>
      <View>
        <Icon icon={icon} size={24} color={color} strokeWidth={focused ? 2.2 : 1.75} />
        {badge > 0 && (
          <View
            style={{
              position: 'absolute',
              top: -4,
              right: -9,
              minWidth: 17,
              height: 17,
              paddingHorizontal: 4,
              borderRadius: radius.full,
              backgroundColor: t.danger,
              borderWidth: 2,
              borderColor: t.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Txt variant="caption" tone="onBrand" style={{ fontSize: 10, lineHeight: 12, fontFamily: fonts.semibold }}>
              {badge > 9 ? '9+' : badge}
            </Txt>
          </View>
        )}
      </View>
      <Txt variant="caption" color={color} style={{ fontSize: 11, lineHeight: 14, fontFamily: focused ? fonts.semibold : fonts.medium }}>
        {label}
      </Txt>
    </View>
  )
}
