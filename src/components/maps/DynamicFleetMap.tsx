'use client'

import dynamic from 'next/dynamic'
import { MapPinOff } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Shown when the map's code can't be loaded (a stale tab after a deploy, a dropped connection): the page still works. */
function MapUnavailable({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 rounded-xl bg-canvas text-center', className)}>
      <MapPinOff size={24} className="text-ink-3" aria-hidden="true" />
      <p className="text-sm font-medium text-ink">The map didn&apos;t load</p>
      <p className="text-xs text-ink-2">Refresh the page to try again.</p>
    </div>
  )
}

/** FleetMap loaded in the browser only: Mapbox GL needs window and is too big for the first page load. */
export const DynamicFleetMap = dynamic(
  () => import('./FleetMap').then((m) => m.FleetMap).catch(() => MapUnavailable),
  {
    ssr: false,
    loading: () => <div className="h-full min-h-[inherit] w-full animate-pulse rounded-xl bg-[#ECEEF1]" aria-hidden="true" />,
  },
)
