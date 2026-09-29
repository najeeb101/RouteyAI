'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { AppDownloadModal } from '@/components/landing/AppDownloadModal'

const AppModalContext = createContext<(() => void) | null>(null)

export function useOpenAppModal() {
  const open = useContext(AppModalContext)
  if (!open) throw new Error('useOpenAppModal must be used inside <AppModalProvider>')
  return open
}

export function AppModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])

  return (
    <AppModalContext.Provider value={open}>
      {children}
      {isOpen && <AppDownloadModal onClose={() => setIsOpen(false)} />}
    </AppModalContext.Provider>
  )
}
