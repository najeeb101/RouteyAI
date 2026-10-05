import type { StatusTone } from '@/components/primitives/StatusText'
import type { ChildStatus } from '@/features/parent/screens/useParentData'

/** How each child status reads on screen: a short label and its StatusText tone. */
export const CHILD_STATUS: Record<ChildStatus, { label: string; tone: StatusTone }> = {
  boarded: { label: 'On the bus', tone: 'success' },
  absent: { label: 'Absent', tone: 'danger' },
  reported: { label: 'Staying home', tone: 'warning' },
  waiting: { label: 'Waiting', tone: 'neutral' },
  'no-bus': { label: 'No bus yet', tone: 'neutral' },
}
