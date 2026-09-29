'use client'

import { useOpenAppModal } from '@/components/landing/AppModalProvider'

export function AppDownloadButton({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const open = useOpenAppModal()
  return (
    <button type="button" onClick={open} className={className}>
      {children}
    </button>
  )
}
