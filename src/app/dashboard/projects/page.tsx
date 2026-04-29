'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Search, ChevronDown, Check, Star, Plus, X, Trash2 } from 'lucide-react'
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
  }) => Promise<void>
}

function NewProjectModal({ clients, users, onClose, onSubmit }: NewProjectModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PROJECT_COLORS[0])
  const [clientName, setClientName] = useState('')
  const [leadId, setLeadId] = useState('')
  const [billable, setBillable] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Project name is required.'); return }
    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        name: name.trim(),
        color,
        clientName: clientName || undefined,
        leadId: leadId || undefined,
        billable,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-[440px] mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e4eaee]">
          <h2 className="text-[17px] font-semibold text-[#333]">New Project</h2>
          <button onClick={onClose} className="text-[#999] hover:text-[#333] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-[#999] uppercase tracking-widest">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              className="w-full px-3 py-2 text-[15px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4]"
            />
          </div>

          {/* Color */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#999] uppercase tracking-widest">Color</label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-[#03a9f4]' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Client */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-[#999] uppercase tracking-widest">Client</label>
            <select
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 text-[15px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4] bg-white"
            >
              <option value="">— No client —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Lead */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-[#999] uppercase tracking-widest">Project Lead</label>
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full px-3 py-2 text-[15px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4] bg-white"
            >
              <option value="">— No lead —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Billable */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBillable(!billable)}
                className={`w-10 h-5 rounded-full transition-colors relative ${billable ? 'bg-[#03a9f4]' : 'bg-[#ccc]'}`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${billable ? 'translate-x-5' : 'translate-x-0.5'}`}
                />
              </button>
              <span className="text-[15px] text-[#666]">Billable</span>
            </div>
          </div>

          {error && <p className="text-[13px] text-red-500">{error}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" onClick={onClose} variant="outline" className="text-[#666] border-[#c6d2d9] hover:bg-[#f2f6f8]">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-[#03a9f4] hover:bg-[#0288d1] text-white">
              {saving ? 'Creating…' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const { projects: storeProjects, users, clients, timeEntries, addProject, updateProjects, deleteProject } = useDataStore()
  const { user } = useAuthStore()
  const isReadOnly = user?.role === 'member'

  const [showNewModal, setShowNewModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Derived leads from store
  const leadItems = useMemo(() => users.map(u => ({ id: u.id, name: u.name, status: 'active' })), [users])
  const clientItems = useMemo(() => clients.map(c => ({ id: c.id, name: c.name })), [clients])

  const groupItems = [
    { name: 'Engineering', status: 'active' },
    { name: 'Design', status: 'active' },
    { name: 'Sales', status: 'active' }
  ]

  const [statusFilter, setStatusFilter] = useState('Active')

  // Advanced Filter States
  const [leadSearchQuery, setLeadSearchQuery] = useState('')
  const [selectedLeadNames, setSelectedLeadNames] = useState<string[]>([])
  const [includeWithoutLead, setIncludeWithoutLead] = useState(false)
  const [accessSearchQuery, setAccessSearchQuery] = useState('')
  const [selectedAccessGroups, setSelectedAccessGroups] = useState<string[]>([])
  const [selectedAccessUsers, setSelectedAccessUsers] = useState<string[]>([])
  const [selectedBillingStatuses, setSelectedBillingStatuses] = useState<string[]>([])
  const [nameSearchQuery, setNameSearchQuery] = useState('')
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])
  const [favorites, setFavorites] = useState<string[]>([])

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

  const [displayProjects, setDisplayProjects] = useState(fullProjects)
  useEffect(() => setDisplayProjects(fullProjects), [fullProjects])

  const handleApplyFilter = () => {
    const filtered = fullProjects.filter(p => {
      const matchesStatus = statusFilter === 'All' ||
        (statusFilter === 'Active' && !p.archived) ||
        (statusFilter === 'Archived' && p.archived)

      const matchesLead = selectedLeadNames.length === 0 ||
        selectedLeadNames.includes(p.lead) ||
        (includeWithoutLead && (p.lead === '-' || !p.lead))

      // Use real billable field
      let matchesBilling = true
      if (selectedBillingStatuses.length > 0) {
        matchesBilling =
          (selectedBillingStatuses.includes('Billable') && p.billable) ||
          (selectedBillingStatuses.includes('Non billable') && !p.billable)
      }

      const matchesName = !nameSearchQuery || p.name.toLowerCase().includes(nameSearchQuery.toLowerCase())

      return matchesStatus && matchesLead && matchesBilling && matchesName
    })
    setDisplayProjects(filtered)
  }

  const handleClearFilters = () => {
    setStatusFilter('Active')
    setSelectedLeadNames([])
    setIncludeWithoutLead(false)
    setSelectedAccessGroups([])
    setSelectedAccessUsers([])
    setSelectedBillingStatuses([])
    setNameSearchQuery('')
    setDisplayProjects(fullProjects)
  }

  const hasActiveFilters = statusFilter !== 'Active' ||
    selectedLeadNames.length > 0 ||
    includeWithoutLead ||
    selectedAccessGroups.length > 0 ||
    selectedAccessUsers.length > 0 ||
    selectedBillingStatuses.length > 0 ||
    nameSearchQuery !== ''

  const toggleFavorite = (projectName: string) => {
    setFavorites(prev => prev.includes(projectName) ? prev.filter(n => n !== projectName) : [...prev, projectName])
  }

  const [sortKey, setSortKey] = useState<string>('NAME')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isLeadStatusFilterOpen, setIsLeadStatusFilterOpen] = useState(false)
  const [isAccessStatusFilterOpen, setIsAccessStatusFilterOpen] = useState(false)
  const [leadStatusFilter, setLeadStatusFilter] = useState('Active')
  const [accessStatusFilter, setAccessStatusFilter] = useState('Active')

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

  const sortedProjects = [...displayProjects].sort((a, b) => {
    if (sortKey === 'NAME') return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    if (sortKey === 'PROJECT LEAD') return sortOrder === 'asc' ? a.lead.localeCompare(b.lead) : b.lead.localeCompare(a.lead)
    if (sortKey === 'TRACKED') {
      const parseH = (s: string) => parseFloat(s.replace(/[^0-9.]/g, '')) || 0
      return sortOrder === 'asc' ? parseH(a.tracked) - parseH(b.tracked) : parseH(b.tracked) - parseH(a.tracked)
    }
    if (sortKey === 'ACCESS') return sortOrder === 'asc' ? a.access.localeCompare(b.access) : b.access.localeCompare(a.access)
    return 0
  })

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

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Delete this project? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await deleteProject(id)
    } finally {
      setDeletingId(null)
    }
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
          onSubmit={(data) => addProject({ ...data, members: [], archived: false })}
        />
      )}

      {/* Header */}
      <div className="w-full px-5 pt-4 pb-2 relative z-50 flex items-center justify-between">
        <h1 className="text-lg text-[#333333] font-normal">Projects</h1>
        {!isReadOnly && (
          <Button
            onClick={() => setShowNewModal(true)}
            className="bg-[#03a9f4] hover:bg-[#0288d1] text-white flex items-center gap-1.5 text-[13px] font-bold tracking-widest uppercase h-9 px-4 rounded-sm shadow"
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
              <div className="flex bg-white border border-[#e4eaee] items-center h-[64px] rounded-md shadow-sm text-[15px] px-2">
                <div className="flex items-center pl-4 pr-3 h-full">
                  <span className="text-[13px] font-bold text-[#999999] uppercase tracking-widest">Filter</span>
                </div>

                <div className="h-8 w-[1px] border-l border-dotted border-[#c6d2d9]" />
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="flex items-center px-4 h-full cursor-pointer text-[#666666] outline-none hover:text-[#333] data-[state=open]:text-[#03a9f4]">
                    <span>{statusFilter}</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[160px] bg-white rounded-sm shadow-xl border border-[#e4eaee] py-1 z-[200]">
                    {['Active', 'Archived', 'All'].map(s => (
                      <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)} className="py-2.5 px-4 cursor-pointer text-gray-700 text-[15px] focus:bg-[#eaf4fb] transition-colors">{s}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-8 w-[1px] border-l border-dotted border-[#c6d2d9]" />
                {/* Project Lead Dropdown */}
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="flex items-center px-4 h-full cursor-pointer text-[#666666] outline-none hover:text-[#333] data-[state=open]:text-[#03a9f4] relative">
                    <span>Project Lead</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                    {(selectedLeadNames.length + (includeWithoutLead ? 1 : 0)) > 0 && (
                      <div className="absolute top-[4px] right-[6px] bg-[#03a9f4] text-white text-[10px] h-[18px] min-w-[18px] px-1 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                        {selectedLeadNames.length + (includeWithoutLead ? 1 : 0)}
                      </div>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[300px] p-0 bg-white shadow-2xl border border-[#e4eaee] z-[200]">
                    <div className="p-3 border-b border-[#e4eaee]">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
                        <input type="text" placeholder="Search Project Lead" value={leadSearchQuery} onChange={(e) => setLeadSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-[7px] text-[15px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4]" />
                      </div>
                    </div>
                    <div className="flex flex-col border-b border-[#e4eaee]">
                      <div className="flex items-center justify-between px-4 py-[11px] cursor-pointer hover:bg-[#fcfdfe]" onClick={(e) => { e.stopPropagation(); setIsLeadStatusFilterOpen(!isLeadStatusFilterOpen) }}>
                        <span className="text-[13px] font-bold text-[#999] uppercase tracking-widest">Show</span>
                        <div className="flex items-center gap-1 text-[15px] text-[#666]">
                          {leadStatusFilter} <ChevronDown className={`h-3.5 w-3.5 text-[#999] transition-transform ${isLeadStatusFilterOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      {isLeadStatusFilterOpen && (
                        <div className="bg-[#fcfdfe] py-1 border-t border-[#e4eaee]/50">
                          {['Active & Archived', 'Active', 'Archived'].map(opt => (
                            <div key={opt} onClick={(e) => { e.stopPropagation(); setLeadStatusFilter(opt); setIsLeadStatusFilterOpen(false) }} className={`py-2 px-10 text-[15px] cursor-pointer transition-colors ${leadStatusFilter === opt ? 'bg-[#eaf4fb] text-[#333]' : 'text-[#666] hover:bg-[#eaf4fb]'}`}>{opt}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="max-h-[220px] overflow-y-auto py-2 scrollbar-hide text-[15px]">
                      {!leadSearchQuery && (
                        <>
                          <div className="flex items-center px-4 py-2 cursor-pointer hover:bg-[#eaf4fb] transition-colors text-[#666]" onClick={toggleAllLeads}>
                            <div className={`w-[14px] h-[14px] border ${allVisibleLeadsSelected ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-gray-300'} rounded-[2px] mr-3 flex items-center justify-center`}>
                              {allVisibleLeadsSelected && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                            </div>
                            Select all
                          </div>
                          <div className="flex items-center px-4 py-2 cursor-pointer hover:bg-[#eaf4fb] transition-colors text-[#666]" onClick={toggleWithoutLead}>
                            <div className={`w-[14px] h-[14px] border ${includeWithoutLead ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-gray-300'} rounded-[2px] mr-3 flex items-center justify-center`}>
                              {includeWithoutLead && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                            </div>
                            Without Project Lead
                          </div>
                        </>
                      )}
                      {filteredLeads.map(lead => (
                        <div key={lead.name} className="flex items-center px-4 py-2 cursor-pointer hover:bg-[#eaf4fb] transition-colors text-[#666]" onClick={() => toggleLead(lead.name)}>
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
                  <DropdownMenuTrigger className="flex items-center px-4 h-full cursor-pointer text-[#666666] outline-none hover:text-[#333] data-[state=open]:text-[#03a9f4] relative">
                    <span>Access</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                    {(selectedAccessGroups.length + selectedAccessUsers.length) > 0 && (
                      <div className="absolute top-[4px] right-[6px] bg-[#03a9f4] text-white text-[10px] h-[18px] min-w-[18px] px-1 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                        {selectedAccessGroups.length + selectedAccessUsers.length}
                      </div>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[300px] p-0 bg-white shadow-2xl border border-[#e4eaee] z-[200]">
                    <div className="p-3 border-b border-[#e4eaee]">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
                        <input type="text" placeholder="Search users or groups" value={accessSearchQuery} onChange={(e) => setAccessSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-[7px] text-[15px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4]" />
                      </div>
                    </div>
                    <div className="flex flex-col border-b border-[#e4eaee]">
                      <div className="flex items-center justify-between px-4 py-[11px] cursor-pointer hover:bg-[#fcfdfe]" onClick={(e) => { e.stopPropagation(); setIsAccessStatusFilterOpen(!isAccessStatusFilterOpen) }}>
                        <span className="text-[13px] font-bold text-[#999] uppercase tracking-widest">Show</span>
                        <div className="flex items-center gap-1 text-[15px] text-[#666]">
                          {accessStatusFilter} <ChevronDown className={`h-3.5 w-3.5 text-[#999] transition-transform ${isAccessStatusFilterOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      {isAccessStatusFilterOpen && (
                        <div className="bg-[#fcfdfe] py-1 border-t border-[#e4eaee]/50">
                          {['All', 'Active', 'Inactive'].map(opt => (
                            <div key={opt} onClick={(e) => { e.stopPropagation(); setAccessStatusFilter(opt); setIsAccessStatusFilterOpen(false) }} className={`py-2 px-10 text-[15px] cursor-pointer transition-colors ${accessStatusFilter === opt ? 'bg-[#eaf4fb] text-[#333]' : 'text-[#666] hover:bg-[#eaf4fb]'}`}>{opt}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="max-h-[280px] overflow-y-auto py-2 scrollbar-hide text-[15px]">
                      <div className="px-4 py-2 pt-3 uppercase text-[13px] font-bold text-[#999] tracking-widest">Groups</div>
                      {filteredGroups.map(group => (
                        <div key={group.name} className="flex items-center px-4 py-2 cursor-pointer hover:bg-[#eaf4fb] transition-colors text-[#666]" onClick={() => toggleAccessGroup(group.name)}>
                          <div className={`w-[14px] h-[14px] border ${selectedAccessGroups.includes(group.name) ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-gray-300'} rounded-[2px] mr-3 flex items-center justify-center`}>
                            {selectedAccessGroups.includes(group.name) && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                          </div>
                          {group.name}
                        </div>
                      ))}
                      <div className="px-4 py-2 pt-4 uppercase text-[13px] font-bold text-[#999] tracking-widest">Users</div>
                      {filteredAccessUsers.map(user => (
                        <div key={user.id} className="flex items-center px-4 py-2 cursor-pointer hover:bg-[#eaf4fb] transition-colors text-[#666]" onClick={() => toggleAccessUser(user.name)}>
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
                  <DropdownMenuTrigger className="flex items-center px-4 h-full cursor-pointer text-[#666666] outline-none hover:text-[#333] data-[state=open]:text-[#03a9f4] relative">
                    <span>Billing</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                    {selectedBillingStatuses.length > 0 && (
                      <div className="absolute top-[4px] right-[6px] bg-[#03a9f4] text-white text-[10px] h-[18px] min-w-[18px] px-1 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                        {selectedBillingStatuses.length}
                      </div>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[180px] p-0 py-2 bg-white shadow-2xl border border-[#e4eaee] z-[200]">
                    {['Billable', 'Non billable'].map(status => (
                      <div key={status} className="flex items-center px-4 py-2 cursor-pointer hover:bg-[#eaf4fb] transition-colors text-[#666]" onClick={() => toggleBilling(status)}>
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
                  <Button onClick={handleApplyFilter} className="bg-[#03a9f4] hover:bg-[#0288d1] text-[13px] font-bold tracking-widest px-4 h-8 rounded-sm shadow-md uppercase text-white transition-all">APPLY FILTER</Button>
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end pr-1 py-3 -mt-2">
                <button onClick={handleClearFilters} className="text-[#03a9f4] hover:underline text-[15px] font-medium transition-all">Clear filters</button>
              </div>
            )}

            {/* Table */}
            <div className="relative z-0">
              <div className="bg-white border border-[#e4eaee] rounded-md shadow-sm overflow-hidden relative">
                <table className="border-collapse table-fixed w-full">
                  <thead>
                    <tr className="bg-[#f0f7fb] border-b border-[#d6e5ef]">
                      <th colSpan={6} className="p-4 py-[14px] text-[16px] text-[#5c7b91] font-bold uppercase tracking-tight text-left">
                        Projects
                      </th>
                    </tr>
                    <tr className="border-b border-[#e4eaee] text-left select-none bg-white">
                      {!isReadOnly && (
                        <th className="w-[42px] pl-5 pr-6 py-3">
                          <div className={`w-[14px] h-[14px] border ${allVisibleProjectsSelected ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-gray-300'} rounded-[2px] cursor-pointer flex items-center justify-center`} onClick={toggleSelectAllProjects}>
                            {allVisibleProjectsSelected && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                          </div>
                        </th>
                      )}
                      {isReadOnly && <th className="w-[42px]" />}
                      {[
                        { label: 'NAME', width: '35%' },
                        { label: 'PROJECT LEAD', width: '20%' },
                        { label: 'TRACKED', width: '12%' },
                        { label: 'PROGRESS', width: '13%' },
                        { label: 'ACCESS', width: '15%' }
                      ].map((col) => (
                        <th
                          key={col.label}
                          style={{ width: col.width }}
                          className="p-4 py-3 text-[16px] font-normal uppercase tracking-widest cursor-pointer text-[#666] transition-colors"
                          onClick={() => handleSort(col.label)}
                        >
                          <div className="flex items-center">
                            {col.label}
                            {!isReadOnly && col.label === 'NAME' && selectedProjectIds.length > 0 && (
                              <div className="flex items-center ml-4 gap-3">
                                <button className="text-[#03a9f4] text-[12px] font-bold normal-case hover:underline">Bulk Edit</button>
                                <button onClick={handleArchiveProjects} className="text-[#03a9f4] text-[12px] font-bold normal-case hover:underline">Archive</button>
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
                        <td colSpan={6} className="py-16 text-center text-[#999] text-[15px]">No projects found.</td>
                      </tr>
                    )}
                    {sortedProjects.map((project) => (
                      <tr key={project.id} className={`hover:bg-[#f2f6f8] group transition-colors border-b border-[#f1f4f7] ${selectedProjectIds.includes(project.id) ? 'bg-[#f0f7fb]' : ''}`}>
                        <td className="pl-5 pr-0 py-4">
                          {!isReadOnly && (
                            <div
                              className={`w-[14px] h-[14px] border ${selectedProjectIds.includes(project.id) ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-gray-300'} rounded-[2px] cursor-pointer flex items-center justify-center`}
                              onClick={() => toggleProjectSelection(project.id)}
                            >
                              {selectedProjectIds.includes(project.id) && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                            </div>
                          )}
                        </td>
                        {/* Name */}
                        <td className="p-4 pl-1 whitespace-nowrap overflow-hidden">
                          <div className="flex items-center">
                            <div className="w-[8px] h-[8px] rounded-full mr-3 shrink-0" style={{ backgroundColor: project.color }} />
                            <Link href={`/dashboard/projects/${project.id}`} className="text-[15px] text-[#333] font-normal truncate hover:underline cursor-pointer">
                              {project.name}
                            </Link>
                          </div>
                        </td>
                        {/* Lead */}
                        <td className="p-4 border-l border-dotted border-[#e4eaee] whitespace-nowrap">
                          <span className="text-[15px] text-[#666] font-normal">{project.lead}</span>
                        </td>
                        {/* Tracked */}
                        <td className="p-4 border-l border-dotted border-[#e4eaee] whitespace-nowrap">
                          <span className="text-[15px] text-[#666] font-normal">{project.tracked}</span>
                        </td>
                        {/* Progress */}
                        <td className="p-4 border-l border-dotted border-[#e4eaee] whitespace-nowrap">
                          <span className="text-[15px] text-[#666]">-</span>
                        </td>
                        {/* Access + actions */}
                        <td className="p-4 border-l border-dotted border-[#e4eaee] whitespace-nowrap">
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[15px] text-[#666] font-normal">{project.access}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="h-4 w-[1px] border-l border-[#e4eaee] mx-1" />
                              <Star
                                onClick={() => toggleFavorite(project.name)}
                                className={`h-[18px] w-[18px] cursor-pointer transition-all mt-[2px] ${favorites.includes(project.name) ? 'text-[#f5a623] fill-[#f5a623]' : 'text-[#d6e5ef] hover:text-[#f5a623]'}`}
                              />
                              {!isReadOnly && (
                                <button
                                  onClick={() => handleDeleteProject(project.id)}
                                  disabled={deletingId === project.id}
                                  className="ml-1 text-[#ccc] hover:text-red-500 transition-colors disabled:opacity-50"
                                  title="Delete project"
                                >
                                  <Trash2 className="h-[16px] w-[16px]" />
                                </button>
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
