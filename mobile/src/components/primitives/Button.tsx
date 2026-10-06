import { ActivityIndicator, Pressable, type ViewStyle } from 'react-native'
import * as Haptics from 'expo-haptics'
import type { LucideIcon } from 'lucide-react-native'
import { Icon } from '@/components/primitives/Icon'
import { Txt } from '@/components/primitives/Txt'
import { minTouch, radius, space, useTheme } from '@/lib/theme'

type Variant = 'primary' | 'secondary' | 'plain' | 'destructive' | 'onNight'

type ButtonProps = {
  label: string
  onPress: () => void
  variant?: Variant
  icon?: LucideIcon
  disabled?: boolean
  loading?: boolean
  /** Light tap feedback, for the actions that matter on the road (Board, Absent, Start, End). */
  haptic?: boolean
  /** Shorter button for use inside cards and rows. */
  compact?: boolean
  style?: ViewStyle
}

/** Rounded-rectangle button: primary (brand fill), secondary (brand tint), plain (text only), destructive, and onNight (white, for the navy signature card). */
export function Button({ label, onPress, variant = 'primary', icon, disabled = false, loading = false, haptic = false, compact = false, style }: ButtonProps) {
  const t = useTheme()
  const fill = { primary: t.brand, secondary: t.brandTint, plain: 'transparent', destructive: t.dangerTint, onNight: t.onNight }[variant]
  const pressedFill = { primary: t.brandPressed, secondary: t.brandTintPressed, plain: t.brandTint, destructive: t.dangerTintPressed, onNight: t.onNightPressed }[variant]
  const ink = disabled ? (variant === 'onNight' ? t.onNightTertiary : t.inkTertiary) : { primary: t.onBrand, secondary: t.brand, plain: t.brand, destructive: t.dangerText, onNight: t.night }[variant]

  return (
    <Pressable
      onPress={() => {
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
        onPress()
      }}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        {
          minHeight: compact ? minTouch : 50,
          paddingHorizontal: compact ? space.lg : space.xl,
          borderRadius: radius.md,
          backgroundColor: disabled && variant !== 'plain' ? (variant === 'onNight' ? t.nightLine : t.separator) : pressed ? pressedFill : fill,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: space.sm,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={ink} size="small" />
      ) : (
        <>
          {icon && <Icon icon={icon} size={compact ? 18 : 20} color={ink} strokeWidth={2} />}
          <Txt variant={compact ? 'bodyMedium' : 'headline'} color={ink} numberOfLines={1}>
            {label}
          </Txt>
        </>
      )}
    </Pressable>
  )
}
