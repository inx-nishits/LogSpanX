'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useDataStore } from '@/lib/stores/data-store'
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function TeamPage() {
  const { users } = useDataStore()
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'GROUPS'>('MEMBERS')

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(50)
  const [sortKey, setSortKey] = useState<'name' | 'email'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const handleSort = (key: 'name' | 'email') => {
    if (sortKey === key) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  // Group tab search
  const [groupTabSearch, setGroupTabSearch] = useState('')

  // Filter states
  const [statusFilter, setStatusFilter] = useState('All')
  const [appliedStatusFilter, setAppliedStatusFilter] = useState('All')
  // Group advanced filter
  const [groupSearch, setGroupSearch] = useState('')
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [appliedSelectedGroups, setAppliedSelectedGroups] = useState<string[]>([])

  const groupOptions = [
    'MEAR-Front End', 'MRN-Backend', 'Project Leads', 'Sales', 'Team BA',
    'Team Design', 'Team DevOps', 'Team Flutter', 'Team PHP', 'Team Python',
    'Team QA', 'Team React native'
  ]
  const filteredGroupOptions = groupOptions.filter(g => g.toLowerCase().includes(groupSearch.toLowerCase()))

  const toggleGroup = (group: string) => {
    setSelectedGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group])
  }
  const allGroupsSelected = filteredGroupOptions.length > 0 && filteredGroupOptions.every(g => selectedGroups.includes(g))
  const toggleAllGroups = () => {
    if (allGroupsSelected) {
      setSelectedGroups(prev => prev.filter(g => !filteredGroupOptions.includes(g)))
    } else {
      setSelectedGroups(Array.from(new Set([...selectedGroups, ...filteredGroupOptions])))
    }
  }

  // Role advanced filter
  const [roleSearch, setRoleSearch] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [appliedSelectedRoles, setAppliedSelectedRoles] = useState<string[]>([])

  const roleOptions = ['Admin', 'Owner', 'Project Manager', 'Team Manager']
  const filteredRoleOptions = roleOptions.filter(r => r.toLowerCase().includes(roleSearch.toLowerCase()))

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role])
  }
  const allRolesSelected = filteredRoleOptions.length > 0 && filteredRoleOptions.every(r => selectedRoles.includes(r))
  const toggleAllRoles = () => {
    if (allRolesSelected) {
      setSelectedRoles(prev => prev.filter(r => !filteredRoleOptions.includes(r)))
    } else {
      setSelectedRoles(Array.from(new Set([...selectedRoles, ...filteredRoleOptions])))
    }
  }

  const handleApplyFilter = () => {
    setAppliedSearch(search)
    setAppliedStatusFilter(statusFilter)
    setAppliedSelectedRoles(selectedRoles)
    setAppliedSelectedGroups(selectedGroups)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setSearch('')
    setStatusFilter('All')
    setSelectedRoles([])
    setSelectedGroups([])

    setAppliedSearch('')
    setAppliedStatusFilter('All')
    setAppliedSelectedRoles([])
    setAppliedSelectedGroups([])
    setCurrentPage(1)
  }

  const hasActiveFilters = appliedSearch !== '' || appliedStatusFilter !== 'All' || appliedSelectedRoles.length > 0 || appliedSelectedGroups.length > 0

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(appliedSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(appliedSearch.toLowerCase())

    const rMatches = appliedSelectedRoles.map(r => r.toLowerCase())
    const matchesRole = appliedSelectedRoles.length === 0 ||
      rMatches.includes(u.role) ||
      (rMatches.includes('project manager') && u.projectManager) ||
      (rMatches.includes('team manager') && u.role === 'admin') // mapping for demo

    const matchesGroup = appliedSelectedGroups.length === 0 ||
      (u.group && appliedSelectedGroups.includes(u.group))

    const matchesStatus = appliedStatusFilter === 'All' || u.status === appliedStatusFilter.toLowerCase()

    return matchesSearch && matchesRole && matchesGroup && matchesStatus
  })

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const valA = (sortKey === 'name' ? a.name : a.email).toLowerCase()
    const valB = (sortKey === 'name' ? b.name : b.email).toLowerCase()
    return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
  })

  const totalItems = sortedUsers.length
  const paginatedUsers = sortedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const SortIndicator = ({ active, order }: { active: boolean, order: 'asc' | 'desc' }) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ml-1"
      >
        <path
          d="m7 9 5-5 5 5"
          className={`transition-all duration-300 ${active && order === 'asc' ? 'text-[#333] opacity-100' : 'text-[#999] opacity-30'}`}
        />
        <path
          d="m7 15 5 5 5-5"
          className={`transition-all duration-300 ${active && order === 'desc' ? 'text-[#333] opacity-100' : 'text-[#999] opacity-30'}`}
        />
      </svg>
    );
  };

  const SectionBar = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <div className="bg-[#f0f7fb] px-4 py-[14px] border-b border-[#d6e5ef] flex items-center justify-between">
      <span className="text-[14px] font-bold text-[#5c7b91] uppercase tracking-tight">{title}</span>
      {children}
    </div>
  )

  return (
    <div className="min-h-full flex flex-col bg-[#f2f6f8] overflow-hidden font-sans antialiased">
      {/* Page Title synchronized with Projects Dashboard */}
      <div className="w-full px-5 pt-4 pb-2 relative z-50">
        <h1 className="text-lg text-[#333333] font-normal">Team</h1>
      </div>

      <div className="w-full pl-5 pt-0 pb-0 pr-5 shrink-0">
        {/* Overlapping Tabs */}
        <div className="flex items-center gap-1.5 h-[44px] mt-4">
          {['MEMBERS', 'GROUPS'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 h-full text-[11px] font-bold tracking-widest rounded-t-[4px] transition-all uppercase border-t border-x ${activeTab === tab ? 'bg-white border-[#e4eaee] text-[#333] relative z-20 shadow-none' : 'bg-[#e4eaee] border-transparent text-[#999] hover:bg-[#d8e0e5] mb-[1px]'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 pl-5 pr-5 pb-8 bg-[#f2f6f8] overflow-auto">
        <div className="bg-white border border-[#e4eaee] rounded-md relative z-10 -mt-[1px] min-h-full flex flex-col shadow-sm">

          {/* Filtering Area */}
          {activeTab === 'MEMBERS' && (
            <div className="p-5">
              <div className="flex items-center border border-[#e4eaee] bg-white h-[56px] rounded-[2px]">
                <div className="flex items-center flex-1 h-full px-5">
                  <span className="text-[11px] font-bold text-[#999] uppercase tracking-widest mr-5">FILTER</span>

                  <div className="flex items-center h-full">
                    <div className="h-6 w-[1px] border-l border-dotted border-[#c6d2d9] mr-2" />
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger className="flex items-center gap-2 px-3 h-full text-[13px] text-[#666] outline-none hover:text-[#333] data-[state=open]:text-[#03a9f4]">
                        {statusFilter} <ChevronDown className="h-3.5 w-3.5 text-[#999]" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[150px] p-0 py-1 shadow-xl bg-white border border-[#e4eaee] z-50 rounded-sm">
                        {['Active', 'Inactive', 'All', 'Invited'].map(opt => (
                          <DropdownMenuItem
                            key={opt}
                            onClick={() => setStatusFilter(opt)}
                            className="py-2 px-4 cursor-pointer text-[13px] text-[#666] transition-colors focus:bg-[#eaf4fb] hover:bg-[#eaf4fb]"
                          >
                            {opt}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-6 w-[1px] border-l border-dotted border-[#c6d2d9] mx-2" />
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger className="flex items-center gap-2 px-3 h-full text-[13px] text-[#666] outline-none hover:text-[#333] data-[state=open]:text-[#03a9f4] relative">
                        <span>Role</span> <ChevronDown className="h-3.5 w-3.5 text-[#999]" />
                        {selectedRoles.length > 0 && (
                          <div className="absolute top-[4px] right-[6px] bg-[#03a9f4] text-white text-[10px] h-[18px] min-w-[18px] px-1 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                            {selectedRoles.length}
                          </div>
                        )}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[280px] p-0 bg-white shadow-2xl border border-[#e4eaee] z-50 rounded-sm">
                        <div className="p-3 border-b border-[#e4eaee]">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
                            <input
                              type="text"
                              placeholder="Search Role"
                              value={roleSearch}
                              onChange={(e) => setRoleSearch(e.target.value)}
                              className="w-full pl-9 pr-3 py-[7px] text-[13px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4]"
                            />
                          </div>
                        </div>
                        <div className="max-h-[220px] overflow-y-auto py-2 scrollbar-hide text-[13px]">
                          {!roleSearch && (
                            <div className="flex items-center px-4 py-2 cursor-pointer hover:bg-[#eaf4fb] transition-colors text-[#666]" onClick={toggleAllRoles}>
                              <div className={`w-[14px] h-[14px] border ${allRolesSelected ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-gray-300'} rounded-[2px] mr-3 flex items-center justify-center`}>
                                {allRolesSelected && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                              </div>
                              Select all
                            </div>
                          )}
                          <div className="px-4 py-2 pt-3 pb-1 uppercase text-[11px] font-bold text-[#999] tracking-widest">ROLE</div>
                          {filteredRoleOptions.map(role => (
                            <div key={role} className="flex items-center px-4 py-2 cursor-pointer hover:bg-[#eaf4fb] transition-colors text-[#666]" onClick={() => toggleRole(role)}>
                              <div className={`w-[14px] h-[14px] border ${selectedRoles.includes(role) ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-gray-300'} rounded-[2px] mr-3 flex items-center justify-center`}>
                                {selectedRoles.includes(role) && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                              </div>
                              {role}
                            </div>
                          ))}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-6 w-[1px] border-l border-dotted border-[#c6d2d9] mx-2" />
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger className="flex items-center gap-2 px-3 h-full text-[13px] text-[#666] outline-none hover:text-[#333] data-[state=open]:text-[#03a9f4] relative">
                        <span>Group</span> <ChevronDown className="h-3.5 w-3.5 text-[#999]" />
                        {selectedGroups.length > 0 && (
                          <div className="absolute top-[4px] right-[6px] bg-[#03a9f4] text-white text-[10px] h-[18px] min-w-[18px] px-1 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                            {selectedGroups.length}
                          </div>
                        )}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[280px] p-0 bg-white shadow-2xl border border-[#e4eaee] z-50 rounded-sm">
                        <div className="p-3 border-b border-[#e4eaee]">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
                            <input
                              type="text"
                              placeholder="Search Group"
                              value={groupSearch}
                              onChange={(e) => setGroupSearch(e.target.value)}
                              className="w-full pl-9 pr-3 py-[7px] text-[13px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4]"
                            />
                          </div>
                        </div>
                        <div className="max-h-[280px] overflow-y-auto py-2 scrollbar-hide text-[13px]">
                          {!groupSearch && (
                            <div className="flex items-center px-4 py-2 cursor-pointer hover:bg-[#eaf4fb] transition-colors text-[#666]" onClick={toggleAllGroups}>
                              <div className={`w-[14px] h-[14px] border ${allGroupsSelected ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-gray-300'} rounded-[2px] mr-3 flex items-center justify-center`}>
                                {allGroupsSelected && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                              </div>
                              Select all
                            </div>
                          )}
                          <div className="px-4 py-2 pt-3 pb-1 uppercase text-[11px] font-bold text-[#999] tracking-widest">GROUP</div>
                          {filteredGroupOptions.map(group => (
                            <div key={group} className="flex items-center px-4 py-2 cursor-pointer hover:bg-[#eaf4fb] transition-colors text-[#666]" onClick={() => toggleGroup(group)}>
                              <div className={`w-[14px] h-[14px] border ${selectedGroups.includes(group) ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-gray-300'} rounded-[2px] mr-3 flex items-center justify-center`}>
                                {selectedGroups.includes(group) && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                              </div>
                              {group}
                            </div>
                          ))}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex items-center pr-5 gap-3 h-full py-2.5">
                  <div className="w-[240px] flex items-center bg-white border border-[#c6d2d9] rounded-[2px] h-full focus-within:border-[#03a9f4] relative z-0 group">
                    <div className="px-3 h-full flex items-center">
                      <Search className="h-4 w-4 text-[#999]" />
                    </div>
                    <input
                      placeholder="Search by name or email"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="flex-1 pr-3 text-[13px] text-[#333] outline-none placeholder:text-[#999] bg-transparent h-full"
                    />
                  </div>
                  <button onClick={handleApplyFilter} className="bg-[#03a9f4] hover:bg-[#0288d1] text-[11px] font-bold tracking-widest px-4 h-8 rounded-sm shadow-md uppercase text-white transition-all">
                    APPLY FILTER
                  </button>
                </div>
              </div>
              {hasActiveFilters && (
                <div className="flex justify-end pt-4 pr-1">
                  <button onClick={handleClearFilters} className="text-[#03a9f4] hover:underline text-[13px] font-medium transition-all">Clear filters</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'GROUPS' && (
            <div className="p-5">
              <div className="relative w-full max-w-[380px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
                <input
                  type="text"
                  placeholder="Search by username or group name"
                  value={groupTabSearch}
                  onChange={(e) => setGroupTabSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-[9px] text-[13px] border border-[#c6d2d9] rounded-[2px] outline-none focus:border-[#03a9f4] placeholder:text-[#999]"
                />
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div className="flex-1 flex flex-col px-5 pb-5 pt-0">
            {activeTab === 'MEMBERS' && (
              <div className="flex flex-col">
                <div className="border border-[#e4eaee] rounded-[2px] bg-white flex flex-col">
                  <SectionBar title="Members" />
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left border-b border-[#e4eaee] bg-white">
                        <th className="p-4 py-3 text-[12px] font-normal text-[#666] uppercase tracking-widest w-1/4 cursor-pointer select-none" onClick={() => handleSort('name')}>
                          <div className="flex items-center">NAME <SortIndicator active={sortKey === 'name'} order={sortOrder} /></div>
                        </th>
                        <th className="p-4 py-3 text-[12px] font-normal text-[#666] uppercase tracking-widest w-1/4 cursor-pointer select-none" onClick={() => handleSort('email')}>
                          <div className="flex items-center">EMAIL <SortIndicator active={sortKey === 'email'} order={sortOrder} /></div>
                        </th>
                        <th className="p-4 py-3 text-[12px] font-normal text-[#666] uppercase tracking-widest w-1/4">ROLE</th>
                        <th className="p-4 py-3 text-[12px] font-normal text-[#666] uppercase tracking-widest w-1/4">GROUP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f4f7]">
                      {paginatedUsers.map((member) => (
                        <tr key={member.id} className="hover:bg-[#f9fafb] transition-colors group text-[13px]">
                          <td className="p-4 py-3 align-top border-r border-dotted border-[#d6e5ef]">
                            <span className={member.status === 'inactive' ? 'line-through text-[#999]' : 'text-[#333]'}>
                              {member.name || '(not joined yet)'}
                            </span>
                          </td>
                          <td className="p-4 py-3 align-top border-r border-dotted border-[#d6e5ef]">
                            <span className="text-[#999] hover:text-[#03a9f4] cursor-pointer transition-colors break-all">
                              {member.email}
                            </span>
                          </td>
                          <td className="p-4 py-3 align-top border-r border-dotted border-[#d6e5ef]">
                            <div className="flex flex-wrap gap-1.5">
                              {member.role === 'owner' && (
                                <span className="px-2 py-0.5 text-[12px] rounded-[2px] bg-[#03a9f4] text-white">
                                  Owner
                                </span>
                              )}
                              {member.projectManager && (
                                <span className="px-2 py-0.5 text-[12px] rounded-[2px] border bg-[#eaf4fb] text-[#03a9f4] border-[#cce5f7]">
                                  Project Manager
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 py-3 align-top">
                            {member.group && (
                              <span className="px-2 py-0.5 text-[12px] rounded-[2px] border bg-[#eaf4fb] text-[#03a9f4] border-[#cce5f7]">
                                {member.group}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalItems > 0 && !appliedSearch && (
                  <div className="pt-6 flex items-center justify-start gap-3 pb-4">
                    <div className="flex items-center border border-[#e4eaee] rounded-[2px] h-8 bg-white shadow-none">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-2 border-r border-[#e4eaee] h-full hover:bg-gray-50 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className={`h-4 w-4 ${currentPage === 1 ? 'text-gray-200' : 'text-[#666]'}`} />
                      </button>
                      <div className="px-4 text-[13px] text-[#666] select-none min-w-[100px] text-center">
                        {startItem}-{endItem} of {totalItems}
                      </div>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalItems / itemsPerPage), p + 1))}
                        disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
                        className="px-2 border-l border-[#e4eaee] h-full hover:bg-gray-50 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className={`h-4 w-4 ${currentPage >= Math.ceil(totalItems / itemsPerPage) ? 'text-gray-200' : 'text-[#666]'}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 h-8">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger className="px-3 border border-[#e4eaee] rounded-[2px] h-full flex items-center gap-2 hover:bg-gray-50 outline-none focus:ring-0">
                          <span className="text-[13px] text-[#666]">{itemsPerPage}</span>
                          <ChevronDown className="h-3.5 w-3.5 text-[#999]" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[80px] p-0 shadow-xl bg-white border border-[#e4eaee] z-50">
                          {[50, 100, 200].map(opt => (
                            <DropdownMenuItem
                              key={opt}
                              onClick={() => { setItemsPerPage(opt); setCurrentPage(1); }}
                              className={`py-2 px-4 cursor-pointer text-[13px] focus:bg-[#eaf4fb] ${itemsPerPage === opt ? 'bg-[#f0f3f5]' : ''}`}
                            >
                              {opt}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <span className="text-[13px] text-[#999]">Items per page</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'GROUPS' && (() => {
              const allGroups = ['MEAR-Front End', 'MRN-Backend', 'Project Leads', 'Sales', 'Team BA', 'Team Design', 'Team DevOps', 'Team Flutter', 'Team PHP', 'Team Python', 'Team QA', 'Team React native']
              const filteredGroups = allGroups.filter(g => g.toLowerCase().includes(groupTabSearch.toLowerCase()))
              return (
                <div className="border border-[#e4eaee] rounded-[2px] bg-white flex flex-col">
                  <SectionBar title="Groups" />
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left border-b border-[#e4eaee] bg-white">
                        <th className="p-4 py-3 text-[12px] font-normal text-[#666] uppercase tracking-widest w-1/2">NAME</th>
                        <th className="p-4 py-3 text-[12px] font-normal text-[#666] uppercase tracking-widest">MEMBERS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f4f7]">
                      {filteredGroups.map(group => {
                        const members = users.filter(u => u.group === group)
                        const membersList = members.map(m => m.name || m.email).join(', ')
                        return (
                          <tr key={group} className="hover:bg-[#f9fafb] transition-colors text-[13px]">
                            <td className="p-4 py-3 text-[#333] font-medium border-r border-dotted border-[#d6e5ef]">{group}</td>
                            <td className="p-4 py-3">
                              <div className="flex relative group/tooltip w-max max-w-[600px]">
                                {members.length === 0 ? (
                                  <span className="text-[#999]">No members</span>
                                ) : (
                                  <>
                                    <span
                                      className="block px-2 py-0.5 text-[12px] rounded-[2px] border bg-[#eaf4fb] text-[#03a9f4] border-[#cce5f7] truncate cursor-default w-full"
                                    >
                                      {membersList}
                                    </span>
                                    {/* Custom Tooltip */}
                                    <div className="absolute left-0 top-full mt-2 hidden group-hover/tooltip:block w-max max-w-[400px] bg-gray-900 text-white text-xs rounded px-3 py-2 z-[60] shadow-lg whitespace-normal leading-relaxed">
                                      {membersList}
                                      {/* Tooltip Triangle */}
                                      <div className="absolute bottom-full left-4 w-0 h-0 border-l-[5px] border-r-[5px] border-b-[5px] border-l-transparent border-r-transparent border-b-gray-900"></div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
