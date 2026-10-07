'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Check, Copy, Pencil, Plus, School, Search, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ActionButton } from '@/components/dashboard/ActionButton'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { Field, inputClass } from '@/components/dashboard/Field'
import { Modal } from '@/components/dashboard/Modal'
import { Notice } from '@/components/dashboard/Notice'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Panel } from '@/components/dashboard/Panel'
import { StatusText } from '@/components/dashboard/StatusText'
import type { SchoolRow } from './page'

type ModalMode = 'add' | 'edit' | 'assign' | null

const joined = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })

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

  const query = search.trim().toLowerCase()
  const filtered = schools.filter((s) => s.name.toLowerCase().includes(query) || s.address.toLowerCase().includes(query))

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
      const { error: err } = await supabase.rpc('create_school', { p_name: form.name, p_address: form.address })
      if (err) { setError(err.message); setLoading(false); return }
      toast.success(`${form.name.trim()} added`, { description: 'Send its admin an invite link next.' })
    } else if (modal === 'edit' && selected) {
      const { error: err } = await supabase
        .from('schools')
        .update({ name: form.name, address: form.address })
        .eq('id', selected.id)
      if (err) { setError(err.message); setLoading(false); return }
      toast.success('School updated')
    }

    await refetch()
    setLoading(false)
    closeModal()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setLoading(true)
    const { error: err } = await supabase.from('schools').delete().eq('id', deleteTarget.id)
    if (err) {
      toast.error('Could not delete the school', { description: err.message })
      setLoading(false)
      return
    }
    toast.success(`${deleteTarget.name} deleted`)
    await refetch()
    setLoading(false)
    setDeleteTarget(null)
  }

  const handleGenerateInvite = async () => {
    if (!selected) return
    setLoading(true)
    setError(null)
    const { data: code, error: err } = await supabase.rpc('generate_school_admin_invite', { p_school_id: selected.id })
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

  const formOpen = modal === 'add' || modal === 'edit'

  return (
    <>
      <PageHeader
        title="Schools"
        subtitle={`${schools.length} ${schools.length === 1 ? 'school' : 'schools'} on the platform`}
        actions={<ActionButton onClick={openAdd}><Plus />Add school</ActionButton>}
      />

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden="true" />
        <input
          type="search"
          aria-label="Search schools"
          placeholder="Search schools"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputClass} pl-10`}
        />
      </div>

      <Panel bodyClassName="p-0">
        {filtered.length === 0 ? (
          <EmptyState
            icon={School}
            title={search ? 'No schools match your search' : 'No schools yet'}
            action={!search && <ActionButton onClick={openAdd}><Plus />Add the first school</ActionButton>}
          >
            {search ? 'Try a different name or address.' : 'Add a school, then send its admin an invite link.'}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr className="text-left text-[13px] text-ink-2">
                  <th className="px-5 py-3 font-medium">School</th>
                  <th className="px-3 py-3 font-medium">Admin</th>
                  <th className="px-3 py-3 text-right font-medium">Buses</th>
                  <th className="px-3 py-3 text-right font-medium">Students</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 text-right font-medium">Joined</th>
                  <th className="px-5 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-t border-line transition-colors hover:bg-canvas/60">
                    <td className="px-5 py-3">
                      <p className="text-sm font-semibold text-ink">{s.name}</p>
                      <p className="text-[13px] text-ink-2">{s.address}</p>
                    </td>
                    <td className="px-3 py-3">
                      {s.admin_name ? (
                        <>
                          <p className="text-[13px] font-medium text-ink">{s.admin_name}</p>
                          {s.admin_email && <p className="text-[13px] text-ink-2">{s.admin_email}</p>}
                        </>
                      ) : (
                        <ActionButton variant="secondary" size="sm" onClick={() => openAssign(s)}><Plus />Invite admin</ActionButton>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right text-[13px] tabular-nums text-ink">{s.bus_count}</td>
                    <td className="px-3 py-3 text-right text-[13px] tabular-nums text-ink">{s.student_count}</td>
                    <td className="px-3 py-3">
                      <StatusText tone={s.admin_name ? 'success' : 'warning'}>{s.admin_name ? 'Active' : 'Waiting for an admin'}</StatusText>
                    </td>
                    <td className="px-3 py-3 text-right text-[13px] text-ink-2">{joined(s.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          aria-label={`Edit ${s.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-brand-tint hover:text-brand"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          aria-label={`Delete ${s.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-bad-tint hover:text-bad-text"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Modal
        open={formOpen}
        onClose={closeModal}
        dismissible={!loading}
        title={modal === 'add' ? 'Add school' : 'Edit school'}
        footer={
          <>
            <ActionButton variant="plain" onClick={closeModal} disabled={loading}>Cancel</ActionButton>
            <ActionButton onClick={handleSave} loading={loading} disabled={!form.name.trim() || !form.address.trim()}>
              {modal === 'add' ? 'Add school' : 'Save changes'}
            </ActionButton>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {error && <Notice tone="danger">{error}</Notice>}
          <Field label="School name" htmlFor="school-name">
            <input id="school-name" className={inputClass} placeholder="e.g. Al Nour International School" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Address" htmlFor="school-address">
            <input id="school-address" className={inputClass} placeholder="Full street address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={modal === 'assign' && selected !== null}
        onClose={closeModal}
        dismissible={!loading}
        title="Invite a school admin"
        description={selected ? `For ${selected.name}` : undefined}
        footer={
          inviteLink ? (
            <ActionButton onClick={closeModal}>Done</ActionButton>
          ) : (
            <>
              <ActionButton variant="plain" onClick={closeModal} disabled={loading}>Cancel</ActionButton>
              <ActionButton onClick={handleGenerateInvite} loading={loading}>Create invite link</ActionButton>
            </>
          )
        }
      >
        <div className="flex flex-col gap-4">
          {error && <Notice tone="danger">{error}</Notice>}
          {inviteLink ? (
            <>
              <p className="text-sm text-ink-2">
                Share this link with the admin. They create their account and are assigned to {selected?.name}. It works once and expires in 7 days.
              </p>
              <div className="flex items-center gap-2 rounded-xl bg-canvas p-3">
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-ink">{inviteLink}</span>
                <ActionButton size="sm" variant={copied ? 'secondary' : 'primary'} onClick={handleCopy}>
                  {copied ? <Check /> : <Copy />}
                  {copied ? 'Copied' : 'Copy'}
                </ActionButton>
              </div>
            </>
          ) : (
            <p className="text-sm text-ink-2">Create a secure link that works once. The admin follows it to make their account.</p>
          )}
        </div>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        dismissible={!loading}
        title="Delete this school?"
        footer={
          <>
            <ActionButton variant="plain" onClick={() => setDeleteTarget(null)} disabled={loading}>Cancel</ActionButton>
            <ActionButton variant="danger" onClick={handleDelete} loading={loading}>Delete school</ActionButton>
          </>
        }
      >
        <Notice tone="danger">
          {deleteTarget?.name} and all its buses, students and routes will be deleted for good. This can&apos;t be undone.
        </Notice>
      </Modal>
    </>
  )
}
