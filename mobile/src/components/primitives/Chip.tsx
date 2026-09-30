import type { ComponentProps } from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/lib/colors'

type ChipProps = {
  label: string
  selected?: boolean
  disabled?: boolean
  icon?: ComponentProps<typeof Ionicons>['name']
  /** Second line, e.g. "Reported" under a date. */
  caption?: string
  onPress?: () => void
}

/** Selectable pill used for dates, reasons and minutes in the sheets. */
export function Chip({ label, selected = false, disabled = false, icon, caption, onPress }: ChipProps) {
  const color = disabled ? colors.subtle : selected ? '#FFFFFF' : colors.dark
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      style={{
        flexDirection: caption ? 'column' : 'row',
        alignItems: 'center',
        gap: caption ? 1 : 6,
        paddingHorizontal: 14,
        paddingVertical: caption ? 8 : 10,
        minHeight: 44,
        justifyContent: 'center',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.primary : disabled ? colors.borderLight : colors.surface,
      }}
    >
      {icon && <Ionicons name={icon} size={15} color={color} />}
      <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color }}>{label}</Text>
      {caption && (
        <Text style={{ fontSize: 10, fontFamily: 'Inter_500Medium', color: selected ? 'rgba(255,255,255,0.75)' : colors.subtle }}>{caption}</Text>
      )}
    </TouchableOpacity>
  )
}
