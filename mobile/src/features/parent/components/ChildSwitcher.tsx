import { View } from 'react-native'
import { SegmentedControl } from '@/components/primitives/SegmentedControl'
import { STATUS_DOT } from '@/components/primitives/StatusText'
import { CHILD_STATUS } from '@/features/parent/components/childStatus'
import type { ChildStatus, ParentChildProfile } from '@/features/parent/screens/useParentData'
import { floatingShadow, radius, useTheme } from '@/lib/theme'

type ChildSwitcherProps = {
  items: ParentChildProfile[]
  selectedId: string | null
  statusFor: (id: string) => ChildStatus
  onSelect: (id: string) => void
  /** `floating` sits on a white card over the map. */
  variant?: 'canvas' | 'floating'
}

/**
 * A segmented control with each child's first name and a status dot, for parents with more than one child.
 * Renders nothing for a single child: the screen title already names them.
 */
export function ChildSwitcher({ items, selectedId, statusFor, onSelect, variant = 'canvas' }: ChildSwitcherProps) {
  const t = useTheme()
  if (items.length < 2) return null

  const control = (
    <SegmentedControl
      segments={items.map((child) => ({
        key: child.id,
        label: child.firstName,
        leading: <View style={{ width: 7, height: 7, borderRadius: radius.full, backgroundColor: t[STATUS_DOT[CHILD_STATUS[statusFor(child.id)].tone]] }} />,
      }))}
      value={selectedId}
      onChange={onSelect}
      onSurface={variant === 'floating'}
    />
  )

  if (variant === 'canvas') return control
  return <View style={[{ backgroundColor: t.surface, borderRadius: radius.md + 3, padding: 3 }, floatingShadow]}>{control}</View>
}
