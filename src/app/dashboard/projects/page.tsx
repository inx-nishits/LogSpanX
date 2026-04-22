'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, Check, ChevronsUpDown, Star, ArrowUp, ArrowDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu'

const mockLeads = [
  { name: 'Aiyub Munshi', status: 'active' },
  { name: 'Chirag Gopiyani', status: 'active' },
  { name: 'Darshan Belani', status: 'archived' },
  { name: 'Harin Patel', status: 'active' },
  { name: 'Inheritx Solutions', status: 'active' },
  { name: 'Jamal Derdiwala', status: 'archived' },
]

const mockGroups = [
  { name: 'MEAR-Front End', status: 'active' },
  { name: 'MRN-Backend', status: 'active' },
  { name: 'Project Leads', status: 'active' },
  { name: 'Sales', status: 'active' },
  { name: 'Team BA', status: 'active' },
  { name: 'Team Design', status: 'active' },
  { name: 'Team DevOps', status: 'active' },
  { name: 'Team Flutter', status: 'active' },
  { name: 'Team PHP', status: 'active' },
  { name: 'Team Python', status: 'active' },
  { name: 'Team QA', status: 'active' },
]

const mockUsers = [
  { name: 'Aiyub Munshi', status: 'active' },
  { name: 'Chirag Gopiyani', status: 'active' },
  { name: 'Darshan Belani', status: 'inactive' },
  { name: 'Harin Patel', status: 'active' },
  { name: 'Inheritx Solutions', status: 'active' },
  { name: 'Jamal Derdiwala', status: 'inactive' },
]

const mockProjects = [
  { id: 'inx-handover', name: '_INX - Handover', lead: '-', tracked: '1,107.04h', progress: null, access: 'Private', color: '#ff5722' },
  { id: 'inx-company', name: '_INX-Company LogSpanX-Clockify : Non-Billable', lead: 'Ram Jangid', tracked: '0.00h', progress: null, access: 'Private', color: '#4caf50' },
  { id: 'inx-estimation', name: '_INX Estimation : Non Billable', lead: 'Inheritx Solutions', tracked: '4,837.45h', progress: null, access: 'Public', color: '#e91e63' },
  { id: 'inx-hr', name: '_INX-HR Work : Non-Billable', lead: 'Inheritx Solutions', tracked: '1,467.75h', progress: null, access: 'Private', color: '#e91e63' },
  { id: 'inx-infra', name: '_INX-Infra Problem : Non-Billable', lead: 'Inheritx Solutions', tracked: '566.97h', progress: null, access: 'Private', color: '#e91e63' },
  { id: 'inx-interviews', name: '_INX-Interviews : Non-Billable', lead: 'Inheritx Solutions', tracked: '953.78h', progress: null, access: 'Private', color: '#e91e63' },
  { id: 'inx-learning', name: '_INX-Learning : Non Billable', lead: 'Inheritx Solutions', tracked: '44,299.24h', progress: null, access: 'Private', color: '#e91e63' },
  { id: 'inx-leaves', name: '_INX-Leaves : Non-Billable', lead: 'Inheritx Solutions', tracked: '29,535.02h', progress: null, access: 'Private', color: '#e91e63' },
  { id: 'inx-meetings', name: '_INX-Meetings : Non-Billable', lead: 'Inheritx Solutions', tracked: '2,640.21h', progress: null, access: 'Private', color: '#e91e63' },
  { id: 'inx-sessions', name: '_INX-Sessions : Non-Billable', lead: 'Inheritx Solutions', tracked: '206.13h', progress: null, access: 'Private', color: '#e91e63' },
  { id: 'inx-training', name: '_INX - Training : Non Billable', lead: 'Inheritx Solutions', tracked: '1,102.62h', progress: null, access: 'Private', color: '#e91e63' },
  { id: 'inhouse-revamp', name: 'Inhouse Clockify Revamp : Next - Node', lead: 'Nishit Sangani', tracked: '72.98h', progress: null, access: 'Private', color: '#03a9f4' },
  { id: 'koradream', name: 'Koradream : Fixed Cost : Billable', lead: '-', tracked: '1,770.33h', progress: { percent: 91.49, total: '1,935.00h' }, access: 'Public', color: '#4caf50' },
  { id: 'pythia', name: 'Pythia : Python - react - DM : Fixed-cost : Billable', lead: 'Sonu Gupta', tracked: '160.17h', progress: null, access: 'Private', color: '#ff5722' },
]

export default function ProjectsPage() {
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

  const [projects, setProjects] = useState(mockProjects)
  const [favorites, setFavorites] = useState<string[]>([])

  const handleApplyFilter = () => {
    const filtered = mockProjects.filter(p => {
      // Project lead filter
      const matchesLead = selectedLeadNames.length === 0 || 
                         selectedLeadNames.includes(p.lead) || 
                         (includeWithoutLead && (p.lead === '-' || !p.lead));
      
      // Billing Filter (Based on project name keywords as a mock)
      let matchesBilling = true;
      if (selectedBillingStatuses.length > 0) {
          const isNonBillable = p.name.toLowerCase().includes('non-billable') || p.name.toLowerCase().includes('non billable');
          const isBillable = !isNonBillable;
          matchesBilling = (selectedBillingStatuses.includes('Billable') && isBillable) || 
                           (selectedBillingStatuses.includes('Non billable') && isNonBillable);
      }

      // Name Search
      const matchesName = !nameSearchQuery || p.name.toLowerCase().includes(nameSearchQuery.toLowerCase());

      return matchesLead && matchesBilling && matchesName;
    });
    setProjects(filtered);
  }

  const handleClearFilters = () => {
    setStatusFilter('Active');
    setSelectedLeadNames([]);
    setIncludeWithoutLead(false);
    setSelectedAccessGroups([]);
    setSelectedAccessUsers([]);
    setSelectedBillingStatuses([]);
    setNameSearchQuery('');
    setProjects(mockProjects);
  }

  const hasActiveFilters = statusFilter !== 'Active' || 
                          selectedLeadNames.length > 0 || 
                          includeWithoutLead || 
                          selectedAccessGroups.length > 0 || 
                          selectedAccessUsers.length > 0 || 
                          selectedBillingStatuses.length > 0 || 
                          nameSearchQuery !== '';

  const toggleFavorite = (projectName: string) => {
    setFavorites(prev => prev.includes(projectName) ? prev.filter(n => n !== projectName) : [...prev, projectName])
  }

  const [sortKey, setSortKey] = useState<string>('NAME')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [leadStatusFilter, setLeadStatusFilter] = useState('Active')
  const [accessStatusFilter, setAccessStatusFilter] = useState('Active')
  const [isLeadStatusFilterOpen, setIsLeadStatusFilterOpen] = useState(false)
  const [isAccessStatusFilterOpen, setIsAccessStatusFilterOpen] = useState(false)

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

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const sortedProjects = [...projects].sort((a, b) => {
    let valA: any = '';
    let valB: any = '';
    
    if (sortKey === 'NAME') { valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); }
    else if (sortKey === 'PROJECT LEAD') { valA = a.lead.toLowerCase(); valB = b.lead.toLowerCase(); }
    else if (sortKey === 'TRACKED') {
      const parseH = (s: string) => parseFloat(s.replace(/[^0-9.]/g, '')) || 0;
      valA = parseH(a.tracked);
      valB = parseH(b.tracked);
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }
    else if (sortKey === 'PROGRESS') {
      valA = a.progress?.percent ?? -1;
      valB = b.progress?.percent ?? -1;
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }
    else if (sortKey === 'ACCESS') { valA = a.access.toLowerCase(); valB = b.access.toLowerCase(); }

    if (sortOrder === 'asc') return valA.localeCompare(valB)
    return valB.localeCompare(valA)
  })

  // Filter Logic Helpers
  const filteredLeads = mockLeads.filter(lead => {
    const matchesSearch = !leadSearchQuery || lead.name.toLowerCase().includes(leadSearchQuery.toLowerCase());
    if (leadStatusFilter === 'Active') return matchesSearch && lead.status === 'active';
    if (leadStatusFilter === 'Archived') return matchesSearch && lead.status === 'archived';
    return matchesSearch;
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

  const filteredGroups = mockGroups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(accessSearchQuery.toLowerCase());
    if (accessStatusFilter === 'Active') return matchesSearch && g.status === 'active';
    if (accessStatusFilter === 'Inactive') return matchesSearch && g.status === 'inactive';
    return matchesSearch;
  })
  const filteredUsers = mockUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(accessSearchQuery.toLowerCase());
    if (accessStatusFilter === 'Active') return matchesSearch && u.status === 'active';
    if (accessStatusFilter === 'Inactive') return matchesSearch && u.status === 'inactive';
    return matchesSearch;
  })
  const toggleAccessGroup = (name: string) => setSelectedAccessGroups(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  const toggleAccessUser = (name: string) => setSelectedAccessUsers(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  const toggleBilling = (status: string) => setSelectedBillingStatuses(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status])

  return (
    <div className="min-h-full flex flex-col bg-[#f2f6f8]">
      <div className="w-full px-5 pt-4 pb-2 relative z-50">
        <h1 className="text-lg text-[#333333] font-normal">Projects</h1>
      </div>

      <div className="w-full px-5 pt-4 pb-20 relative z-10">
        <div className="max-w-full overflow-x-auto hidden-scrollbar">
          <div className="min-w-[1000px] flex flex-col gap-6">
            
            <div className="relative z-[100]">
              <div className="flex bg-white border border-[#e4eaee] items-center h-[56px] rounded-md shadow-sm text-[13px]">
                <div className="flex items-center pl-4 pr-3 h-full">
                  <span className="text-[11px] font-bold text-[#999999] uppercase tracking-widest">Filter</span>
                </div>
                
                <div className="h-8 w-[1px] border-l border-dotted border-[#c6d2d9]" />
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="flex items-center px-4 h-full cursor-pointer text-[#666666] outline-none hover:text-[#333] data-[state=open]:text-[#03a9f4]">
                    <span>{statusFilter}</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[160px] bg-white rounded-sm shadow-xl border border-[#e4eaee] py-1 z-[200]">
                    {['Active', 'Archived', 'All'].map(s => (
                      <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)} className="py-2.5 px-4 cursor-pointer text-gray-700 text-[13px] focus:bg-[#eaf4fb] transition-colors">{s}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-8 w-[1px] border-l border-dotted border-[#c6d2d9]" />
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
                        <input type="text" placeholder="Search Project Lead" value={leadSearchQuery} onChange={(e) => setLeadSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-[7px] text-[13px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4]" />
                      </div>
                    </div>
                    <div className="flex flex-col border-b border-[#e4eaee]">
                      <div 
                        className="flex items-center justify-between px-4 py-[11px] cursor-pointer hover:bg-[#fcfdfe]"
                        onClick={(e) => { e.stopPropagation(); setIsLeadStatusFilterOpen(!isLeadStatusFilterOpen); }}
                      >
                         <span className="text-[11px] font-bold text-[#999] uppercase tracking-widest">Show</span>
                         <div className="flex items-center gap-1 text-[13px] text-[#666]">
                           {leadStatusFilter} <ChevronDown className={`h-3.5 w-3.5 text-[#999] transition-transform ${isLeadStatusFilterOpen ? 'rotate-180' : ''}`} />
                         </div>
                      </div>
                      {isLeadStatusFilterOpen && (
                        <div className="bg-[#fcfdfe] py-1 border-t border-[#e4eaee]/50 border-b border-[#e4eaee]/30">
                          {['Active & Archived', 'Active', 'Archived'].map(opt => (
                            <div 
                              key={opt} 
                              onClick={(e) => { e.stopPropagation(); setLeadStatusFilter(opt); setIsLeadStatusFilterOpen(false); }} 
                              className={`py-2 px-10 text-[13px] cursor-pointer transition-colors ${leadStatusFilter === opt ? 'bg-[#eaf4fb] text-[#333]' : 'text-[#666] hover:bg-[#eaf4fb]'}`}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="max-h-[220px] overflow-y-auto py-2 scrollbar-hide text-[13px]">
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
                        <input type="text" placeholder="Search users or groups" value={accessSearchQuery} onChange={(e) => setAccessSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-[7px] text-[13px] border border-[#c6d2d9] rounded-sm outline-none focus:border-[#03a9f4]" />
                      </div>
                    </div>
                    <div className="flex flex-col border-b border-[#e4eaee]">
                      <div 
                        className="flex items-center justify-between px-4 py-[11px] cursor-pointer hover:bg-[#fcfdfe]"
                        onClick={(e) => { e.stopPropagation(); setIsAccessStatusFilterOpen(!isAccessStatusFilterOpen); }}
                      >
                         <span className="text-[11px] font-bold text-[#999] uppercase tracking-widest">Show</span>
                         <div className="flex items-center gap-1 text-[13px] text-[#666]">
                           {accessStatusFilter} <ChevronDown className={`h-3.5 w-3.5 text-[#999] transition-transform ${isAccessStatusFilterOpen ? 'rotate-180' : ''}`} />
                         </div>
                      </div>
                      {isAccessStatusFilterOpen && (
                        <div className="bg-[#fcfdfe] py-1 border-t border-[#e4eaee]/50 border-b border-[#e4eaee]/30">
                          {['All', 'Active', 'Inactive'].map(opt => (
                            <div 
                              key={opt} 
                              onClick={(e) => { e.stopPropagation(); setAccessStatusFilter(opt); setIsAccessStatusFilterOpen(false); }} 
                              className={`py-2 px-10 text-[13px] cursor-pointer transition-colors ${accessStatusFilter === opt ? 'bg-[#eaf4fb] text-[#333]' : 'text-[#666] hover:bg-[#eaf4fb]'}`}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="max-h-[280px] overflow-y-auto py-2 scrollbar-hide text-[13px]">
                      <div className="px-4 py-2 pt-3 uppercase text-[11px] font-bold text-[#999] tracking-widest">Groups</div>
                      {filteredGroups.map(group => (
                        <div key={group.name} className="flex items-center px-4 py-2 cursor-pointer hover:bg-[#eaf4fb] transition-colors text-[#666]" onClick={() => toggleAccessGroup(group.name)}>
                          <div className={`w-[14px] h-[14px] border ${selectedAccessGroups.includes(group.name) ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-gray-300'} rounded-[2px] mr-3 flex items-center justify-center`}>
                            {selectedAccessGroups.includes(group.name) && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                          </div>
                          {group.name}
                        </div>
                      ))}
                      <div className="px-4 py-2 pt-4 uppercase text-[11px] font-bold text-[#999] tracking-widest">Users</div>
                      {filteredUsers.map(user => (
                        <div key={user.name} className="flex items-center px-4 py-2 cursor-pointer hover:bg-[#eaf4fb] transition-colors text-[#666]" onClick={() => toggleAccessUser(user.name)}>
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
                  <Button onClick={handleApplyFilter} className="bg-[#03a9f4] hover:bg-[#0288d1] text-[11px] font-bold tracking-widest px-4 h-8 rounded-sm shadow-md uppercase text-white transition-all">APPLY FILTER</Button>
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end pr-1 py-3 -mt-2">
                <button onClick={handleClearFilters} className="text-[#03a9f4] hover:underline text-[13px] font-medium transition-all">Clear filters</button>
              </div>
            )}

            <div className="relative z-0">
              <div className="bg-white border border-[#e4eaee] rounded-md shadow-sm overflow-hidden relative">
                <table className="w-full border-collapse table-fixed">
                  <thead>
                    <tr className="bg-[#f0f7fb] border-b border-[#d6e5ef]">
                      <th colSpan={5} className="p-4 py-[14px] text-[14px] text-[#5c7b91] font-bold uppercase tracking-tight text-left">
                        Projects
                      </th>
                    </tr>
                    <tr className="border-b border-[#e4eaee] text-left select-none bg-white">
                      {[ 
                        { label: 'NAME', width: '35%' }, 
                        { label: 'PROJECT LEAD', width: '20%' }, 
                        { label: 'TRACKED', width: '15%' }, 
                        { label: 'PROGRESS', width: '15%' }, 
                        { label: 'ACCESS', width: '15%' } 
                      ].map((col) => (
                        <th 
                          key={col.label} 
                          style={{ width: col.width }} 
                          className="p-4 py-3 text-[12px] font-normal uppercase tracking-widest cursor-pointer text-[#666] transition-colors"
                          onClick={() => handleSort(col.label)}
                        >
                          <div className="flex items-center">
                            {col.label} 
                            <SortIndicator active={sortKey === col.label} order={sortOrder} />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProjects.map((project, index) => (
                      <tr key={index} className="hover:bg-[#f9fafb] group transition-colors border-b border-[#f1f4f7]">
                        <td className="p-4 whitespace-nowrap overflow-hidden">
                          <div className="flex items-center">
                            <div className="w-[8px] h-[8px] rounded-full mr-3 shrink-0" style={{ backgroundColor: project.color }} />
                            {project.id === 'inx-estimation' ? (
                                <Link href={`/dashboard/projects/${project.id}?tab=TASKS`} className="text-[13px] text-[#333] font-normal truncate hover:underline cursor-pointer">
                                  {project.name}
                                </Link>
                            ) : (
                                <span className="text-[13px] text-[#333] font-normal truncate">
                                  {project.name}
                                </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 border-l border-dotted border-[#e4eaee] whitespace-nowrap">
                          {project.id === 'inx-estimation' ? (
                              <Link href={`/dashboard/projects/${project.id}?tab=TASKS`} className="text-[13px] text-[#666] font-normal hover:underline cursor-pointer">
                                {project.lead}
                              </Link>
                          ) : (
                              <span className="text-[13px] text-[#666] font-normal">
                                {project.lead}
                              </span>
                          )}
                        </td>
                        <td className="p-4 border-l border-dotted border-[#e4eaee] whitespace-nowrap">
                          {project.id === 'inx-estimation' ? (
                            <Link href={`/dashboard/projects/${project.id}?tab=STATUS`} className="text-[13px] text-[#666] font-normal hover:underline cursor-pointer">
                              {project.tracked}
                            </Link>
                          ) : (
                            <span className="text-[13px] text-[#666] font-normal">{project.tracked}</span>
                          )}
                        </td>
                        <td className="p-4 border-l border-dotted border-[#e4eaee] whitespace-nowrap">
                          {project.progress ? (
                            <div className="flex flex-col w-full max-w-[120px]">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[12px] text-[#333] font-medium">{project.progress.percent}%</span>
                              </div>
                              <div className="w-full bg-[#f0f7fb] h-1 rounded-full overflow-hidden">
                                <div className="bg-[#4caf50] h-full" style={{ width: `${project.progress.percent}%` }} />
                              </div>
                            </div>
                          ) : (
                            <span className="text-[13px] text-[#666]">-</span>
                          )}
                        </td>
                        <td className="p-4 border-l border-dotted border-[#e4eaee] whitespace-nowrap">
                          <div className="flex items-center justify-between w-full">
                            {project.id === 'inx-estimation' ? (
                              <Link href={`/dashboard/projects/${project.id}?tab=ACCESS`} className="text-[13px] text-[#666] font-normal hover:underline cursor-pointer">
                                {project.access}
                              </Link>
                            ) : (
                              <span className="text-[13px] text-[#666] font-normal">{project.access}</span>
                            )}
                            <div className="flex items-center">
                              <div className="h-4 w-[1px] border-l border-[#e4eaee] mx-4" />
                              <Star 
                                onClick={() => toggleFavorite(project.name)}
                                className={`h-[18px] w-[18px] cursor-pointer transition-all mt-[2px] ${favorites.includes(project.name) ? 'text-[#f5a623] fill-[#f5a623]' : 'text-[#d6e5ef] hover:text-[#f5a623]'}`} 
                              />
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
