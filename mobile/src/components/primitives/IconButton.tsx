import { Pressable, View } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import { Icon } from '@/components/primitives/Icon'
import { Txt } from '@/components/primitives/Txt'
import { minTouch, radius, useTheme } from '@/lib/theme'

/** A round icon-only button (header actions, closing a sheet), with an optional count badge. */
export function IconButton({ icon, label, onPress, badge = 0, filled = true }: { icon: LucideIcon; label: string; onPress: () => void; badge?: number; filled?: boolean }) {
  const t = useTheme()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => ({
        width: minTouch - 4,
        height: minTouch - 4,
        borderRadius: radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: filled ? (pressed ? t.separator : t.surface) : 'transparent',
        opacity: !filled && pressed ? 0.5 : 1,
      })}
    >
      <Icon icon={icon} size={20} color={t.ink} />
      {badge > 0 && (
        <View
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            minWidth: 18,
            height: 18,
            paddingHorizontal: 5,
            borderRadius: radius.full,
            backgroundColor: t.danger,
            borderWidth: 2,
            borderColor: t.canvas,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Txt variant="caption" tone="onBrand" style={{ fontSize: 10, lineHeight: 12 }}>
            {badge > 9 ? '9+' : badge}
          </Txt>
        </View>
      )}
    </Pressable>
  )
}
