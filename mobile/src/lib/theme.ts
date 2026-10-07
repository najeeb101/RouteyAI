import type { TextStyle, ViewStyle } from 'react-native'

/**
 * The app's design tokens (Docs/plans/mobile-ui-refresh.md). Screens never use raw colours, font names or
 * sizes: they read colours through useTheme() and set text with <Txt variant>. Same families and palette as the landing
 * page: Schibsted Grotesk for headings and big numbers, Inter for body text, deep blue only for things you can act on.
 */

const light = {
  ink: '#0F172A',
  inkSecondary: '#64748B',
  inkTertiary: '#94A3B8',
  canvas: '#F6F7F9',
  surface: '#FFFFFF',
  separator: '#E5E7EB',
  brand: '#1E3A8A',
  brandPressed: '#172E6E',
  brandTint: 'rgba(30, 58, 138, 0.08)',
  brandTintPressed: 'rgba(30, 58, 138, 0.14)',
  onBrand: '#FFFFFF',
  onBrandSecondary: 'rgba(255, 255, 255, 0.78)',
  live: '#38BDF8',
  success: '#10B981',
  successText: '#047857',
  successTint: '#ECFDF5',
  warning: '#F59E0B',
  warningText: '#B45309',
  warningTint: '#FFFBEB',
  danger: '#EF4444',
  dangerText: '#B91C1C',
  dangerTint: '#FEF2F2',
  dangerTintPressed: '#FEE2E2',
  infoTint: '#EFF6FF',
  infoText: '#1E40AF',
  scrim: 'rgba(15, 23, 42, 0.4)',
  // Brand surfaces: the landing page's navy (footer, safety section) for the one signature card per screen and the
  // login panel. The logo's blue-to-cyan route line is drawn on it; see components/brand.
  night: '#0A1430',
  nightGlow: '#1E40AF',
  nightLine: 'rgba(255, 255, 255, 0.16)',
  onNight: '#FFFFFF',
  onNightSecondary: 'rgba(255, 255, 255, 0.72)',
  onNightTertiary: 'rgba(255, 255, 255, 0.5)',
  onNightPressed: 'rgba(255, 255, 255, 0.86)',
  routeStart: '#2563EB',
  routeEnd: '#22D3EE',
}

export type Palette = typeof light

/** The brand blue for places outside React, such as the Android "Route in progress" notification. */
export const BRAND_COLOR = light.brand

export const fonts = {
  display: 'SchibstedGrotesk_700Bold',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
} as const

export const type = {
  display: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44, letterSpacing: -0.8, fontVariant: ['tabular-nums'] as TextStyle['fontVariant'] },
  largeTitle: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  title: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  headline: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  subhead: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
} satisfies Record<string, TextStyle>

export type TextVariant = keyof typeof type

export const radius = { sm: 6, md: 12, lg: 20, full: 999 } as const

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 40 } as const

/** The screen's side margin. */
export const gutter = space.xl

/** The only shadow: for cards, chips and sheets floating over the map. Flat cards on the canvas have none. */
export const floatingShadow: ViewStyle = {
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 12,
  elevation: 6,
}

/** Smallest comfortable touch target (pt). */
export const minTouch = 44

/**
 * The active palette. Always light for now; dark mode will pick a second palette from useColorScheme() here, which is
 * why screens read colours through this hook instead of importing them.
 */
export function useTheme(): Palette {
  return light
}
