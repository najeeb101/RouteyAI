'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
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

function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-7 h-7 bg-[#F1F5F9] rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#E2E8F0] transition-colors">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  )
}

function RowMenu({ onEdit, onChangeBus, onInviteParent, onRemove }: {
  onEdit: () => void
  onChangeBus: () => void
  onInviteParent: () => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-8 h-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex items-center justify-center hover:bg-[#F1F5F9] transition-colors"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-9 w-44 bg-white rounded-xl border border-[#E2E8F0] shadow-[0_8px_24px_-4px_rgb(0_0_0/0.12)] z-20 overflow-hidden">
          <button onClick={() => { setOpen(false); onEdit() }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-[#0F172A] hover:bg-[#F8FAFC] text-left">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Student
          </button>
          <button onClick={() => { setOpen(false); onChangeBus() }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-[#0F172A] hover:bg-[#F8FAFC] text-left">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/>
              <path d="M18 18h3s.5-1.7.8-4.3c.3-2.7.2-7.7.2-7.7H2S1.7 7 2 9.7c.3 2.6.8 4.3.8 4.3H5"/>
              <circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
            </svg>
            Change Bus
          </button>
          <button onClick={() => { setOpen(false); onInviteParent() }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-[#0F172A] hover:bg-[#F8FAFC] text-left">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Invite Parent
          </button>
          <div className="h-px bg-[#F1F5F9] mx-2" />
          <button onClick={() => { setOpen(false); onRemove() }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-[#EF4444] hover:bg-[#FEF2F2] text-left">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            Remove
          </button>
        </div>
      )}
    </div>
  )
}

export default function StudentsTable({
  initialStudents,
  buses,
}: {
  initialStudents: StudentRow[]
  buses: BusRow[]
}) {
  const supabase = createClient()

  const [students, setStudents] = useState<StudentRow[]>(initialStudents)
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  // Modal state
  const [addOpen,          setAddOpen]          = useState(false)
  const [editStudent,      setEditStudent]      = useState<StudentRow | null>(null)
  const [changeBusStudent, setChangeBusStudent] = useState<StudentRow | null>(null)
  const [deleteStudent,    setDeleteStudent]    = useState<StudentRow | null>(null)
  const [inviteStudent,    setInviteStudent]    = useState<StudentRow | null>(null)
  const [inviteLink,       setInviteLink]       = useState<string | null>(null)
  const [copied,           setCopied]           = useState(false)
  const [geocodeWarning,   setGeocodeWarning]   = useState(false)

  // Add form
  const [addName,    setAddName]    = useState('')
  const [addAddress, setAddAddress] = useState('')
  const [addBusId,   setAddBusId]   = useState('')

  // Edit form
  const [editName,    setEditName]    = useState('')
  const [editAddress, setEditAddress] = useState('')

  // Change bus
  const [newBusId, setNewBusId] = useState('')

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.bus_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    s.home_address.toLowerCase().includes(search.toLowerCase())
  )

  const refetch = useCallback(async () => {
    const { data } = await supabase.rpc('get_students_with_bus')
    if (data) setStudents(data as StudentRow[])
  }, [supabase])

  const triggerOptimization = useCallback(async (schoolId?: string) => {
    if (!schoolId) return
    await supabase.functions.invoke('optimize-route', {
      body: { school_id: schoolId },
    })
  }, [supabase])

  const openEdit = (s: StudentRow) => {
    setEditStudent(s)
    setEditName(s.name)
    setEditAddress(s.home_address)
  }

  const openChangeBus = (s: StudentRow) => {
    setChangeBusStudent(s)
    setNewBusId(s.bus_id ?? buses[0]?.id ?? '')
  }

  const handleAdd = async () => {
    if (!addName.trim() || !addAddress.trim()) return
    setLoading(true); setError(null); setGeocodeWarning(false)
    const { lat, lng, geocoded } = await geocodeAddress(addAddress)
    if (!geocoded) setGeocodeWarning(true)
    const { error: err } = await supabase.rpc('add_student', {
      p_name:         addName.trim(),
      p_home_address: addAddress.trim(),
      p_lat:          lat,
      p_lng:          lng,
      p_bus_id:       addBusId || null,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setAddOpen(false)
    setAddName(''); setAddAddress(''); setAddBusId('')
    await triggerOptimization(students[0]?.school_id)
    await refetch()
  }

  const handleEdit = async () => {
    if (!editStudent) return
    setLoading(true); setError(null)
    const { error: err } = await supabase
      .from('students')
      .update({
        name:         editName.trim()    || editStudent.name,
        home_address: editAddress.trim() || editStudent.home_address,
      })
      .eq('id', editStudent.id)
    setLoading(false)
    if (err) { setError(err.message); return }
    setEditStudent(null)
    await refetch()
  }

  const handleChangeBus = async () => {
    if (!changeBusStudent) return
    setLoading(true); setError(null)
    const { error: err } = await supabase
      .from('students')
      .update({ bus_id: newBusId || null })
      .eq('id', changeBusStudent.id)
    setLoading(false)
    if (err) { setError(err.message); return }
    await triggerOptimization(changeBusStudent.school_id)
    setChangeBusStudent(null)
    await refetch()
  }

  const handleDelete = async () => {
    if (!deleteStudent) return
    setLoading(true); setError(null)
    const { error: err } = await supabase.from('students').delete().eq('id', deleteStudent.id)
    setLoading(false)
    if (err) { setError(err.message); return }
    await triggerOptimization(deleteStudent.school_id)
    setDeleteStudent(null)
    await refetch()
  }

  const handleGenerateParentInvite = async () => {
    if (!inviteStudent) return
    setLoading(true); setError(null)
    const { data: code, error: err } = await supabase.rpc('generate_parent_invite', {
      p_student_id: inviteStudent.id,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setInviteLink(`${window.location.origin}/invite/${code}`)
  }

  const closeInvite = () => {
    setInviteStudent(null)
    setInviteLink(null)
    setCopied(false)
  }

  const handleCopy = () => {
    if (!inviteLink) return
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-7 max-w-[1280px]">
      {error && (
        <div className="mb-4 px-4 py-3 bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-sm rounded-xl">
          {error}
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] leading-tight">Student Roster</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{students.length} student{students.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 bg-[#1E3A8A] text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-[#1e40af] transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Student
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] p-5">
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, bus or address…"
            className="w-full border border-[#E2E8F0] rounded-xl py-2.5 pl-9 pr-3 text-[13px] text-[#0F172A] bg-[#FAFAFA] outline-none focus:border-[#3B82F6] transition-colors"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#94A3B8]">
            {students.length === 0
              ? 'No students yet. Add your first student to get started.'
              : 'No students match your search.'}
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC]">
                {['Student', 'Home Address', 'Bus', 'Stop Order', ''].map(h => (
                  <th key={h} className="px-3.5 py-2.5 text-left text-[11px] font-bold text-[#64748B] uppercase tracking-wide border-b border-[#E2E8F0]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const initials = s.name.split(' ').map(n => n[0] ?? '').join('')
                return (
                  <tr key={s.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[13px] font-bold text-[#1E3A8A] shrink-0">
                          {initials}
                        </div>
                        <span className="text-sm font-semibold text-[#0F172A]">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-3.5 py-3 text-[13px] text-[#64748B] max-w-[200px] truncate">{s.home_address}</td>
                    <td className="px-3.5 py-3 text-[13px] font-medium text-[#0F172A]">{s.bus_name ?? <span className="text-[#94A3B8]">Unassigned</span>}</td>
                    <td className="px-3.5 py-3 text-[13px] text-[#64748B]">{s.stop_order ?? <span className="text-[#94A3B8]">—</span>}</td>
                    <td className="px-3.5 py-3">
                      <RowMenu
                        onEdit={() => openEdit(s)}
                        onChangeBus={() => openChangeBus(s)}
                        onInviteParent={() => { setInviteStudent(s); setInviteLink(null) }}
                        onRemove={() => setDeleteStudent(s)}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Add Student Modal ── */}
      {addOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/45 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => { setAddOpen(false); setGeocodeWarning(false) }}>
          <div className="bg-white rounded-2xl p-6 w-[480px] shadow-[0_20px_60px_-15px_rgb(0_0_0/0.3)]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <span className="text-lg font-bold text-[#0F172A]">Add New Student</span>
              <CloseBtn onClick={() => { setAddOpen(false); setGeocodeWarning(false) }} />
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Full Name</label>
                <input
                  value={addName}
                  onChange={e => setAddName(e.target.value)}
                  type="text"
                  placeholder="e.g. Sarah Abdullah"
                  className="w-full border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-sm text-[#0F172A] bg-[#FAFAFA] outline-none focus:border-[#3B82F6] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Home Address</label>
                <input
                  value={addAddress}
                  onChange={e => setAddAddress(e.target.value)}
                  type="text"
                  placeholder="Full address for geocoding…"
                  className="w-full border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-sm text-[#0F172A] bg-[#FAFAFA] outline-none focus:border-[#3B82F6] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Assign to Bus</label>
                <select
                  value={addBusId}
                  onChange={e => setAddBusId(e.target.value)}
                  className="w-full border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-sm text-[#0F172A] bg-[#FAFAFA] outline-none"
                >
                  <option value="">Auto-assign (smart placement)</option>
                  {buses.map(b => {
                    const isFull = b.student_count >= b.capacity
                    return (
                      <option key={b.id} value={b.id} disabled={isFull}>
                        {b.name} ({b.student_count}/{b.capacity}){isFull ? ' · FULL' : ''}
                      </option>
                    )
                  })}
                </select>
              </div>
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-3 py-2.5 flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" className="shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-xs text-[#1E3A8A]">The address will be geocoded via Mapbox to record the exact pickup location for route optimization.</p>
              </div>
              {geocodeWarning && (
                <div className="px-3 py-2.5 bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-xs rounded-xl flex items-start gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 mt-0.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  Address could not be geocoded — student saved with approximate Qatar coordinates. Re-add with a more specific address for accurate route distances.
                </div>
              )}
              <div className="flex gap-2 justify-end mt-1">
                <button onClick={() => { setAddOpen(false); setGeocodeWarning(false) }} className="bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm font-medium">Cancel</button>
                <button
                  onClick={handleAdd}
                  disabled={!addName.trim() || !addAddress.trim() || loading}
                  className="bg-[#1E3A8A] text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 flex items-center gap-2"
                >
                  {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Add Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Student Modal ── */}
      {editStudent && (
        <div className="fixed inset-0 bg-[#0F172A]/45 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setEditStudent(null)}>
          <div className="bg-white rounded-2xl p-6 w-[460px] shadow-[0_20px_60px_-15px_rgb(0_0_0/0.3)]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <span className="text-lg font-bold text-[#0F172A]">Edit Student</span>
              <CloseBtn onClick={() => setEditStudent(null)} />
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Full Name</label>
                <input value={editName} onChange={e => setEditName(e.target.value)} type="text" className="w-full border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-sm text-[#0F172A] bg-[#FAFAFA] outline-none focus:border-[#3B82F6] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Home Address</label>
                <input value={editAddress} onChange={e => setEditAddress(e.target.value)} type="text" className="w-full border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-sm text-[#0F172A] bg-[#FAFAFA] outline-none focus:border-[#3B82F6] transition-colors" />
              </div>
              <div className="flex gap-2 justify-end mt-1">
                <button onClick={() => setEditStudent(null)} className="bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm font-medium">Cancel</button>
                <button
                  onClick={handleEdit}
                  disabled={loading}
                  className="bg-[#1E3A8A] text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 flex items-center gap-2"
                >
                  {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Change Bus Modal ── */}
      {changeBusStudent && (
        <div className="fixed inset-0 bg-[#0F172A]/45 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setChangeBusStudent(null)}>
          <div className="bg-white rounded-2xl p-6 w-[420px] shadow-[0_20px_60px_-15px_rgb(0_0_0/0.3)]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-bold text-[#0F172A]">Change Bus</span>
              <CloseBtn onClick={() => setChangeBusStudent(null)} />
            </div>
            <p className="text-sm text-[#64748B] mb-5">
              {changeBusStudent.name} · currently on{' '}
              <span className="font-semibold text-[#0F172A]">{changeBusStudent.bus_name ?? 'no bus'}</span>
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">New Bus Assignment</label>
                <select
                  value={newBusId}
                  onChange={e => setNewBusId(e.target.value)}
                  className="w-full border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-sm text-[#0F172A] bg-[#FAFAFA] outline-none"
                >
                  <option value="">Unassigned</option>
                  {buses.map(b => {
                    const isFull = b.student_count >= b.capacity && b.id !== changeBusStudent.bus_id
                    return (
                      <option key={b.id} value={b.id} disabled={isFull}>
                        {b.name} ({b.student_count}/{b.capacity}){isFull ? ' · FULL' : ''}
                      </option>
                    )
                  })}
                </select>
              </div>
              <div className="flex gap-2 justify-end mt-1">
                <button onClick={() => setChangeBusStudent(null)} className="bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm font-medium">Cancel</button>
                <button
                  onClick={handleChangeBus}
                  disabled={loading}
                  className="bg-[#1E3A8A] text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 flex items-center gap-2"
                >
                  {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Reassign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Invite Parent Modal ── */}
      {inviteStudent && (
        <div className="fixed inset-0 bg-[#0F172A]/45 backdrop-blur-sm flex items-center justify-center z-50" onClick={closeInvite}>
          <div className="bg-white rounded-2xl p-6 w-[460px] shadow-[0_20px_60px_-15px_rgb(0_0_0/0.3)]" onClick={e => e.stopPropagation()}>
            {inviteLink ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-[#0F172A]">Parent Invite Link</span>
                  <CloseBtn onClick={closeInvite} />
                </div>
                <p className="text-sm text-[#64748B] mb-4">
                  Share this with <span className="font-semibold text-[#0F172A]">{inviteStudent.name}&apos;s</span> parent. When they sign up, they will be automatically linked to their child.
                </p>
                <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2.5 mb-4">
                  <span className="flex-1 text-[12px] text-[#0F172A] truncate font-mono">{inviteLink}</span>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 flex items-center gap-1.5 bg-[#1E3A8A] text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[#1e40af]"
                  >
                    {copied ? (
                      <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Copied</>
                    ) : (
                      <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copy</>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-[#94A3B8]">Link expires in 7 days · Single use</p>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold text-[#0F172A]">Invite Parent</span>
                  <CloseBtn onClick={closeInvite} />
                </div>
                <p className="text-sm text-[#64748B] mb-5">{inviteStudent.name}</p>
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-4 py-3 mb-5 text-sm text-[#1E3A8A]">
                  Generate a one-time invite link. The parent clicks it, creates an account, and is automatically linked to {inviteStudent.name} for live bus tracking.
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={closeInvite} className="bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm font-medium">Cancel</button>
                  <button
                    onClick={handleGenerateParentInvite}
                    disabled={loading}
                    className="bg-[#1E3A8A] text-white rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
                  >
                    {loading
                      ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    }
                    Generate Invite Link
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deleteStudent && (
        <div className="fixed inset-0 bg-[#0F172A]/45 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setDeleteStudent(null)}>
          <div className="bg-white rounded-2xl p-6 w-[400px] shadow-[0_20px_60px_-15px_rgb(0_0_0/0.3)]" onClick={e => e.stopPropagation()}>
            <div className="w-11 h-11 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[#0F172A] mb-1">Remove {deleteStudent.name}?</h2>
            <p className="text-sm text-[#64748B] mb-5">
              This will remove the student from the roster{deleteStudent.bus_name ? ` and unassign them from ${deleteStudent.bus_name}` : ''}.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteStudent(null)} className="bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm font-medium">Cancel</button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="bg-[#EF4444] text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 flex items-center gap-2"
              >
                {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Remove Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
