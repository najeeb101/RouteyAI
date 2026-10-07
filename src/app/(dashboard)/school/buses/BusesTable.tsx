'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Bus, Check, Copy, Pencil, Plus, Trash2, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { busDayStatus, type BusRunsToday } from '@/lib/runs'
import { ActionButton } from '@/components/dashboard/ActionButton'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Field, inputClass } from '@/components/dashboard/Field'
import { Modal } from '@/components/dashboard/Modal'
import { Notice } from '@/components/dashboard/Notice'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Rise } from '@/components/dashboard/Rise'
import { StatusText } from '@/components/dashboard/StatusText'

export type BusRow = {
  id: string
  school_id: string
  name: string
  capacity: number
  driver_id: string | null
  driver_name: string | null
  driver_email: string | null
  color: string
  is_active: boolean
  student_count: number
  created_at: string
}

/**
 * Bus colours, used for its route line and on the parent's map. The landing page's route colours first (checked for
 * contrast, and clear of the status green and amber), then a few more.
 */
const BUS_COLORS = ['#3B82F6', '#DB2777', '#0891B2', '#8B5CF6', '#EA580C', '#4F46E5', '#0D9488', '#65A30D']

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Route colour">
      {BUS_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === c}
          aria-label={c}
          onClick={() => onChange(c)}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full text-white transition-transform duration-200 ease-swift hover:scale-110',
            value === c && 'scale-110 ring-2 ring-ink ring-offset-2',
          )}
          style={{ background: c }}
        >
          {value === c && <Check size={14} strokeWidth={3} />}
        </button>
      ))}
    </div>
  )
}

export default function BusesTable({ initialBuses, runsByBus }: { initialBuses: BusRow[]; runsByBus: Record<string, BusRunsToday> }) {
  const supabase = createClient()

  const [buses, setBuses] = useState<BusRow[]>(initialBuses)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(() => new Date())

  const [addOpen, setAddOpen] = useState(false)
  const [editBus, setEditBus] = useState<BusRow | null>(null)
  const [deleteBus, setDeleteBus] = useState<BusRow | null>(null)
  const [assignBus, setAssignBus] = useState<BusRow | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [name, setName] = useState('')
  const [capacity, setCapacity] = useState('40')
  const [color, setColor] = useState(BUS_COLORS[0]!)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const refetch = useCallback(async () => {
    const { data, error: err } = await supabase.rpc('get_buses_with_drivers')
    if (err) console.error('Buses:', err.message)
    if (data) setBuses(data as BusRow[])
  }, [supabase])

  const close = () => {
    setAddOpen(false)
    setEditBus(null)
    setDeleteBus(null)
    setError(null)
  }

  const openAdd = () => {
    setName('')
    setCapacity('40')
    setColor(BUS_COLORS[buses.length % BUS_COLORS.length]!)
    setError(null)
    setAddOpen(true)
  }

  const openEdit = (b: BusRow) => {
    setEditBus(b)
    setName(b.name)
    setCapacity(String(b.capacity))
    setColor(b.color)
    setError(null)
  }

  const handleAdd = async () => {
    if (!name.trim()) return
    setLoading(true); setError(null)
    const { error: err } = await supabase.rpc('create_bus', { p_name: name.trim(), p_capacity: Number(capacity) || 40, p_color: color })
    setLoading(false)
    if (err) { setError(err.message); return }
    close()
    toast.success(`${name.trim()} added`, { description: 'Invite its driver next.' })
    await refetch()
  }

  const handleEdit = async () => {
    if (!editBus) return
    setLoading(true); setError(null)
    const { error: err } = await supabase
      .from('buses')
      .update({ name: name.trim() || editBus.name, capacity: Number(capacity) || editBus.capacity, color })
      .eq('id', editBus.id)
    setLoading(false)
    if (err) { setError(err.message); return }
    close()
    toast.success('Bus updated')
    await refetch()
  }

  const handleDelete = async () => {
    if (!deleteBus) return
    setLoading(true); setError(null)
    const { error: err } = await supabase.from('buses').delete().eq('id', deleteBus.id)
    setLoading(false)
    if (err) { setError(err.message); return }
    const removed = deleteBus.name
    close()
    toast.success(`${removed} removed`)
    await refetch()
  }

  const handleGenerateInvite = async () => {
    if (!assignBus) return
    setLoading(true); setError(null)
    const { data: code, error: err } = await supabase.rpc('generate_driver_invite', { p_bus_id: assignBus.id })
    setLoading(false)
    if (err) { setError(err.message); return }
    setInviteLink(`${window.location.origin}/invite/${code}`)
  }

  const closeAssign = () => {
    setAssignBus(null)
    setCopied(false)
    setError(null)
  }

  const handleCopy = () => {
    if (!inviteLink) return
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const seats = buses.reduce((n, b) => n + b.capacity, 0)
  const riders = buses.reduce((n, b) => n + Number(b.student_count), 0)

  const busForm = (
    <div className="flex flex-col gap-4">
      {error && <Notice tone="danger">{error}</Notice>}
      <div className="grid grid-cols-[1fr_120px] gap-3">
        <Field label="Name or number" htmlFor="bus-name">
          <input id="bus-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Bus 14" className={inputClass} />
        </Field>
        <Field label="Seats" htmlFor="bus-seats">
          <input id="bus-seats" type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} className={inputClass} />
        </Field>
      </div>
      <Field label="Route colour" hint="Its route line on the map, and the colour parents see for their child's bus.">
        <ColorPicker value={color} onChange={setColor} />
      </Field>
    </div>
  )

  return (
    <>
      <PageHeader
        title="Fleet"
        subtitle={buses.length ? `${buses.length} bus${buses.length === 1 ? '' : 'es'} · ${riders} of ${seats} seats taken` : 'Your school’s buses and drivers'}
        actions={<ActionButton onClick={openAdd}><Plus /> Add bus</ActionButton>}
      />

      {buses.length === 0 ? (
        <Rise step={1} className="rounded-xl bg-white ring-1 ring-ink/[0.04]">
          <EmptyState icon={Bus} title="No buses yet" action={<ActionButton onClick={openAdd}><Plus /> Add bus</ActionButton>}>
            Add a bus, invite its driver, then put students on it.
          </EmptyState>
        </Rise>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {buses.map((b, i) => {
            const status = busDayStatus(runsByBus[b.id] ?? {}, now)
            const pct = b.capacity ? Math.min(100, Math.round((Number(b.student_count) / b.capacity) * 100)) : 0
            const full = Number(b.student_count) >= b.capacity
            return (
              <Rise key={b.id} step={i + 1} className="flex flex-col rounded-xl bg-white p-5 ring-1 ring-ink/[0.04] transition-shadow duration-200 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ background: b.color }} aria-hidden="true" />
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-xl font-bold tracking-[-0.01em] text-ink">{b.name}</h2>
                      <StatusText tone={status.tone} className="mt-0.5">{status.label}</StatusText>
                    </div>
                  </div>
                  <ActionButton size="sm" variant="plain" onClick={() => openEdit(b)} aria-label={`Edit ${b.name}`}><Pencil /> Edit</ActionButton>
                </div>

                <div className="mt-5 flex min-h-[60px] items-center gap-3 rounded-xl bg-canvas px-3.5 py-2.5">
                  <UserRound size={18} className="shrink-0 text-ink-2" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className={cn('truncate text-sm font-medium', b.driver_name ? 'text-ink' : 'text-warn-text')}>{b.driver_name ?? 'No driver yet'}</p>
                    {b.driver_email && <p className="truncate text-xs text-ink-2">{b.driver_email}</p>}
                  </div>
                  <ActionButton size="sm" variant={b.driver_id ? 'plain' : 'secondary'} onClick={() => { setAssignBus(b); setInviteLink(null); setError(null) }}>
                    {b.driver_id ? 'New invite' : 'Invite driver'}
                  </ActionButton>
                </div>

                <div className="mt-5">
                  <div className="mb-1.5 flex items-baseline justify-between text-[13px]">
                    <span className="text-ink-2">Seats taken</span>
                    <span className={cn('font-medium tabular-nums', full ? 'text-warn-text' : 'text-ink')}>{b.student_count} of {b.capacity}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-canvas" aria-hidden="true">
                    <div
                      className={cn('h-full origin-left rounded-full animate-grow-x motion-reduce:animate-none', full ? 'bg-warn' : 'bg-brand')}
                      style={{ width: `${pct}%`, animationDelay: `${150 + i * 60}ms` }}
                    />
                  </div>
                </div>

                <div className="mt-auto flex justify-end pt-4">
                  <ActionButton size="sm" variant="danger-plain" onClick={() => { setDeleteBus(b); setError(null) }}><Trash2 /> Remove</ActionButton>
                </div>
              </Rise>
            )
          })}
        </div>
      )}

      <Modal
        open={addOpen}
        onClose={close}
        dismissible={!loading}
        title="Add a bus"
        footer={
          <>
            <ActionButton variant="plain" onClick={close} disabled={loading}>Cancel</ActionButton>
            <ActionButton onClick={handleAdd} loading={loading} disabled={!name.trim()}>Add bus</ActionButton>
          </>
        }
      >
        {busForm}
      </Modal>

      <Modal
        open={editBus !== null}
        onClose={close}
        dismissible={!loading}
        title={`Edit ${editBus?.name ?? 'bus'}`}
        footer={
          <>
            <ActionButton variant="plain" onClick={close} disabled={loading}>Cancel</ActionButton>
            <ActionButton onClick={handleEdit} loading={loading}>Save</ActionButton>
          </>
        }
      >
        {busForm}
      </Modal>

      <Modal
        open={assignBus !== null}
        onClose={closeAssign}
        title={inviteLink ? 'Invite link ready' : `Invite ${assignBus?.name ?? 'the bus'}'s driver`}
        description={
          inviteLink
            ? `Send it to the driver. When they sign up, they are assigned to ${assignBus?.name ?? 'this bus'} and can use the driver app.`
            : 'A one-time link. The driver opens it, creates an account and is assigned to this bus.'
        }
        footer={
          inviteLink ? (
            <ActionButton onClick={closeAssign}>Done</ActionButton>
          ) : (
            <>
              <ActionButton variant="plain" onClick={closeAssign}>Cancel</ActionButton>
              <ActionButton onClick={handleGenerateInvite} loading={loading}>Create link</ActionButton>
            </>
          )
        }
      >
        {error && <Notice tone="danger">{error}</Notice>}
        {inviteLink && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-canvas p-1.5 pl-3.5 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-ink">{inviteLink}</span>
              <ActionButton size="sm" variant={copied ? 'secondary' : 'primary'} onClick={handleCopy}>
                {copied ? <><Check /> Copied</> : <><Copy /> Copy</>}
              </ActionButton>
            </div>
            <p className="text-xs text-ink-2">Works once and expires in 7 days.</p>
          </div>
        )}
      </Modal>

      <Modal
        open={deleteBus !== null}
        onClose={close}
        dismissible={!loading}
        width="sm"
        title={`Remove ${deleteBus?.name ?? 'bus'}?`}
        description={
          deleteBus && Number(deleteBus.student_count) > 0
            ? `Its ${deleteBus.student_count} student${Number(deleteBus.student_count) === 1 ? '' : 's'} will have no bus, and its route is deleted.`
            : 'Its route is deleted.'
        }
        footer={
          <>
            <ActionButton variant="plain" onClick={close} disabled={loading}>Cancel</ActionButton>
            <ActionButton variant="danger" onClick={handleDelete} loading={loading}>Remove</ActionButton>
          </>
        }
      >
        {error && <Notice tone="danger">{error}</Notice>}
      </Modal>
    </>
  )
}
