import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { colors } from '@/lib/colors'
import { CHILD_STATUS } from '@/features/parent/components/childStatus'
import type { ChildStatus, ParentChildProfile } from '@/features/parent/screens/useParentData'

type ChildSwitcherProps = {
  items: ParentChildProfile[]
  selectedId: string | null
  statusFor: (id: string) => ChildStatus
  onSelect: (id: string) => void
  /** `dark` sits on the navy header; `light` floats over the map. */
  variant?: 'dark' | 'light'
}

/**
 * One chip per child with their live status, so a parent with several children can switch between them.
 * With a single child it shows one full-width card instead.
 */
export function ChildSwitcher({ items, selectedId, statusFor, onSelect, variant = 'dark' }: ChildSwitcherProps) {
  const dark = variant === 'dark'

  function renderChip(child: ParentChildProfile, single: boolean) {
    const selected = single || child.id === selectedId
    const meta = CHILD_STATUS[statusFor(child.id)]
    const background = dark ? (selected ? '#FFFFFF' : 'rgba(255,255,255,0.08)') : selected ? colors.dark : '#FFFFFF'
    const nameColor = dark ? (selected ? colors.dark : '#FFFFFF') : selected ? '#FFFFFF' : colors.dark
    const captionColor = dark ? (selected ? colors.muted : 'rgba(255,255,255,0.6)') : selected ? 'rgba(255,255,255,0.7)' : colors.muted

    return (
      <TouchableOpacity
        key={child.id}
        onPress={() => onSelect(child.id)}
        disabled={single}
        activeOpacity={0.85}
        accessibilityRole={single ? undefined : 'tab'}
        accessibilityState={{ selected }}
        accessibilityLabel={`${child.name}, ${meta.label}`}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingLeft: 6,
          paddingRight: 14,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: background,
          borderWidth: 1,
          borderColor: dark ? (selected ? '#FFFFFF' : 'rgba(255,255,255,0.1)') : colors.border,
          shadowColor: colors.dark,
          shadowOpacity: dark ? 0 : 0.12,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: dark ? 0 : 3,
        }}
      >
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: child.busColor,
            borderWidth: 2,
            borderColor: selected ? meta.color : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_800ExtraBold', fontSize: 12 }}>{child.initials}</Text>
        </View>
        <View style={{ flexShrink: 1 }}>
          <Text style={{ color: nameColor, fontFamily: 'Inter_700Bold', fontSize: 13.5 }} numberOfLines={1}>
            {single ? child.name : child.firstName}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: meta.color }} />
            <Text style={{ color: captionColor, fontFamily: 'Inter_500Medium', fontSize: 11 }} numberOfLines={1}>
              {meta.label}
              {single && child.busName ? ` · ${child.busName}` : ''}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  if (items.length === 1 && items[0]) return <View>{renderChip(items[0], true)}</View>

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingRight: 4 }}
      accessibilityRole="tablist"
      style={{ flexGrow: 0 }}
    >
      {items.map((child) => renderChip(child, false))}
    </ScrollView>
  )
}
