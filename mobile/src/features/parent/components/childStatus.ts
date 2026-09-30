import type { ComponentProps } from 'react'
import type { Ionicons } from '@expo/vector-icons'
import { colors } from '@/lib/colors'
import type { ChildStatus } from '@/features/parent/screens/useParentData'

type Meta = {
  /** Short label for chips and pills. */
  label: string
  color: string
  bg: string
  icon: ComponentProps<typeof Ionicons>['name']
}

export const CHILD_STATUS: Record<ChildStatus, Meta> = {
  boarded: { label: 'On the bus', color: colors.successMid, bg: colors.successBg, icon: 'checkmark-circle' },
  absent: { label: 'Absent', color: colors.danger, bg: colors.dangerBg, icon: 'close-circle' },
  reported: { label: 'Staying home', color: '#B45309', bg: colors.warningBg, icon: 'home' },
  waiting: { label: 'Waiting', color: colors.info, bg: colors.infoBg, icon: 'time' },
  'no-bus': { label: 'No bus yet', color: colors.muted, bg: colors.borderLight, icon: 'help-circle' },
}
