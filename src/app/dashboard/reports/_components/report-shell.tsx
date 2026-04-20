'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, ChevronDown, Filter } from 'lucide-react'
import { startOfWeek, endOfWeek, addDays } from 'date-fns'
import { cn } from '@/lib/utils'
import { FilterDropdown } from '../summary/filter-dropdown'
import { DateRangePicker } from '@/components/dashboard/date-range-picker'

export const TABS = [
  { label: 'Summary', href: '/dashboard/reports/summary' },
  { label: 'Detailed', href: '/dashboard/reports/detailed' },
  { label: 'Weekly', href: '/dashboard/reports/weekly' },
  { label: 'Shared', href: '/dashboard/reports/shared' },
]

export const TEAM_ITEMS = [
  { id: 'g1', label: 'MEAR-Front End', group: 'Groups' },
  { id: 'g2', label: 'MRN-Backend', group: 'Groups' },
  { id: 'g3', label: 'Project Leads', group: 'Groups' },
  { id: 'g4', label: 'Sales', group: 'Groups' },
  { id: 'g5', label: 'Team BA', group: 'Groups' },
  { id: 'g6', label: 'Team Design', group: 'Groups' },
  { id: 'user_1', label: 'Nishit Sangani' },
  { id: 'user_2', label: 'Aiyub Munshi' },
  { id: 'user_3', label: 'Jaydeep Vegad' },
  { id: 'user_4', label: 'Sonu Gupta' },
  { id: 'user_5', label: 'Vrutik Patel' },
  { id: 'user_6', label: 'Ram Jangid' },
]

export const LEAD_ITEMS = [
  { id: 'pl_1', label: 'Aiyub Munshi' },
  { id: 'pl_2', label: 'Chirag Gopiyani' },
  { id: 'pl_3', label: 'Darshan Belani' },
  { id: 'pl_4', label: 'Harin Patel' },
  { id: 'pl_5', label: 'Inheritx Solutions' },
  { id: 'pl_6', label: 'Jamal Derdivala' },
  { id: 'pl_7', label: 'Jaydeep Vegad' },
  { id: 'pl_8', label: 'Nishit Sangani' },
]

export const PROJECT_ITEMS = [
  { id: 'project_1', label: 'StaffBot Dedicated : Billable', group: 'Jaydeep Vegad' },
  { id: 'project_2', label: 'Nexaan(Jiteshbhai) : T & M : Billable', group: 'Sonu Gupta' },
  { id: 'project_3', label: 'Kavia AI : Dedicated : Billable', group: 'Aiyub Munshi' },
  { id: 'project_4', label: '_INX-Learning : Non-Billable', group: 'Aiyub Munshi' },
  { id: 'project_5', label: 'Ecosmob : Dedicated : Billable', group: 'Ram Jangid' },
  { id: 'project_6', label: 'Nurvia : Fixed-cost : Billable', group: 'Aiyub Munshi' },
  { id: 'project_7', label: 'Lifeguru : Fixed-cost : Billable', group: 'Aiyub Munshi' },
  { id: 'project_8', label: 'Pocket Sergeant : Maintenance : Billable', group: 'Vrutik Patel' },
  { id: 'project_9', label: 'Inhouse Clokify Revamp :: Next - Node', group: 'Nishit Sangani' },
  { id: 'project_10', label: 'Culturify : Fixed cost : Billable', group: 'Aiyub Munshi' },
  { id: 'project_11', label: 'DycoVue : Dedicated : Billable', group: 'Aiyub Munshi' },
  { id: 'project_12', label: 'Ceremonia : Fixed Cost : Billable', group: 'Aiyub Munshi' },
  { id: 'project_13', label: '_INX-Company Website Revamp', group: 'No Project Lead' },
  { id: 'project_14', label: 'HealthSync : T & M : Billable', group: 'Sonu Gupta' },
]

export const TASK_ITEMS = [
  { id: 'task_1', label: 'Frontend Refactor', group: 'StaffBot Dedicated : Billable' },
  { id: 'task_2', label: 'API Integration', group: 'Nexaan : T & M : Billable' },
  { id: 'task_3', label: 'ML Pipeline Setup', group: 'Kavia AI : Dedicated : Billable' },
  { id: 'task_4', label: 'React Training Module', group: '_INX-Learning : Non-Billable' },
  { id: 'task_5', label: 'VoIP Gateway Config', group: 'Ecosmob : Dedicated : Billable' },
  { id: 'task_6', label: 'Dashboard UI', group: 'Nurvia : Fixed-cost : Billable' },
  { id: 'task_7', label: 'Backend Optimization', group: 'Lifeguru : Fixed-cost : Billable' },
  { id: 'task_8', label: 'Bug Fixes Sprint 4', group: 'Pocket Sergeant : Maintenance : Billable' },
  { id: 'task_9', label: 'Next.js Migration', group: 'Inhouse Clokify Revamp :: Next - Node' },
  { id: 'task_10', label: 'Payment Integration', group: 'Culturify : Fixed cost : Billable' },
  { id: 'task_11', label: 'Real-time Sync', group: 'DycoVue : Dedicated : Billable' },
  { id: 'task_12', label: 'Landing Page Design', group: 'Ceremonia : Fixed Cost : Billable' },
  { id: 'task_13', label: 'SEO Audit', group: '_INX-Company Website Revamp' },
  { id: 'task_14', label: 'FHIR API Integration', group: 'HealthSync : T & M : Billable' },
]

export const TAG_ITEMS = [
  { id: 'tag_1', label: 'Bug' },
  { id: 'tag_2', label: 'Feature' },
  { id: 'tag_3', label: 'Review' },
  { id: 'tag_4', label: 'Meeting' },
  { id: 'tag_5', label: 'Research' },
  { id: 'tag_6', label: 'Design' },
  { id: 'tag_7', label: 'DevOps' },
  { id: 'tag_8', label: 'Testing' },
]

export const STATUS_ITEMS = [
  { id: 'billable', label: 'Billable', group: 'Billable' },
  { id: 'non-billable', label: 'Non-billable', group: 'Billable' },
]

export interface DateRange {
  from: Date
  to: Date
}

interface ReportShellProps {
  dateRange: DateRange
  onRangeChange: (r: DateRange) => void
  showFilters?: boolean
  children: React.ReactNode
}

export function ReportShell({ dateRange, onRangeChange, showFilters = true, children }: ReportShellProps) {
  const pathname = usePathname()
  const [selTeam, setSelTeam] = useState<string[]>([])
  const [selLead, setSelLead] = useState<string[]>([])
  const [selProject, setSelProject] = useState<string[]>([])
  const [selTask, setSelTask] = useState<string[]>([])
  const [selTag, setSelTag] = useState<string[]>([])
  const [selStatus, setSelStatus] = useState<string[]>([])

  return (
    <div className="flex flex-col h-full bg-[#f2f6f8] overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center justify-between px-4 h-[48px] bg-white border-b border-[#e4eaee] flex-shrink-0">
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-1.5 px-3 h-[30px] text-[13px] text-[#555] border border-[#d0d8de] rounded mr-2 hover:border-[#aaa] cursor-pointer">
            Time Report <ChevronDown className="h-3 w-3 text-[#aaa]" />
          </button>
          {TABS.map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'px-4 h-[30px] flex items-center text-[13px] rounded transition-colors',
                pathname === tab.href
                  ? 'bg-[#03a9f4] text-white font-medium'
                  : 'text-[#555] hover:bg-[#f0f4f8]'
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Date range picker + prev/next */}
        <div className="flex items-center gap-0">
          <button
            onClick={() => onRangeChange({ from: addDays(dateRange.from, -1), to: addDays(dateRange.to, -1) })}
            className="w-[28px] h-[28px] flex items-center justify-center border border-[#d0d8de] border-r-0 rounded-l hover:bg-[#f5f7f9] text-[#999] cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <DateRangePicker initialRange={dateRange} onRangeChange={onRangeChange} />
          <button
            onClick={() => onRangeChange({ from: addDays(dateRange.from, 1), to: addDays(dateRange.to, 1) })}
            className="w-[28px] h-[28px] flex items-center justify-center border border-[#d0d8de] border-l-0 rounded-r hover:bg-[#f5f7f9] text-[#999] cursor-pointer"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="flex items-center gap-1.5 px-4 h-[46px] bg-white border-b border-[#e4eaee] flex-shrink-0 flex-wrap">
          <button className="flex items-center gap-1.5 px-3 h-[30px] text-[13px] text-[#555] border border-[#d0d8de] rounded hover:border-[#aaa] cursor-pointer">
            <Filter className="h-3.5 w-3.5" /> Filter <ChevronDown className="h-3 w-3 text-[#aaa]" />
          </button>
          <FilterDropdown label="Team" placeholder="Search users or groups" items={TEAM_ITEMS} selected={selTeam} onChange={setSelTeam} />
          <FilterDropdown label="Project Lead" placeholder="Search Project Lead" items={LEAD_ITEMS} selected={selLead} onChange={setSelLead} showWithout="Without Project Lead" />
          <FilterDropdown label="Project" placeholder="Search Projects" items={PROJECT_ITEMS} selected={selProject} onChange={setSelProject} showWithout="Without Project" />
          <FilterDropdown label="Task" placeholder="Search Tasks" items={TASK_ITEMS} selected={selTask} onChange={setSelTask} showWithout="Without Task" />
          <FilterDropdown label="Tag" placeholder="Search Tags" items={TAG_ITEMS} selected={selTag} onChange={setSelTag} showWithout="Without Tag" />
          <FilterDropdown label="Status" placeholder="" items={STATUS_ITEMS} selected={selStatus} onChange={setSelStatus} noSearch />
          <button className="flex items-center gap-1 px-3 h-[30px] text-[13px] border border-[#d0d8de] rounded text-[#555] hover:border-[#aaa] cursor-pointer">
            Description <ChevronDown className="h-3 w-3 text-[#aaa]" />
          </button>
          <button className="ml-auto px-5 h-[30px] text-[13px] font-medium text-white bg-[#03a9f4] hover:bg-[#0288d1] rounded cursor-pointer whitespace-nowrap">
            Apply Filter
          </button>
        </div>
      )}

      {children}
    </div>
  )
}
