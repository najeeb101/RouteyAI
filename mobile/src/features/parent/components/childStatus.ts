import type { StatusTone } from '@/components/primitives/StatusText'
import type { ChildStatus } from '@/features/parent/screens/useParentData'
import { CARD_STATUS } from '@/lib/runs'

/** How each child status reads on screen: a short label and its StatusText tone (the words live in lib/runs). */
export const CHILD_STATUS: Record<ChildStatus, { label: string; tone: StatusTone }> = CARD_STATUS
