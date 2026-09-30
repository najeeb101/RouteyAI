"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

/** Marketing pages always use the light brand theme, whatever the visitor's system setting. */
const LIGHT_ONLY_PATHS = new Set(["/", "/privacy", "/terms"])

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const pathname = usePathname()
  const forcedTheme = LIGHT_ONLY_PATHS.has(pathname) ? "light" : undefined
  return (
    <NextThemesProvider {...props} forcedTheme={forcedTheme}>
      {children}
    </NextThemesProvider>
  )
}
