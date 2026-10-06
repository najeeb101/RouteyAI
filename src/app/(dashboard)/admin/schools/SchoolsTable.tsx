'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SchoolRow } from './page'

type ModalMode = 'add' | 'edit' | 'assign' | null

export default function SchoolsTable({ initialSchools }: { initialSchools: SchoolRow[] }) {
  const [schools, setSchools] = useState<SchoolRow[]>(initialSchools)
  const [modal, setModal] = useState<ModalMode>(null)
  const [selected, setSelected] = useState<SchoolRow | null>(null)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<SchoolRow | null>(null)
  const [form, setForm] = useState({ name: '', address: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const supabase = createClient()

  const refetch = async () => {
    const { data } = await supabase.rpc('get_schools_with_admins')
    if (data) setSchools(data as SchoolRow[])
  }

  const filtered = schools.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.address.toLowerCase().includes(search.toLowerCase())
  )

  const closeModal = () => { setModal(null); setError(null) }

  const openAdd = () => {
    setForm({ name: '', address: '' })
    setSelected(null)
    setError(null)
    setModal('add')
  }

  const openEdit = (s: SchoolRow) => {
    setForm({ name: s.name, address: s.address })
    setSelected(s)
    setError(null)
    setModal('edit')
  }

  const openAssign = (s: SchoolRow) => {
    setSelected(s)
    setInviteLink(null)
    setCopied(false)
    setError(null)
    setModal('assign')
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)

    if (modal === 'add') {
      const { error: err } = await supabase.rpc('create_school', {
        p_name: form.name,
        p_address: form.address,
      })
      if (err) { setError(err.message); setLoading(false); return }
    } else if (modal === 'edit' && selected) {
      const { error: err } = await supabase
        .from('schools')
        .update({ name: form.name, address: form.address })
        .eq('id', selected.id)
      if (err) { setError(err.message); setLoading(false); return }
    }

    await refetch()
    setLoading(false)
    closeModal()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setLoading(true)
    await supabase.from('schools').delete().eq('id', deleteTarget.id)
    await refetch()
    setLoading(false)
    setDeleteTarget(null)
  }

  const handleGenerateInvite = async () => {
    if (!selected) return
    setLoading(true)
    setError(null)
    const { data: code, error: err } = await supabase.rpc('generate_school_admin_invite', {
      p_school_id: selected.id,
    })
    if (err || !code) {
      setError(err?.message ?? 'Failed to generate invite')
      setLoading(false)
      return
    }
    setInviteLink(`${window.location.origin}/invite/${code}`)
    setLoading(false)
  }

  const handleCopy = () => {
    if (!inviteLink) return
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Schools</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{schools.length} schools on the platform</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#1E3A8A] text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-[#1e40af] transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add School
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Search schools…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-[#E2E8F0] rounded-xl py-2.5 pl-9 pr-3 text-sm text-[#0F172A] bg-white outline-none focus:border-[#3B82F6] transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">School</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">School Admin</th>
              <th className="text-center px-4 py-3.5 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">Buses</th>
              <th className="text-center px-4 py-3.5 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">Students</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">Status</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wide">Joined</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr
                key={s.id}
                className={`border-b border-[#F8FAFC] last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'} hover:bg-blue-50/40 transition-colors`}
              >
                <td className="px-5 py-4">
                  <div className="font-semibold text-[#0F172A] text-[13px]">{s.name}</div>
                  <div className="text-[11px] text-[#94A3B8]">{s.address}</div>
                </td>
                <td className="px-5 py-4">
                  {s.admin_name ? (
                    <div>
                      <div className="text-[13px] text-[#0F172A] font-medium">{s.admin_name}</div>
                      {s.admin_email && <div className="text-[11px] text-[#94A3B8]">{s.admin_email}</div>}
                    </div>
                  ) : (
                    <button
                      onClick={() => openAssign(s)}
                      className="text-[12px] text-[#3B82F6] font-semibold hover:underline"
                    >
                      + Assign admin
                    </button>
                  )}
                </td>
                <td className="px-4 py-4 text-center text-[13px] font-semibold text-[#0F172A]">{s.bus_count}</td>
                <td className="px-4 py-4 text-center text-[13px] font-semibold text-[#0F172A]">{s.student_count}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full ${
                    s.admin_name ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.admin_name ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {s.admin_name ? 'Active' : 'Pending'}
                  </span>
                </td>
                <td className="px-5 py-4 text-[12px] text-[#94A3B8]">
                  {new Date(s.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => openEdit(s)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#1E3A8A] hover:bg-[#EFF6FF] transition-colors"
                      title="Edit school"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(s)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete school"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/>
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#94A3B8]">
                  {search ? 'No schools match your search.' : 'No schools yet. Add the first one.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 bg-[#0F172A]/45 backdrop-blur-sm flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white rounded-2xl p-6 w-[480px] shadow-[0_20px_60px_-15px_rgb(0_0_0/0.3)]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <span className="text-lg font-bold text-[#0F172A]">{modal === 'add' ? 'Add School' : 'Edit School'}</span>
              <button onClick={closeModal} className="w-7 h-7 bg-[#F1F5F9] rounded-lg flex items-center justify-center text-[#64748B]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">School name</label>
                <input
                  type="text"
                  placeholder="e.g. Al Nour International School"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-sm text-[#0F172A] bg-[#FAFAFA] outline-none focus:border-[#3B82F6] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Address</label>
                <input
                  type="text"
                  placeholder="Full street address"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-sm text-[#0F172A] bg-[#FAFAFA] outline-none focus:border-[#3B82F6] transition-colors"
                />
              </div>
              <div className="flex gap-2 justify-end mt-1">
                <button onClick={closeModal} className="bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm font-medium">Cancel</button>
                <button
                  onClick={handleSave}
                  disabled={!form.name.trim() || !form.address.trim() || loading}
                  className="bg-[#1E3A8A] text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {modal === 'add' ? 'Add School' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign admin modal — invite-based */}
      {modal === 'assign' && selected && (
        <div className="fixed inset-0 bg-[#0F172A]/45 backdrop-blur-sm flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white rounded-2xl p-6 w-[440px] shadow-[0_20px_60px_-15px_rgb(0_0_0/0.3)]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <span className="text-lg font-bold text-[#0F172A]">Assign School Admin</span>
              <button onClick={closeModal} className="w-7 h-7 bg-[#F1F5F9] rounded-lg flex items-center justify-center text-[#64748B]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="mb-4 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
              <div className="text-xs text-[#94A3B8] mb-0.5">Assigning admin to</div>
              <div className="text-sm font-semibold text-[#0F172A]">{selected.name}</div>
            </div>

            {error && (
              <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
            )}

            {inviteLink ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-[#64748B]">
                  Share this link with the admin. They&apos;ll create their account and be automatically assigned to{' '}
                  <span className="font-semibold text-[#0F172A]">{selected.name}</span>.
                  The link expires in 7 days and can only be used once.
                </p>
                <div className="flex items-center gap-2 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                  <span className="flex-1 text-[12px] text-[#0F172A] font-mono truncate">{inviteLink}</span>
                  <button
                    onClick={handleCopy}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                      copied ? 'bg-emerald-50 text-emerald-600' : 'bg-[#1E3A8A] text-white hover:bg-[#1e40af]'
                    }`}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <button onClick={closeModal} className="w-full bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] rounded-lg py-2 text-sm font-medium mt-1">
                  Done
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-[#64748B]">
                  Generate a secure, single-use invite link for the school admin. They&apos;ll follow the link to create their account.
                </p>
                <div className="flex gap-2 justify-end">
                  <button onClick={closeModal} className="bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm font-medium">Cancel</button>
                  <button
                    onClick={handleGenerateInvite}
                    disabled={loading}
                    className="bg-[#1E3A8A] text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    Generate Invite Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-[#0F172A]/45 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl p-6 w-[400px] shadow-[0_20px_60px_-15px_rgb(0_0_0/0.3)]" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-1">Delete school?</h3>
            <p className="text-sm text-[#64748B] mb-5">
              <span className="font-semibold text-[#0F172A]">{deleteTarget.name}</span> and all its buses, students, and routes will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm font-medium">Cancel</button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-500 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Delete School
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
