import type { ComponentProps } from 'react'
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/lib/colors'

/** Full-width main button for sheets and forms (52 pt tall, easy to hit one-handed). */
export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  tone = 'primary',
  icon,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  tone?: 'primary' | 'danger'
  icon?: ComponentProps<typeof Ionicons>['name']
}) {
  const bg = tone === 'danger' ? colors.danger : colors.primary
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      style={{
        height: 52,
        borderRadius: 16,
        backgroundColor: disabled ? colors.border : bg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
      }}
    >
      {loading ? <ActivityIndicator color="#FFFFFF" size="small" /> : icon && <Ionicons name={icon} size={18} color={disabled ? colors.muted : '#FFFFFF'} />}
      <Text style={{ color: disabled ? colors.muted : '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 15 }}>{label}</Text>
    </TouchableOpacity>
  )
}
