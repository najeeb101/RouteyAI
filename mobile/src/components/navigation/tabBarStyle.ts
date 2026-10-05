import type { ViewStyle } from 'react-native'
import type { Palette } from '@/lib/theme'

/** Shared bottom tab bar look for the parent and driver apps: white, one hairline on top, no shadow. */
export function tabBarStyle(t: Palette): ViewStyle {
  return {
    backgroundColor: t.surface,
    borderTopColor: t.separator,
    borderTopWidth: 1,
    height: 82,
    paddingTop: 10,
    paddingBottom: 16,
    elevation: 0,
    shadowOpacity: 0,
  }
}
