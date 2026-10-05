import { Pressable, View } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import { Icon } from '@/components/primitives/Icon'
import { Txt } from '@/components/primitives/Txt'
import { minTouch, radius, space, useTheme } from '@/lib/theme'

type ChipProps = {
  label: string
  selected?: boolean
  disabled?: boolean
  icon?: LucideIcon
  /** Second line, e.g. "Reported" under a date. */
  caption?: string
  onPress?: () => void
}

/** Selectable choice used for dates, reasons and minutes in the sheets. */
export function Chip({ label, selected = false, disabled = false, icon, caption, onPress }: ChipProps) {
  const t = useTheme()
  const ink = disabled ? t.inkTertiary : selected ? t.onBrand : t.ink
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => ({
        minHeight: minTouch,
        paddingHorizontal: space.lg,
        paddingVertical: space.sm,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: selected ? t.brand : t.separator,
        backgroundColor: selected ? t.brand : disabled || pressed ? t.canvas : t.surface,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs + 2 }}>
        {icon && <Icon icon={icon} size={16} color={ink} />}
        <Txt variant="bodyMedium" color={ink}>
          {label}
        </Txt>
      </View>
      {caption && (
        <Txt variant="caption" color={selected ? t.onBrandSecondary : t.inkSecondary}>
          {caption}
        </Txt>
      )}
    </Pressable>
  )
}
