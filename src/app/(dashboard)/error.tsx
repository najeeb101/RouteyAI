'use client'

import { useEffect } from 'react'
import { RefreshCw, TriangleAlert } from 'lucide-react'
import { ActionButton } from '@/components/dashboard/ActionButton'

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center text-center animate-rise motion-reduce:animate-none">
      <TriangleAlert size={28} strokeWidth={1.75} className="mb-3 text-bad" aria-hidden="true" />
      <h2 className="font-display text-xl font-bold text-ink">This page didn&apos;t load</h2>
      <p className="mt-1 max-w-sm text-sm text-ink-2">{error.message || 'Something went wrong. Try again in a moment.'}</p>
      <ActionButton className="mt-6" onClick={reset}><RefreshCw /> Try again</ActionButton>
    </div>
  )
}
