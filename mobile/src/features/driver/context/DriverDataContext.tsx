import { createContext, useContext, type ReactNode } from 'react'
import { useDriverData } from '@/features/driver/hooks/useDriverData'
import { useTrip } from '@/features/driver/hooks/useTrip'

type DriverContextValue = ReturnType<typeof useDriverData> & { trip: ReturnType<typeof useTrip> }

const DriverDataContext = createContext<DriverContextValue | null>(null)

export function DriverDataProvider({ children }: { children: ReactNode }) {
  const data = useDriverData()
  const trip = useTrip({
    busId: data.profile?.busId ?? null,
    run: data.run,
    running: data.running,
    runsLoaded: data.runsLoaded,
    onRunsChanged: data.reloadRuns,
  })
  return <DriverDataContext.Provider value={{ ...data, trip }}>{children}</DriverDataContext.Provider>
}

export function useDriverContext(): DriverContextValue {
  const ctx = useContext(DriverDataContext)
  if (!ctx) throw new Error('useDriverContext must be used inside DriverDataProvider')
  return ctx
}
