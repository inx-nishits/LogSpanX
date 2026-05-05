'use client'

import { useEffect, useState, useRef } from 'react'
import { getGroups, updateGroup, updateUserRole, ApiGroup } from '@/lib/api/teams'
import { apiRequest } from '@/lib/api/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useToastStore } from '@/lib/stores/toast-store'
import { Search, ChevronDown, Pencil, MoreVertical, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RawUser { _id: string; id?: string; name: string; email: string; archived?: boolean }

export default function ProjectLeadPage() {
  const { token } = useAuthStore()
  const [group, setGroup] = useState<ApiGroup | null>(null)
  const [rawUsers, setRawUsers] = useState<RawUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('active')
  const [statusOpen, setStatusOpen] = useState(false)
  const [addDropOpen, setAddDropOpen] = useState(false)
  const [addSearch, setAddSearch] = useState('')
  const addRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (addRef.current && !addRef.current.contains(e.target as Node)) setAddDropOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const [adding, setAdding] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<RawUser | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleArchiveToggle = async (user: RawUser) => {
    try {
      await apiRequest(`/users/${user._id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify({ archived: !user.archived }),
      })
      setRawUsers(prev => prev.map(u => u._id === user._id ? { ...u, archived: !u.archived } : u))
      useToastStore.getState().show(`User ${user.archived ? 'activated' : 'archived'} successfully`, 'success')
    } catch (err) { console.error(err) }
    setOpenMenuId(null)
  }

  const handleEditSave = async () => {
    if (!editingUser || !editName.trim()) return
    try {
      await apiRequest(`/users/${editingUser._id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify({ name: editName.trim(), email: editEmail.trim() }),
      })
      setRawUsers(prev => prev.map(u => u._id === editingUser._id ? { ...u, name: editName.trim(), email: editEmail.trim() } : u))
      useToastStore.getState().show('User updated successfully', 'success')
      setEditingUser(null)
    } catch (err) { console.error(err) }
  }
  const statusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    Promise.all([
      getGroups(),
      apiRequest<unknown>('/users', { method: 'GET', token }),
    ]).then(([groupsRes, usersRes]) => {
      const allGroups = Array.isArray(groupsRes) ? groupsRes : []
      const found = allGroups.find((g: ApiGroup) => g.name.toLowerCase().includes('project lead'))
      setGroup(found ?? null)

      const arr: RawUser[] = Array.isArray(usersRes)
        ? usersRes
        : Array.isArray((usersRes as any)?.data) ? (usersRes as any).data
        : Object.values(usersRes as object).find(Array.isArray) ?? []
      setRawUsers(arr)
    })
    .catch(console.error)
    .finally(() => setLoading(false))
  }, [token])

  // Match memberIds against raw _id or id field
  const allMembers = group
    ? rawUsers.filter(u => group.memberIds.includes(u._id) || group.memberIds.includes(u.id ?? ''))
    : []

  const filteredMembers = allMembers
    .filter(u => {
      if (statusFilter === 'active') return !u.archived
      if (statusFilter === 'inactive') return u.archived
      return true
    })
    .filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  const allSelected = filteredMembers.length > 0 && filteredMembers.every(u => selectedIds.includes(u._id))

  const toggleOne = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  const handleAdd = async (user: RawUser) => {
    if (!group || group.memberIds.includes(user._id)) return
    setAdding(true)
    try {
      const [groupRes] = await Promise.all([
        updateGroup(group._id, { memberIds: [...group.memberIds, user._id] }),
        updateUserRole(user._id, 'team_lead'),
      ])
      const updated = (groupRes as any)?._id ? groupRes as ApiGroup : (groupRes as any)?.data as ApiGroup
      setGroup(prev => prev ? { ...prev, memberIds: updated?.memberIds ?? [...prev.memberIds, user._id] } : prev)
      setAddSearch('')
      setAddDropOpen(false)
    } catch (err) { console.error(err) }
    finally { setAdding(false) }
  }

  // Users not yet in the group, filtered by search
  const addableUsers = rawUsers
    .filter(u => !group?.memberIds.includes(u._id))
    .filter(u => !addSearch || u.name.toLowerCase().includes(addSearch.toLowerCase()))
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
          {/* Status filter */}
          <div className="relative" ref={statusRef}>
            <button
              onClick={() => setStatusOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 h-[34px] text-[14px] text-[#555] bg-white border border-[#c6d2d9] rounded-sm hover:border-[#aaa] transition-colors"
            >
              {statusLabel} <ChevronDown className="h-3.5 w-3.5 text-[#aaa]" />
            </button>
            {statusOpen && (
              <div className="absolute top-full left-0 mt-0.5 bg-white border border-[#ddd] shadow-lg z-50 min-w-[150px] py-0.5 rounded-sm">
                {(['active', 'inactive', 'all'] as const).map(s => (
                  <button key={s} onClick={() => { setStatusFilter(s); setStatusOpen(false) }}
                    className={cn('w-full text-left px-3 py-2 text-[14px] cursor-pointer transition-colors',
                      statusFilter === s ? 'bg-[#03a9f4] text-white' : 'text-[#555] hover:bg-[#f0f4f8]')}>
                    {s === 'active' ? 'Show active' : s === 'inactive' ? 'Show inactive' : 'Show all'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="flex items-center bg-white border border-[#c6d2d9] rounded-sm h-[34px] w-[260px] focus-within:border-[#03a9f4] transition-all">
            <Search className="h-4 w-4 text-[#bbb] ml-3 flex-shrink-0" />
            <input
              placeholder="Search by name"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-2 text-[14px] outline-none placeholder:text-[#bbb] bg-transparent"
            />
          </div>

          <div className="flex-1" />

          {/* Add new */}
          <div className="flex items-center gap-2" ref={addRef}>
            <div className="relative">
              <input
                placeholder="Add new Project Lead"
                value={addSearch}
                onChange={e => { setAddSearch(e.target.value); setAddDropOpen(true) }}
                onFocus={() => setAddDropOpen(true)}
                className="h-[34px] px-3 text-[14px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4] w-[240px] bg-white"
              />
              {addDropOpen && (
                <div className="absolute top-full left-0 mt-0.5 bg-white border border-[#ddd] shadow-lg z-50 w-[240px] max-h-[220px] overflow-y-auto rounded-sm">
                  {addableUsers.length === 0 ? (
                    <div className="px-3 py-2 text-[13px] text-[#aaa]">{addSearch ? 'No users found' : 'All users already added'}</div>
                  ) : addableUsers.map(u => (
                    <button key={u._id} onClick={() => handleAdd(u)} disabled={adding}
                      className="w-full text-left px-3 py-2 text-[14px] text-[#333] hover:bg-[#eaf4fb] transition-colors cursor-pointer">
                      {u.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#e4eaee] shadow-sm">
          {/* Section header */}
          <div className="bg-[#f2f6fb] px-5 py-[10px] border-b border-[#e4eaee]">
            <span className="text-[14px] text-[#666] font-medium">Project Lead</span>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b border-[#e4eaee] bg-white">
                <th className="pl-4 pr-2 py-3 w-[36px]">
                  <div
                    onClick={() => {
                      if (allSelected) setSelectedIds(prev => prev.filter(id => !filteredMembers.some(u => u._id === id)))
                      else setSelectedIds(prev => [...new Set([...prev, ...filteredMembers.map(u => u._id)])])
                    }}
                    className={cn('w-[14px] h-[14px] border rounded-[2px] cursor-pointer flex items-center justify-center',
                      allSelected ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-[#c6d2d9]')}
                  >
                    {allSelected && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                </th>
                <th className="px-4 py-3 text-[14px] font-normal text-[#666] uppercase tracking-widest w-[30%]">Name</th>
                <th className="px-4 py-3 text-[14px] font-normal text-[#666] uppercase tracking-widest w-[35%]">Address</th>
                <th className="px-4 py-3 text-[14px] font-normal text-[#666] uppercase tracking-widest w-[20%]">Currency</th>
                <th className="px-4 py-3 w-[80px]" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f4f7]">
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-[14px] text-[#aaa]">Loading…</td></tr>
              ) : !group ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-[14px] text-[#aaa]">No "Project Leads" group found in the database.</td></tr>
              ) : filteredMembers.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-[14px] text-[#aaa]">No members found.</td></tr>
              ) : filteredMembers.map(m => (
                <tr key={m._id} className="hover:bg-[#f9fafb] transition-colors group h-[56px]">
                  <td className="pl-4 pr-2 py-2">
                    <div
                      onClick={() => toggleOne(m._id)}
                      className={cn('w-[14px] h-[14px] border rounded-[2px] cursor-pointer flex items-center justify-center',
                        selectedIds.includes(m._id) ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-[#c6d2d9]')}
                    >
                      {selectedIds.includes(m._id) && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-[14px] text-[#333]">{m.name}</td>
                  <td className="px-4 py-2 text-[14px] text-[#999]">—</td>
                  <td className="px-4 py-2 text-[14px] text-[#333]">USD</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity" ref={menuRef}>
                      <button
                        onClick={() => { setEditingUser(m); setEditName(m.name); setEditEmail(m.email) }}
                        className="text-[#ccc] hover:text-[#03a9f4] transition-colors"
                        title="Edit user"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === m._id ? null : m._id)}
                          className="text-[#ccc] hover:text-[#666] transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenuId === m._id && (
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

    {/* Edit User Modal */}
    {editingUser && (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-sm shadow-2xl w-full max-w-[420px] mx-4">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e4eaee]">
            <h2 className="text-[16px] font-semibold text-[#333]">Edit Project Lead</h2>
            <button onClick={() => setEditingUser(null)} className="text-[#bbb] hover:text-[#555]">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-6 py-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#999] uppercase tracking-widest">Name</label>
              <input value={editName} onChange={e => setEditName(e.target.value)}
                className="w-full px-3 py-2.5 text-[14px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#999] uppercase tracking-widest">Email</label>
              <input value={editEmail} onChange={e => setEditEmail(e.target.value)}
                className="w-full px-3 py-2.5 text-[14px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4]" />
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
