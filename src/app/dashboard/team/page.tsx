'use client'

import { useState } from 'react'
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
import { X } from 'lucide-react'
import { canInviteMembers, canChangeUserRole, canDeleteUser } from '@/lib/rbac'

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
  const [statusFilter, setStatusFilter] = useState('All')
  const [roleFilter, setRoleFilter] = useState('Role')
  const [billableRateFilter, setBillableRateFilter] = useState('Billable rate')
  const [groupFilter, setGroupFilter] = useState('Group')

  // Modal states
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [selectedUserForRole, setSelectedUserForRole] = useState<any>(null)

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'All' ||
      (statusFilter === 'Active' && !u.archived) ||
      (statusFilter === 'Inactive' && u.archived)

    const matchesRole = roleFilter === 'Role' || u.role.toLowerCase() === roleFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesRole
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
    <div className="bg-[#f2f6fb] px-5 py-[11px] border-b border-[#e4eaee] flex items-center justify-between">
      <span className="text-[13px] font-normal text-[#999]">{title}</span>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="flex items-center gap-1.5 text-[12px] text-[#333] hover:text-[#03a9f4] outline-none">
          Export <ChevronDown className="h-3 w-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[120px] bg-white shadow-xl border border-[#e4eaee]">
          <DropdownMenuItem className="text-[13px] py-2 cursor-pointer">CSV</DropdownMenuItem>
          <DropdownMenuItem className="text-[13px] py-2 cursor-pointer">Excel</DropdownMenuItem>
          <DropdownMenuItem className="text-[13px] py-2 cursor-pointer">PDF</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  return (
    <div className="min-h-full flex flex-col bg-[#f2f6f8] overflow-hidden font-sans antialiased">
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
        <div className="bg-white border border-[#e4eaee] relative z-10 -mt-[1px] min-h-full flex flex-col shadow-sm overflow-hidden">

          {/* Filtering Area */}
          <div className="px-5 py-3 border-b border-[#e4eaee] flex items-center h-[64px]">
            <div className="flex items-center flex-1 gap-1">
              <span className="text-[11px] font-bold text-[#999] uppercase tracking-widest px-3">FILTER</span>

              <div className="flex items-center">
                <div className="h-8 w-[1px] border-l border-dotted border-[#c6d2d9] mx-1" />
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="flex items-center gap-1.5 px-4 h-8 text-[13px] text-[#666] outline-none hover:bg-[#f8fafb] transition-colors rounded-sm">
                    {statusFilter} <ChevronDown className="h-3 w-3 text-[#999]" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[150px] p-0 shadow-xl bg-white border border-[#e4eaee] z-50">
                    {['All', 'Active', 'Inactive'].map(opt => (
                      <DropdownMenuItem key={opt} onClick={() => setStatusFilter(opt)} className="py-2.5 px-4 cursor-pointer text-[13px] focus:bg-[#eaf4fb] focus:text-[#333]">
                        {opt}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-8 w-[1px] border-l border-dotted border-[#c6d2d9] mx-1" />
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="flex items-center gap-1.5 px-4 h-8 text-[13px] text-[#666] outline-none hover:bg-[#f8fafb] transition-colors rounded-sm">
                    {billableRateFilter} <ChevronDown className="h-3 w-3 text-[#999]" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[150px] p-0 shadow-xl bg-white border border-[#e4eaee] z-50">
                    {['Billable rate', 'Hidden', 'Visible'].map(opt => (
                      <DropdownMenuItem key={opt} onClick={() => setBillableRateFilter(opt)} className="py-2.5 px-4 cursor-pointer text-[13px] focus:bg-[#eaf4fb]">
                        {opt}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-8 w-[1px] border-l border-dotted border-[#c6d2d9] mx-1" />
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="flex items-center gap-1.5 px-4 h-8 text-[13px] text-[#666] outline-none hover:bg-[#f8fafb] transition-colors rounded-sm">
                    {roleFilter} <ChevronDown className="h-3 w-3 text-[#999]" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[150px] p-0 shadow-xl bg-white border border-[#e4eaee] z-50">
                    {['Role', 'Admin', 'Owner', 'User', 'Project Manager'].map(opt => (
                      <DropdownMenuItem key={opt} onClick={() => setRoleFilter(opt)} className="py-2.5 px-4 cursor-pointer text-[13px] focus:bg-[#eaf4fb]">
                        {opt}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-8 w-[1px] border-l border-dotted border-[#c6d2d9] mx-1" />
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="flex items-center gap-1.5 px-4 h-8 text-[13px] text-[#666] outline-none hover:bg-[#f8fafb] transition-colors rounded-sm">
                    {groupFilter} <ChevronDown className="h-3 w-3 text-[#999]" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[150px] p-0 shadow-xl bg-white border border-[#e4eaee] z-50">
                    {['Group', 'Engineering', 'Design', 'Marketing', 'MEAR-Front End', 'Team Flutter', 'Quality Assurance'].map(opt => (
                      <DropdownMenuItem key={opt} onClick={() => setGroupFilter(opt)} className="py-2.5 px-4 cursor-pointer text-[13px] focus:bg-[#eaf4fb]">
                        {opt}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-[280px] flex items-center bg-white border border-[#c6d2d9] rounded-[2px] h-9 focus-within:border-[#03a9f4] transition-all group shadow-sm">
                <div className="pl-3 pr-2 h-full flex items-center">
                  <Search className="h-4 w-4 text-[#bbb] group-focus-within:text-[#03a9f4]" />
                </div>
                <input
                  placeholder="Search by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 pr-3 text-[13px] text-[#333] outline-none placeholder:text-[#bbb] bg-transparent"
                />
              </div>
              <button className="px-5 h-9 border border-[#03a9f4] text-[#03a9f4] text-[11px] font-bold uppercase rounded-[2px] hover:bg-[#03a9f4] hover:text-white transition-all tracking-widest whitespace-nowrap shadow-sm">
                APPLY FILTER
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 flex flex-col">
            {activeTab === 'MEMBERS' && (
              <>
                <SectionBar title="Members" />
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left border-b border-[#e4eaee] bg-white">
                      <th className="p-4 py-3 w-[48px]">
                        <div className="w-[14px] h-[14px] border border-[#c6d2d9] rounded-[2px] bg-white" />
                      </th>
                      <th className="p-4 py-3 text-[11px] font-normal text-[#666] uppercase tracking-widest w-[25%] cursor-pointer hover:bg-[#f9fafb]">
                        <div className="flex items-center gap-1.5">NAME <SortIndicator active={true} order="asc" /></div>
                      </th>
                      <th className="p-4 py-3 text-[11px] font-normal text-[#666] uppercase tracking-widest w-[20%] cursor-pointer hover:bg-[#f9fafb]">
                        <div className="flex items-center gap-1.5">EMAIL <SortIndicator active={false} order="asc" /></div>
                      </th>
                      <th className="p-4 py-3 text-[11px] font-normal text-[#666] uppercase tracking-widest w-[20%] text-center px-8">
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">BILLABLE RATE (USD) <SortIndicator active={false} order="asc" /></div>
                      </th>
                      <th className="p-4 py-3 text-[11px] font-normal text-[#666] uppercase tracking-widest w-[15%]">ROLE</th>
                      <th className="p-4 py-3 text-[11px] font-normal text-[#666] uppercase tracking-widest w-[15%]">GROUP</th>
                      <th className="p-4 py-3 w-[40px]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f4f7]">
                    {filteredUsers.map((member) => (
                      <tr key={member.id} className="hover:bg-[#f9fafb] transition-colors group text-[13px] h-[64px]">
                        <td className="p-4 py-2 text-center">
                          <div className="w-[14px] h-[14px] border border-[#c6d2d9] rounded-[2px] bg-white" />
                        </td>
                        <td className="p-4 py-2">
                          <div className="flex flex-col">
                            <span className="text-[#333] font-normal">{member.name || '(not joined yet)'}</span>
                          </div>
                        </td>
                        <td className="p-4 py-2">
                          <span className="text-[#999] hover:text-[#03a9f4] cursor-pointer transition-colors break-all">
                            {member.email}
                          </span>
                        </td>
                        <td className="p-4 py-2">
                          <div className="flex items-center justify-center">
                            <div className="flex bg-[#f2f6fb] border border-[#e4eaee] rounded-[2px] overflow-hidden w-[140px]">
                              <div className="px-3 py-1.5 text-[#333] flex-1 text-center font-normal">
                                {member.billableRate ? member.billableRate.toFixed(2) : '-'}
                              </div>
                              <button className="bg-white px-3 py-1.5 text-[#03a9f4] text-[11px] font-medium border-l border-[#e4eaee] hover:bg-gray-50 transition-colors uppercase">
                                Change
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 py-2">
                          {member.role ? (
                            <span
                              onClick={() => canChangeRole && (setSelectedUserForRole(member), setIsRoleModalOpen(true))}
                              className={cn('text-[#333] transition-colors', canChangeRole && 'hover:text-[#03a9f4] cursor-pointer')}
                            >
                              {member.role === 'owner' ? 'Admin' : member.role === 'admin' ? 'Team Lead' : 'Team Member'}
                            </span>
                          ) : (
                            canChangeRole ? (
                              <button
                                onClick={() => { setSelectedUserForRole(member); setIsRoleModalOpen(true); }}
                                className="flex items-center gap-1.5 text-[#03a9f4] hover:underline"
                              >
                                <PlusCircle className="h-4 w-4" /> Role
                              </button>
                            ) : <span className="text-[#999]">—</span>
                          )}
                        </td>
                        <td className="p-4 py-2">
                          {member.group ? (
                            <div className="inline-flex bg-[#eaf4fb] text-[#5c7b91] text-[12px] px-3 py-1 rounded-[2px] border border-[#d6e5ef]">
                              {member.group}
                              <ChevronDown className="h-3 w-3 ml-2 mt-0.5 opacity-60" />
                            </div>
                          ) : (
                            <button className="flex items-center gap-1.5 text-[#03a9f4] hover:underline">
                              <PlusCircle className="h-4 w-4" /> Group
                            </button>
                          )}
                        </td>
                        <td className="p-4 py-2 text-center text-[#ccc] group-hover:text-[#999]">
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
                  <div className="flex items-center bg-white border border-[#c6d2d9] rounded-[2px] h-9 w-[300px] group focus-within:border-[#03a9f4]">
                    <div className="pl-3 pr-2 h-full flex items-center">
                      <Search className="h-4 w-4 text-[#bbb] group-focus-within:text-[#03a9f4]" />
                    </div>
                    <input
                      placeholder="Search by username or group name"
                      className="flex-1 text-[13px] outline-none placeholder:text-[#bbb] bg-transparent"
                    />
                  </div>
                  {canInvite && (
                    <div className="flex items-center gap-2">
                      <div className="w-[200px] border border-[#c6d2d9] rounded-[2px] h-9 flex items-center px-3 bg-white focus-within:border-[#03a9f4]">
                        <input placeholder="Add new group" className="w-full text-[13px] outline-none placeholder:text-[#bbb]" />
                      </div>
                      <button className="bg-[#03a9f4] text-white px-6 h-9 text-[12px] font-bold rounded-[2px] hover:bg-[#0288d1] uppercase tracking-widest">ADD</button>
                    </div>
                  )}
                </div>
                <SectionBar title="Groups" />
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left border-b border-[#e4eaee] bg-white">
                      <th className="p-4 py-3 w-[48px]">
                        <div className="w-[14px] h-[14px] border border-[#c6d2d9] rounded-[2px] bg-white" />
                      </th>
                      <th className="p-4 py-3 text-[11px] font-normal text-[#666] uppercase tracking-widest w-[25%]">NAME</th>
                      <th className="p-4 py-3 text-[11px] font-normal text-[#666] uppercase tracking-widest w-[60%]">ACCESS</th>
                      <th className="p-4 py-3 w-[80px]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f4f7]">
                    {storeGroups.map((group) => (
                      <tr key={group.id} className="hover:bg-[#f9fafb] transition-colors group text-[13px] h-[64px]">
                        <td className="p-4 py-2 text-center">
                          <div className="w-[14px] h-[14px] border border-[#c6d2d9] rounded-[2px] bg-white" />
                        </td>
                        <td className="p-4 py-2 font-normal text-[#333]">{group.name}</td>
                        <td className="p-4 py-2">
                          <div className="flex flex-wrap gap-2">
                            {users.filter(u => group.memberIds.includes(u.id)).map(u => (
                              <div key={u.id} className="bg-[#eaf4fb] text-[#5c7b91] text-[12px] px-3 py-1 rounded-[2px] border border-[#d6e5ef] flex items-center gap-1.5 whitespace-nowrap">
                                {u.name}
                                <ChevronDown className="h-3 w-3 opacity-60" />
                              </div>
                            ))}
                            {group.memberIds.length > 5 && (
                              <span className="text-[#999] text-[12px] pt-1">...</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 py-2 text-right pr-6">
                          {canDelete && (
                            <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Pencil className="h-4 w-4 text-[#ccc] hover:text-[#03a9f4] cursor-pointer" />
                              <Trash2 className="h-4 w-4 text-[#ccc] hover:text-[#f44336] cursor-pointer" />
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
