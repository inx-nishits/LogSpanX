'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useDataStore } from '@/lib/stores/data-store'
import { Search, ChevronDown, MoreVertical, Plus, Pencil, X, Check, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getGroups, createGroup, updateGroup, deleteGroup,
  ApiGroup,
} from '@/lib/api/teams'
import { toggleUserActive, updateUserRole } from '@/lib/api/users'
import { Role, User } from '@/lib/types'
import {
  canAssignUserRole,
  canDeleteGroup,
  canDeleteUser,
  canInviteMembers,
  canManageGroups,
  canToggleUserActive,
  canUpdateUserAdminFields,
  canUpdateUserRole,
  getAssignableRoles,
  normalizeRole,
  roleBadgeColor,
  roleLabel,
} from '@/lib/rbac'
import { mapApiUser } from '@/lib/api/mappers'
import { InviteMemberModal } from '@/components/team/invite-member-modal'

interface RawUser { _id: string; id?: string; name: string; email: string; archived?: boolean; isActive?: boolean }

// ─── Member Actions Dropdown ──────────────────────────────────────────────────

function MemberActionsDropdown({ member, canEdit, canToggleActive, canDelete, onEdit, onToggleActive, onDelete }: {
  member: User
  canEdit: boolean
  canToggleActive: boolean
  canDelete: boolean
  onEdit: (member: User) => void
  onToggleActive: (member: User) => void
  onDelete: (member: User) => void
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
          {canEdit && (
            <button
              onClick={() => { onEdit(member); setOpen(false) }}
              className="w-full text-left px-4 py-1.5 text-[12px] text-[#333] hover:bg-[#f0f4f8] cursor-pointer"
            >
              Edit
            </button>
          )}
          {canToggleActive && (
            <button
              onClick={() => { onToggleActive(member); setOpen(false) }}
              className={cn('w-full text-left px-4 py-1.5 text-[12px] cursor-pointer',
                member.isActive !== false ? 'text-[#f44336] hover:bg-[#fff5f5]' : 'text-[#4caf50] hover:bg-[#f5fff5]'
              )}
            >
              {member.isActive !== false ? 'Deactivate' : 'Activate'}
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => { onDelete(member); setOpen(false) }}
              className="w-full text-left px-4 py-1.5 text-[12px] text-red-500 hover:bg-red-50 cursor-pointer"
            >
              Delete
            </button>
          )}
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
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const [search, setSearch] = useState('')
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) { setOpen(false); setSearch('') }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const filtered = rawUsers.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()))
  const allSelected = filtered.length > 0 && filtered.every(u => group.memberIds.includes(u._id) || group.memberIds.includes(u.id ?? ''))
  const groupMembers = rawUsers.filter(u => group.memberIds.includes(u._id) || group.memberIds.includes(u.id ?? ''))

  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      // Open upward if too close to bottom of viewport
      const spaceBelow = window.innerHeight - rect.bottom
      const dropdownH = Math.min(groupMembers.length * 36 + 80, 320)
      const top = spaceBelow < dropdownH ? rect.top - dropdownH - 4 : rect.bottom + 4
      setPos({ top: top + window.scrollY, left: rect.left + window.scrollX })
    }
    setOpen(o => !o)
  }

  const memberChip = groupMembers.length > 0 ? (
    <div className="flex items-center gap-1.5 bg-[#eaf4fb] text-[#5c7b91] text-[12px] px-2.5 py-1 rounded-sm border border-[#d6e5ef] max-w-[280px]">
      <span className="truncate">{groupMembers.map(u => u.name).join(', ')}</span>
    </div>
  ) : <span className="text-[#bbb] text-[12px]">No members</span>

  if (readOnly) return (
    <div ref={triggerRef}>{memberChip}</div>
  )

  return (
    <div ref={triggerRef}>
      <div
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
      >
        {groupMembers.length > 0 ? (
          <div className="flex items-center gap-1.5 bg-[#eaf4fb] text-[#5c7b91] text-[12px] px-2.5 py-1 rounded-sm border border-[#d6e5ef] max-w-[280px]">
            <span className="truncate">{groupMembers.map(u => u.name).join(', ')}</span>
            <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
          </div>
        ) : (
          <button className="flex items-center gap-1 text-[#03a9f4] hover:underline text-[12px] cursor-pointer">
            <Plus className="h-3 w-3" /> Add members
          </button>
        )}
      </div>
      {open && typeof document !== 'undefined' && (
        <div
          ref={dropdownRef}
          className="fixed bg-white border border-[#ddd] shadow-xl z-[9999] w-[260px] rounded-sm"
          style={{ top: pos.top, left: pos.left }}
        >
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
            {filtered.length === 0 && (
              <div className="px-3 py-3 text-[12px] text-[#aaa]">No users found</div>
            )}
            {filtered.map(u => {
              const checked = group.memberIds.includes(u._id) || group.memberIds.includes(u.id ?? '')
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

function RoleDropdown({ memberId, currentRole, actorRole, onRoleChange }: {
  memberId: string
  currentRole: Role
  actorRole: Role
  onRoleChange: (memberId: string, newRole: Role) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const options = getAssignableRoles(actorRole).map(value => ({ label: roleLabel(value), value }))
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
          {options.map(opt => (
            <button key={opt.value}
              onClick={() => { onRoleChange(memberId, opt.value); setOpen(false) }}
              className={cn('w-full text-left px-3 py-1.5 text-[12px] cursor-pointer transition-colors',
                currentRole === opt.value ? 'bg-[#03a9f4] text-white' : 'text-[#555] hover:bg-[#f0f4f8]'
              )}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Group Lead Picker ───────────────────────────────────────────────────────

function GroupLeadPicker({ group, users, canEdit, onAssign }: {
  group: ApiGroup
  users: User[]
  canEdit: boolean
  onAssign: (groupId: string, leadId: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const [search, setSearch] = useState('')
  const triggerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) { setOpen(false); setSearch('') }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const leadId = group.leadId ?? null
  const lead = users.find(u => u.id === leadId)
  const filtered = users.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()))

  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX })
    }
    setOpen(o => !o)
  }

  if (!canEdit) {
    return (
      <div ref={triggerRef}>
        {lead
          ? <span className="text-[12px] text-[#333] font-medium">{lead.name}</span>
          : <span className="text-[#bbb] text-[12px]">—</span>
        }
      </div>
    )
  }

  return (
    <div ref={triggerRef}>
      <button onClick={handleOpen}
        className="flex items-center gap-1 text-[12px] hover:text-[#03a9f4] transition-colors cursor-pointer">
        {lead
          ? <span className="text-[#333] font-medium">{lead.name}</span>
          : <span className="text-[#03a9f4]">+ Assign</span>
        }
        <ChevronDown className="h-3 w-3 text-[#aaa]" />
      </button>
      {open && (
        <div
          ref={dropdownRef}
          className="fixed bg-white border border-[#ddd] shadow-xl z-[9999] w-[220px] rounded-sm"
          style={{ top: pos.top, left: pos.left }}
        >
          <div className="flex items-center border-b border-[#eee] px-3 py-2">
            <Search className="h-3.5 w-3.5 text-[#bbb] shrink-0" />
            <input autoFocus placeholder="Search users…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 ml-2 text-[12px] outline-none placeholder:text-[#bbb]" />
          </div>
          <div className="max-h-[220px] overflow-y-auto py-1">
            {lead && (
              <button onClick={() => { onAssign(group._id, null); setOpen(false); setSearch('') }}
                className="w-full text-left px-3 py-1.5 text-[12px] text-red-400 hover:bg-red-50 cursor-pointer">
                Remove lead
              </button>
            )}
            {filtered.length === 0 && (
              <div className="px-3 py-3 text-[12px] text-[#aaa]">No users found</div>
            )}
            {filtered.map(u => (
              <button key={u.id} onClick={() => { onAssign(group._id, u.id); setOpen(false); setSearch('') }}
                className={cn('w-full text-left px-3 py-1.5 text-[12px] cursor-pointer flex items-center justify-between',
                  u.id === leadId ? 'bg-[#03a9f4] text-white' : 'text-[#333] hover:bg-[#f0f4f8]'
                )}>
                {u.name}
                {u.id === leadId && <Check className="h-3 w-3" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Ensure every group has a guaranteed _id (backend may return `id` instead)
function normalizeGroups(groups: ApiGroup[]): ApiGroup[] {
  return groups
    .map(g => ({ ...g, _id: g._id ?? g.id ?? '' }))
    .filter(g => g._id) // drop any with no id at all
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const { user } = useAuthStore()
  const { users, createGroup: storeCreateGroup, updateGroup: storeUpdateGroup, deleteGroup: storeDeleteGroup, groups: storeGroups } = useDataStore()

  const canInvite = user ? canInviteMembers(user.role) : false
  const canEditAdminFields = user ? canUpdateUserAdminFields(user.role) : false
  const canToggleActive = user ? canToggleUserActive(user.role) : false
  const canRemoveUser = user ? canDeleteUser(user.role) : false
  const canDeleteGroupItem = user ? canDeleteGroup(user.role) : false
  const canChangeAnyRole = user ? canUpdateUserRole(user.role) : false
  const canAssignGroupLead = user ? (user.role === 'owner' || user.role === 'admin') : false
  const canManageGroup = user ? canManageGroups(user.role) : false

  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'GROUPS' | 'REMINDERS'>('MEMBERS')

  // ── Members tab state ──
  const [memberSearch, setMemberSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [billableFilter, setBillableFilter] = useState('Billable rate')
  const [roleFilter, setRoleFilter] = useState('Role')
  const [groupFilter, setGroupFilter] = useState('Group')
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  const handleRoleChange = async (memberId: string, newBackendRole: Role) => {
    const target = users.find(member => member.id === memberId)
    if (!user || !target || !canAssignUserRole(user, target, newBackendRole)) return
    try {
      await updateUserRole(memberId, newBackendRole)
      // Refresh users list from store by updating locally
      // The store will reflect on next load; for immediate UI update we rely on re-fetch
      // Trigger a page-level re-render by updating a local map
      setRoleOverrides(prev => ({ ...prev, [memberId]: newBackendRole }))
    } catch (err) { console.error(err) }
  }

  // ── Single groups state shared across both tabs ──
  const [groups, setGroups] = useState<ApiGroup[]>([])
  const [loadingGroups, setLoadingGroups] = useState(false)

  // Fetch groups once on mount — used by both Members and Groups tabs
  useEffect(() => {
    setLoadingGroups(true)
    getGroups()
      .then(res => setGroups(normalizeGroups(Array.isArray(res) ? res : [])))
      .catch(() => setGroups([]))
      .finally(() => setLoadingGroups(false))
  }, [])

  // Re-fetch when switching to Groups tab to get fresh data
  useEffect(() => {
    if (activeTab !== 'GROUPS') return
    setLoadingGroups(true)
    getGroups()
      .then(res => setGroups(normalizeGroups(Array.isArray(res) ? res : [])))
      .catch(() => {})
      .finally(() => setLoadingGroups(false))
  }, [activeTab])

  // Use store users as rawUsers — already fetched on init, avoids a duplicate /users call
  // Map to RawUser shape so AccessDropdown can match against _id
  const rawUsers: RawUser[] = users.map(u => ({ _id: u.id, id: u.id, name: u.name, email: u.email, isActive: u.isActive, archived: u.archived }))

  // Helper: normalize memberIds from a group (backend may return populated objects)
  const normalizeMemberIds = (memberIds: string[]) =>
    memberIds.map(m => {
      if (typeof m === 'string') return m
      const obj = m as { _id?: string; id?: string }
      return obj._id ?? obj.id ?? ''
    }).filter(Boolean)

  // Helper: apply API response back to local groups state + data store
  const applyGroupUpdate = (groupId: string, res: unknown) => {
    const updated = (res as any)?._id ? res as ApiGroup
      : (res as any)?.data?._id ? (res as any).data as ApiGroup
      : null
    
    if (!updated) return
    
    const rawMemberIds = updated.memberIds ?? []
    // Always normalize memberIds to plain strings
    const memberIds = rawMemberIds.map((m: unknown) => {
      if (typeof m === 'string') return m
      const obj = m as { _id?: string; id?: string }
      return obj._id ?? obj.id ?? ''
    }).filter(Boolean)
    
    const normalizedGroup: ApiGroup = {
      ...updated,
      _id: updated._id ?? updated.id ?? groupId,
      memberIds,
      name: updated.name,
      leadId: updated.leadId ?? null,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    }
    
    setGroups(prev => prev.map(g => g._id === groupId ? normalizedGroup : g))
    const storeGroup = storeGroups.find(g => g.id === groupId)
    if (storeGroup) {
      storeUpdateGroup(groupId, {
        name: normalizedGroup.name,
        memberIds: normalizedGroup.memberIds,
        leadId: normalizedGroup.leadId
      })
    }
  }

  const isProjectLeadGroup = (g: ApiGroup) => g.name?.toLowerCase().includes('project lead') ?? false

  const handleGroupAccessToggle = async (group: ApiGroup, userId: string, checked: boolean) => {
    const newMemberIds = checked
      ? [...group.memberIds, userId]
      : group.memberIds.filter(id => id !== userId)
    try {
      const res = await updateGroup(group._id, { memberIds: newMemberIds })
      applyGroupUpdate(group._id, res)
      
      if (checked && isProjectLeadGroup(group)) {
        await updateUserRole(userId, 'group_lead')
      }
    } catch (err) { 
      console.error('Failed to update group access:', err instanceof Error ? err.message : String(err))
    }
  }

  const handleGroupAccessSelectAll = async (group: ApiGroup, selectedUsers: RawUser[], selectAll: boolean) => {
    const newMemberIds = selectAll ? selectedUsers.map(u => u._id) : []
    try {
      const res = await updateGroup(group._id, { memberIds: newMemberIds })
      applyGroupUpdate(group._id, res)
      
      if (selectAll && isProjectLeadGroup(group)) {
        await Promise.all(selectedUsers.map(u => updateUserRole(u._id, 'group_lead')))
      }
    } catch (err) { 
      console.error('Failed to update group members:', err instanceof Error ? err.message : String(err))
    }
  }

  const [roleOverrides, setRoleOverrides] = useState<Record<string, Role>>({})
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

  const handleDeleteMember = async (member: User) => {
    if (member.id === user?.id) return
    if (!confirm(`Delete ${member.name}? This cannot be undone.`)) return
    const { deleteUserRecord } = useDataStore.getState()
    await deleteUserRecord(member.id)
  }

  const handleAssignGroupLead = async (groupId: string, leadId: string | null) => {
    const group = groups.find(g => g._id === groupId)
    if (!group) return
    try {
      const resolvedLeadId = leadId
        ? (rawUsers.find(u => u._id === leadId || u.id === leadId)?._id ?? leadId)
        : null
      
      const res = await updateGroup(groupId, { leadId: resolvedLeadId })
      applyGroupUpdate(groupId, res)
      
      if (resolvedLeadId) {
        try {
          await updateUserRole(resolvedLeadId, 'group_lead')
          await useDataStore.getState().updateUserRecord(resolvedLeadId, { role: 'group_lead' })
        } catch (roleErr) {
          console.error('Failed to update lead role:', roleErr instanceof Error ? roleErr.message : String(roleErr))
        }
      }
    } catch (err) {
      console.error('Failed to assign group lead:', err instanceof Error ? err.message : String(err))
    }
  }

  // ── Groups tab state ──
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null)
  const [groupSearch, setGroupSearch] = useState('')
  const [newGroupName, setNewGroupName] = useState('')
  const [editingGroup, setEditingGroup] = useState<ApiGroup | null>(null)
  const [editName, setEditName] = useState('')

  // ── Members filtering ──
  const filteredUsers = users.filter(u => {
    const isActive = u.id in activeOverrides ? activeOverrides[u.id] : (u.isActive !== false && !u.archived)
    if (memberSearch && !u.name.toLowerCase().includes(memberSearch.toLowerCase()) &&
      !u.email.toLowerCase().includes(memberSearch.toLowerCase())) return false
    if (statusFilter === 'Active' && !isActive) return false
    if (statusFilter === 'Inactive' && isActive) return false
    if (roleFilter !== 'Role' && roleLabel(u.role).toLowerCase() !== roleFilter.toLowerCase()) return false
    if (groupFilter !== 'Group') {
      const grp = groups.find(g => g.name === groupFilter)
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
      const created = res as ApiGroup
      const normalized = normalizeGroups([created])[0]
      if (normalized?._id) {
        setGroups(prev => [...prev, normalized])
        storeCreateGroup(newGroupName.trim(), [], undefined)
      }
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
      storeDeleteGroup(confirmDelete.id)
    } catch (err) { console.error(err) } finally {
      setConfirmDelete(null)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingGroup || !editName.trim()) return
    try {
      const res = await updateGroup(editingGroup._id, { name: editName.trim() })
      applyGroupUpdate(editingGroup._id, res)
      setEditingGroup(null)
    } catch (err) { 
      console.error('Failed to update group name:', err instanceof Error ? err.message : String(err))
    }
  }

  const groupNames = ['Group', ...groups.map(g => g.name)]

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
          {canInvite && activeTab === 'MEMBERS' && (
            <button
              onClick={() => setIsInviteOpen(true)}
              className="flex items-center gap-1.5 px-4 h-[30px] bg-[#03a9f4] hover:bg-[#0288d1] text-white text-[12px] font-bold uppercase rounded-sm tracking-widest transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" /> Invite
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
                <span className="text-[12px] font-bold text-[#999] uppercase tracking-widest">FILTER</span>
                <div className="h-6 w-px bg-[#e0e0e0]" />
                <FilterDropdown label="Active" options={['Active', 'Inactive', 'All']} value={statusFilter} onChange={setStatusFilter} />
                <FilterDropdown label="Billable rate" options={['Billable rate', 'Hidden', 'Visible']} value={billableFilter} onChange={setBillableFilter} />
                <FilterDropdown label="Role" options={['Role', 'Owner', 'Admin', 'Group Lead', 'Member']} value={roleFilter} onChange={setRoleFilter} />
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
                    <th className="px-4 py-2 w-[40px]" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f4f7]">
                  {filteredUsers.map(member => {
                    const isActive = member.id in activeOverrides ? activeOverrides[member.id] : (member.isActive !== false)
                    const canChangeRole = Boolean(user && canChangeAnyRole && canAssignUserRole(user, member, member.role))
                    return (
                      <tr key={member.id} className="hover:bg-[#f9fafb] transition-colors group text-[12px] h-[40px]">
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
                              {canEditAdminFields && (
                                <button className="bg-white px-3 h-full flex items-center text-[#03a9f4] text-[11px] border-l border-[#e4eaee] hover:bg-gray-50 uppercase font-medium">
                                  Change
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className={cn('px-4 py-2', !isActive && 'opacity-50')}>
                          {canChangeRole ? (
                            <RoleDropdown
                              memberId={member.id}
                              currentRole={roleOverrides[member.id] ?? normalizeRole(member.role)}
                              actorRole={user!.role}
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
                        <td className="px-4 py-2 text-center">
                          {(canEditAdminFields || canToggleActive || canRemoveUser) && member.id !== user?.id && (
                            <MemberActionsDropdown
                              member={{ ...member, isActive }}
                              canEdit={canEditAdminFields}
                              canToggleActive={canToggleActive}
                              canDelete={canRemoveUser}
                              onEdit={setEditingMember}
                              onToggleActive={handleToggleActive}
                              onDelete={handleDeleteMember}
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
                {canManageGroup && (
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
                    <th className="px-5 py-2 text-[11px] font-normal text-[#666] uppercase tracking-widest w-[25%]">GROUP LEAD</th>
                    <th className="px-5 py-2 text-[11px] font-normal text-[#666] uppercase tracking-widest">MEMBERS</th>
                    <th className="px-5 py-2 w-[80px]" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f4f7]">
                  {loadingGroups ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-[14px] text-[#aaa]">Loading...</td></tr>
                  ) : filteredGroups.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-[14px] text-[#aaa]">No groups found</td></tr>
                  ) : filteredGroups.map(group => {
                    const lead = group.leadId ? users.find(u => u.id === group.leadId) : null
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
                        <td className="px-5 py-3 text-[12px]">
                          <GroupLeadPicker
                            group={group}
                            users={users}
                            canEdit={canAssignGroupLead}
                            onAssign={handleAssignGroupLead}
                          />
                        </td>
                        <td className="px-5 py-2">
                          <AccessDropdown
                            group={group}
                            rawUsers={rawUsers}
                            onToggle={(userId, checked) => handleGroupAccessToggle(group, userId, checked)}
                            onSelectAll={(allUsers, sel) => handleGroupAccessSelectAll(group, allUsers, sel)}
                            readOnly={!canManageGroup}
                          />
                        </td>
                        <td className="px-5 py-2 text-right">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            {canManageGroup && (
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

      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onInvite={async (emails, role) => {
          const { inviteUser } = useDataStore.getState()
          return await inviteUser(emails, role)
        }}
      />

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
