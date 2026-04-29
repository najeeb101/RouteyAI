/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type OptimizeInputRow = {
  bus_id: string
  school_id: string
  school_lat: number
  school_lng: number
  student_id: string | null
  student_lat: number | null
  student_lng: number | null
}

type Waypoint = {
  lat: number
  lng: number
  student_id: string
  stop_order: number
  eta_offset_min: number
}

type SchoolOptimizationRow = {
  school_id: string
  school_lat: number
  school_lng: number
  bus_id: string
  bus_capacity: number
  student_id: string | null
  student_lat: number | null
  student_lng: number | null
}

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const r = 6371
  const dLat = ((bLat - aLat) * Math.PI) / 180
  const dLng = ((bLng - aLng) * Math.PI) / 180
  const sa = Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
    Math.cos((bLat * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return 2 * r * Math.asin(Math.sqrt(sa))
}

type StopPoint = {
  student_id: string
  student_lat: number
  student_lng: number
}

type ClusterCenter = { lat: number; lng: number }
type BusInfo = { id: string; capacity: number }

function nearestNeighborOrder(stops: StopPoint[], startLat: number, startLng: number) {
  const remaining = [...stops]
  const ordered: StopPoint[] = []

  let curLat = startLat
  let curLng = startLng

  while (remaining.length > 0) {
    let bestIdx = 0
    let bestDist = Number.POSITIVE_INFINITY
    for (let i = 0; i < remaining.length; i += 1) {
      const s = remaining[i]
      if (!s) continue
      const d = haversineKm(curLat, curLng, s.student_lat, s.student_lng)
      if (d < bestDist) {
        bestDist = d
        bestIdx = i
      }
    }

    const [next] = remaining.splice(bestIdx, 1)
    if (!next) break
    ordered.push(next)
    curLat = next.student_lat
    curLng = next.student_lng
  }

  return ordered
}

function euclideanSq(aLat: number, aLng: number, bLat: number, bLng: number) {
  const dLat = aLat - bLat
  const dLng = aLng - bLng
  return dLat * dLat + dLng * dLng
}

function runKMeans(students: StopPoint[], k: number, maxIter = 20): ClusterCenter[] {
  const centers: ClusterCenter[] = students.slice(0, Math.max(1, k)).map((s) => ({ lat: s.student_lat, lng: s.student_lng }))
  while (centers.length < k) centers.push({ ...centers[centers.length - 1]! })

  for (let iter = 0; iter < maxIter; iter += 1) {
    const buckets: StopPoint[][] = Array.from({ length: k }, () => [])
    for (const s of students) {
      let best = 0
      let bestD = Number.POSITIVE_INFINITY
      for (let i = 0; i < k; i += 1) {
        const c = centers[i]!
        const d = euclideanSq(s.student_lat, s.student_lng, c.lat, c.lng)
        if (d < bestD) {
          bestD = d
          best = i
        }
      }
      buckets[best]!.push(s)
    }

    let moved = false
    for (let i = 0; i < k; i += 1) {
      const bucket = buckets[i]!
      if (bucket.length === 0) continue
      const lat = bucket.reduce((sum, s) => sum + s.student_lat, 0) / bucket.length
      const lng = bucket.reduce((sum, s) => sum + s.student_lng, 0) / bucket.length
      const prev = centers[i]!
      if (Math.abs(prev.lat - lat) > 1e-7 || Math.abs(prev.lng - lng) > 1e-7) {
        moved = true
      }
      centers[i] = { lat, lng }
    }
    if (!moved) break
  }

  return centers
}

function assignStudentsWithCapacity(students: StopPoint[], buses: BusInfo[], centers: ClusterCenter[]) {
  const assignments = new Map<string, string>()
  const remaining = new Map<string, number>()
  for (const b of buses) remaining.set(b.id, Math.max(0, b.capacity))

  for (const s of students) {
    const ranked = buses
      .map((b, idx) => ({
        busId: b.id,
        dist: euclideanSq(s.student_lat, s.student_lng, centers[idx]!.lat, centers[idx]!.lng),
      }))
      .sort((a, b) => a.dist - b.dist)

    let picked: string | null = null
    for (const r of ranked) {
      const slots = remaining.get(r.busId) ?? 0
      if (slots > 0) {
        picked = r.busId
        break
      }
    }

    if (!picked) {
      picked = buses
        .map((b) => ({ id: b.id, slots: remaining.get(b.id) ?? 0 }))
        .sort((a, b) => b.slots - a.slots)[0]?.id ?? buses[0]!.id
    }

    assignments.set(s.student_id, picked)
    remaining.set(picked, (remaining.get(picked) ?? 0) - 1)
  }

  return assignments
}

async function getRoadMetrics(
  mapboxToken: string | null,
  schoolLat: number,
  schoolLng: number,
  ordered: StopPoint[],
) {
  let totalDistanceKm = 0
  let totalDurationMin = 0
  let encodedPolyline: string | null = null

  if (ordered.length === 0) {
    return { totalDistanceKm, totalDurationMin, encodedPolyline }
  }

  if (mapboxToken && ordered.length <= 24) {
    const coords = [
      `${schoolLng},${schoolLat}`,
      ...ordered.map((s) => `${s.student_lng},${s.student_lat}`),
    ].join(';')

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?overview=full&geometries=polyline&steps=false&access_token=${mapboxToken}`
    const res = await fetch(url)
    if (res.ok) {
      const json = await res.json()
      const route = json?.routes?.[0]
      if (route?.distance != null && route?.duration != null) {
        totalDistanceKm = Number((route.distance / 1000).toFixed(2))
        totalDurationMin = Math.round(route.duration / 60)
        encodedPolyline = typeof route.geometry === 'string' ? route.geometry : null
        return { totalDistanceKm, totalDurationMin, encodedPolyline }
      }
    }
  }

  let currentLat = schoolLat
  let currentLng = schoolLng
  for (const stop of ordered) {
    totalDistanceKm += haversineKm(currentLat, currentLng, stop.student_lat, stop.student_lng)
    currentLat = stop.student_lat
    currentLng = stop.student_lng
  }
  totalDistanceKm = Number(totalDistanceKm.toFixed(2))
  totalDurationMin = Math.round((totalDistanceKm / 30) * 60)
  return { totalDistanceKm, totalDurationMin, encodedPolyline }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }

    const supabase = createClient(supabaseUrl, serviceKey)
    const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN') ?? Deno.env.get('NEXT_PUBLIC_MAPBOX_TOKEN') ?? null
    const body = await req.json().catch(() => ({}))
    const busId = typeof body?.bus_id === 'string' ? body.bus_id : null

    if (!busId && typeof body?.school_id === 'string') {
      const { data: schoolRowsRaw, error: schoolErr } = await supabase.rpc('get_school_optimization_payload', {
        p_school_id: body.school_id,
      })
      if (schoolErr) throw schoolErr
      const schoolRows = (schoolRowsRaw ?? []) as SchoolOptimizationRow[]
      const busesById = new Map<string, BusInfo>()
      const studentsById = new Map<string, StopPoint>()
      for (const row of schoolRows) {
        if (!busesById.has(row.bus_id)) busesById.set(row.bus_id, { id: row.bus_id, capacity: row.bus_capacity })
        if (row.student_id && row.student_lat !== null && row.student_lng !== null) {
          studentsById.set(row.student_id, {
            student_id: row.student_id,
            student_lat: row.student_lat,
            student_lng: row.student_lng,
          })
        }
      }

      const buses = [...busesById.values()]
      const students = [...studentsById.values()]
      if (buses.length > 0 && students.length > 0) {
        const centers = runKMeans(students, buses.length)
        const assignmentMap = assignStudentsWithCapacity(students, buses, centers)
        const assignments = [...assignmentMap.entries()].map(([student_id, bus_id]) => ({ student_id, bus_id }))
        const { error: assignErr } = await supabase.rpc('save_student_bus_assignments', { p_assignments: assignments })
        if (assignErr) throw assignErr
      }
    }

    const { data, error } = await supabase.rpc('get_route_optimization_payload', { p_bus_id: busId })
    if (error) throw error

    const rows = (data ?? []) as OptimizeInputRow[]
    const byBus = new Map<string, OptimizeInputRow[]>()
    for (const row of rows) {
      if (!byBus.has(row.bus_id)) byBus.set(row.bus_id, [])
      byBus.get(row.bus_id)!.push(row)
    }

    const results: Array<{ bus_id: string; route_id: string | null; stop_count: number; distance_km: number; duration_min: number }> = []

    for (const [currentBusId, busRows] of byBus.entries()) {
      const anchor = busRows[0]
      const stops: StopPoint[] = busRows
        .filter((r) => r.student_id && r.student_lat !== null && r.student_lng !== null)
        .map((r) => ({
          student_id: r.student_id as string,
          student_lat: r.student_lat as number,
          student_lng: r.student_lng as number,
        }))

      if (stops.length === 0) {
        const { data: routeId, error: saveErr } = await supabase.rpc('save_optimized_route', {
          p_bus_id: currentBusId,
          p_waypoints: [],
          p_total_distance_km: 0,
          p_total_duration_min: 0,
          p_encoded_polyline: null,
        })
        if (saveErr) throw saveErr
        results.push({ bus_id: currentBusId, route_id: routeId ?? null, stop_count: 0, distance_km: 0, duration_min: 0 })
        continue
      }

      const ordered = nearestNeighborOrder(stops, anchor.school_lat, anchor.school_lng)
      const waypoints: Waypoint[] = []
      const metrics = await getRoadMetrics(mapboxToken, anchor.school_lat, anchor.school_lng, ordered)
      let cumulativeDistanceKm = 0
      let currentLat = anchor.school_lat
      let currentLng = anchor.school_lng
      for (let i = 0; i < ordered.length; i += 1) {
        const stop = ordered[i]!
        cumulativeDistanceKm += haversineKm(currentLat, currentLng, stop.student_lat, stop.student_lng)
        waypoints.push({
          lat: stop.student_lat,
          lng: stop.student_lng,
          student_id: stop.student_id,
          stop_order: i + 1,
          eta_offset_min: Math.round((cumulativeDistanceKm / 30) * 60),
        })
        currentLat = stop.student_lat
        currentLng = stop.student_lng
      }

      const { data: routeId, error: saveErr } = await supabase.rpc('save_optimized_route', {
        p_bus_id: currentBusId,
        p_waypoints: waypoints,
        p_total_distance_km: metrics.totalDistanceKm,
        p_total_duration_min: metrics.totalDurationMin,
        p_encoded_polyline: metrics.encodedPolyline,
      })
      if (saveErr) throw saveErr

      results.push({
        bus_id: currentBusId,
        route_id: routeId ?? null,
        stop_count: waypoints.length,
        distance_km: metrics.totalDistanceKm,
        duration_min: metrics.totalDurationMin,
      })
    }

    return new Response(JSON.stringify({ ok: true, optimized: results.length, results }), {
      headers,
      status: 200,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ ok: false, error: message }), {
      headers,
      status: 500,
    })
  }
})
