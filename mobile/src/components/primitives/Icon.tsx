import type { LucideIcon } from 'lucide-react-native'
import { useTheme } from '@/lib/theme'

/** A Lucide icon (the landing page's set) with the app's stroke and default size: 22 in lists, 24 in the tab bar. */
export function Icon({ icon: Glyph, size = 22, color, strokeWidth = 1.75 }: { icon: LucideIcon; size?: number; color?: string; strokeWidth?: number }) {
  const t = useTheme()
  return <Glyph size={size} color={color ?? t.ink} strokeWidth={strokeWidth} />
}
