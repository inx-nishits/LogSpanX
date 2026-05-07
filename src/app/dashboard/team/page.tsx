'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useDataStore } from '@/lib/stores/data-store'
import { apiRequest } from '@/lib/api/client'
import { Search, ChevronDown, MoreVertical, Plus, Pencil, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getGroups, createGroup, updateGroup, deleteGroup,
  ApiGroup, updateUserRole,
} from '@/lib/api/teams'
import { toggleUserActive } from '@/lib/api/users'
import { User } from '@/lib/types'
import { canInviteMembers, canUpdateUserRole, canDeleteGroup } from '@/lib/rbac'
import { mapApiUser } from '@/lib/api/mappers'

interface RawUser { _id: string; id?: string; name: string; email: string; archived?: boolean; isActive?: boolean }

// ─── Member Actions Dropdown ──────────────────────────────────────────────────

function MemberActionsDropdown({ member, onEdit, onToggleActive }: {
  member: User
  onEdit: (member: User) => void
  onToggleActive: (member: User) => void
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node) && e.target !== btnRef.current) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 4, left: rect.right - 150 })
    }
    setOpen(o => !o)
  }

  return (
    <div ref={ref}>
      <button ref={btnRef} onClick={handleOpen} className="p-1 text-[#ccc] hover:text-[#555] cursor-pointer transition-colors">
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="fixed bg-white border border-[#ddd] shadow-lg z-[9999] w-[150px] py-0.5 rounded-sm"
          style={{ top: pos.top, left: pos.left }}
        >
          <button
            onClick={() => { onEdit(member); setOpen(false) }}
            className="w-full text-left px-4 py-1.5 text-[12px] text-[#333] hover:bg-[#f0f4f8] cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={() => { onToggleActive(member); setOpen(false) }}
            className={cn('w-full text-left px-4 py-1.5 text-[12px] cursor-pointer',
              member.isActive !== false ? 'text-[#f44336] hover:bg-[#fff5f5]' : 'text-[#4caf50] hover:bg-[#f5fff5]'
            )}
          >
            {member.isActive !== false ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Edit Member Modal ────────────────────────────────────────────────────────

function EditMemberModal({ member, onClose, onSave }: {
  member: User
  onClose: () => void
  onSave: (id: string, updates: { name: string; email: string; billableRate: number }) => Promise<void>
}) {
  const [name, setName] = useState(member.name)
  const [email, setEmail] = useState(member.email)
  const [billableRate, setBillableRate] = useState(member.billableRate ?? 0)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(member.id, { name, email, billableRate })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-[480px]">
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#e4eaee]">
          <h2 className="text-[18px] font-normal text-[#333]">Edit Member</h2>
          <button onClick={onClose} className="text-[#999] hover:text-[#666] cursor-pointer"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-[13px] font-bold text-[#555] uppercase tracking-wider block mb-1">Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full border border-[#c6d2d9] rounded-sm px-3 h-[36px] text-[14px] outline-none focus:border-[#03a9f4]" />
          </div>
          <div>
            <label className="text-[13px] font-bold text-[#555] uppercase tracking-wider block mb-1">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-[#c6d2d9] rounded-sm px-3 h-[36px] text-[14px] outline-none focus:border-[#03a9f4]" />
          </div>
          <div>
            <label className="text-[13px] font-bold text-[#555] uppercase tracking-wider block mb-1">Billable Rate (USD)</label>
            <input type="number" value={billableRate} onChange={e => setBillableRate(Number(e.target.value))}
              className="w-full border border-[#c6d2d9] rounded-sm px-3 h-[36px] text-[14px] outline-none focus:border-[#03a9f4]" />
          </div>
        </div>
        <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-[#e4eaee]">
          <button onClick={onClose} className="text-[#03a9f4] text-[14px] hover:underline cursor-pointer">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="bg-[#03a9f4] text-white px-8 py-2 text-[14px] font-bold rounded-sm hover:bg-[#0288d1] uppercase tracking-wider disabled:opacity-60 cursor-pointer">
            {saving ? 'Saving...' : 'SAVE'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roleLabel(role: string) {
  if (role === 'project_manager') return 'Project Manager'
  if (role === 'team_lead') return 'Team Lead'
  return 'Team Member'
}

function roleBadgeColor(role: string) {
  if (role === 'project_manager') return 'bg-[#03a9f4] text-white'
  if (role === 'team_lead') return 'bg-[#e3f2fd] text-[#0288d1]'
  return 'bg-[#f5f5f5] text-[#666]'
}

// ─── Simple dropdown ──────────────────────────────────────────────────────────

function FilterDropdown({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-3 h-[30px] text-[12px] text-[#555] bg-white border border-[#d0d8de] rounded-sm hover:border-[#aaa] transition-colors cursor-pointer"
      >
        {value} <ChevronDown className="h-3 w-3 text-[#aaa]" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-0.5 bg-white border border-[#ddd] shadow-lg z-50 min-w-[140px] py-0.5 rounded-sm">
          {options.map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false) }}
              className={cn('w-full text-left px-3 py-1.5 text-[12px] cursor-pointer transition-colors',
                value === opt ? 'bg-[#03a9f4] text-white' : 'text-[#555] hover:bg-[#f0f4f8]')}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Access Dropdown ────────────────────────────────────────────────────────

function AccessDropdown({ group, rawUsers, onToggle, onSelectAll, readOnly = false }: {
  group: ApiGroup
  rawUsers: RawUser[]
  onToggle: (userId: string, checked: boolean) => void
  onSelectAll: (users: RawUser[], selectAll: boolean) => void
  readOnly?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered = rawUsers.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()))
  const allSelected = filtered.length > 0 && filtered.every(u => group.memberIds.includes(u._id))
  const groupMembers = rawUsers.filter(u => group.memberIds.includes(u._id))

  if (readOnly) {
    return groupMembers.length > 0 ? (
      <div className="inline-flex items-center gap-1.5 bg-[#eaf4fb] text-[#5c7b91] text-[13px] px-2.5 py-1 rounded-sm border border-[#d6e5ef] max-w-[400px]">
        <span className="truncate">{groupMembers.map(u => u.name).join(', ')}</span>
      </div>
    ) : <span className="text-[#ccc] text-[12px]">—</span>
  }

  return (
    <div className="relative" ref={ref}>
      {groupMembers.length > 0 ? (
        <div onClick={() => setOpen(o => !o)}
          className="inline-flex items-center gap-1.5 bg-[#eaf4fb] text-[#5c7b91] text-[12px] px-2.5 py-0.5 rounded-sm border border-[#d6e5ef] cursor-pointer hover:bg-[#d6edf8] transition-colors max-w-[400px]">
          <span className="truncate">{groupMembers.map(u => u.name).join(', ')}</span>
          <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
        </div>
      ) : (
        <button onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1 text-[#03a9f4] hover:underline text-[12px]">
          <Plus className="h-3 w-3" /> Access
        </button>
      )}
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-[#ddd] shadow-lg z-50 w-[260px] rounded-sm">
          <div className="flex items-center border-b border-[#eee] px-3 py-2">
            <Search className="h-3.5 w-3.5 text-[#bbb] shrink-0" />
            <input autoFocus placeholder="Search users…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 ml-2 text-[12px] outline-none placeholder:text-[#bbb]" />
          </div>
          <div className="max-h-[240px] overflow-y-auto py-1">
            {!search && (
              <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#f0f4f8] cursor-pointer border-b border-[#f0f0f0]">
                <input type="checkbox" checked={allSelected}
                  onChange={() => onSelectAll(filtered, !allSelected)}
                  className="accent-[#03a9f4] w-[14px] h-[14px]" />
                <span className="text-[12px] text-[#555] font-medium">Select all</span>
              </label>
            )}
            {filtered.map(u => {
              const checked = group.memberIds.includes(u._id)
              return (
                <label key={u._id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#f0f4f8] cursor-pointer">
                  <input type="checkbox" checked={checked}
                    onChange={e => onToggle(u._id, e.target.checked)}
                    className="accent-[#03a9f4] w-[14px] h-[14px]" />
                  <span className="text-[12px] text-[#333]">{u.name}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Role Dropdown ──────────────────────────────────────────────────────────

// Maps frontend display label -> backend role value
const ROLE_OPTIONS: { label: string; value: string }[] = [
  { label: 'Project Manager', value: 'admin' },
  { label: 'Team Lead', value: 'team_lead' },
  { label: 'Team Member', value: 'team_member' },
]

function RoleDropdown({ memberId, currentRole, onRoleChange }: {
  memberId: string
  currentRole: string
  onRoleChange: (memberId: string, newRole: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={cn('px-2.5 py-0.5 rounded-sm text-[12px] font-medium flex items-center gap-1', roleBadgeColor(currentRole))}
      >
        {roleLabel(currentRole)} <ChevronDown className="h-3 w-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-0.5 bg-white border border-[#ddd] shadow-lg z-50 min-w-[150px] py-0.5 rounded-sm">
          {ROLE_OPTIONS.map(opt => (
            <button key={opt.value}
              onClick={() => { onRoleChange(memberId, opt.value); setOpen(false) }}
              className={cn('w-full text-left px-3 py-1.5 text-[12px] cursor-pointer transition-colors',
                roleLabel(currentRole) === opt.label ? 'bg-[#03a9f4] text-white' : 'text-[#555] hover:bg-[#f0f4f8]'
              )}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Group Dropdown ──────────────────────────────────────────────────────────

function GroupDropdown({ member, allGroups, onToggle, trigger }: {
  member: User
  allGroups: ApiGroup[]
  onToggle: (group: ApiGroup, checked: boolean) => void
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered = allGroups.filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()))
  const memberGroupIds = allGroups.filter(g => g.memberIds.includes(member.id)).map(g => g._id)

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(o => !o)} className="cursor-pointer">{trigger}</div>
      {open && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-[#ddd] shadow-lg z-50 w-[260px] rounded-sm">
          <div className="flex items-center border-b border-[#eee] px-3 py-2">
            <Search className="h-3.5 w-3.5 text-[#bbb] flex-shrink-0" />
            <input
              autoFocus
              placeholder="Add/Search groups"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 ml-2 text-[12px] outline-none placeholder:text-[#bbb]"
            />
          </div>
          <div className="max-h-[220px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-[12px] text-[#aaa]">No groups found</div>
            ) : filtered.map(g => {
              const checked = memberGroupIds.includes(g._id)
              return (
                <label key={g._id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#f0f4f8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={e => { onToggle(g, e.target.checked); }}
                    className="accent-[#03a9f4] w-[14px] h-[14px]"
                  />
                  <span className="text-[12px] text-[#333]">{g.name}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const { user } = useAuthStore()
  const { users, groups: storeGroups, createGroup: storeCreateGroup, updateGroup: storeUpdateGroup, deleteGroup: storeDeleteGroup } = useDataStore()

  const canInvite = user ? canInviteMembers(user.role) : false
  const canDeleteGroupItem = user ? canDeleteGroup(user.role) : false
  const canChangeRole = user ? canUpdateUserRole(user.role) : false

  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'GROUPS' | 'REMINDERS'>('MEMBERS')

  // ── Members tab state ──
  const [memberSearch, setMemberSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [billableFilter, setBillableFilter] = useState('Billable rate')
  const [roleFilter, setRoleFilter] = useState('Role')
  const [groupFilter, setGroupFilter] = useState('Group')
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  const handleRoleChange = async (memberId: string, newBackendRole: string) => {
    try {
      await updateUserRole(memberId, newBackendRole)
      // Refresh users list from store by updating locally
      // The store will reflect on next load; for immediate UI update we rely on re-fetch
      // Trigger a page-level re-render by updating a local map
      setRoleOverrides(prev => ({ ...prev, [memberId]: newBackendRole }))
    } catch (err) { console.error(err) }
  }

  // ── All groups for member dropdown ──
  const [allGroups, setAllGroups] = useState<ApiGroup[]>([])
  const [rawUsers, setRawUsers] = useState<RawUser[]>([])

  useEffect(() => {
    apiRequest<unknown>('/users', { method: 'GET', token: useAuthStore.getState().token })
      .then(res => {
        const arr: RawUser[] = Array.isArray(res) ? res
          : Array.isArray((res as any)?.data) ? (res as any).data
            : Object.values(res as object).find(Array.isArray) ?? []
        setRawUsers(arr)
      })
      .catch(() => setRawUsers([]))
  }, [])

  const isProjectLeadGroup = (g: ApiGroup) => g.name.toLowerCase().includes('project lead')

  const handleGroupAccessToggle = async (group: ApiGroup, userId: string, checked: boolean) => {
    const newMemberIds = checked
      ? [...group.memberIds, userId]
      : group.memberIds.filter(id => id !== userId)
    try {
      const calls: Promise<any>[] = [updateGroup(group._id, { memberIds: newMemberIds })]
      if (checked && isProjectLeadGroup(group)) calls.push(updateUserRole(userId, 'team_lead'))
      const [res] = await Promise.all(calls)
      const updated = (res as any)?._id ? res as ApiGroup : (res as any)?.data as ApiGroup
      const finalIds = updated?.memberIds ?? newMemberIds
      setGroups(prev => prev.map(g => g._id === group._id ? { ...g, memberIds: finalIds } : g))
      storeUpdateGroup(group._id, { memberIds: finalIds })
    } catch (err) { console.error(err) }
  }

  const handleGroupAccessSelectAll = async (group: ApiGroup, allUsers: RawUser[], selectAll: boolean) => {
    const newMemberIds = selectAll ? allUsers.map(u => u._id) : []
    try {
      const calls: Promise<any>[] = [updateGroup(group._id, { memberIds: newMemberIds })]
      if (selectAll && isProjectLeadGroup(group)) {
        allUsers.forEach(u => calls.push(updateUserRole(u._id, 'team_lead')))
      }
      const [res] = await Promise.all(calls)
      const updated = (res as any)?._id ? res as ApiGroup : (res as any)?.data as ApiGroup
      const finalIds = updated?.memberIds ?? newMemberIds
      setGroups(prev => prev.map(g => g._id === group._id ? { ...g, memberIds: finalIds } : g))
      storeUpdateGroup(group._id, { memberIds: finalIds })
    } catch (err) { console.error(err) }
  }

  const [roleOverrides, setRoleOverrides] = useState<Record<string, string>>({})
  const [activeOverrides, setActiveOverrides] = useState<Record<string, boolean>>({})
  const [editingMember, setEditingMember] = useState<User | null>(null)

  const handleToggleActive = async (member: User) => {
    const currentlyActive = member.id in activeOverrides ? activeOverrides[member.id] : (member.isActive !== false && !member.archived)
    const newActive = !currentlyActive
    try {
      const res = await toggleUserActive(member.id, newActive)
      const updated = mapApiUser(res)
      setActiveOverrides(prev => ({ ...prev, [member.id]: updated.isActive ?? newActive }))
    } catch (err) { console.error(err) }
  }

  const handleEditSave = async (id: string, updates: { name: string; email: string; billableRate: number }) => {
    const { updateUserRecord } = useDataStore.getState()
    await updateUserRecord(id, updates)
  }

  useEffect(() => {
    getGroups()
      .then(res => setAllGroups(Array.isArray(res) ? res : []))
      .catch(() => setAllGroups([]))
  }, [])

  const handleMemberGroupToggle = async (member: User, group: ApiGroup, checked: boolean) => {
    const newMemberIds = checked
      ? [...group.memberIds, member.id]
      : group.memberIds.filter(id => id !== member.id)
    try {
      const res = await updateGroup(group._id, { memberIds: newMemberIds })
      const updated = res as ApiGroup
      const finalIds = updated?.memberIds ?? newMemberIds
      setAllGroups(prev => prev.map(g => g._id === group._id ? { ...g, memberIds: finalIds } : g))
      storeUpdateGroup(group._id, { memberIds: finalIds })
    } catch (err) { console.error(err) }
  }

  // ── Groups tab state ──
  const [groups, setGroups] = useState<ApiGroup[]>([])
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null)
  const [groupSearch, setGroupSearch] = useState('')
  const [newGroupName, setNewGroupName] = useState('')
  const [editingGroup, setEditingGroup] = useState<ApiGroup | null>(null)
  const [editName, setEditName] = useState('')
  const [loadingGroups, setLoadingGroups] = useState(false)

  // Load groups from API when tab is active
  useEffect(() => {
    if (activeTab !== 'GROUPS') return
    const timer = setTimeout(() => setLoadingGroups(true), 0)
    getGroups()
      .then(res => {
        const arr = Array.isArray(res) ? res : []
        setGroups(arr)
      })
      .catch(() => setGroups([]))
      .finally(() => setLoadingGroups(false))
    return () => clearTimeout(timer)
  }, [activeTab])

  // ── Members filtering ──
  const filteredUsers = users.filter(u => {
    const isActive = u.id in activeOverrides ? activeOverrides[u.id] : (u.isActive !== false && !u.archived)
    if (memberSearch && !u.name.toLowerCase().includes(memberSearch.toLowerCase()) &&
      !u.email.toLowerCase().includes(memberSearch.toLowerCase())) return false
    if (statusFilter === 'Active' && !isActive) return false
    if (statusFilter === 'Inactive' && isActive) return false
    if (roleFilter !== 'Role' && roleLabel(u.role).toLowerCase() !== roleFilter.toLowerCase()) return false
    if (groupFilter !== 'Group') {
      const grp = storeGroups.find(g => g.name === groupFilter)
      if (!grp || !grp.memberIds.includes(u.id)) return false
    }
    return true
  }).sort((a, b) => a.name.localeCompare(b.name))

  // ── Groups filtering ──
  const filteredGroups = groups.filter(g =>
    !groupSearch || g.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
    g.memberIds.some(id => users.find(u => u.id === id)?.name.toLowerCase().includes(groupSearch.toLowerCase()))
  )

  const handleApplyFilter = () => { } // filters apply instantly on change

  const handleClearFilters = () => {
    setMemberSearch(''); setStatusFilter('All'); setBillableFilter('Billable rate')
    setRoleFilter('Role'); setGroupFilter('Group')
  }

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return
    try {
      const res = await createGroup(newGroupName.trim())
      // client.ts unwraps envelope — res is the group object directly
      const created = res as ApiGroup
      if (created?._id) setGroups(prev => [...prev, created])
      setNewGroupName('')
    } catch (err) { console.error(err) }
  }

  const handleDeleteGroup = async (id: string, name: string) => {
    setConfirmDelete({ id, name })
  }

  const confirmDeleteGroup = async () => {
    if (!confirmDelete) return
    try {
      await deleteGroup(confirmDelete.id)
      setGroups(prev => prev.filter(g => g._id !== confirmDelete.id))
    } catch (err) { console.error(err) } finally {
      setConfirmDelete(null)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingGroup || !editName.trim()) return
    try {
      const res = await updateGroup(editingGroup._id, { name: editName.trim(), memberIds: editingGroup.memberIds })
      const updated = res as ApiGroup
      setGroups(prev => prev.map(g => g._id === editingGroup._id ? updated : g))
      setEditingGroup(null)
    } catch (err) { console.error(err) }
  }

  const groupNames = ['Group', ...storeGroups.map(g => g.name)]

  return (
    <div className="min-h-full flex flex-col bg-[#f2f6f8] font-sans antialiased">
      <div className="w-full px-5 pt-4 pb-2">
        <h1 className="text-lg text-[#333] font-normal">Team</h1>
      </div>

      {/* Tabs + Add button */}
      <div className="w-full px-5 pt-0 pb-0 shrink-0">
        <div className="flex items-end justify-between mt-4">
          <div className="flex items-center gap-0 h-[36px]">
            {(['MEMBERS', 'GROUPS', 'REMINDERS'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={cn('px-8 h-full text-[12px] font-bold tracking-widest border transition-all uppercase',
                  activeTab === tab
                    ? 'bg-white border-[#e4eaee] border-b-white text-[#333] relative z-20'
                    : 'bg-[#eaecee] border-transparent text-[#999] hover:bg-[#dde0e3]'
                )}>
                {tab}
              </button>
            ))}
          </div>
          {canInvite && activeTab === 'MEMBERS' && null}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-8 bg-[#f2f6f8] overflow-auto">
        <div className="bg-white border border-[#e4eaee] relative z-10 -mt-[1px] min-h-full flex flex-col shadow-sm">

          {/* ── MEMBERS TAB ── */}
          {activeTab === 'MEMBERS' && (
            <>
              {/* Filter bar */}
              <div className="px-5 py-3 border-b border-[#e4eaee] flex items-center gap-3 flex-wrap">
                <span className="text-[12px] font-bold text-[#999] uppercase tracking-widest">FILTER</span>
                <div className="h-6 w-px bg-[#e0e0e0]" />
                <FilterDropdown label="Active" options={['Active', 'Inactive', 'All']} value={statusFilter} onChange={setStatusFilter} />
                <FilterDropdown label="Billable rate" options={['Billable rate', 'Hidden', 'Visible']} value={billableFilter} onChange={setBillableFilter} />
                <FilterDropdown label="Role" options={['Role', 'Project Manager', 'Team Lead', 'Team Member']} value={roleFilter} onChange={setRoleFilter} />
                <FilterDropdown label="Group" options={groupNames} value={groupFilter} onChange={setGroupFilter} />
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white border border-[#c6d2d9] rounded-sm h-[30px] w-[260px] focus-within:border-[#03a9f4] transition-all">
                    <Search className="h-4 w-4 text-[#bbb] ml-3 flex-shrink-0" />
                    <input placeholder="Search by name or email" value={memberSearch}
                      onChange={e => setMemberSearch(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleApplyFilter()}
                      className="flex-1 px-2 text-[12px] outline-none placeholder:text-[#bbb] bg-transparent" />
                  </div>
                  <button onClick={handleApplyFilter}
                    className="px-4 h-[30px] bg-[#03a9f4] hover:bg-[#0288d1] text-white text-[12px] font-bold uppercase rounded-sm transition-colors tracking-widest">
                    APPLY FILTER
                  </button>
                </div>
              </div>

              {/* Clear filters */}
              {(memberSearch || statusFilter !== 'All' || roleFilter !== 'Role' || groupFilter !== 'Group') && (
                <div className="flex justify-end px-5 py-1 border-b border-[#f0f0f0]">
                  <button onClick={handleClearFilters} className="text-[12px] text-[#03a9f4] hover:underline cursor-pointer">
                    Clear filters
                  </button>
                </div>
              )}

              {/* Section bar */}
              <div className="bg-[#f2f6fb] px-5 py-[10px] border-b border-[#e4eaee] flex items-center justify-between">
                <span className="text-[13px] text-[#999]">Members</span>
                <button className="flex items-center gap-1 text-[13px] text-[#555] hover:text-[#03a9f4]">
                  Export <ChevronDown className="h-3 w-3" />
                </button>
              </div>

              {/* Table */}
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b border-[#e4eaee] bg-white">
                    <th className="px-4 py-3 w-[40px]">
                      <div className="w-[14px] h-[14px] border border-[#c6d2d9] rounded-sm bg-white" />
                    </th>
                    <th className="px-4 py-2 text-[11px] font-normal text-[#666] uppercase tracking-wider w-[22%]">
                      <div className="flex items-center gap-1">NAME <ChevronDown className="h-3 w-3" /></div>
                    </th>
                    <th className="px-4 py-2 text-[11px] font-normal text-[#666] uppercase tracking-wider w-[22%]">
                      <div className="flex items-center gap-1">EMAIL <ChevronDown className="h-3 w-3" /></div>
                    </th>
                    <th className="px-4 py-2 text-[11px] font-normal text-[#666] uppercase tracking-wider w-[20%] text-center">
                      <div className="flex items-center justify-center gap-1">BILLABLE RATE (USD) <ChevronDown className="h-3 w-3" /></div>
                    </th>
                    <th className="px-4 py-2 text-[11px] font-normal text-[#666] uppercase tracking-wider w-[18%]">ROLE</th>
                    <th className="px-4 py-2 text-[11px] font-normal text-[#666] uppercase tracking-wider w-[14%]">GROUP</th>
                    <th className="px-4 py-2 w-[40px]" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f4f7]">
                  {filteredUsers.map(member => {
                    const memberGroup = member.group
                      ? allGroups.find(g => g.name === member.group) ?? { _id: '', name: member.group, memberIds: [] }
                      : allGroups.find(g => g.memberIds.includes(member.id))
                    const isActive = member.id in activeOverrides ? activeOverrides[member.id] : (member.isActive !== false)
                    return (
                      <tr key={member.id} className="hover:bg-[#f9fafb] transition-colors group text-[12px] h-[40px]">
                        <td className={cn('px-4 py-2', !isActive && 'opacity-50')}>
                          <div className="w-[14px] h-[14px] border border-[#c6d2d9] rounded-sm bg-white" />
                        </td>
                        <td className={cn('px-4 py-2 text-[#333] font-normal', !isActive && 'opacity-50')}>
                          <span className={cn(!isActive && 'line-through text-[#aaa]')}>{member.name}</span>
                        </td>
                        <td className={cn('px-4 py-2 text-[#999] hover:text-[#03a9f4] cursor-pointer transition-colors', !isActive && 'opacity-50')}>{member.email}</td>
                        <td className={cn('px-4 py-2', !isActive && 'opacity-50')}>
                          <div className="flex items-center justify-center">
                            <div className="flex items-center bg-[#f2f6fb] border border-[#e4eaee] rounded-sm overflow-hidden w-[130px] h-[26px]">
                              <div className="px-3 text-[#333] flex-1 text-center text-[12px]">
                                {member.billableRate ? member.billableRate.toFixed(2) : '—'}
                              </div>
                              <button className="bg-white px-3 h-full flex items-center text-[#03a9f4] text-[11px] border-l border-[#e4eaee] hover:bg-gray-50 uppercase font-medium">
                                Change
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className={cn('px-4 py-2', !isActive && 'opacity-50')}>
                          {canChangeRole ? (
                            <RoleDropdown
                              memberId={member.id}
                              currentRole={roleOverrides[member.id]
                                ? (() => {
                                  const v = roleOverrides[member.id]
                                  if (v === 'project_manager') return 'project_manager'
                                  if (v === 'team_lead') return 'team_lead'
                                  return 'team_member'
                                })()
                                : member.role}
                              onRoleChange={handleRoleChange}
                            />
                          ) : member.role ? (
                            <span className={cn('px-2.5 py-0.5 rounded-sm text-[12px] font-medium', roleBadgeColor(member.role))}>
                              {roleLabel(member.role)}
                            </span>
                          ) : (
                            <button className="flex items-center gap-1 text-[#03a9f4] hover:underline text-[12px]">
                              <Plus className="h-3 w-3" /> Role
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {canInvite ? (
                            <GroupDropdown
                              member={member}
                              allGroups={allGroups}
                              onToggle={(group, checked) => handleMemberGroupToggle(member, group, checked)}
                              trigger={
                                memberGroup ? (
                                  <div className="inline-flex items-center bg-[#eaf4fb] text-[#5c7b91] text-[12px] px-2.5 py-0.5 rounded-sm border border-[#d6e5ef] gap-1">
                                    {memberGroup.name} <ChevronDown className="h-3 w-3 opacity-60" />
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-[#03a9f4] hover:underline text-[12px]">
                                    <Plus className="h-3 w-3" /> Group
                                  </div>
                                )
                              }
                            />
                          ) : memberGroup ? (
                            <div className="inline-flex items-center bg-[#eaf4fb] text-[#5c7b91] text-[12px] px-2.5 py-0.5 rounded-sm border border-[#d6e5ef]">
                              {memberGroup.name}
                            </div>
                          ) : <span className="text-[#ccc] text-[12px]">—</span>}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {canInvite && (
                            <MemberActionsDropdown
                              member={{ ...member, isActive }}
                              onEdit={setEditingMember}
                              onToggleActive={handleToggleActive}
                            />
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </>
          )}

          {/* ── GROUPS TAB ── */}
          {activeTab === 'GROUPS' && (
            <>
              {/* Search + Add */}
              <div className="px-5 py-3 border-b border-[#e4eaee] flex items-center justify-between gap-4">
                <div className="flex items-center bg-white border border-[#c6d2d9] rounded-sm h-[30px] w-[320px] focus-within:border-[#03a9f4] transition-all">
                  <Search className="h-4 w-4 text-[#bbb] ml-3 flex-shrink-0" />
                  <input placeholder="Search by username or group name" value={groupSearch}
                    onChange={e => setGroupSearch(e.target.value)}
                    className="flex-1 px-2 text-[12px] outline-none placeholder:text-[#bbb] bg-transparent" />
                </div>
                {canInvite && (
                  <div className="flex items-center gap-2">
                    <div className="border border-[#c6d2d9] rounded-sm h-[30px] flex items-center px-3 bg-white focus-within:border-[#03a9f4] w-[200px]">
                      <input placeholder="Add new group" value={newGroupName}
                        onChange={e => setNewGroupName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddGroup()}
                        className="w-full text-[12px] outline-none placeholder:text-[#bbb]" />
                    </div>
                    <button onClick={handleAddGroup}
                      className="bg-[#03a9f4] text-white px-6 h-[30px] text-[12px] font-bold rounded-sm hover:bg-[#0288d1] uppercase tracking-widest">
                      ADD
                    </button>
                  </div>
                )}
              </div>

              {/* Section bar */}
              <div className="bg-[#f2f6fb] px-5 py-[10px] border-b border-[#e4eaee] flex items-center justify-between">
                <span className="text-[13px] text-[#999]">Groups</span>
                <button className="flex items-center gap-1 text-[13px] text-[#555] hover:text-[#03a9f4]">
                  Export <ChevronDown className="h-3 w-3" />
                </button>
              </div>

              {/* Table */}
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b border-[#e4eaee] bg-white">
                    <th className="px-5 py-2 text-[11px] font-normal text-[#666] uppercase tracking-widest w-[25%]">
                      <div className="flex items-center gap-1">NAME <ChevronDown className="h-3 w-3" /></div>
                    </th>
                    <th className="px-5 py-2 text-[11px] font-normal text-[#666] uppercase tracking-widest">ACCESS</th>
                    <th className="px-5 py-2 w-[80px]" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f4f7]">
                  {loadingGroups ? (
                    <tr><td colSpan={3} className="px-5 py-8 text-center text-[14px] text-[#aaa]">Loading...</td></tr>
                  ) : filteredGroups.length === 0 ? (
                    <tr><td colSpan={3} className="px-5 py-8 text-center text-[14px] text-[#aaa]">No groups found</td></tr>
                  ) : filteredGroups.map(group => {
                    const members = users.filter(u => group.memberIds.includes(u.id))
                    const MAX_SHOW = 5
                    const _shown = members.slice(0, MAX_SHOW)
                    const _extra = members.length - MAX_SHOW
                    const isEditing = editingGroup?._id === group._id

                    return (
                      <tr key={group._id} className="hover:bg-[#f9fafb] transition-colors group text-[12px] h-[45px]">
                        <td className="px-5 py-3 text-[#333] text-[12px]">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input value={editName} onChange={e => setEditName(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') setEditingGroup(null) }}
                                autoFocus
                                className="border border-[#03a9f4] rounded-sm px-2 py-1 text-[12px] outline-none w-[160px]" />
                              <button onClick={handleSaveEdit} className="text-[#03a9f4] hover:text-[#0288d1]">
                                <Check className="h-4 w-4" />
                              </button>
                              <button onClick={() => setEditingGroup(null)} className="text-[#aaa] hover:text-[#666]">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : group.name}
                        </td>
                        <td className="px-5 py-2">
                          <AccessDropdown
                            group={group}
                            rawUsers={rawUsers}
                            onToggle={(userId, checked) => handleGroupAccessToggle(group, userId, checked)}
                            onSelectAll={(users, selectAll) => handleGroupAccessSelectAll(group, users, selectAll)}
                            readOnly={!canInvite}
                          />
                        </td>
                        <td className="px-5 py-2 text-right">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            {canInvite && (
                              <button onClick={() => { setEditingGroup(group); setEditName(group.name) }}
                                className="text-[#ccc] hover:text-[#03a9f4] cursor-pointer transition-colors">
                                <Pencil className="h-4 w-4" />
                              </button>
                            )}
                            {canDeleteGroupItem && (
                              <button onClick={() => handleDeleteGroup(group._id, group.name)}
                                className="text-[#ccc] hover:text-[#f44336] cursor-pointer transition-colors">
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </>
          )}

          {/* ── REMINDERS TAB ── */}
          {activeTab === 'REMINDERS' && (
            <div className="py-16 text-center text-[14px] text-[#aaa]">No reminders configured</div>
          )}
        </div>
      </div>

      {/* Delete Group Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-sm shadow-2xl w-full max-w-[400px]">
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#e4eaee]">
              <h2 className="text-[18px] font-normal text-[#333]">Delete Group</h2>
              <button onClick={() => setConfirmDelete(null)} className="text-[#999] hover:text-[#666] cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="text-[15px] text-[#555]">
                Are you sure you want to delete the group <strong className="text-[#333]">&quot;{confirmDelete.name}&quot;</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-[#e4eaee]">
              <button onClick={() => setConfirmDelete(null)} className="text-[#555] text-[14px] hover:underline cursor-pointer">Cancel</button>
              <button onClick={confirmDeleteGroup}
                className="bg-[#f44336] hover:bg-[#d32f2f] text-white px-6 py-2 text-[14px] font-bold rounded-sm uppercase tracking-wider cursor-pointer transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <EditMemberModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSave={handleEditSave}
        />
      )}


    </div>
  )
}
