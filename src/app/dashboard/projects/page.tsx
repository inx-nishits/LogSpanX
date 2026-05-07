'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Search, ChevronDown, Check, Star, Plus, X, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDataStore } from '@/lib/stores/data-store'
import { useAuthStore } from '@/lib/stores/auth-store'

// Helpers
const fmtDur = (s: number) => {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return `${h}h ${m}m`
}

const PROJECT_COLORS = [
  '#03a9f4', '#e91e63', '#9c27b0', '#673ab7',
  '#3f51b5', '#4caf50', '#ff9800', '#f44336',
  '#00bcd4', '#009688', '#795548', '#607d8b',
]

// ─── New Project Modal ───────────────────────────────────────────────────────
interface NewProjectModalProps {
  clients: { id: string; name: string }[]
  users: { id: string; name: string }[]
  onClose: () => void
  onSubmit: (data: {
    name: string
    color: string
    clientName?: string
    leadId?: string
    billable: boolean
    memberIds: string[]
  }) => Promise<void>
}

function NewProjectModal({ clients, users, onClose, onSubmit }: NewProjectModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PROJECT_COLORS[0])
  const [clientName, setClientName] = useState('')
  const [leadId, setLeadId] = useState('')
  const [billable, setBillable] = useState(true)
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [memberSearch, setMemberSearch] = useState('')
  const [memberDropOpen, setMemberDropOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const memberRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (memberRef.current && !memberRef.current.contains(e.target as Node)) setMemberDropOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filteredUsers = users.filter(u => !memberSearch || u.name.toLowerCase().includes(memberSearch.toLowerCase()))
  const toggleMember = (id: string) => setMemberIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Project name is required.'); return }
    setSaving(true); setError(null)
    try {
      await onSubmit({ name: name.trim(), color, clientName: clientName || undefined, leadId: leadId || undefined, billable, memberIds })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project.')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-[560px] mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e4eaee] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <h2 className="text-[16px] font-semibold text-[#333]">New Project</h2>
          </div>
          <button onClick={onClose} className="text-[#bbb] hover:text-[#555] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">
          {/* Name + Color row */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest">Project Name *</label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Website Redesign"
                className="w-full px-3 py-2.5 text-[13px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest">Color</label>
              <div className="flex flex-wrap gap-1.5 max-w-[120px]">
                {PROJECT_COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-all shrink-0 ${color === c ? 'ring-2 ring-offset-1 ring-[#03a9f4]' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>

          {/* Client + Lead row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest">Client</label>
              <select value={clientName} onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2.5 text-[13px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4] bg-white transition-colors">
                <option value="">— No client —</option>
                {clients.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest">Project Lead</label>
              <select value={leadId} onChange={(e) => setLeadId(e.target.value)}
                className="w-full px-3 py-2.5 text-[13px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4] bg-white transition-colors">
                <option value="">— No lead —</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>

          {/* Members */}
          <div className="flex flex-col gap-1.5" ref={memberRef}>
            <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest">Members</label>
            <div
              onClick={() => setMemberDropOpen(o => !o)}
              className="w-full min-h-[40px] px-3 py-2 text-[13px] border border-[#c6d2d9] rounded-sm cursor-pointer flex items-center flex-wrap gap-1.5 focus-within:border-[#03a9f4] transition-colors hover:border-[#aaa]"
            >
              {memberIds.length === 0 ? (
                <span className="text-[#bbb]">Select members…</span>
              ) : (
                memberIds.map(id => {
                  const u = users.find(u => u.id === id)
                  return u ? (
                    <span key={id} className="inline-flex items-center gap-1 bg-[#eaf4fb] text-[#0288d1] text-[12px] px-2 py-0.5 rounded-sm border border-[#d6e5ef]">
                      {u.name}
                      <button type="button" onClick={(e) => { e.stopPropagation(); toggleMember(id) }} className="hover:text-red-400">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ) : null
                })
              )}
              <ChevronDown className="h-3.5 w-3.5 text-[#aaa] ml-auto shrink-0" />
            </div>
            {memberDropOpen && (
              <div className="border border-[#ddd] rounded-sm shadow-lg bg-white z-50">
                <div className="flex items-center border-b border-[#eee] px-3 py-2">
                  <Search className="h-3.5 w-3.5 text-[#bbb] shrink-0" />
                  <input autoFocus placeholder="Search members…" value={memberSearch}
                    onChange={e => setMemberSearch(e.target.value)}
                    className="flex-1 ml-2 text-[13px] outline-none placeholder:text-[#bbb]" />
                </div>
                <div className="max-h-[180px] overflow-y-auto py-1">
                  {filteredUsers.length === 0 ? (
                    <div className="px-3 py-2 text-[12px] text-[#aaa]">No users found</div>
                  ) : filteredUsers.map(u => (
                    <label key={u.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#f0f4f8] cursor-pointer">
                      <input type="checkbox" checked={memberIds.includes(u.id)}
                        onChange={() => toggleMember(u.id)}
                        className="accent-[#03a9f4] w-[14px] h-[14px]" />
                      <span className="text-[13px] text-[#333]">{u.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Billable toggle */}
          <div className="flex items-center gap-3 py-1">
            <button type="button" onClick={() => setBillable(!billable)}
              className={`w-10 h-5 rounded-full transition-colors relative shrink-0 inline-flex items-center ${billable ? 'bg-[#03a9f4]' : 'bg-[#ddd]'}`}>
              <span className={`absolute w-4 h-4 rounded-full bg-white shadow transition-transform ${billable ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
            </button>
            <span className="text-[13px] text-[#555]">Billable project</span>
          </div>

          {error && <p className="text-[13px] text-red-500 bg-red-50 px-3 py-2 rounded-sm border border-red-200">{error}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-[#f0f0f0]">
            <button type="button" onClick={onClose}
              className="px-5 py-2 text-[13px] text-[#666] border border-[#c6d2d9] rounded-sm hover:bg-[#f2f6f8] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-6 py-2 text-[13px] font-bold text-white bg-[#03a9f4] hover:bg-[#0288d1] rounded-sm transition-colors disabled:opacity-60 uppercase tracking-widest">
              {saving ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const { projects: storeProjects, users, clients, timeEntries, addProject, updateProject, updateProjects, deleteProject, toggleProjectArchive } = useDataStore()
  const { user } = useAuthStore()
  const isReadOnly = user?.role !== 'project_manager'

  const [showNewModal, setShowNewModal] = useState(false)

  const handleArchiveSingle = async (id: string) => {
    const project = storeProjects.find(p => p.id === id)
    try {
      await toggleProjectArchive(id)
      const { useToastStore } = await import('@/lib/stores/toast-store')
      useToastStore.getState().show(
        `Project ${project?.archived ? 'unarchived' : 'archived'} successfully`,
        'success'
      )
    } catch (err) { console.error(err) }
  }

  // Derived leads from store
  const leadItems = useMemo(() => users.map(u => ({ id: u.id, name: u.name, status: 'active' })), [users])
  const clientItems = useMemo(() => clients.map(c => ({ id: c.id, name: c.name })), [clients])

  const groupItems = [
    { name: 'Engineering', status: 'active' },
    { name: 'Design', status: 'active' },
    { name: 'Sales', status: 'active' }
  ]

  const [sortKey, setSortKey] = useState<string>('NAME')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isLeadStatusFilterOpen, setIsLeadStatusFilterOpen] = useState(false)
  const [isAccessStatusFilterOpen, setIsAccessStatusFilterOpen] = useState(false)
  const [leadStatusFilter, setLeadStatusFilter] = useState('Active')
  const [accessStatusFilter, setAccessStatusFilter] = useState('Active')
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>([])

  const [statusFilter, setStatusFilter] = useState('All')
  const [leadSearchQuery, setLeadSearchQuery] = useState('')
  const [selectedLeadNames, setSelectedLeadNames] = useState<string[]>([])
  const [includeWithoutLead, setIncludeWithoutLead] = useState(false)
  const [accessSearchQuery, setAccessSearchQuery] = useState('')
  const [selectedAccessGroups, setSelectedAccessGroups] = useState<string[]>([])
  const [selectedAccessUsers, setSelectedAccessUsers] = useState<string[]>([])
  const [selectedBillingStatuses, setSelectedBillingStatuses] = useState<string[]>([])
  const [nameSearchQuery, setNameSearchQuery] = useState('')

  // Applied filter state — only updated when Apply Filter is clicked
  const [appliedStatus, setAppliedStatus] = useState('All')
  const [appliedLeadNames, setAppliedLeadNames] = useState<string[]>([])
  const [appliedWithoutLead, setAppliedWithoutLead] = useState(false)
  const [appliedBillingStatuses, setAppliedBillingStatuses] = useState<string[]>([])
  const [appliedNameQuery, setAppliedNameQuery] = useState('')

  const SortIndicator = ({ active, order }: { active: boolean; order: 'asc' | 'desc' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
      <path d="m7 9 5-5 5 5" className={`transition-all duration-300 ${active && order === 'asc' ? 'text-[#333] opacity-100' : 'text-[#999] opacity-30'}`} />
      <path d="m7 15 5 5 5-5" className={`transition-all duration-300 ${active && order === 'desc' ? 'text-[#333] opacity-100' : 'text-[#999] opacity-30'}`} />
    </svg>
  )

  const handleSort = (key: string) => {
    if (sortKey === key) setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortOrder('asc') }
  }

  // Compute functional project list
  const fullProjects = useMemo(() => {
    return storeProjects.map(p => {
      const lead = users.find(u => u.id === p.leadId)?.name || '-'
      const duration = timeEntries.filter(e => e.projectId === p.id).reduce((acc, e) => acc + (e.duration || 0), 0)
      return {
        ...p,
        lead,
        tracked: fmtDur(duration),
        progress: null,
        access: 'Private'
      }
    })
  }, [storeProjects, users, timeEntries])

  // Filter Logic — uses applied state only
  const filteredProjects = useMemo(() => {
    return fullProjects.filter(p => {
      const matchesStatus = appliedStatus === 'All' ||
        (appliedStatus === 'Active' && !p.archived) ||
        (appliedStatus === 'Archived' && p.archived)
      if (!matchesStatus) return false

      const matchesLead = appliedLeadNames.length === 0 ||
        appliedLeadNames.includes(p.lead) ||
        (appliedWithoutLead && (p.lead === '-' || !p.lead))
      if (!matchesLead) return false

      let matchesBilling = true
      if (appliedBillingStatuses.length > 0) {
        matchesBilling =
          (appliedBillingStatuses.includes('Billable') && p.billable) ||
          (appliedBillingStatuses.includes('Non billable') && !p.billable)
      }
      if (!matchesBilling) return false

      const matchesName = !appliedNameQuery || p.name.toLowerCase().includes(appliedNameQuery.toLowerCase())
      if (!matchesName) return false

      return true
    })
  }, [fullProjects, appliedStatus, appliedLeadNames, appliedWithoutLead, appliedBillingStatuses, appliedNameQuery])

  // Sort projects
  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      if (sortKey === 'NAME') return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      if (sortKey === 'PROJECT LEAD') return sortOrder === 'asc' ? a.lead.localeCompare(b.lead) : b.lead.localeCompare(a.lead)
      if (sortKey === 'TRACKED') {
        const parseH = (s: string) => parseFloat(s.replace(/[^0-9.]/g, '')) || 0
        return sortOrder === 'asc' ? parseH(a.tracked) - parseH(b.tracked) : parseH(b.tracked) - parseH(a.tracked)
      }
      if (sortKey === 'ACCESS') return sortOrder === 'asc' ? a.access.localeCompare(b.access) : b.access.localeCompare(a.access)
      return 0
    })
  }, [filteredProjects, sortKey, sortOrder])

  const handleApplyFilter = () => {
    setAppliedStatus(statusFilter)
    setAppliedLeadNames([...selectedLeadNames])
    setAppliedWithoutLead(includeWithoutLead)
    setAppliedBillingStatuses([...selectedBillingStatuses])
    setAppliedNameQuery(nameSearchQuery)
  }

  const handleClearFilters = () => {
    setStatusFilter('All')
    setSelectedLeadNames([])
    setIncludeWithoutLead(false)
    setSelectedAccessGroups([])
    setSelectedAccessUsers([])
    setSelectedBillingStatuses([])
    setNameSearchQuery('')
    setAppliedStatus('All')
    setAppliedLeadNames([])
    setAppliedWithoutLead(false)
    setAppliedBillingStatuses([])
    setAppliedNameQuery('')
  }

  const hasActiveFilters = appliedStatus !== 'All' ||
    appliedLeadNames.length > 0 ||
    appliedWithoutLead ||
    appliedBillingStatuses.length > 0 ||
    appliedNameQuery !== ''

  const toggleFavorite = (projectName: string) => {
    setFavorites(prev => prev.includes(projectName) ? prev.filter(n => n !== projectName) : [...prev, projectName])
  }


  // Filter Logic Helpers
  const filteredLeads = leadItems.filter(lead => {
    const matchesSearch = !leadSearchQuery || lead.name.toLowerCase().includes(leadSearchQuery.toLowerCase())
    if (leadStatusFilter === 'Active') return matchesSearch && lead.status === 'active'
    if (leadStatusFilter === 'Archived') return matchesSearch && lead.status === 'archived'
    return matchesSearch
  })
  const toggleLead = (name: string) => setSelectedLeadNames(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  const toggleWithoutLead = () => setIncludeWithoutLead(!includeWithoutLead)
  const allVisibleLeadsSelected = filteredLeads.every(l => selectedLeadNames.includes(l.name)) && (leadSearchQuery ? true : includeWithoutLead)
  const toggleAllLeads = () => {
    if (allVisibleLeadsSelected) {
      setSelectedLeadNames(prev => prev.filter(name => !filteredLeads.some(l => l.name === name)))
      if (!leadSearchQuery) setIncludeWithoutLead(false)
    } else {
      setSelectedLeadNames(Array.from(new Set([...selectedLeadNames, ...filteredLeads.map(l => l.name)])))
      if (!leadSearchQuery) setIncludeWithoutLead(true)
    }
  }

  // Bulk Selection Logic
  const toggleProjectSelection = (id: string) => {
    setSelectedProjectIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }
  const allVisibleProjectsSelected = sortedProjects.length > 0 && sortedProjects.every(p => selectedProjectIds.includes(p.id))
  const toggleSelectAllProjects = () => {
    if (allVisibleProjectsSelected) setSelectedProjectIds(prev => prev.filter(id => !sortedProjects.some(p => p.id === id)))
    else setSelectedProjectIds(Array.from(new Set([...selectedProjectIds, ...sortedProjects.map(p => p.id)])))
  }

  const handleArchiveProjects = () => {
    if (selectedProjectIds.length === 0) return
    updateProjects(selectedProjectIds, { archived: true })
    setSelectedProjectIds([])
  }

  const filteredGroups = groupItems.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(accessSearchQuery.toLowerCase())
    if (accessStatusFilter === 'Active') return matchesSearch && g.status === 'active'
    if (accessStatusFilter === 'Inactive') return matchesSearch && g.status === 'inactive'
    return matchesSearch
  })
  const filteredAccessUsers = leadItems.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(accessSearchQuery.toLowerCase())
    if (accessStatusFilter === 'Active') return matchesSearch && u.status === 'active'
    if (accessStatusFilter === 'Inactive') return matchesSearch && u.status === 'inactive'
    return matchesSearch
  })
  const toggleAccessGroup = (name: string) => setSelectedAccessGroups(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  const toggleAccessUser = (name: string) => setSelectedAccessUsers(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  const toggleBilling = (status: string) => setSelectedBillingStatuses(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status])

  return (
    <div className="min-h-full flex flex-col bg-[#f2f6f8]">
      {/* New Project Modal */}
      {showNewModal && (
        <NewProjectModal
          clients={clientItems}
          users={leadItems}
          onClose={() => setShowNewModal(false)}
          onSubmit={(data) => addProject({
            ...data,
            members: data.memberIds.map(id => ({ userId: id, role: 'member' as const })),
            archived: false,
          })}
        />
      )}

      {/* Header */}
      <div className="w-full px-5 pt-4 pb-2 relative z-50 flex items-center justify-between">
        <h1 className="text-lg text-[#333333] font-normal">Projects</h1>
        {!isReadOnly && (
          <Button
            onClick={() => setShowNewModal(true)}
            className="bg-[#03a9f4] hover:bg-[#0288d1] text-white flex items-center gap-1.5 text-[14px] font-bold tracking-widest uppercase h-9 px-4 rounded-sm shadow"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      <div className="w-full px-5 pt-4 pb-20 relative z-10">
        <div className="max-w-full overflow-x-auto hidden-scrollbar">
          <div className="min-w-[1000px] flex flex-col gap-6">

            {/* Filter Bar */}
            <div className="relative z-[100] mb-6">
              <div className="flex bg-white border border-[#e4eaee] items-center h-[54px] rounded-md shadow-sm text-[13px] px-2">
                <div className="flex items-center pl-4 pr-3 h-full">
                  <span className="text-[13px] font-bold text-[#999999] uppercase tracking-widest">Filter</span>
                </div>

                <div className="h-8 w-[1px] border-l border-dotted border-[#c6d2d9]" />
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className={`flex items-center px-4 h-full cursor-pointer outline-none hover:text-[#333] data-[state=open]:text-[#03a9f4] ${appliedStatus !== 'All' ? 'text-[#03a9f4] font-semibold' : 'text-[#666666]'}`}>
                    <span>{statusFilter}</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[160px] bg-white rounded-sm shadow-xl border border-[#e4eaee] py-1 z-[200]">
                    {['Active', 'Archived', 'All'].map(s => (
                      <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)} className={`py-1.5 px-4 cursor-pointer text-[12px] transition-colors ${statusFilter === s ? 'bg-[#eaf4fb] text-[#03a9f4] font-semibold' : 'text-gray-700 focus:bg-[#eaf4fb]'}`}>{s}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-8 w-[1px] border-l border-dotted border-[#c6d2d9]" />
                {/* Project Lead Dropdown */}
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className={`flex items-center px-4 h-full cursor-pointer outline-none hover:text-[#333] data-[state=open]:text-[#03a9f4] relative ${selectedLeadNames.length > 0 || includeWithoutLead ? "text-[#03a9f4] font-semibold" : "text-[#666666]"}`}>
                    <span>Project Lead</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                    {(selectedLeadNames.length + (includeWithoutLead ? 1 : 0)) > 0 && (
                      <div className="absolute top-[4px] right-[6px] bg-[#03a9f4] text-white text-[14px] h-[18px] min-w-[18px] px-1 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                        {selectedLeadNames.length + (includeWithoutLead ? 1 : 0)}
                      </div>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[300px] p-0 bg-white shadow-2xl border border-[#e4eaee] z-[200]">
                    <div className="p-3 border-b border-[#e4eaee]">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
                        <input type="text" placeholder="Search by name" value={leadSearchQuery} onChange={(e) => setLeadSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-1.5 text-[12px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4]" />
                      </div>
                    </div>
                    <div className="flex flex-col border-b border-[#e4eaee]">
                      <div className="flex items-center justify-between px-4 py-[9px] cursor-pointer hover:bg-[#fcfdfe]" onClick={(e) => { e.stopPropagation(); setIsLeadStatusFilterOpen(!isLeadStatusFilterOpen) }}>
                        <span className="text-[12px] font-bold text-[#999] uppercase tracking-widest">Show</span>
                        <div className="flex items-center gap-1 text-[12px] text-[#666]">
                          {leadStatusFilter} <ChevronDown className={`h-3.5 w-3.5 text-[#999] transition-transform ${isLeadStatusFilterOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      {isLeadStatusFilterOpen && (
                        <div className="bg-[#fcfdfe] py-1 border-t border-[#e4eaee]/50">
                          {['Active & Archived', 'Active', 'Archived'].map(opt => (
                            <div key={opt} onClick={(e) => { e.stopPropagation(); setLeadStatusFilter(opt); setIsLeadStatusFilterOpen(false) }} className={`py-1.5 px-10 text-[12px] cursor-pointer transition-colors ${leadStatusFilter === opt ? 'bg-[#eaf4fb] text-[#333]' : 'text-[#666] hover:bg-[#eaf4fb]'}`}>{opt}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="max-h-[220px] overflow-y-auto py-1 scrollbar-hide text-[12px]">
                      {!leadSearchQuery && (
                        <>
                          <div className="flex items-center px-4 py-1.5 cursor-pointer hover:bg-[#eaf4fb] transition-colors text-[#666]" onClick={toggleAllLeads}>
                            <div className={`w-[14px] h-[14px] border ${allVisibleLeadsSelected ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-gray-300'} rounded-[2px] mr-3 flex items-center justify-center`}>
                              {allVisibleLeadsSelected && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                            </div>
                            Select all
                          </div>
                          <div className="flex items-center px-4 py-1.5 cursor-pointer hover:bg-[#eaf4fb] transition-colors text-[#666]" onClick={toggleWithoutLead}>
                            <div className={`w-[14px] h-[14px] border ${includeWithoutLead ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-gray-300'} rounded-[2px] mr-3 flex items-center justify-center`}>
                              {includeWithoutLead && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                            </div>
                            Without Project Lead
                          </div>
                        </>
                      )}
                      {filteredLeads.map(lead => (
                        <div key={lead.name} className="flex items-center px-4 py-1.5 cursor-pointer hover:bg-[#eaf4fb] transition-colors text-[#666]" onClick={() => toggleLead(lead.name)}>
                          <div className={`w-[14px] h-[14px] border ${selectedLeadNames.includes(lead.name) ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-gray-300'} rounded-[2px] mr-3 flex items-center justify-center`}>
                            {selectedLeadNames.includes(lead.name) && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                          </div>
                          {lead.name}
                        </div>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-8 w-[1px] border-l border-dotted border-[#c6d2d9]" />
                {/* Access Dropdown */}
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className={`flex items-center px-4 h-full cursor-pointer outline-none hover:text-[#333] data-[state=open]:text-[#03a9f4] relative ${selectedAccessGroups.length + selectedAccessUsers.length > 0 ? "text-[#03a9f4] font-semibold" : "text-[#666666]"}`}>
                    <span>Access</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                    {(selectedAccessGroups.length + selectedAccessUsers.length) > 0 && (
                      <div className="absolute top-[4px] right-[6px] bg-[#03a9f4] text-white text-[14px] h-[18px] min-w-[18px] px-1 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                        {selectedAccessGroups.length + selectedAccessUsers.length}
                      </div>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[300px] p-0 bg-white shadow-2xl border border-[#e4eaee] z-[200]">
                    <div className="p-3 border-b border-[#e4eaee]">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
                        <input type="text" placeholder="Search users or groups" value={accessSearchQuery} onChange={(e) => setAccessSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-1.5 text-[12px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4]" />
                      </div>
                    </div>
                    <div className="flex flex-col border-b border-[#e4eaee]">
                      <div className="flex items-center justify-between px-4 py-[9px] cursor-pointer hover:bg-[#fcfdfe]" onClick={(e) => { e.stopPropagation(); setIsAccessStatusFilterOpen(!isAccessStatusFilterOpen) }}>
                        <span className="text-[12px] font-bold text-[#999] uppercase tracking-widest">Show</span>
                        <div className="flex items-center gap-1 text-[12px] text-[#666]">
                          {accessStatusFilter} <ChevronDown className={`h-3.5 w-3.5 text-[#999] transition-transform ${isAccessStatusFilterOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      {isAccessStatusFilterOpen && (
                        <div className="bg-[#fcfdfe] py-1 border-t border-[#e4eaee]/50">
                          {['All', 'Active', 'Inactive'].map(opt => (
                            <div key={opt} onClick={(e) => { e.stopPropagation(); setAccessStatusFilter(opt); setIsAccessStatusFilterOpen(false) }} className={`py-1.5 px-10 text-[12px] cursor-pointer transition-colors ${accessStatusFilter === opt ? 'bg-[#eaf4fb] text-[#333]' : 'text-[#666] hover:bg-[#eaf4fb]'}`}>{opt}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="max-h-[280px] overflow-y-auto py-1 scrollbar-hide text-[12px]">
                      <div className="px-4 py-1.5 pt-2 uppercase text-[12px] font-bold text-[#999] tracking-widest">Groups</div>
                      {filteredGroups.map(group => (
                        <div key={group.name} className="flex items-center px-4 py-1.5 cursor-pointer hover:bg-[#eaf4fb] transition-colors text-[#666]" onClick={() => toggleAccessGroup(group.name)}>
                          <div className={`w-[14px] h-[14px] border ${selectedAccessGroups.includes(group.name) ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-gray-300'} rounded-[2px] mr-3 flex items-center justify-center`}>
                            {selectedAccessGroups.includes(group.name) && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                          </div>
                          {group.name}
                        </div>
                      ))}
                      <div className="px-4 py-1.5 pt-3 uppercase text-[12px] font-bold text-[#999] tracking-widest">Users</div>
                      {filteredAccessUsers.map(user => (
                        <div key={user.id} className="flex items-center px-4 py-1.5 cursor-pointer hover:bg-[#eaf4fb] transition-colors text-[#666]" onClick={() => toggleAccessUser(user.name)}>
                          <div className={`w-[14px] h-[14px] border ${selectedAccessUsers.includes(user.name) ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-gray-300'} rounded-[2px] mr-3 flex items-center justify-center`}>
                            {selectedAccessUsers.includes(user.name) && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                          </div>
                          {user.name}
                        </div>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-8 w-[1px] border-l border-dotted border-[#c6d2d9]" />
                {/* Billing Dropdown */}
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className={`flex items-center px-4 h-full cursor-pointer outline-none hover:text-[#333] data-[state=open]:text-[#03a9f4] relative ${selectedBillingStatuses.length > 0 ? "text-[#03a9f4] font-semibold" : "text-[#666666]"}`}>
                    <span>Billing</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                    {selectedBillingStatuses.length > 0 && (
                      <div className="absolute top-[4px] right-[6px] bg-[#03a9f4] text-white text-[14px] h-[18px] min-w-[18px] px-1 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                        {selectedBillingStatuses.length}
                      </div>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[180px] p-0 py-1 bg-white shadow-2xl border border-[#e4eaee] z-[200]">
                    {['Billable', 'Non billable'].map(status => (
                      <div key={status} className="flex items-center px-4 py-1.5 cursor-pointer hover:bg-[#eaf4fb] transition-colors text-[#666] text-[12px]" onClick={() => toggleBilling(status)}>
                        <div className={`w-[14px] h-[14px] border ${selectedBillingStatuses.includes(status) ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-gray-300'} rounded-[2px] mr-3 flex items-center justify-center`}>
                          {selectedBillingStatuses.includes(status) && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                        </div>
                        {status}
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-8 w-[1px] border-l border-dotted border-[#c6d2d9]" />
                <div className="flex-1 flex items-center h-full px-4 relative group">
                  <Search className="absolute left-4 h-4 w-4 text-[#999]" />
                  <input
                    type="text"
                    placeholder="Find by name"
                    value={nameSearchQuery}
                    onChange={(e) => setNameSearchQuery(e.target.value)}
                    className="w-full h-full pl-7 outline-none bg-transparent"
                  />
                </div>
                <div className="flex items-center pr-4 pl-2">
                  <Button onClick={handleApplyFilter} className="bg-[#03a9f4] hover:bg-[#0288d1] text-[13px] font-bold tracking-widest px-3 h-8 rounded-sm shadow-md uppercase text-white transition-all">APPLY FILTER</Button>
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end pr-1 py-3 -mt-2">
                <button onClick={handleClearFilters} className="text-[#03a9f4] hover:underline text-[14px] font-medium transition-all">Clear filters</button>
              </div>
            )}

            {/* Table */}
            <div className="relative z-0">
              <div className="bg-white border border-[#e4eaee] rounded-md shadow-sm overflow-hidden relative">
                <table className="border-collapse table-auto w-full">
                  <thead>
                    <tr className="bg-[#f0f7fb] border-b border-[#d6e5ef]">
                      <th colSpan={6} className="px-4 py-3 text-[14px] text-[#5c7b91] font-bold uppercase tracking-tight text-left">
                        Projects
                      </th>
                    </tr>
                    <tr className="border-b border-[#e4eaee] text-left select-none bg-white">
                      {[
                        { label: 'NAME', width: '30%' },
                        { label: 'PROJECT LEAD', width: '20%' },
                        { label: 'TRACKED', width: '15%' },
                        { label: 'PROGRESS', width: '15%' },
                        { label: 'ACCESS', width: 'auto' }
                      ].map((col) => (
                        <th
                          key={col.label}
                          style={{ width: col.width }}
                          className="pl-4 pr-3 py-2.5 text-[12px] font-normal uppercase tracking-widest cursor-pointer text-[#666] transition-colors"
                          onClick={() => handleSort(col.label)}
                        >
                          <div className="flex items-center gap-2">
                            {!isReadOnly && col.label === 'NAME' && (
                              <div className={`w-[14px] h-[14px] border ${allVisibleProjectsSelected ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-gray-300'} rounded-[2px] cursor-pointer flex items-center justify-center shrink-0`}
                                onClick={e => { e.stopPropagation(); toggleSelectAllProjects() }}>
                                {allVisibleProjectsSelected && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                              </div>
                            )}
                            {col.label}
                            {!isReadOnly && col.label === 'NAME' && selectedProjectIds.length > 0 && (
                              <div className="flex items-center ml-2 gap-3">
                                <button className="text-[#03a9f4] text-[14px] font-bold normal-case hover:underline">Bulk Edit</button>
                                <button onClick={handleArchiveProjects} className="text-[#03a9f4] text-[14px] font-bold normal-case hover:underline">Archive</button>
                              </div>
                            )}
                            <div className="flex-1" />
                            <SortIndicator active={sortKey === col.label} order={sortOrder} />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProjects.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-[#999] text-[14px]">No projects found.</td>
                      </tr>
                    )}
                    {sortedProjects.map((project) => (
                      <tr key={project.id} className={`hover:bg-[#f2f6f8] group transition-colors border-b border-[#f1f4f7] h-[46px] ${selectedProjectIds.includes(project.id) ? 'bg-[#f0f7fb]' : ''} ${project.archived ? 'bg-gray-50/50' : ''}`}>
                        {/* Name */}
                        <td className="pl-4 pr-3 py-4 whitespace-nowrap overflow-hidden">
                          <div className="flex items-center gap-4">
                            {!isReadOnly && (
                              <div
                                className={`w-[14px] h-[14px] border ${selectedProjectIds.includes(project.id) ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-gray-300'} rounded-[2px] cursor-pointer flex items-center justify-center shrink-0`}
                                onClick={() => toggleProjectSelection(project.id)}
                              >
                                {selectedProjectIds.includes(project.id) && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                              </div>
                            )}
                            <div className="w-[8px] h-[8px] rounded-full shrink-0" style={{ backgroundColor: project.color, opacity: project.archived ? 0.5 : 1 }} />
                            {isReadOnly ? (
                              <span className={`text-[14px] font-normal truncate ${project.archived ? 'line-through text-[#999]' : 'text-[#333]'}`}>
                                {project.name}
                              </span>
                            ) : (
                              <Link href={`/dashboard/projects/${project.id}`} className={`text-[13px] font-normal truncate hover:underline cursor-pointer ${project.archived ? 'line-through text-[#999]' : 'text-[#333]'}`}>
                                {project.name}
                              </Link>
                            )}
                          </div>
                        </td>
                        {/* Lead */}
                        <td className="p-4 border-l border-dotted border-[#e4eaee] whitespace-nowrap">
                          <span className="text-[13px] text-[#666] font-normal">{project.lead}</span>
                        </td>
                        {/* Tracked */}
                        <td className="p-4 border-l border-dotted border-[#e4eaee] whitespace-nowrap">
                          <span className="text-[13px] text-[#666] font-normal">{project.tracked}</span>
                        </td>
                        {/* Progress */}
                        <td className="p-4 border-l border-dotted border-[#e4eaee] whitespace-nowrap">
                          <span className="text-[13px] text-[#666]">-</span>
                        </td>
                        {/* Access + actions */}
                        <td className="p-4 border-l border-dotted border-[#e4eaee] whitespace-nowrap">
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[13px] text-[#666] font-normal">{project.access}</span>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Star
                                onClick={() => toggleFavorite(project.name)}
                                className={`h-[18px] w-[18px] cursor-pointer transition-all ${favorites.includes(project.name) ? 'text-[#f5a623] fill-[#f5a623]' : 'text-[#d6e5ef] hover:text-[#f5a623]'}`}
                              />
                              {!isReadOnly && (
                                <DropdownMenu modal={false}>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      className="text-[#ccc] hover:text-[#666] transition-colors p-0.5 outline-none"
                                    >
                                      <MoreVertical className="h-[16px] w-[16px]" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-white border border-[#ddd] shadow-lg min-w-[140px] rounded-sm py-1">
                                    <DropdownMenuItem
                                      onClick={() => handleArchiveSingle(project.id)}
                                      className="px-4 py-2 text-[13px] text-[#555] cursor-pointer hover:bg-[#f0f4f8] outline-none"
                                    >
                                      {project.archived ? 'Unarchive' : 'Archive'}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
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
        </div>
      </div>
    </div>
  )
}
