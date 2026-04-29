'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FleetMapSvg } from '@/components/maps/FleetMapSvg'
import type { RouteRow } from './page'

function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-7 h-7 bg-[#F1F5F9] rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#E2E8F0] transition-colors">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  )
}

function capacityPct(r: RouteRow) {
  return 0
}

export default function RoutesClient({ initialRoutes }: { initialRoutes: RouteRow[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [routes]   = useState<RouteRow[]>(initialRoutes)
  const [selected, setSelected] = useState<RouteRow | null>(null)

  const [recalcRoute,   setRecalcRoute]   = useState<RouteRow | null>(null)
  const [recalcLoading, setRecalcLoading] = useState(false)
  const [recalcDone,    setRecalcDone]    = useState(false)
  const [recalcError,   setRecalcError]   = useState<string | null>(null)
  const [allLoading,    setAllLoading]    = useState(false)

  const openRecalc = (r: RouteRow) => {
    setRecalcRoute(r)
    setRecalcDone(false)
    setRecalcError(null)
  }

  const handleRecalc = async () => {
    if (!recalcRoute) return
    setRecalcLoading(true)
    setRecalcError(null)

    const { error } = await supabase.functions.invoke('optimize-route', {
      body: { bus_id: recalcRoute.bus_id },
    })

    if (error) {
      setRecalcError(error.message)
      setRecalcLoading(false)
      return
    }

    setRecalcLoading(false)
    setRecalcDone(true)
    router.refresh()
  }

  const handleOptimizeAll = async () => {
    const schoolId = routes[0]?.school_id
    if (!schoolId) return
    setAllLoading(true)
    const { error } = await supabase.functions.invoke('optimize-route', { body: { school_id: schoolId } })
    setAllLoading(false)
    if (error) {
      console.error('Optimize all error:', error)
      return
    }
    router.refresh()
  }

  return (
    <div className="p-7 max-w-[1280px]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] leading-tight">Route Management</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            {routes.length > 0 ? `${routes.length} route${routes.length !== 1 ? 's' : ''} · AI-optimized` : 'No routes yet — run optimization to generate routes'}
          </p>
        </div>
        <button
          onClick={handleOptimizeAll}
          disabled={routes.length === 0}
          className="flex items-center gap-2 bg-[#1E3A8A] text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-[#1e40af] transition-colors disabled:opacity-50"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
          {allLoading ? 'Optimizing...' : 'Optimize All Routes'}
        </button>
      </div>

      {routes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-16 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center mb-4">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" strokeWidth="1.5" strokeLinecap="round">
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
              <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-[#0F172A] mb-1">No routes generated yet</p>
          <p className="text-xs text-[#94A3B8] max-w-xs">
            Routes are created automatically when you add students. The AI optimizer (Phase 6) will assign each student to the nearest bus cluster and calculate the optimal stop order.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[340px_1fr] gap-5">
          {/* Route list */}
          <div className="flex flex-col gap-3">
            {routes.map(r => {
              const color = r.bus_color ?? '#3B82F6'
              const stops = r.waypoints.length
              return (
                <div
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="bg-white rounded-2xl border shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-4 cursor-pointer transition-all hover:shadow-md"
                  style={{ borderColor: selected?.id === r.id ? color : '#E2E8F0', borderWidth: 1.5 }}
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                      <span className="text-[15px] font-bold text-[#0F172A]">{r.bus_name ?? 'Unnamed Route'}</span>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#D1FAE5] text-[#059669]">
                      Active
                    </span>
                  </div>
                  <div className="text-xs text-[#64748B] mb-1">{stops} stop{stops !== 1 ? 's' : ''}</div>
                  {r.total_distance_km && (
                    <div className="text-[11px] text-[#94A3B8]">
                      {r.total_distance_km.toFixed(1)} km
                      {r.total_duration_min ? ` · ~${Math.round(r.total_duration_min)} min` : ''}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Detail panel */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-5">
            {selected ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: selected.bus_color ?? '#3B82F6' }} />
                    <span className="text-sm font-bold text-[#0F172A]">{selected.bus_name ?? 'Route'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openRecalc(selected)}
                      className="bg-[#FEF2F2] text-[#EF4444] border border-[#FEE2E2] rounded-lg px-3.5 py-1.5 text-xs font-medium hover:bg-[#FEE2E2] transition-colors"
                    >
                      Recalculate
                    </button>
                  </div>
                </div>
                <div className="flex flex-col" style={{ minHeight: 320 }}>
                  <FleetMapSvg />
                </div>
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {([
                    ['Stops',    selected.waypoints.length],
                    ['Distance', selected.total_distance_km ? `${selected.total_distance_km.toFixed(1)} km` : '—'],
                    ['Duration', selected.total_duration_min ? `${Math.round(selected.total_duration_min)} min` : '—'],
                    ['Updated',  new Date(selected.optimized_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })],
                  ] as const).map(([l, v]) => (
                    <div key={l} className="bg-[#F8FAFC] rounded-xl p-3 text-center border border-[#E2E8F0]">
                      <div className="text-xl font-bold text-[#0F172A]">{v}</div>
                      <div className="text-[11px] text-[#64748B]">{l}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-72 text-[#94A3B8]">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" className="mb-3 opacity-40">
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                  <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
                </svg>
                <span className="text-sm">Select a route to view details</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Recalculate Modal ── */}
      {recalcRoute && (
        <div className="fixed inset-0 bg-[#0F172A]/45 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => !recalcLoading && setRecalcRoute(null)}>
          <div className="bg-white rounded-2xl p-6 w-[420px] shadow-[0_20px_60px_-15px_rgb(0_0_0/0.3)]" onClick={e => e.stopPropagation()}>
            {!recalcDone ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold text-[#0F172A]">Recalculate Route</span>
                  {!recalcLoading && <CloseBtn onClick={() => setRecalcRoute(null)} />}
                </div>
                <p className="text-sm text-[#64748B] mb-5">{recalcRoute.bus_name ?? 'Route'} · {recalcRoute.waypoints.length} stops</p>

                {recalcLoading ? (
                  <div className="flex flex-col items-center py-6 gap-4">
                    <div className="relative w-14 h-14">
                      <div className="absolute inset-0 rounded-full border-4 border-[#E2E8F0]" />
                      <div className="absolute inset-0 rounded-full border-4 border-t-[#1E3A8A] animate-spin" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-[#0F172A]">Running AI optimization…</p>
                      <p className="text-xs text-[#94A3B8] mt-1">K-Means clustering · Nearest-Neighbor TSP</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {recalcError && (
                      <div className="mb-4 px-3 py-2.5 bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-xs rounded-lg">
                        {recalcError}
                      </div>
                    )}
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 mb-5">
                      <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-2">This will:</p>
                      <ul className="flex flex-col gap-1.5 text-sm text-[#0F172A]">
                        {[
                          'Re-cluster all student pickup points',
                          'Re-order stops for shortest total distance',
                          'Update ETAs for all parents on this route',
                        ].map(item => (
                          <li key={item} className="flex items-center gap-2">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setRecalcRoute(null)} className="bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm font-medium">Cancel</button>
                      <button onClick={handleRecalc} className="bg-[#1E3A8A] text-white rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                        </svg>
                        Recalculate
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center py-4 text-center">
                <div className="w-14 h-14 rounded-full bg-[#D1FAE5] border border-[#6EE7B7] flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-1">Route Recalculated</h3>
                <p className="text-sm text-[#64748B] mb-2">{recalcRoute.bus_name ?? 'Route'} has been optimized.</p>
                <p className="text-xs text-[#94A3B8] mb-6">Stop order and ETAs updated for all parents.</p>
                <button onClick={() => setRecalcRoute(null)} className="bg-[#1E3A8A] text-white rounded-lg px-6 py-2 text-sm font-semibold">Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
