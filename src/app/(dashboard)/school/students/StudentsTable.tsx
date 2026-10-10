'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { ArrowRightLeft, Check, Copy, Ellipsis, Mail, Pencil, Plus, Search, Trash2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import { updateBuses } from '@/lib/dashboard/planner'
import { describeUpdates } from '@/lib/dashboard/plannerText'
import { ActionButton } from '@/components/dashboard/ActionButton'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Field, inputClass } from '@/components/dashboard/Field'
import { Modal } from '@/components/dashboard/Modal'
import { Notice } from '@/components/dashboard/Notice'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Panel } from '@/components/dashboard/Panel'
import { Badge } from '@/components/dashboard/StatusText'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { BusRow } from '../buses/BusesTable'

export type StudentRow = {
  id: string
  school_id: string
  name: string
  home_address: string
  bus_id: string | null
  bus_name: string | null
  stop_order: number | null
  created_at: string
}

type Filter = 'all' | 'not-on-route' | 'no-bus'

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number; geocoded: boolean }> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  if (!token) return { lat: 25.2854, lng: 51.5310, geocoded: false }
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&limit=1&country=QA&proximity=51.531,25.2854`
    const res  = await fetch(url)
    const json = await res.json()
    if (!json.features?.length) return { lat: 25.2854, lng: 51.5310, geocoded: false }
    const [lng, lat] = json.features[0].center as [number, number]
    return { lat, lng, geocoded: true }
  } catch {
    return { lat: 25.2854, lng: 51.5310, geocoded: false }
  }
}

const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join('')

/**
 * After a child is added, moved, re-addressed or removed, their bus's route takes the change in (optimize-route
 * `update`): the child slots in where they add the least driving and every other stop keeps its place. Routes are
 * never re-planned from here. One toast says what was saved, then what the route did.
 */
async function slotIn(title: string, busIds: (string | null | undefined)[], child: { id: string; name: string }) {
  const ids = busIds.filter((id): id is string => Boolean(id))
  if (ids.length === 0) {
    toast.success(title, { description: 'Not on a bus, so no route changed.' })
    return
  }
  const toastId = toast.loading(title, { description: 'Updating the route…' })
  const res = await updateBuses(ids)
  if (!res.ok) {
    toast.warning(title, {
      id: toastId,
      description: `Saved, but the route wasn’t updated: ${res.message} Press Update for the bus on the Routes page.`,
    })
    return
  }
  toast.success(title, { id: toastId, description: describeUpdates(res.data, new Map([[child.id, child.name]])) })
}

export default function StudentsTable({ initialStudents, buses }: { initialStudents: StudentRow[]; buses: BusRow[] }) {
  const supabase = createClient()

  const [students, setStudents] = useState<StudentRow[]>(initialStudents)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [addOpen, setAddOpen] = useState(false)
  const [editStudent, setEditStudent] = useState<StudentRow | null>(null)
  const [changeBusStudent, setChangeBusStudent] = useState<StudentRow | null>(null)
  const [deleteStudent, setDeleteStudent] = useState<StudentRow | null>(null)
  const [inviteStudent, setInviteStudent] = useState<StudentRow | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [addName, setAddName] = useState('')
  const [addAddress, setAddAddress] = useState('')
  const [addBusId, setAddBusId] = useState('')
  const [editName, setEditName] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [newBusId, setNewBusId] = useState('')

  const busName = (id: string) => buses.find((b) => b.id === id)?.name ?? 'the bus'
  const busColor = (id: string | null) => buses.find((b) => b.id === id)?.color ?? '#94A3B8'

  const notOnRoute = students.filter((s) => s.bus_id && s.stop_order === null).length
  const noBus = students.filter((s) => !s.bus_id).length
  const q = search.trim().toLowerCase()
  const filtered = students.filter((s) => {
    if (filter === 'not-on-route' && !(s.bus_id && s.stop_order === null)) return false
    if (filter === 'no-bus' && s.bus_id) return false
    return !q || s.name.toLowerCase().includes(q) || (s.bus_name ?? '').toLowerCase().includes(q) || s.home_address.toLowerCase().includes(q)
  })

  const refetch = useCallback(async () => {
    const { data, error: err } = await supabase.rpc('get_students_with_bus')
    if (err) console.error('Students:', err.message)
    const rows = (data ?? null) as StudentRow[] | null
    if (rows) setStudents(rows)
    return rows ?? []
  }, [supabase])

  const close = () => {
    setError(null)
    setAddOpen(false)
    setEditStudent(null)
    setChangeBusStudent(null)
    setDeleteStudent(null)
  }

  const openAdd = () => {
    setAddName('')
    setAddAddress('')
    setAddBusId('')
    setError(null)
    setAddOpen(true)
  }

  const openEdit = (s: StudentRow) => {
    setEditStudent(s)
    setEditName(s.name)
    setEditAddress(s.home_address)
    setError(null)
  }

  const openChangeBus = (s: StudentRow) => {
    setChangeBusStudent(s)
    setNewBusId(s.bus_id ?? buses[0]?.id ?? '')
    setError(null)
  }

  const handleAdd = async () => {
    if (!addName.trim() || !addAddress.trim()) return
    setLoading(true); setError(null)
    const name = addName.trim()
    const { lat, lng, geocoded } = await geocodeAddress(addAddress)
    const { data: newId, error: err } = await supabase.rpc('add_student', {
      p_name: name,
      p_home_address: addAddress.trim(),
      p_lat: lat,
      p_lng: lng,
      p_bus_id: addBusId || null,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    close()
    const added = (await refetch()).find((s) => s.id === newId)
    if (!geocoded) {
      toast.warning('Address not found on the map', {
        description: `${name}'s stop is at the centre of Doha for now. Edit the address with the area or street to fix it.`,
      })
    }
    await slotIn(added?.bus_name ? `${name} added to ${added.bus_name}` : `${name} added`, [added?.bus_id], { id: String(newId), name })
    await refetch()
  }

  const handleEdit = async () => {
    if (!editStudent) return
    const name = editName.trim() || editStudent.name
    const address = editAddress.trim() || editStudent.home_address
    const addressChanged = address !== editStudent.home_address
    setLoading(true); setError(null)

    const update: Database['public']['Tables']['students']['Update'] = { name, home_address: address }
    if (addressChanged) {
      // The stop has to move with the address; never save new text with the old point.
      if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
        setLoading(false)
        setError("Address lookup isn't set up on this site yet, so the address can't be changed.")
        return
      }
      const { lat, lng, geocoded } = await geocodeAddress(address)
      if (!geocoded) {
        setLoading(false)
        setError("We couldn't find that address on the map. Try adding the area or street.")
        return
      }
      update.home_location = `SRID=4326;POINT(${lng} ${lat})`
      // Off the route until the planner gives the new home a stop, so a failed update still shows "Not on route".
      update.stop_order = null
    }

    const { error: err } = await supabase.from('students').update(update).eq('id', editStudent.id)
    setLoading(false)
    if (err) { setError(err.message); return }
    const busId = editStudent.bus_id
    close()
    await refetch()
    // The planner sees the child lost their place on the route and gives only them a new stop.
    if (!addressChanged) toast.success('Student updated')
    else {
      await slotIn(`${name}'s address updated`, [busId], { id: editStudent.id, name })
      await refetch()
    }
  }

  const handleChangeBus = async () => {
    if (!changeBusStudent) return
    const busId = newBusId || null
    const fromBusId = changeBusStudent.bus_id
    if (busId === fromBusId) { close(); return }
    setLoading(true); setError(null)
    // The old stop number belongs to the old bus's route.
    const { error: err } = await supabase.from('students').update({ bus_id: busId, stop_order: null }).eq('id', changeBusStudent.id)
    setLoading(false)
    if (err) { setError(err.message); return }
    const name = changeBusStudent.name
    close()
    await refetch()
    await slotIn(busId ? `${name} moved to ${busName(busId)}` : `${name} taken off the bus`, [fromBusId, busId], { id: changeBusStudent.id, name })
    await refetch()
  }

  const handleDelete = async () => {
    if (!deleteStudent) return
    setLoading(true); setError(null)
    const { error: err } = await supabase.from('students').delete().eq('id', deleteStudent.id)
    setLoading(false)
    if (err) { setError(err.message); return }
    const { id, name, bus_id } = deleteStudent
    close()
    await refetch()
    await slotIn(`${name} removed`, [bus_id], { id, name })
  }

  const handleGenerateParentInvite = async () => {
    if (!inviteStudent) return
    setLoading(true); setError(null)
    const { data: code, error: err } = await supabase.rpc('generate_parent_invite', { p_student_id: inviteStudent.id })
    setLoading(false)
    if (err) { setError(err.message); return }
    setInviteLink(`${window.location.origin}/invite/${code}`)
  }

  const closeInvite = () => {
    setInviteStudent(null)
    setCopied(false)
    setError(null)
  }

  const handleCopy = () => {
    if (!inviteLink) return
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filters: { value: Filter; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: students.length },
    { value: 'not-on-route', label: 'Not on a route', count: notOnRoute },
    { value: 'no-bus', label: 'No bus', count: noBus },
  ]

  return (
    <>
      <PageHeader
        title="Students"
        subtitle={`${students.length} student${students.length === 1 ? '' : 's'} · ${students.length - noBus} on a bus`}
        actions={<ActionButton onClick={openAdd}><Plus /> Add student</ActionButton>}
      />

      <Panel step={1} bodyClassName="p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden="true" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, bus or address"
              aria-label="Search students"
              className={cn(inputClass, 'pl-10')}
            />
          </div>
          <div className="flex gap-1.5" role="group" aria-label="Show">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                aria-pressed={filter === f.value}
                className={cn(
                  'h-9 rounded-xl px-3 text-[13px] font-medium transition-colors duration-150',
                  filter === f.value ? 'bg-brand text-white' : 'bg-canvas text-ink-2 hover:text-ink',
                )}
              >
                {f.label} <span className={cn('tabular-nums', filter === f.value ? 'text-white/70' : 'text-ink-2')}>{f.count}</span>
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Users} title={students.length === 0 ? 'No students yet' : 'No students match'}>
            {students.length === 0 ? 'Add your first student to put them on a bus.' : 'Try another name, or show all students.'}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="text-left text-[13px] text-ink-2">
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-3 py-3 font-medium">Home address</th>
                  <th className="px-3 py-3 font-medium">Bus</th>
                  <th className="px-3 py-3 font-medium">Stop</th>
                  <th className="w-14 px-5 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr
                    key={s.id}
                    className="border-t border-line transition-colors hover:bg-canvas/60 animate-rise motion-reduce:animate-none"
                    style={{ animationDelay: `${Math.min(i, 15) * 25}ms` }}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-tint text-xs font-semibold text-brand">{initialsOf(s.name)}</span>
                        <span className="text-sm font-semibold text-ink">{s.name}</span>
                      </div>
                    </td>
                    <td className="max-w-[260px] truncate px-3 py-3 text-[13px] text-ink-2" title={s.home_address}>{s.home_address}</td>
                    <td className="px-3 py-3 text-[13px]">
                      {s.bus_name ? (
                        <span className="inline-flex items-center gap-2 font-medium text-ink">
                          <span className="h-2 w-2 rounded-full" style={{ background: busColor(s.bus_id) }} aria-hidden="true" />
                          {s.bus_name}
                        </span>
                      ) : (
                        <span className="text-ink-2">No bus</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-[13px] tabular-nums text-ink-2">
                      {s.stop_order ?? (s.bus_id ? <Badge tone="warning">Not on route</Badge> : <span className="text-ink-2">—</span>)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          aria-label={`Actions for ${s.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-canvas hover:text-ink data-[state=open]:bg-canvas"
                        >
                          <Ellipsis size={18} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl border-line p-1.5 shadow-[0_12px_32px_-8px_rgba(15,23,42,0.18)]">
                          <DropdownMenuItem onSelect={() => openEdit(s)} className="rounded-lg px-2.5 py-2 text-[13px] focus:bg-canvas"><Pencil /> Edit student</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openChangeBus(s)} className="rounded-lg px-2.5 py-2 text-[13px] focus:bg-canvas"><ArrowRightLeft /> Change bus</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => { setInviteStudent(s); setInviteLink(null); setError(null) }} className="rounded-lg px-2.5 py-2 text-[13px] focus:bg-canvas"><Mail /> Invite parent</DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-line" />
                          <DropdownMenuItem onSelect={() => { setDeleteStudent(s); setError(null) }} className="rounded-lg px-2.5 py-2 text-[13px] text-bad-text focus:bg-bad-tint focus:text-bad-text"><Trash2 /> Remove</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Modal
        open={addOpen}
        onClose={close}
        dismissible={!loading}
        title="Add a student"
        description="Their home becomes their stop. It slots into the bus's route where it adds the least driving; nobody else's stop moves."
        footer={
          <>
            <ActionButton variant="plain" onClick={close} disabled={loading}>Cancel</ActionButton>
            <ActionButton onClick={handleAdd} loading={loading} disabled={!addName.trim() || !addAddress.trim()}>Add student</ActionButton>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {error && <Notice tone="danger">{error}</Notice>}
          <Field label="Full name" htmlFor="add-name">
            <input id="add-name" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Sarah Abdullah" className={inputClass} autoFocus />
          </Field>
          <Field label="Home address" htmlFor="add-address" hint="Include the area or street so the map finds the right place.">
            <input id="add-address" value={addAddress} onChange={(e) => setAddAddress(e.target.value)} placeholder="Street 12, Al Waab, Doha" className={inputClass} />
          </Field>
          <Field label="Bus" htmlFor="add-bus">
            <select id="add-bus" value={addBusId} onChange={(e) => setAddBusId(e.target.value)} className={inputClass}>
              <option value="">Nearest bus with space</option>
              {buses.map((b) => {
                const full = b.student_count >= b.capacity
                return <option key={b.id} value={b.id} disabled={full}>{b.name} ({b.student_count}/{b.capacity}){full ? ', full' : ''}</option>
              })}
            </select>
          </Field>
        </div>
      </Modal>

      <Modal
        open={editStudent !== null}
        onClose={close}
        dismissible={!loading}
        title="Edit student"
        description={editStudent?.bus_name ? `A new address gives ${editStudent.name} a new stop on ${editStudent.bus_name}. Other stops stay where they are.` : undefined}
        footer={
          <>
            <ActionButton variant="plain" onClick={close} disabled={loading}>Cancel</ActionButton>
            <ActionButton onClick={handleEdit} loading={loading}>Save</ActionButton>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {error && <Notice tone="danger">{error}</Notice>}
          <Field label="Full name" htmlFor="edit-name">
            <input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Home address" htmlFor="edit-address">
            <input id="edit-address" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className={inputClass} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={changeBusStudent !== null}
        onClose={close}
        dismissible={!loading}
        title="Change bus"
        description={changeBusStudent ? `${changeBusStudent.name} is on ${changeBusStudent.bus_name ?? 'no bus'}. They leave that route and slot into the new bus's route.` : undefined}
        footer={
          <>
            <ActionButton variant="plain" onClick={close} disabled={loading}>Cancel</ActionButton>
            <ActionButton onClick={handleChangeBus} loading={loading}>Move</ActionButton>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {error && <Notice tone="danger">{error}</Notice>}
          <Field label="New bus" htmlFor="change-bus">
            <select id="change-bus" value={newBusId} onChange={(e) => setNewBusId(e.target.value)} className={inputClass}>
              <option value="">No bus</option>
              {buses.map((b) => {
                const full = b.student_count >= b.capacity && b.id !== changeBusStudent?.bus_id
                return <option key={b.id} value={b.id} disabled={full}>{b.name} ({b.student_count}/{b.capacity}){full ? ', full' : ''}</option>
              })}
            </select>
          </Field>
        </div>
      </Modal>

      <Modal
        open={inviteStudent !== null}
        onClose={closeInvite}
        title={inviteLink ? 'Invite link ready' : 'Invite a parent'}
        description={
          inviteLink
            ? `Send it to ${inviteStudent?.name ?? 'the student'}'s parent. When they sign up, they are linked to their child.`
            : `A one-time link. The parent opens it, creates an account and follows ${inviteStudent?.name ?? 'their child'}'s bus in the app.`
        }
        footer={
          inviteLink ? (
            <ActionButton onClick={closeInvite}>Done</ActionButton>
          ) : (
            <>
              <ActionButton variant="plain" onClick={closeInvite}>Cancel</ActionButton>
              <ActionButton onClick={handleGenerateParentInvite} loading={loading}>{!loading && <Mail />} Create link</ActionButton>
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
        open={deleteStudent !== null}
        onClose={close}
        dismissible={!loading}
        width="sm"
        title={`Remove ${deleteStudent?.name ?? 'student'}?`}
        description={`They leave the roster${deleteStudent?.bus_name ? ` and ${deleteStudent.bus_name}'s route` : ''}. Their parent loses access to the bus.`}
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
