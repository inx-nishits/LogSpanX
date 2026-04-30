'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useDataStore } from '@/lib/stores/data-store'
import {
  Search,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  PlusCircle,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { X, Filter, Check } from 'lucide-react'
import { canInviteMembers, canChangeUserRole, canDeleteUser } from '@/lib/rbac'
import { FilterDropdown } from '../reports/summary/filter-dropdown'

const STATUS_ITEMS = [
  { id: 'Active', label: 'Active' },
  { id: 'Inactive', label: 'Inactive' }
]

const BILLABLE_RATE_ITEMS = [
  { id: 'Hidden', label: 'Hidden' },
  { id: 'Visible', label: 'Visible' }
]

const ROLE_ITEMS = [
  { id: 'Admin', label: 'Admin' },
  { id: 'Owner', label: 'Owner' },
  { id: 'User', label: 'User' },
  { id: 'Project Manager', label: 'Project Manager' }
]

const GROUP_ITEMS = [
  { id: 'Engineering', label: 'Engineering' },
  { id: 'Design', label: 'Design' },
  { id: 'Marketing', label: 'Marketing' },
  { id: 'MEAR-Front End', label: 'MEAR-Front End' },
  { id: 'Team Flutter', label: 'Team Flutter' },
  { id: 'Quality Assurance', label: 'Quality Assurance' }
]

const ALL_TEAM_FILTER_KEYS = ['Status', 'Billable rate', 'Role', 'Group'] as const
type TeamFilterKey = typeof ALL_TEAM_FILTER_KEYS[number]

function TeamFilterVisibilityDropdown({ visible, onChange }: { visible: TeamFilterKey[], onChange: (v: TeamFilterKey[]) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const toggle = (key: TeamFilterKey) =>
    onChange(visible.includes(key) ? visible.filter(k => k !== key) : [...visible, key])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-[14px] text-[#555] hover:text-[#333] cursor-pointer pr-4"
      >
        <Filter className="h-3.5 w-3.5" /> FILTER <ChevronDown className="h-3 w-3 text-[#aaa]" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-[#e4eaee] shadow-lg z-[300] min-w-[200px] py-1">
          {ALL_TEAM_FILTER_KEYS.map(key => (
            <div
              key={key}
              onClick={() => toggle(key)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-[#f5f7f9] cursor-pointer"
            >
              <div className={cn(
                'w-[16px] h-[16px] border flex items-center justify-center flex-shrink-0 transition-colors',
                visible.includes(key) ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-[#ccc] bg-white'
              )}>
                {visible.includes(key) && <Check className="h-2.5 w-2.5 text-white stroke-[3px]" />}
              </div>
              <span className="text-[14px] text-[#333]">{key}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TeamPage() {
  const { user } = useAuthStore()
  const { users, groups: storeGroups } = useDataStore()
  // TEAM_MEMBER is read-only; ADMIN and TEAM_LEAD can manage
  const isReadOnly = user?.role === 'member'
  const canInvite = user ? canInviteMembers(user.role) : false
  const canChangeRole = user ? canChangeUserRole(user.role) : false
  const canDelete = user ? canDeleteUser(user.role) : false
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'GROUPS' | 'REMINDERS'>('MEMBERS')

  // Filter states
  const [visibleFilters, setVisibleFilters] = useState<TeamFilterKey[]>([...ALL_TEAM_FILTER_KEYS])
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [roleFilter, setRoleFilter] = useState<string[]>([])
  const [billableRateFilter, setBillableRateFilter] = useState<string[]>([])
  const [groupFilter, setGroupFilter] = useState<string[]>([])

  // Modal states
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [selectedUserForRole, setSelectedUserForRole] = useState<any>(null)

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter.length === 0 ||
      (statusFilter.includes('Active') && !u.archived) ||
      (statusFilter.includes('Inactive') && u.archived)

    const matchesRole = roleFilter.length === 0 || roleFilter.some(r => u.role?.toLowerCase() === r.toLowerCase())
    
    const matchesGroup = groupFilter.length === 0 || groupFilter.some(g => u.group?.toLowerCase() === g.toLowerCase())

    return matchesSearch && matchesStatus && matchesRole && matchesGroup
  })

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

  const SectionBar = ({ title }: { title: string }) => (
    <div className="bg-[#f9fafb] px-5 py-[12px] border-b border-[#eaecf0] flex items-center justify-between">
      <span className="text-[13px] font-normal text-[#344054] uppercase tracking-[0.5px]">{title}</span>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="flex items-center gap-1.5 text-[13px] font-normal text-[#667085] hover:text-[#101828] outline-none">
          Export <ChevronDown className="h-3 w-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[120px] bg-white shadow-xl border border-[#e4eaee]">
          <DropdownMenuItem className="text-[13px] py-2 cursor-pointer font-normal text-[#344054]">CSV</DropdownMenuItem>
          <DropdownMenuItem className="text-[13px] py-2 cursor-pointer font-normal text-[#344054]">Excel</DropdownMenuItem>
          <DropdownMenuItem className="text-[13px] py-2 cursor-pointer font-normal text-[#344054]">PDF</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  return (
    <div className="min-h-full flex flex-col bg-[#f2f6f8] overflow-hidden font-sans antialiased" style={{ fontFamily: '"Inter", "Roboto", "Segoe UI", sans-serif' }}>
      {/* Page Title synchronized with Projects Dashboard */}
      <div className="w-full px-5 pt-4 pb-2 relative z-50">
        <h1 className="text-lg text-[#333333] font-normal">Team</h1>
      </div>

      <div className="w-full pl-5 pr-5 pt-0 pb-0 shrink-0">
        <div className="flex items-center justify-between mt-4">
          {/* Overlapping Tabs */}
          <div className="flex items-center gap-1.5 h-[44px]">
            {['MEMBERS', 'GROUPS', 'REMINDERS'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-8 h-full text-[13px] font-bold tracking-widest rounded-t-[4px] transition-all uppercase border-t border-x ${activeTab === tab ? 'bg-white border-[#e4eaee] text-[#333] relative z-20 shadow-none' : 'bg-[#e4eaee] border-transparent text-[#999] hover:bg-[#d8e0e5] mb-[1px]'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {canInvite && (
            <button
              onClick={() => setIsAddMemberModalOpen(true)}
              className="bg-[#03a9f4] hover:bg-[#0288d1] text-white text-[12px] font-bold py-2.5 px-6 rounded-[2px] transition-colors uppercase tracking-widest"
            >
              ADD NEW MEMBER
            </button>
          )}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 pl-5 pr-5 pb-8 bg-[#f2f6f8] overflow-auto">
        <div className="bg-white border border-[#e4eaee] relative z-10 -mt-[1px] min-h-full flex flex-col shadow-sm">

          {/* Filtering Area */}
          <div className="flex items-center px-6 h-[65px] bg-white border-b border-[#e4eaee] flex-shrink-0 relative z-50">
            <TeamFilterVisibilityDropdown visible={visibleFilters} onChange={setVisibleFilters} />

            {visibleFilters.includes('Status') && (
              <>
                <div className="w-px h-5 bg-[#e4eaee] flex-shrink-0" />
                <FilterDropdown label="Status" placeholder="Search status" items={STATUS_ITEMS} selected={statusFilter} onChange={setStatusFilter} noSearch />
              </>
            )}

            {visibleFilters.includes('Billable rate') && (
              <>
                <div className="w-px h-5 bg-[#e4eaee] flex-shrink-0" />
                <FilterDropdown label="Billable rate" placeholder="Search rates" items={BILLABLE_RATE_ITEMS} selected={billableRateFilter} onChange={setBillableRateFilter} noSearch />
              </>
            )}

            {visibleFilters.includes('Role') && (
              <>
                <div className="w-px h-5 bg-[#e4eaee] flex-shrink-0" />
                <FilterDropdown label="Role" placeholder="Search roles" items={ROLE_ITEMS} selected={roleFilter} onChange={setRoleFilter} noSearch />
              </>
            )}

            {visibleFilters.includes('Group') && (
              <>
                <div className="w-px h-5 bg-[#e4eaee] flex-shrink-0" />
                <FilterDropdown label="Group" placeholder="Search groups" items={GROUP_ITEMS} selected={groupFilter} onChange={setGroupFilter} />
              </>
            )}

            <div className="flex items-center gap-2 px-3 h-[38px] border border-[#d0d8de] rounded bg-white w-[260px] focus-within:border-[#03a9f4] transition-colors ml-4">
              <Search className="h-4 w-4 text-[#bbb] flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 text-[15px] outline-none placeholder:text-[#bbb] bg-transparent"
              />
            </div>

            <button className="ml-auto px-5 h-[32px] text-[13px] font-bold uppercase tracking-wide text-white bg-[#03a9f4] hover:bg-[#0288d1] rounded-sm cursor-pointer whitespace-nowrap">
              APPLY FILTER
            </button>
          </div>

          {/* Clear filters row */}
          {(statusFilter.length > 0 || roleFilter.length > 0 || billableRateFilter.length > 0 || groupFilter.length > 0) && (
            <div className="flex justify-end px-6 py-1.5 bg-white border-b border-[#e4eaee]">
              <button 
                onClick={() => {
                  setStatusFilter([]);
                  setRoleFilter([]);
                  setBillableRateFilter([]);
                  setGroupFilter([]);
                }} 
                className="text-[15px] text-[#03a9f4] hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Tab Content */}
          <div className="flex-1 flex flex-col overflow-auto">
            {activeTab === 'MEMBERS' && (
              <>
                {/* Stats bar matching Reports Summary style */}
                <div className="flex items-center justify-between px-6 h-[48px] bg-[#f2f6fb] border-b border-[#e4eaee] shrink-0">
                  <div className="flex items-center gap-6">
                    <span className="text-[13px] font-normal text-[#667085]">Total: <strong className="text-[#101828] font-bold tabular-nums text-[14px]">{filteredUsers.length} members</strong></span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger className="flex items-center gap-1 text-[13px] font-normal text-[#667085] hover:text-[#101828] outline-none cursor-pointer">
                          Export <ChevronDown className="h-3 w-3" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[120px] bg-white shadow-xl border border-[#e4eaee]">
                          <DropdownMenuItem className="text-[13px] py-2 cursor-pointer font-normal text-[#344054]">CSV</DropdownMenuItem>
                          <DropdownMenuItem className="text-[13px] py-2 cursor-pointer font-normal text-[#344054]">Excel</DropdownMenuItem>
                          <DropdownMenuItem className="text-[13px] py-2 cursor-pointer font-normal text-[#344054]">PDF</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left border-b border-[#e4eaee] bg-white">
                      <th className="p-4 py-4 w-[48px]">
                        <div className="w-[16px] h-[16px] border border-[#d0d5dd] rounded-[4px] bg-white" />
                      </th>
                      <th className="p-4 py-4 text-[14px] font-normal text-[#344054] tracking-[0.3px] uppercase w-[25%] cursor-pointer hover:bg-[#f9fafb]">
                        <div className="flex items-center gap-1.5">NAME <SortIndicator active={true} order="asc" /></div>
                      </th>
                      <th className="p-4 py-4 text-[14px] font-normal text-[#344054] tracking-[0.3px] uppercase w-[20%] cursor-pointer hover:bg-[#f9fafb]">
                        <div className="flex items-center gap-1.5">EMAIL <SortIndicator active={false} order="asc" /></div>
                      </th>
                      <th className="p-4 py-4 text-[14px] font-normal text-[#344054] tracking-[0.3px] uppercase w-[20%] text-center px-8">
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">BILLABLE RATE (USD) <SortIndicator active={false} order="asc" /></div>
                      </th>
                      <th className="p-4 py-4 text-[14px] font-normal text-[#344054] tracking-[0.3px] uppercase w-[15%]">ROLE</th>
                      <th className="p-4 py-4 text-[14px] font-normal text-[#344054] tracking-[0.3px] uppercase w-[15%]">GROUP</th>
                      <th className="p-4 py-4 w-[40px]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2f4f7]">
                    {filteredUsers.map((member) => (
                      <tr key={member.id} className="hover:bg-[#f9fafb] transition-colors group text-[14px] h-[72px]">
                        <td className="p-4 py-3 text-center">
                          <div className="w-[16px] h-[16px] border border-[#d0d5dd] rounded-[4px] bg-white" />
                        </td>
                        <td className="p-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-[#101828] font-normal leading-[22px]">{member.name || '(not joined yet)'}</span>
                          </div>
                        </td>
                        <td className="p-4 py-3">
                          <span className="text-[#667085] font-normal leading-[22px] hover:text-[#03a9f4] cursor-pointer transition-colors break-all">
                            {member.email}
                          </span>
                        </td>
                        <td className="p-4 py-3">
                          <div className="flex items-center justify-center">
                            <div className="flex bg-[#f9fafb] border border-[#d0d5dd] rounded-[4px] overflow-hidden w-[150px]">
                              <div className="px-3 py-2 text-[#101828] flex-1 text-center font-normal tabular-nums">
                                {member.billableRate ? member.billableRate.toFixed(2) : '-'}
                              </div>
                              <button className="bg-white px-4 py-2 text-[#03a9f4] text-[13px] font-medium border-l border-[#d0d5dd] hover:bg-gray-50 transition-colors uppercase">
                                Change
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 py-3">
                          {member.role ? (
                            <span
                              onClick={() => canChangeRole && (setSelectedUserForRole(member), setIsRoleModalOpen(true))}
                              className={cn('text-[#344054] font-normal transition-colors', canChangeRole && 'hover:text-[#03a9f4] cursor-pointer')}
                            >
                              {member.role === 'owner' ? 'Admin' : member.role === 'admin' ? 'Team Lead' : 'Team Member'}
                            </span>
                          ) : (
                            canChangeRole ? (
                              <button
                                onClick={() => { setSelectedUserForRole(member); setIsRoleModalOpen(true); }}
                                className="flex items-center gap-1.5 text-[#03a9f4] font-normal hover:underline"
                              >
                                <PlusCircle className="h-4 w-4" /> Role
                              </button>
                            ) : <span className="text-[#667085]">—</span>
                          )}
                        </td>
                        <td className="p-4 py-3">
                          {member.group ? (
                            <div className="inline-flex items-center bg-[#f2f4f7] text-[#344054] text-[13px] font-normal px-3 py-1 rounded-[4px] border border-[#d0d5dd] hover:bg-[#eaecf0] cursor-pointer transition-colors">
                              {member.group}
                              <ChevronDown className="h-3.5 w-3.5 ml-2 opacity-60" />
                            </div>
                          ) : (
                            <button className="flex items-center gap-1.5 text-[#03a9f4] font-normal hover:underline">
                              <PlusCircle className="h-4 w-4" /> Group
                            </button>
                          )}
                        </td>
                        <td className="p-4 py-3 text-center text-[#98a2b3] group-hover:text-[#667085]">
                          <MoreHorizontal className="h-5 w-5 cursor-pointer" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {activeTab === 'GROUPS' && (
              <>
                <div className="px-5 py-4 border-b border-[#e4eaee] flex items-center justify-between bg-white">
                  <div className="flex items-center bg-white border border-[#d0d5dd] rounded-[4px] h-10 w-[320px] group focus-within:border-[#03a9f4] transition-colors">
                    <div className="pl-3 pr-2 h-full flex items-center">
                      <Search className="h-4 w-4 text-[#98a2b3] group-focus-within:text-[#03a9f4]" />
                    </div>
                    <input
                      placeholder="Search by username or group name"
                      className="flex-1 text-[14px] outline-none placeholder:text-[#98a2b3] bg-transparent text-[#101828]"
                    />
                  </div>
                  {canInvite && (
                    <div className="flex items-center gap-3">
                      <div className="w-[220px] border border-[#d0d5dd] rounded-[4px] h-10 flex items-center px-3 bg-white focus-within:border-[#03a9f4] transition-colors">
                        <input placeholder="Add new group" className="w-full text-[14px] outline-none placeholder:text-[#98a2b3] text-[#101828]" />
                      </div>
                      <button className="bg-[#03a9f4] text-white px-6 h-10 text-[13px] font-normal rounded-[4px] hover:bg-[#0288d1] uppercase tracking-[0.5px] transition-colors">ADD</button>
                    </div>
                  )}
                </div>
                <SectionBar title="Groups" />
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left border-b border-[#e4eaee] bg-white">
                      <th className="p-4 py-4 w-[48px]">
                        <div className="w-[16px] h-[16px] border border-[#d0d5dd] rounded-[4px] bg-white" />
                      </th>
                      <th className="p-4 py-4 text-[14px] font-normal text-[#344054] tracking-[0.3px] uppercase w-[25%]">NAME</th>
                      <th className="p-4 py-4 text-[14px] font-normal text-[#344054] tracking-[0.3px] uppercase w-[60%]">ACCESS</th>
                      <th className="p-4 py-4 w-[80px]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2f4f7]">
                    {storeGroups.map((group) => (
                      <tr key={group.id} className="hover:bg-[#f9fafb] transition-colors group text-[14px] h-[72px]">
                        <td className="p-4 py-3 text-center">
                          <div className="w-[16px] h-[16px] border border-[#d0d5dd] rounded-[4px] bg-white" />
                        </td>
                        <td className="p-4 py-3 font-normal text-[#101828]">{group.name}</td>
                        <td className="p-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {users.filter(u => group.memberIds.includes(u.id)).map(u => (
                              <div key={u.id} className="bg-[#f2f4f7] text-[#344054] text-[13px] font-normal px-3 py-1 rounded-[4px] border border-[#d0d5dd] flex items-center gap-1.5 whitespace-nowrap hover:bg-[#eaecf0] cursor-pointer transition-colors">
                                {u.name}
                                <ChevronDown className="h-3 w-3 opacity-60" />
                              </div>
                            ))}
                            {group.memberIds.length > 5 && (
                              <span className="text-[#667085] text-[13px] pt-1">...</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 py-3 text-right pr-6">
                          {canDelete && (
                            <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Pencil className="h-4 w-4 text-[#98a2b3] hover:text-[#03a9f4] cursor-pointer" />
                              <Trash2 className="h-4 w-4 text-[#98a2b3] hover:text-[#f44336] cursor-pointer" />
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Role Selection Modal — admins/owners only */}
      {canChangeRole && isRoleModalOpen && selectedUserForRole && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-[2px] shadow-2xl w-full max-w-[580px] overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#e4eaee]">
              <h2 className="text-[20px] font-normal text-[#333]">{selectedUserForRole.name}'s role</h2>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-[#999] hover:text-[#666]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              {[
                { id: 'admin', name: 'Admin', desc: 'Can see and edit everything. Only Owner can remove admin role.' },
                { id: 'project_manager', name: 'Project Manager', desc: 'Can edit all Projects they manage, and see and approve all time on those Projects' },
                { id: 'team_manager', name: 'Team Manager', desc: 'Can see all time of users they manage and approve their timesheets' }
              ].map((role) => (
                <div key={role.id} className="flex gap-4 group cursor-pointer" onClick={() => { }}>
                  <div className={cn(
                    "w-18 h-18 mt-1 border-[1.5px] rounded-[2px] flex items-center justify-center transition-all px-1.5 py-1.5 shrink-0",
                    selectedUserForRole.role === role.id ? "bg-[#03a9f4] border-[#03a9f4]" : "border-[#c6d2d9] bg-white group-hover:border-[#03a9f4]"
                  )}>
                    {selectedUserForRole.role === role.id && <div className="w-[10px] h-[10px] border-l-2 border-b-2 border-white -rotate-45 mb-1" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-[#333]">{role.name}</span>
                    <span className="text-[13px] text-[#999] leading-tight">{role.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-[#e4eaee]">
              <button onClick={() => setIsRoleModalOpen(false)} className="text-[#03a9f4] text-[13px] font-normal hover:underline">Cancel</button>
              <button onClick={() => setIsRoleModalOpen(false)} className="bg-[#03a9f4] text-white px-8 py-2 text-[14px] font-normal rounded-[2px] hover:bg-[#0288d1]">SAVE</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal — admins/owners only */}
      {canInvite && isAddMemberModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-[2px] shadow-2xl w-full max-w-[760px] overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#e4eaee]">
              <h2 className="text-[20px] font-normal text-[#333]">Add members</h2>
              <button onClick={() => setIsAddMemberModalOpen(false)} className="text-[#999] hover:text-[#666]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-8">
              <div className="mb-2">
                <label className="text-[13px] font-bold text-[#333]">Invite by email</label>
                <p className="text-[12px] text-[#999]">Separate multiple emails with commas, spaces, semicolons, or using an Enter key.</p>
              </div>
              <textarea
                placeholder="Enter email"
                className="w-full h-[120px] border border-[#c6d2d9] rounded-[2px] p-4 text-[14px] outline-none focus:border-[#03a9f4] placeholder:text-[#ccc]"
              />
            </div>
            <div className="px-6 py-4 bg-white flex items-center justify-end gap-3">
              <button onClick={() => setIsAddMemberModalOpen(false)} className="text-[#03a9f4] text-[13px] font-normal hover:underline pr-4">Cancel</button>
              <button onClick={() => setIsAddMemberModalOpen(false)} className="bg-[#03a9f4] text-white px-8 py-2 text-[14px] font-normal rounded-[2px] hover:bg-[#0288d1] uppercase tracking-wider">SEND INVITE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
