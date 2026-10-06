'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowRight, Bus, Megaphone, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { parsePoint, type LatLng } from '@/lib/geo'
import { loadFleetToday, type BusRoute, type FleetToday } from '@/lib/dashboard/today'
import {
  busDayStatus,
  reportCovers,
  rodeCount,
  runProgress,
  RUN_LABEL,
  schoolRun,
  unconfirmedDropOffs,
  type Run,
} from '@/lib/runs'
import { ActionButton } from '@/components/dashboard/ActionButton'
import { CountUp } from '@/components/dashboard/CountUp'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Field, inputClass } from '@/components/dashboard/Field'
import { LivePill } from '@/components/dashboard/LivePill'
import { Modal } from '@/components/dashboard/Modal'
import { Notice } from '@/components/dashboard/Notice'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Panel } from '@/components/dashboard/Panel'
import { SignatureCard } from '@/components/dashboard/SignatureCard'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { StatusText } from '@/components/dashboard/StatusText'
import { DynamicFleetMap } from '@/components/maps/DynamicFleetMap'
import type { BusRow } from './buses/BusesTable'

export type AnnouncementRow = {
  id: string
  message: string
  bus_id: string | null
  bus_name: string | null
  created_at: string
}

export type OverviewStudent = { id: string; name: string; bus_id: string | null; stop_order: number | null }

const longDate = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Qatar', weekday: 'long', day: 'numeric', month: 'long' })

function timeAgo(iso: string, now: Date) {
  const mins = Math.floor((now.getTime() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} h ago`
  const days = Math.floor(hrs / 24)
  return days === 1 ? 'Yesterday' : `${days} days ago`
}

/** One sentence for the school's day on the run it is on. */
function daySentence(run: Run, p: { running: number; done: number; waiting: number }, buses: number): string {
  const runName = run === 'morning' ? 'morning run' : 'afternoon run'
  if (buses === 0) return 'Add a bus to start planning routes.'
  if (p.running > 0) return `${p.running} of ${buses} bus${buses === 1 ? '' : 'es'} on the ${runName}${p.done ? `, ${p.done} finished` : ''}.`
  if (p.done === buses) return run === 'morning' ? 'Every bus has finished the morning run.' : 'Every bus has finished the afternoon run. Done for today.'
  if (p.done > 0) return `${p.done} of ${buses} buses finished the ${runName}. ${p.waiting} not started.`
  return `No bus has started the ${runName} yet.`
}

export default function SchoolOverviewClient({ buses, students, routes, school, initialToday, initialAnnouncements }: {
  buses: BusRow[]
  students: OverviewStudent[]
  routes: BusRoute[]
  school: LatLng | null
  initialToday: FleetToday
  initialAnnouncements: AnnouncementRow[]
}) {
  const [today, setToday] = useState(initialToday)
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [now, setNow] = useState(() => new Date())
  const [hovered, setHovered] = useState<string | null>(null)
  const [announceOpen, setAnnounceOpen] = useState(false)

  // Follow the day live: runs starting and ending, check-ins, absence reports and buses moving.
  const busIds = useMemo(() => buses.map((b) => b.id), [buses])
  const busKey = busIds.join(',')
  useEffect(() => {
    const supabase = createClient()
    const ids = new Set(busKey ? busKey.split(',') : [])
    let timer: ReturnType<typeof setTimeout> | undefined
    const refresh = () => {
      clearTimeout(timer)
      timer = setTimeout(async () => setToday(await loadFleetToday(supabase, [...ids])), 400)
    }
    const channel = supabase
      .channel('school-overview')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bus_runs' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'absence_reports' }, refresh)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bus_locations' }, (payload) => {
        const row = payload.new as { bus_id?: string; location?: unknown; timestamp?: string }
        const point = parsePoint(row.location)
        if (!row.bus_id || !ids.has(row.bus_id) || !point) return
        setToday((t) => ({ ...t, positions: { ...t.positions, [row.bus_id!]: { ...point, at: row.timestamp ?? new Date().toISOString() } } }))
      })
      .subscribe()
    const clock = setInterval(() => setNow(new Date()), 60_000)
    return () => {
      clearTimeout(timer)
      clearInterval(clock)
      supabase.removeChannel(channel)
    }
  }, [busKey])

  const busRuns = buses.map((b) => today.runsByBus[b.id] ?? {})
  const run = schoolRun(busRuns, now)
  const progress = runProgress(busRuns, run)
  const onBus = students.filter((s) => s.bus_id)
  const reportedFor = (r: Run) => new Set(today.reports.filter((x) => reportCovers(x.runs, r)).map((x) => x.studentId))
  const expected = onBus.filter((s) => !reportedFor(run).has(s.id)).length
  const rode = rodeCount(today.marks, run)
  const home = today.marks.filter((m) => m.run === 'afternoon' && m.status === 'dropped_off').length
  const anyRunning = progress.running > 0

  const runsByBus = useMemo(() => new Map(Object.entries(today.runsByBus)), [today.runsByBus])
  const studentName = new Map(students.map((s) => [s.id, s.name]))
  const busName = new Map(buses.map((b) => [b.id, b.name]))
  const unconfirmed = unconfirmedDropOffs(today.marks, runsByBus)

  const notOnRoute = onBus.filter((s) => s.stop_order === null).length
  const withoutDriver = buses.filter((b) => !b.driver_id).length
  const routedBuses = new Set(routes.map((r) => r.busId))
  const needRoute = buses.filter((b) => b.student_count > 0 && !routedBuses.has(b.id)).length
  const reportsToday = today.reports.length

  const mapRoutes = routes
    .filter((r) => r.run === run)
    .map((r) => ({ id: r.busId, color: buses.find((b) => b.id === r.busId)?.color ?? '#3B82F6', coords: r.coords }))
  const mapBuses = buses.flatMap((b) => {
    const pos = today.positions[b.id]
    const runs = today.runsByBus[b.id] ?? {}
    const live = Boolean((runs.morning && !runs.morning.endedAt) || (runs.afternoon && !runs.afternoon.endedAt))
    return pos && live ? [{ id: b.id, name: b.name, lat: pos.lat, lng: pos.lng, live }] : []
  })

  return (
    <>
      <PageHeader
        title="Today"
        subtitle={longDate.format(now)}
        actions={
          <ActionButton variant="secondary" onClick={() => setAnnounceOpen(true)}>
            <Megaphone /> Send announcement
          </ActionButton>
        }
      />

      {unconfirmed.length > 0 && (
        <Notice tone="danger" className="mb-5 animate-rise" title={`${unconfirmed.length === 1 ? 'A child was' : `${unconfirmed.length} children were`} not marked dropped off`}>
          {unconfirmed.map((m) => `${studentName.get(m.studentId) ?? 'A student'} (${busName.get(m.busId ?? '') ?? 'bus'})`).join(', ')}.{' '}
          The driver ended the afternoon run with {unconfirmed.length === 1 ? 'this child' : 'them'} still on board. Their parents see
          &ldquo;Not confirmed&rdquo;. Check with the driver and the family.
        </Notice>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <SignatureCard step={1} className="flex min-h-[248px] flex-col">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[15px] font-medium text-white/80">{RUN_LABEL[run]}</p>
            {anyRunning && <LivePill onNight />}
          </div>
          <div className="mt-auto pt-8">
            <p className="font-display text-[56px] font-bold leading-none tracking-[-0.03em] tabular-nums">
              <CountUp value={run === 'afternoon' && progress.done + progress.running > 0 ? home : rode} />
              <span className="text-[28px] text-white/50"> / {expected}</span>
            </p>
            <p className="mt-2 text-[15px] text-white/70">
              {run === 'morning' ? 'students picked up' : progress.done + progress.running > 0 ? 'students home' : 'students to take home'}
              {run === 'afternoon' && rode > home ? ` · ${rode - home} on the bus` : ''}
            </p>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/15" aria-hidden="true">
              <div
                className="h-full origin-left rounded-full bg-live transition-[width] duration-700 ease-swift animate-grow-x motion-reduce:animate-none"
                style={{ width: `${expected ? Math.min(100, ((run === 'afternoon' ? home : rode) / expected) * 100) : 0}%` }}
              />
            </div>
            <p className="mt-4 text-sm text-white/70">{daySentence(run, progress, buses.length)}</p>
          </div>
        </SignatureCard>

        <div className="grid grid-cols-2 gap-4">
          <StatsCard step={2} label="Students" value={students.length} sub={notOnRoute ? `${notOnRoute} not on a route yet` : `${onBus.length} on a bus`} subTone={notOnRoute ? 'warning' : 'neutral'} />
          <StatsCard step={3} label="Staying home today" value={reportsToday} sub={<Link href="/school/absences" className="hover:underline">Reported by parents</Link>} />
          <StatsCard step={4} label="Buses" value={buses.length} sub={withoutDriver ? `${withoutDriver} without a driver` : 'All have a driver'} subTone={withoutDriver ? 'warning' : 'neutral'} />
          <StatsCard step={5} label="Routes" value={routedBuses.size} sub={needRoute ? `${needRoute} bus${needRoute === 1 ? ' needs' : 'es need'} a route` : 'Every bus has one'} subTone={needRoute ? 'warning' : 'neutral'} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel
          step={6}
          title="Fleet map"
          subtitle={`${RUN_LABEL[run]} routes${mapBuses.length ? ' · buses on the road update live' : ''}`}
          action={<Link href="/school/routes" className="inline-flex items-center gap-1 text-[13px] font-medium text-brand hover:underline">Routes <ArrowRight size={14} /></Link>}
        >
          <div className="h-[380px]">
            <DynamicFleetMap className="h-full" school={school} routes={mapRoutes} buses={mapBuses} selectedId={hovered} />
          </div>
        </Panel>

        <Panel step={7} title="Buses" subtitle={RUN_LABEL[run]} bodyClassName="px-2 pb-2">
          {buses.length === 0 ? (
            <EmptyState icon={Bus} title="No buses yet" action={<Link href="/school/buses" className="text-sm font-medium text-brand hover:underline">Add a bus</Link>} />
          ) : (
            <ul>
              {buses.map((b) => {
                const status = busDayStatus(today.runsByBus[b.id] ?? {}, now)
                const kids = onBus.filter((s) => s.bus_id === b.id)
                const busExpected = kids.filter((s) => !reportedFor(run).has(s.id)).length
                const busRode = today.marks.filter((m) => m.busId === b.id && m.run === run && (m.status === 'boarded' || m.status === 'dropped_off')).length
                return (
                  <li key={b.id}>
                    <Link
                      href="/school/routes"
                      onMouseEnter={() => setHovered(b.id)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(b.id)}
                      onBlur={() => setHovered(null)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-canvas"
                    >
                      <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: b.color }} aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold text-ink">{b.name}</p>
                        <p className={b.driver_name ? 'truncate text-[13px] text-ink-2' : 'text-[13px] text-warn-text'}>{b.driver_name ?? 'No driver yet'}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <StatusText tone={status.tone}>{status.label}</StatusText>
                        <p className="mt-0.5 text-xs tabular-nums text-ink-2">{busRode} of {busExpected} rode</p>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
      </div>

      <Panel
        step={8}
        className="mt-4"
        title="Announcements"
        action={<ActionButton size="sm" variant="plain" onClick={() => setAnnounceOpen(true)}><Send /> New</ActionButton>}
        bodyClassName="px-5 pb-3"
      >
        {announcements.length === 0 ? (
          <EmptyState icon={Megaphone} title="No announcements yet" className="py-8">Messages you send reach drivers and parents in the app.</EmptyState>
        ) : (
          <ul className="divide-y divide-line">
            {announcements.map((a) => (
              <li key={a.id} className="flex items-baseline gap-4 py-3">
                <span className="w-24 shrink-0 text-xs text-ink-2">{timeAgo(a.created_at, now)}</span>
                <p className="min-w-0 flex-1 text-sm text-ink">{a.message}</p>
                <span className="shrink-0 text-xs text-ink-2">{a.bus_name ?? 'Everyone'}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <AnnouncementDialog
        open={announceOpen}
        onClose={() => setAnnounceOpen(false)}
        buses={buses}
        onSent={async () => {
          const { data, error } = await createClient().rpc('get_recent_announcements', { p_limit: 5 })
          if (error) console.error('Announcements:', error.message)
          else setAnnouncements((data ?? []) as AnnouncementRow[])
        }}
      />
    </>
  )
}

function AnnouncementDialog({ open, onClose, buses, onSent }: { open: boolean; onClose: () => void; buses: BusRow[]; onSent: () => Promise<void> }) {
  const [to, setTo] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setTo('')
    setMessage('')
    setError(null)
  }, [open])

  const send = async () => {
    if (!message.trim()) return
    setSending(true)
    setError(null)
    const { error: err } = await createClient().rpc('send_announcement', { p_message: message.trim(), p_bus_id: to || null })
    setSending(false)
    if (err) {
      setError(err.message)
      return
    }
    toast.success('Announcement sent', { description: to ? `To ${buses.find((b) => b.id === to)?.name ?? 'the bus'}'s driver and parents.` : 'To every driver and parent.' })
    onClose()
    await onSent()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!sending}
      title="Send an announcement"
      description="Drivers and parents get it as a notification in the app."
      footer={
        <>
          <ActionButton variant="plain" onClick={onClose} disabled={sending}>Cancel</ActionButton>
          <ActionButton onClick={send} loading={sending} disabled={!message.trim()}>{!sending && <Send />} Send</ActionButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <Notice tone="danger">{error}</Notice>}
        <Field label="Send to" htmlFor="announce-to">
          <select id="announce-to" value={to} onChange={(e) => setTo(e.target.value)} className={inputClass}>
            <option value="">Every bus and parent</option>
            {buses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </Field>
        <Field label="Message" htmlFor="announce-message">
          <textarea
            id="announce-message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="The buses will leave 15 minutes late tomorrow because of the parade."
            className={`${inputClass} resize-none`}
          />
        </Field>
      </div>
    </Modal>
  )
}
