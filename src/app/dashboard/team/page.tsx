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
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function TeamPage() {
  const { user } = useAuthStore()
  const { users } = useDataStore()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'MEMBERS' | 'GROUPS'>('MEMBERS')
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('All')
  const [roleFilter, setRoleFilter] = useState('Role')
  const [groupFilter, setGroupFilter] = useState('Group')

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

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
        <div className="bg-white border border-[#e4eaee] rounded-md relative z-10 -mt-[1px] min-h-full flex flex-col shadow-sm overflow-hidden">
          
          {/* Filtering Area */}
          <div className="px-5 py-3 border-b border-[#e4eaee] flex items-center h-[56px]">
            <div className="flex items-center flex-1">
              <span className="text-[11px] font-bold text-[#999] uppercase tracking-widest mr-4">FILTER</span>
              
              <div className="flex items-center h-8">
                <div className="h-8 w-[1px] border-l border-dotted border-[#c6d2d9]" />
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 h-full text-[13px] text-[#666] outline-none hover:bg-[#f8fafb]">
                    {statusFilter} <ChevronDown className="h-3 w-3 text-[#999]" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[150px] p-0 shadow-xl bg-white border border-[#e4eaee] z-50">
                    {['All', 'Active', 'Inactive'].map(opt => (
                      <DropdownMenuItem key={opt} onClick={() => setStatusFilter(opt)} className="py-2 px-4 cursor-pointer text-[13px] focus:bg-[#eaf4fb]">
                        {opt}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-8 w-[1px] border-l border-dotted border-[#c6d2d9]" />
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 h-full text-[13px] text-[#666] outline-none hover:bg-[#f8fafb]">
                    {roleFilter} <ChevronDown className="h-3 w-3 text-[#999]" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[150px] p-0 shadow-xl bg-white border border-[#e4eaee] z-50">
                    {['Role', 'Admin', 'Owner', 'User'].map(opt => (
                      <DropdownMenuItem key={opt} onClick={() => setRoleFilter(opt)} className="py-2 px-4 cursor-pointer text-[13px] focus:bg-[#eaf4fb]">
                        {opt}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-8 w-[1px] border-l border-dotted border-[#c6d2d9]" />
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 h-full text-[13px] text-[#666] outline-none hover:bg-[#f8fafb]">
                    {groupFilter} <ChevronDown className="h-3 w-3 text-[#999]" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[150px] p-0 shadow-xl bg-white border border-[#e4eaee] z-50">
                    {['Group', 'Engineering', 'Design', 'Marketing'].map(opt => (
                      <DropdownMenuItem key={opt} onClick={() => setGroupFilter(opt)} className="py-2 px-4 cursor-pointer text-[13px] focus:bg-[#eaf4fb]">
                        {opt}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-[240px] flex items-center bg-white border border-[#c6d2d9] rounded-l-[2px] h-8 focus-within:border-[#03a9f4] relative z-0 focus-within:z-10">
                <div className="px-3 h-full flex items-center">
                  <Search className="h-3.5 w-3.5 text-[#ccc]" />
                </div>
                <input
                  placeholder="Search by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 pr-3 text-[13px] text-[#333] outline-none placeholder:text-[#ccc] bg-transparent"
                />
              </div>
              <button className="px-4 h-8 border border-l-0 border-[#c6d2d9] text-[#03a9f4] text-[11px] font-bold uppercase rounded-r-[2px] hover:bg-[#e1f5fe] transition-colors tracking-widest whitespace-nowrap -ml-[1px] relative z-0 hover:z-10 hover:border-[#03a9f4] hover:border-l">
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
                      <th className="p-4 py-3 text-[12px] font-normal text-[#666] uppercase tracking-widest w-[30%]">
                        <div className="flex items-center">NAME <SortIndicator active={true} order="asc" /></div>
                      </th>
                      <th className="p-4 py-3 text-[12px] font-normal text-[#666] uppercase tracking-widest w-[30%]">
                        <div className="flex items-center">EMAIL <SortIndicator active={false} order="asc" /></div>
                      </th>
                      <th className="p-4 py-3 text-[12px] font-normal text-[#666] uppercase tracking-widest w-[20%]">ROLE</th>
                      <th className="p-4 py-3 text-[12px] font-normal text-[#666] uppercase tracking-widest w-[20%]">GROUP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f4f7]">
                    {filteredUsers.map((member) => (
                      <tr key={member.id} className="hover:bg-[#f9fafb] transition-colors group text-[13px]">
                        <td className="p-4 py-3 align-top text-[#333]">{member.name || '(not joined yet)'}</td>
                        <td className="p-4 py-3 align-top">
                          <span className="text-[#999] hover:text-[#03a9f4] cursor-pointer transition-colors break-all">
                            {member.email}
                          </span>
                        </td>
                        <td className="p-4 py-3 align-top">
                          <div className="inline-flex bg-[#e4eaee] text-[#666] text-[11px] font-normal px-2 py-0.5 rounded-[2px] border border-[#d6e5ef] uppercase">
                            {member.role}
                          </div>
                        </td>
                        <td className="p-4 py-3 align-top text-[#03a9f4] hover:underline cursor-pointer">
                          Team Flutter
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {activeTab === 'GROUPS' && (
              <>
                <SectionBar title="Groups" />
                <div className="p-8 text-center text-[#999] text-[13px]">
                  No groups configured yet.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
