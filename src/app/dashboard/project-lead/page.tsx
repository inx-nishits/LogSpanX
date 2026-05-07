'use client'

import { useEffect, useState, useRef } from 'react'
import { apiRequest } from '@/lib/api/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useToastStore } from '@/lib/stores/toast-store'
import { Search, ChevronDown, Pencil, MoreVertical, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mapApiUser } from '@/lib/api/mappers'
import { User } from '@/lib/types'

export default function ProjectLeadPage() {
  const { token } = useAuthStore()
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('active')
  const [statusOpen, setStatusOpen] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const statusRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    apiRequest<unknown>('/users', { method: 'GET', token })
      .then(res => {
        const arr: any[] = Array.isArray(res) ? res
          : Array.isArray((res as any)?.data) ? (res as any).data
          : Object.values(res as object).find(Array.isArray) ?? []
        setAllUsers(arr.map(mapApiUser))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  const handleArchiveToggle = async (user: User) => {
    try {
      await apiRequest(`/users/${user.id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify({ archived: !user.archived }),
      })
      setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, archived: !u.archived } : u))
      useToastStore.getState().show(`User ${user.archived ? 'activated' : 'archived'} successfully`, 'success')
    } catch (err) { console.error(err) }
    setOpenMenuId(null)
  }

  const handleEditSave = async () => {
    if (!editingUser || !editName.trim()) return
    try {
      await apiRequest(`/users/${editingUser.id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify({ name: editName.trim(), email: editEmail.trim() }),
      })
      setAllUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, name: editName.trim(), email: editEmail.trim() } : u))
      useToastStore.getState().show('User updated successfully', 'success')
      setEditingUser(null)
    } catch (err) { console.error(err) }
  }

  // Show only team_lead role users
  const teamLeads = allUsers.filter(u => u.role === 'team_lead')

  const filteredMembers = teamLeads
    .filter(u => {
      if (statusFilter === 'active') return u.isActive !== false && !u.archived
      if (statusFilter === 'inactive') return u.isActive === false || u.archived
      return true
    })
    .filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  const statusLabel = statusFilter === 'active' ? 'Show active' : statusFilter === 'inactive' ? 'Show inactive' : 'Show all'

  return (
    <>
    <div className="min-h-full flex flex-col bg-[#f2f6f8] font-sans antialiased">
      <div className="w-full px-5 pt-4 pb-3">
        <h1 className="text-lg text-[#333] font-normal">Project Lead</h1>
      </div>

      <div className="flex-1 px-5 pb-8">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative" ref={statusRef}>
            <button
              onClick={() => setStatusOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 h-[34px] text-[13px] text-[#555] bg-white border border-[#c6d2d9] rounded-sm hover:border-[#aaa] transition-colors"
            >
              {statusLabel} <ChevronDown className="h-3.5 w-3.5 text-[#aaa]" />
            </button>
            {statusOpen && (
              <div className="absolute top-full left-0 mt-0.5 bg-white border border-[#ddd] shadow-lg z-50 min-w-[150px] py-0.5 rounded-sm">
                {(['active', 'inactive', 'all'] as const).map(s => (
                  <button key={s} onClick={() => { setStatusFilter(s); setStatusOpen(false) }}
                    className={cn('w-full text-left px-3 py-2 text-[12px] cursor-pointer transition-colors',
                      statusFilter === s ? 'bg-[#03a9f4] text-white' : 'text-[#555] hover:bg-[#f0f4f8]')}>
                    {s === 'active' ? 'Show active' : s === 'inactive' ? 'Show inactive' : 'Show all'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center bg-white border border-[#c6d2d9] rounded-sm h-[34px] w-[260px] focus-within:border-[#03a9f4] transition-all">
            <Search className="h-4 w-4 text-[#bbb] ml-3 flex-shrink-0" />
            <input
              placeholder="Search by name"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-2 text-[13px] outline-none placeholder:text-[#bbb] bg-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#e4eaee] shadow-sm">
          <div className="bg-[#f0f7fb] px-5 py-[10px] border-b border-[#d6e5ef]">
            <span className="text-[14px] text-[#5c7b91] font-bold uppercase tracking-tight">Team Leads</span>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b border-[#e4eaee] bg-white">
                <th className="px-4 py-3 text-[12px] font-normal text-[#666] uppercase tracking-widest w-[35%]">Name</th>
                <th className="px-4 py-3 text-[12px] font-normal text-[#666] uppercase tracking-widest w-[35%]">Email</th>
                <th className="px-4 py-3 text-[12px] font-normal text-[#666] uppercase tracking-widest w-[20%]">Status</th>
                <th className="px-4 py-3 w-[80px]" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f4f7]">
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-[14px] text-[#aaa]">Loading…</td></tr>
              ) : filteredMembers.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-[14px] text-[#aaa]">No team leads found.</td></tr>
              ) : filteredMembers.map(m => (
                <tr key={m.id} className="hover:bg-[#f9fafb] transition-colors group h-[56px]">
                  <td className="px-4 py-2 text-[13px] text-[#333]">{m.name}</td>
                  <td className="px-4 py-2 text-[13px] text-[#999]">{m.email}</td>
                  <td className="px-4 py-2">
                    <span className={cn('text-[12px] px-2 py-0.5 rounded-sm font-medium',
                      m.isActive !== false && !m.archived ? 'bg-[#e8f5e9] text-[#388e3c]' : 'bg-[#fafafa] text-[#aaa]')}>
                      {m.isActive !== false && !m.archived ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity" ref={menuRef}>
                      <button
                        onClick={() => { setEditingUser(m); setEditName(m.name); setEditEmail(m.email) }}
                        className="text-[#ccc] hover:text-[#03a9f4] transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === m.id ? null : m.id)}
                          className="text-[#ccc] hover:text-[#666] transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenuId === m.id && (
                          <div className="absolute right-0 top-full mt-0.5 bg-white border border-[#ddd] shadow-lg z-50 min-w-[140px] rounded-sm py-0.5">
                            <button
                              onClick={() => handleArchiveToggle(m)}
                              className="w-full text-left px-4 py-2 text-[13px] text-[#555] hover:bg-[#f0f4f8] transition-colors"
                            >
                              {m.archived ? 'Unarchive' : 'Archive'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {editingUser && (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-sm shadow-2xl w-full max-w-[420px] mx-4">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e4eaee]">
            <h2 className="text-[16px] font-semibold text-[#333]">Edit Team Lead</h2>
            <button onClick={() => setEditingUser(null)} className="text-[#bbb] hover:text-[#555]">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-6 py-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest">Name</label>
              <input value={editName} onChange={e => setEditName(e.target.value)}
                className="w-full px-3 py-2.5 text-[13px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest">Email</label>
              <input value={editEmail} onChange={e => setEditEmail(e.target.value)}
                className="w-full px-3 py-2.5 text-[13px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4]" />
            </div>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e4eaee]">
            <button onClick={() => setEditingUser(null)}
              className="px-5 py-2 text-[13px] text-[#666] border border-[#c6d2d9] rounded-sm hover:bg-[#f2f6f8]">
              Cancel
            </button>
            <button onClick={handleEditSave}
              className="px-6 py-2 text-[13px] font-bold text-white bg-[#03a9f4] hover:bg-[#0288d1] rounded-sm uppercase tracking-widest">
              Save
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  )
}
