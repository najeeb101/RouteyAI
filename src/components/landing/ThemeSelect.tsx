'use client'

import { useEffect, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

const OPTIONS = [
  { value: 'system', label: 'Match device', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const

/** Three-way theme choice for the footer, including going back to the device setting. */
export function ThemeSelect() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div role="radiogroup" aria-label="Colour theme" className="inline-flex rounded-full bg-white/[0.06] p-1 ring-1 ring-white/10">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const selected = mounted && theme === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
              selected ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
            )}
          >
            <Icon size={15} />
          </button>
        )
      })}
    </div>
  )
}
