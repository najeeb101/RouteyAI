'use client'

import { useState } from 'react'

const BUSES_LIST = [
  { id: 1, num: 3,  route: 'Route A — Morning', students: 28, capacity: 40 },
  { id: 2, num: 7,  route: 'Route B — Morning', students: 35, capacity: 40 },
  { id: 3, num: 12, route: 'Route C — Afternoon', students: 18, capacity: 40 },
  { id: 4, num: 5,  route: 'Route D — Morning', students: 40, capacity: 40 },
]

const STUDENTS = [
  { id:1, name:'Aisha Rahman',   grade:'Grade 4', bus:'Bus #3', stop:'Lusail Blvd',    status:'boarded', time:'7:42 AM' },
  { id:2, name:'Tariq Hassan',   grade:'Grade 6', bus:'Bus #3', stop:'C-Ring Rd',      status:'boarded', time:'7:31 AM' },
  { id:3, name:'Sara Al-Farsi',  grade:'Grade 2', bus:'Bus #7', stop:'Pearl Drive',    status:'absent',  time:'—'       },
  { id:4, name:'Omar Khalil',    grade:'Grade 5', bus:'Bus #7', stop:'Al Waab St',     status:'boarded', time:'7:55 AM' },
  { id:5, name:'Noor Jaber',     grade:'Grade 3', bus:'Bus #12',stop:'Salwa Rd',       status:'waiting', time:'—'       },
  { id:6, name:'Khalid Mansour', grade:'Grade 7', bus:'Bus #5', stop:'Doha Expwy',     status:'boarded', time:'7:48 AM' },
  { id:7, name:'Lina Qasem',     grade:'Grade 1', bus:'Bus #5', stop:'Education City', status:'boarded', time:'7:52 AM' },
  { id:8, name:'Yusuf Al-Ali',   grade:'Grade 8', bus:'Bus #3', stop:'West Bay',       status:'boarded', time:'7:38 AM' },
]

const STATUS_STYLE = {
  boarded: { bg: '#D1FAE5', text: '#059669', label: 'Boarded' },
  absent:  { bg: '#FEE2E2', text: '#DC2626', label: 'Absent'  },
  waiting: { bg: '#FEF3C7', text: '#D97706', label: 'Waiting' },
} as const

type StudentStatus = keyof typeof STATUS_STYLE

export default function StudentsPage() {
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const filtered = STUDENTS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.bus.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-7 max-w-[1280px]">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] leading-tight">Student Roster</h1>
          <p className="text-sm text-[#64748B] mt-0.5">{STUDENTS.length} students registered</p>
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
        {/* Search */}
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students or buses…"
            className="w-full border border-[#E2E8F0] rounded-xl py-2.5 pl-9 pr-3 text-[13px] text-[#0F172A] bg-[#FAFAFA] outline-none focus:border-[#3B82F6] transition-colors"
          />
        </div>

        {/* Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC]">
              {['Student','Grade','Bus','Stop','Status','Time',''].map(h => (
                <th key={h} className="px-3.5 py-2.5 text-left text-[11px] font-bold text-[#64748B] uppercase tracking-wide border-b border-[#E2E8F0]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const ss = STATUS_STYLE[s.status as StudentStatus] ?? STATUS_STYLE.waiting
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
                  <td className="px-3.5 py-3 text-[13px] text-[#64748B]">{s.grade}</td>
                  <td className="px-3.5 py-3 text-[13px] font-medium text-[#0F172A]">{s.bus}</td>
                  <td className="px-3.5 py-3 text-[13px] text-[#64748B]">{s.stop}</td>
                  <td className="px-3.5 py-3">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: ss.bg, color: ss.text }}>
                      {ss.label}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 text-[13px] text-[#64748B] font-mono">{s.time}</td>
                  <td className="px-3.5 py-3">
                    <button className="w-8 h-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex items-center justify-center">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {addOpen && (
        <div className="fixed inset-0 bg-[#0F172A]/45 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setAddOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-[480px] shadow-[0_20px_60px_-15px_rgb(0_0_0/0.3)] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <span className="text-lg font-bold text-[#0F172A]">Add New Student</span>
              <button onClick={() => setAddOpen(false)} className="w-7 h-7 bg-[#F1F5F9] rounded-lg flex items-center justify-center text-[#64748B]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {[
                ['Full Name',     'text',  'e.g. Sarah Abdullah'],
                ['Grade',         'text',  'e.g. Grade 3'],
                ['Home Address',  'text',  'Start typing to geocode…'],
                ['Parent Email',  'email', 'parent@email.com'],
              ].map(([l, t, p]) => (
                <div key={l}>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">{l}</label>
                  <input type={t} placeholder={p} className="w-full border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-sm text-[#0F172A] bg-[#FAFAFA] outline-none focus:border-[#3B82F6] transition-colors" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Assign to Bus</label>
                <select className="w-full border border-[#E2E8F0] rounded-xl py-2.5 px-3 text-sm text-[#0F172A] bg-[#FAFAFA] outline-none">
                  {BUSES_LIST.map(b => (
                    <option key={b.id}>Bus #{b.num} — {b.route} ({b.students}/{b.capacity})</option>
                  ))}
                </select>
              </div>
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-3 py-2.5 text-xs text-[#1E3A8A]">
                Smart Placement will auto-assign this student to the nearest existing stop cluster.
              </div>
              <div className="flex gap-2 justify-end mt-1">
                <button onClick={() => setAddOpen(false)} className="bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] rounded-lg px-4 py-2 text-sm font-medium">Cancel</button>
                <button onClick={() => setAddOpen(false)} className="bg-[#1E3A8A] text-white rounded-lg px-4 py-2 text-sm font-semibold">Add Student</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
