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
import { User } from '@/lib/types'
import { canInviteMembers, canDeleteUser, canChangeUserRole } from '@/lib/rbac'

interface RawUser { _id: string; id?: string; name: string; email: string; archived?: boolean }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roleLabel(role: string) {
  if (role === 'owner') return 'Project Manager'
  if (role === 'admin') return 'Team Lead'
  return 'Team Member'
}

function roleBadgeColor(role: string) {
  if (role === 'owner') return 'bg-[#03a9f4] text-white'
  if (role === 'admin') return 'bg-[#e3f2fd] text-[#0288d1]'
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
        className="flex items-center gap-1 px-3 h-[34px] text-[14px] text-[#555] bg-white border border-[#d0d8de] rounded-sm hover:border-[#aaa] transition-colors cursor-pointer"
      >
        {value} <ChevronDown className="h-3 w-3 text-[#aaa]" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-0.5 bg-white border border-[#ddd] shadow-lg z-50 min-w-[140px] py-0.5 rounded-sm">
          {options.map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false) }}
              className={cn('w-full text-left px-3 py-2 text-[14px] cursor-pointer transition-colors',
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

function AccessDropdown({ group, rawUsers, onToggle }: {
  group: ApiGroup
  rawUsers: RawUser[]
  onToggle: (userId: string, checked: boolean) => void
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

  const handleSelectAll = () => {
    filtered.forEach(u => {
      const isIn = group.memberIds.includes(u._id)
      if (allSelected && isIn) onToggle(u._id, false)
      else if (!allSelected && !isIn) onToggle(u._id, true)
    })
  }

  const groupMembers = rawUsers.filter(u => group.memberIds.includes(u._id))

  return (
    <div className="relative" ref={ref}>
      {groupMembers.length > 0 ? (
        <div onClick={() => setOpen(o => !o)}
          className="inline-flex items-center gap-1.5 bg-[#eaf4fb] text-[#5c7b91] text-[13px] px-2.5 py-1 rounded-sm border border-[#d6e5ef] cursor-pointer hover:bg-[#d6edf8] transition-colors max-w-[400px]">
          <span className="truncate">{groupMembers.map(u => u.name).join(', ')}</span>
          <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
        </div>
      ) : (
        <button onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1 text-[#03a9f4] hover:underline text-[14px]">
          <Plus className="h-3.5 w-3.5" /> Access
        </button>
      )}
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-[#ddd] shadow-lg z-50 w-[260px] rounded-sm">
          <div className="flex items-center border-b border-[#eee] px-3 py-2">
            <Search className="h-3.5 w-3.5 text-[#bbb] shrink-0" />
            <input autoFocus placeholder="Search users…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 ml-2 text-[13px] outline-none placeholder:text-[#bbb]" />
          </div>
          <div className="max-h-[240px] overflow-y-auto py-1">
            {!search && (
              <label className="flex items-center gap-2 px-3 py-2 hover:bg-[#f0f4f8] cursor-pointer border-b border-[#f0f0f0]">
                <input type="checkbox" checked={allSelected} onChange={handleSelectAll}
                  className="accent-[#03a9f4] w-[14px] h-[14px]" />
                <span className="text-[13px] text-[#555] font-medium">Select all</span>
              </label>
            )}
            {filtered.map(u => {
              const checked = group.memberIds.includes(u._id)
              return (
                <label key={u._id} className="flex items-center gap-2 px-3 py-2 hover:bg-[#f0f4f8] cursor-pointer">
                  <input type="checkbox" checked={checked}
                    onChange={e => onToggle(u._id, e.target.checked)}
                    className="accent-[#03a9f4] w-[14px] h-[14px]" />
                  <span className="text-[13px] text-[#333]">{u.name}</span>
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
        className={cn('px-2.5 py-1 rounded-sm text-[14px] font-medium flex items-center gap-1', roleBadgeColor(currentRole))}
      >
        {roleLabel(currentRole)} <ChevronDown className="h-3 w-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-0.5 bg-white border border-[#ddd] shadow-lg z-50 min-w-[150px] py-0.5 rounded-sm">
          {ROLE_OPTIONS.map(opt => (
            <button key={opt.value}
              onClick={() => { onRoleChange(memberId, opt.value); setOpen(false) }}
              className={cn('w-full text-left px-3 py-2 text-[14px] cursor-pointer transition-colors',
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
        <div className="absolute top-full left-0 mt-1 bg-white border border-[#ddd] shadow-lg z-50 w-[260px] rounded-sm">
          <div className="flex items-center border-b border-[#eee] px-3 py-2">
            <Search className="h-3.5 w-3.5 text-[#bbb] flex-shrink-0" />
            <input
              autoFocus
              placeholder="Add/Search groups"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 ml-2 text-[14px] outline-none placeholder:text-[#bbb]"
            />
          </div>
          <div className="max-h-[220px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-[14px] text-[#aaa]">No groups found</div>
            ) : filtered.map(g => {
              const checked = memberGroupIds.includes(g._id)
              return (
                <label key={g._id} className="flex items-center gap-2 px-3 py-2 hover:bg-[#f0f4f8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={e => { onToggle(g, e.target.checked); }}
                    className="accent-[#03a9f4] w-[14px] h-[14px]"
                  />
                  <span className="text-[14px] text-[#333]">{g.name}</span>
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
  const canDelete = user ? canDeleteUser(user.role) : false
  const canChangeRole = user ? canChangeUserRole(user.role) : false

  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'GROUPS' | 'REMINDERS'>('MEMBERS')

  // ── Members tab state ──
  const [memberSearch, setMemberSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Active')
  const [billableFilter, setBillableFilter] = useState('Billable rate')
  const [roleFilter, setRoleFilter] = useState('Role')
  const [groupFilter, setGroupFilter] = useState('Group')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [appliedStatus, setAppliedStatus] = useState('Active')
  const [appliedRole, setAppliedRole] = useState('Role')
  const [appliedGroup, setAppliedGroup] = useState('Group')
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')

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
    apiRequest<RawUser[] | { data: RawUser[] }>('/users', { method: 'GET', token: useAuthStore.getState().token })
      .then(res => {
        const arr = Array.isArray(res) ? res : (res as { data: RawUser[] })?.data ?? []
        setRawUsers(arr)
      })
      .catch(console.error)
  }, [])

  const handleGroupAccessToggle = async (group: ApiGroup, userId: string, checked: boolean) => {
    const newMemberIds = checked
      ? [...group.memberIds, userId]
      : group.memberIds.filter(id => id !== userId)
    try {
      const res = await updateGroup(group._id, { memberIds: newMemberIds })
      const updated = res as ApiGroup
      const finalIds = updated?.memberIds ?? newMemberIds
      setGroups(prev => prev.map(g => g._id === group._id ? { ...g, memberIds: finalIds } : g))
    } catch (err) { console.error(err) }
  }

  const [roleOverrides, setRoleOverrides] = useState<Record<string, string>>({})

  useEffect(() => {
    getGroups()
      .then(res => setAllGroups(Array.isArray(res) ? res : []))
      .catch(console.error)
  }, [])

  const handleMemberGroupToggle = async (member: User, group: ApiGroup, checked: boolean) => {
    const newMemberIds = checked
      ? [...group.memberIds, member.id]
      : group.memberIds.filter(id => id !== member.id)
    try {
      const res = await updateGroup(group._id, { memberIds: newMemberIds })
      const updated = res as ApiGroup
      setAllGroups(prev => prev.map(g => g._id === group._id ? { ...g, memberIds: updated?.memberIds ?? newMemberIds } : g))
    } catch (err) { console.error(err) }
  }

  // ── Groups tab state ──
  const [groups, setGroups] = useState<ApiGroup[]>([])
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
        // client.ts unwraps { success, data: [...] } so res is already the array
        const arr = Array.isArray(res) ? res : []
        setGroups(arr)
      })
      .catch(console.error)
      .finally(() => setLoadingGroups(false))
    return () => clearTimeout(timer)
  }, [activeTab])

  // ── Members filtering ──
  const filteredUsers = users.filter(u => {
    if (appliedSearch && !u.name.toLowerCase().includes(appliedSearch.toLowerCase()) &&
      !u.email.toLowerCase().includes(appliedSearch.toLowerCase())) return false
    if (appliedStatus === 'Active' && u.archived) return false
    if (appliedStatus === 'Inactive' && !u.archived) return false
    if (appliedRole !== 'Role' && roleLabel(u.role).toLowerCase() !== appliedRole.toLowerCase()) return false
    if (appliedGroup !== 'Group') {
      const grp = storeGroups.find(g => g.name === appliedGroup)
      if (!grp || !grp.memberIds.includes(u.id)) return false
    }
    return true
  }).sort((a, b) => a.name.localeCompare(b.name))

  // ── Groups filtering ──
  const filteredGroups = groups.filter(g =>
    !groupSearch || g.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
    g.memberIds.some(id => users.find(u => u.id === id)?.name.toLowerCase().includes(groupSearch.toLowerCase()))
  )

  const handleApplyFilter = () => {
    setAppliedSearch(memberSearch)
    setAppliedStatus(statusFilter)
    setAppliedRole(roleFilter)
    setAppliedGroup(groupFilter)
  }

  const handleClearFilters = () => {
    setMemberSearch(''); setStatusFilter('Active'); setBillableFilter('Billable rate')
    setRoleFilter('Role'); setGroupFilter('Group')
    setAppliedSearch(''); setAppliedStatus('Active'); setAppliedRole('Role'); setAppliedGroup('Group')
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

  const handleDeleteGroup = async (id: string) => {
    try {
      await deleteGroup(id)
      setGroups(prev => prev.filter(g => g._id !== id))
    } catch (err) { console.error(err) }
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
          <div className="flex items-center gap-0 h-[40px]">
            {(['MEMBERS', 'GROUPS', 'REMINDERS'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={cn('px-8 h-full text-[14px] font-bold tracking-widest border transition-all uppercase',
                  activeTab === tab
                    ? 'bg-white border-[#e4eaee] border-b-white text-[#333] relative z-20'
                    : 'bg-[#eaecee] border-transparent text-[#999] hover:bg-[#dde0e3]'
                )}>
                {tab}
              </button>
            ))}
          </div>
          {canInvite && activeTab === 'MEMBERS' && (
            <button onClick={() => setIsInviteOpen(true)}
              className="bg-[#03a9f4] hover:bg-[#0288d1] text-white text-[14px] font-bold py-2.5 px-6 rounded-sm transition-colors uppercase tracking-widest">
              ADD NEW MEMBER
            </button>
          )}
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
                <span className="text-[14px] font-bold text-[#999] uppercase tracking-widest">FILTER</span>
                <div className="h-6 w-px bg-[#e0e0e0]" />
                <FilterDropdown label="Active" options={['Active', 'Inactive', 'All']} value={statusFilter} onChange={setStatusFilter} />
                <FilterDropdown label="Billable rate" options={['Billable rate', 'Hidden', 'Visible']} value={billableFilter} onChange={setBillableFilter} />
                <FilterDropdown label="Role" options={['Role', 'Project Manager', 'Team Lead', 'Team Member']} value={roleFilter} onChange={setRoleFilter} />
                <FilterDropdown label="Group" options={groupNames} value={groupFilter} onChange={setGroupFilter} />
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white border border-[#c6d2d9] rounded-sm h-[34px] w-[260px] focus-within:border-[#03a9f4] transition-all">
                    <Search className="h-4 w-4 text-[#bbb] ml-3 flex-shrink-0" />
                    <input placeholder="Search by name or email" value={memberSearch}
                      onChange={e => setMemberSearch(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleApplyFilter()}
                      className="flex-1 px-2 text-[14px] outline-none placeholder:text-[#bbb] bg-transparent" />
                  </div>
                  <button onClick={handleApplyFilter}
                    className="px-4 h-[34px] border border-[#03a9f4] text-[#03a9f4] text-[14px] font-bold uppercase rounded-sm hover:bg-[#03a9f4] hover:text-white transition-all tracking-widest">
                    APPLY FILTER
                  </button>
                </div>
              </div>

              {/* Clear filters */}
              {(appliedSearch || appliedStatus !== 'Active' || appliedRole !== 'Role' || appliedGroup !== 'Group') && (
                <div className="flex justify-end px-5 py-1 border-b border-[#f0f0f0]">
                  <button onClick={handleClearFilters} className="text-[14px] text-[#03a9f4] hover:underline cursor-pointer">
                    Clear filters
                  </button>
                </div>
              )}

              {/* Section bar */}
              <div className="bg-[#f2f6fb] px-5 py-[10px] border-b border-[#e4eaee] flex items-center justify-between">
                <span className="text-[14px] text-[#999]">Members</span>
                <button className="flex items-center gap-1 text-[14px] text-[#555] hover:text-[#03a9f4]">
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
                    <th className="px-4 py-3 text-[14px] font-normal text-[#666] uppercase tracking-widest w-[22%]">
                      <div className="flex items-center gap-1">NAME <ChevronDown className="h-3 w-3" /></div>
                    </th>
                    <th className="px-4 py-3 text-[14px] font-normal text-[#666] uppercase tracking-widest w-[22%]">
                      <div className="flex items-center gap-1">EMAIL <ChevronDown className="h-3 w-3" /></div>
                    </th>
                    <th className="px-4 py-3 text-[14px] font-normal text-[#666] uppercase tracking-widest w-[20%] text-center">
                      <div className="flex items-center justify-center gap-1">BILLABLE RATE (USD) <ChevronDown className="h-3 w-3" /></div>
                    </th>
                    <th className="px-4 py-3 text-[14px] font-normal text-[#666] uppercase tracking-widest w-[18%]">ROLE</th>
                    <th className="px-4 py-3 text-[14px] font-normal text-[#666] uppercase tracking-widest w-[14%]">GROUP</th>
                    <th className="px-4 py-3 w-[40px]" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f4f7]">
                  {filteredUsers.map(member => {
                    const memberGroup = allGroups.find(g => g.memberIds.includes(member.id))
                    return (
                      <tr key={member.id} className="hover:bg-[#f9fafb] transition-colors group text-[14px] h-[60px]">
                        <td className="px-4 py-2">
                          <div className="w-[14px] h-[14px] border border-[#c6d2d9] rounded-sm bg-white" />
                        </td>
                        <td className="px-4 py-2 text-[#333] font-normal">{member.name}</td>
                        <td className="px-4 py-2 text-[#999] hover:text-[#03a9f4] cursor-pointer transition-colors">{member.email}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center">
                            <div className="flex bg-[#f2f6fb] border border-[#e4eaee] rounded-sm overflow-hidden w-[130px]">
                              <div className="px-3 py-1.5 text-[#333] flex-1 text-center">
                                {member.billableRate ? member.billableRate.toFixed(2) : '—'}
                              </div>
                              <button className="bg-white px-3 py-1.5 text-[#03a9f4] text-[14px] border-l border-[#e4eaee] hover:bg-gray-50 uppercase">
                                Change
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          {canChangeRole ? (
                            <RoleDropdown
                              memberId={member.id}
                              currentRole={roleOverrides[member.id]
                                ? (() => {
                                    const v = roleOverrides[member.id]
                                    if (v === 'admin') return 'owner'
                                    if (v === 'team_lead') return 'admin'
                                    return 'member'
                                  })()
                                : member.role}
                              onRoleChange={handleRoleChange}
                            />
                          ) : member.role ? (
                            <span className={cn('px-2.5 py-1 rounded-sm text-[14px] font-medium', roleBadgeColor(member.role))}>
                              {roleLabel(member.role)}
                            </span>
                          ) : (
                            <button className="flex items-center gap-1 text-[#03a9f4] hover:underline text-[14px]">
                              <Plus className="h-3.5 w-3.5" /> Role
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <GroupDropdown
                            member={member}
                            allGroups={allGroups}
                            onToggle={(group, checked) => handleMemberGroupToggle(member, group, checked)}
                            trigger={
                              memberGroup ? (
                                <div className="inline-flex items-center bg-[#eaf4fb] text-[#5c7b91] text-[14px] px-2.5 py-1 rounded-sm border border-[#d6e5ef] gap-1">
                                  {memberGroup.name} <ChevronDown className="h-3 w-3 opacity-60" />
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-[#03a9f4] hover:underline text-[14px]">
                                  <Plus className="h-3.5 w-3.5" /> Group
                                </div>
                              )
                            }
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <MoreVertical className="h-4 w-4 text-[#ccc] group-hover:text-[#999] cursor-pointer" />
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
                <div className="flex items-center bg-white border border-[#c6d2d9] rounded-sm h-[36px] w-[320px] focus-within:border-[#03a9f4] transition-all">
                  <Search className="h-4 w-4 text-[#bbb] ml-3 flex-shrink-0" />
                  <input placeholder="Search by username or group name" value={groupSearch}
                    onChange={e => setGroupSearch(e.target.value)}
                    className="flex-1 px-2 text-[14px] outline-none placeholder:text-[#bbb] bg-transparent" />
                </div>
                {canInvite && (
                  <div className="flex items-center gap-2">
                    <div className="border border-[#c6d2d9] rounded-sm h-[36px] flex items-center px-3 bg-white focus-within:border-[#03a9f4] w-[200px]">
                      <input placeholder="Add new group" value={newGroupName}
                        onChange={e => setNewGroupName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddGroup()}
                        className="w-full text-[14px] outline-none placeholder:text-[#bbb]" />
                    </div>
                    <button onClick={handleAddGroup}
                      className="bg-[#03a9f4] text-white px-6 h-[36px] text-[14px] font-bold rounded-sm hover:bg-[#0288d1] uppercase tracking-widest">
                      ADD
                    </button>
                  </div>
                )}
              </div>

              {/* Section bar */}
              <div className="bg-[#f2f6fb] px-5 py-[10px] border-b border-[#e4eaee] flex items-center justify-between">
                <span className="text-[14px] text-[#999]">Groups</span>
                <button className="flex items-center gap-1 text-[14px] text-[#555] hover:text-[#03a9f4]">
                  Export <ChevronDown className="h-3 w-3" />
                </button>
              </div>

              {/* Table */}
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b border-[#e4eaee] bg-white">
                    <th className="px-5 py-3 text-[14px] font-normal text-[#666] uppercase tracking-widest w-[25%]">
                      <div className="flex items-center gap-1">NAME <ChevronDown className="h-3 w-3" /></div>
                    </th>
                    <th className="px-5 py-3 text-[14px] font-normal text-[#666] uppercase tracking-widest">ACCESS</th>
                    <th className="px-5 py-3 w-[80px]" />
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
                      <tr key={group._id} className="hover:bg-[#f9fafb] transition-colors group text-[14px] h-[60px]">
                        <td className="px-5 py-2 font-normal text-[#333]">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input value={editName} onChange={e => setEditName(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') setEditingGroup(null) }}
                                autoFocus
                                className="border border-[#03a9f4] rounded-sm px-2 py-1 text-[14px] outline-none w-[160px]" />
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
                            {canDelete && (
                              <button onClick={() => handleDeleteGroup(group._id)}
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

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-sm shadow-2xl w-full max-w-[560px]">
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#e4eaee]">
              <h2 className="text-[18px] font-normal text-[#333]">Add members</h2>
              <button onClick={() => setIsInviteOpen(false)} className="text-[#999] hover:text-[#666]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="text-[14px] font-bold text-[#333] block mb-1">Invite by email</label>
              <p className="text-[14px] text-[#999] mb-3">Separate multiple emails with commas, spaces, or Enter.</p>
              <textarea value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full h-[100px] border border-[#c6d2d9] rounded-sm p-3 text-[14px] outline-none focus:border-[#03a9f4] placeholder:text-[#ccc] resize-none" />
            </div>
            <div className="px-6 py-4 flex items-center justify-end gap-3 border-t border-[#e4eaee]">
              <button onClick={() => setIsInviteOpen(false)} className="text-[#03a9f4] text-[14px] hover:underline">Cancel</button>
              <button onClick={() => setIsInviteOpen(false)}
                className="bg-[#03a9f4] text-white px-8 py-2 text-[14px] font-bold rounded-sm hover:bg-[#0288d1] uppercase tracking-wider">
                SEND INVITE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
