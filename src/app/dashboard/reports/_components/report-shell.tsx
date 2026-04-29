'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react'
import { addDays } from 'date-fns'
import { cn } from '@/lib/utils'
import { FilterDropdown } from '../summary/filter-dropdown'
import { DateRangePicker } from '@/components/dashboard/date-range-picker'
import { FilterVisibilityDropdown, FilterKey, ALL_FILTER_KEYS } from './filter-visibility-dropdown'
import { DescriptionPill } from './description-pill'
import { useDataStore } from '@/lib/stores/data-store'
import { canViewAllTimeEntries } from '@/lib/rbac'
import { useAuthStore } from '@/lib/stores/auth-store'

export const TABS = [
  { label: 'Summary', href: '/dashboard/reports/summary' },
  { label: 'Detailed', href: '/dashboard/reports/detailed' },
  { label: 'Weekly', href: '/dashboard/reports/weekly' },
  { label: 'Shared', href: '/dashboard/reports/shared' },
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
  initialTeam?: string[]
  initialLead?: string[]
  initialProject?: string[]
  initialTags?: string[]
  initialTasks?: string[]
  initialStatus?: string[]
  initialDescription?: string
  onApply?: (filters: { team: string[]; lead: string[]; project: string[]; tasks: string[]; tags: string[]; status: string[]; description: string }) => void
  children: React.ReactNode
}

export function ReportShell({ dateRange, onRangeChange, showFilters = true, initialTeam = [], initialLead = [], initialProject = [], initialTags = [], initialTasks = [], initialStatus = [], initialDescription = '', onApply, children }: ReportShellProps) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { users, groups, projects, tasks, tags } = useDataStore()

  // ── Build filter items from store data ──────────────────────────────────────
  const teamItems = useMemo(() => {
    const groupItems = groups.map(g => ({ id: g.id, label: g.name, group: 'Groups' }))
    const userItems = canViewAllTimeEntries(user?.role ?? 'member')
      ? users.map(u => ({ id: u.id, label: u.name }))
      : [] // members only see their own data, no team filter needed
    return [...groupItems, ...userItems]
  }, [groups, users, user])

  const leadItems = useMemo(() => {
    // Unique leads from projects that have a leadId
    const seen = new Set<string>()
    return projects
      .filter(p => p.leadId && p.leadName)
      .reduce<{ id: string; label: string }[]>((acc, p) => {
        if (!seen.has(p.leadId!)) {
          seen.add(p.leadId!)
          acc.push({ id: p.leadId!, label: p.leadName! })
        }
        return acc
      }, [])
  }, [projects])

  const projectItems = useMemo(() =>
    projects
      .filter(p => !p.archived)
      .map(p => ({
        id: p.id,
        label: p.name,
        group: p.leadName || 'No Project Lead',
      })),
    [projects]
  )

  const taskItems = useMemo(() =>
    tasks.map(t => {
      const proj = projects.find(p => p.id === t.projectId)
      return { id: t.id, label: t.name, group: proj?.name || 'Unknown Project' }
    }),
    [tasks, projects]
  )

  const tagItems = useMemo(() =>
    tags
      .filter(t => !t.archived)
      .map(t => ({ id: t.id, label: t.name })),
    [tags]
  )
  // ────────────────────────────────────────────────────────────────────────────

  const [selTeam, setSelTeam] = useState<string[]>(initialTeam)
  const [selLead, setSelLead] = useState<string[]>(initialLead)
  const [selProject, setSelProject] = useState<string[]>(initialProject)
  const [selTask, setSelTask] = useState<string[]>(initialTasks)
  const [selTag, setSelTag] = useState<string[]>(initialTags)
  const [selStatus, setSelStatus] = useState<string[]>(initialStatus)
  const [selDesc, setSelDesc] = useState<string>(initialDescription)
  const [visibleFilters, setVisibleFilters] = useState<FilterKey[]>([...ALL_FILTER_KEYS])
  const [timeReportOpen, setTimeReportOpen] = useState(false)
  const timeReportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (timeReportRef.current && !timeReportRef.current.contains(e.target as Node)) setTimeReportOpen(false)
    }
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [])

  return (
    <div className="flex flex-col bg-[#f2f6f8] min-h-screen">
      {/* Tab bar */}
      <div className="flex items-center justify-between px-6 m-6 h-[56px] bg-white border-b border-[#e4eaee] flex-shrink-0">
        <div className="flex items-center gap-1">
          <div className="relative" ref={timeReportRef}>
            <button
              onClick={() => setTimeReportOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 h-[34px] text-[14px] text-[#555] bg-white border border-[#d0d8de] rounded mr-3 hover:border-[#aaa] cursor-pointer font-medium"
            >
              TIME REPORT <ChevronDown className="h-3.5 w-3.5 text-[#aaa]" />
            </button>
            {timeReportOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-[#e4eaee] shadow-lg z-[200] min-w-[180px] py-1">
                <button className="w-full text-left px-4 py-2.5 text-[14px] text-[#333] hover:bg-[#f5f7f9] cursor-pointer font-medium bg-[#f5f7f9]">
                  Time report
                </button>
                <button className="w-full text-left px-4 py-2.5 text-[14px] text-[#555] hover:bg-[#f5f7f9] cursor-pointer">
                  Team report
                </button>
                <button className="w-full text-left px-4 py-2.5 text-[14px] text-[#555] hover:bg-[#f5f7f9] cursor-pointer">
                  Expense report
                </button>
              </div>
            )}
          </div>
          {TABS.map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'px-4 h-[56px] flex items-center text-[14px] transition-colors border-b-2 -mb-px',
                pathname === tab.href
                  ? 'text-[#333] font-bold border-b-[#333]'
                  : 'text-[#777] hover:text-[#333] border-b-transparent font-normal'
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-0">
          <button onClick={() => onRangeChange({ from: addDays(dateRange.from, -7), to: addDays(dateRange.to, -7) })} className="w-[28px] h-[28px] flex items-center justify-center border border-[#d0d8de] border-r-0 rounded-l hover:bg-[#f5f7f9] text-[#999] cursor-pointer">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <DateRangePicker initialRange={dateRange} onRangeChange={onRangeChange} />
          <button onClick={() => onRangeChange({ from: addDays(dateRange.from, 7), to: addDays(dateRange.to, 7) })} className="w-[28px] h-[28px] flex items-center justify-center border border-[#d0d8de] border-l-0 rounded-r hover:bg-[#f5f7f9] text-[#999] cursor-pointer">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="flex items-center px-6 h-[65px] m-6 bg-white border-b border-[#e4eaee] flex-shrink-0">
          <FilterVisibilityDropdown visible={visibleFilters} onChange={setVisibleFilters} />
          {visibleFilters.includes('Team') && (
            <><div className="w-px h-5 bg-[#e4eaee] flex-shrink-0" />
              <FilterDropdown label="Team" placeholder="Search users or groups" items={teamItems} selected={selTeam} onChange={setSelTeam} noDataMessage="No users or groups" /></>)}
          {visibleFilters.includes('Project Lead') && (
            <><div className="w-px h-5 bg-[#e4eaee] flex-shrink-0" />
              <FilterDropdown label="Project Lead" placeholder="Search Project Lead" items={leadItems} selected={selLead} onChange={setSelLead} showWithout="Without Project Lead" noDataMessage="No project leads" /></>)}
          {visibleFilters.includes('Project') && (
            <><div className="w-px h-5 bg-[#e4eaee] flex-shrink-0" />
              <FilterDropdown label="Project" placeholder="Search Projects" items={projectItems} selected={selProject} onChange={setSelProject} showWithout="Without Project" noDataMessage="No projects" /></>)}
          {visibleFilters.includes('Task') && (
            <><div className="w-px h-5 bg-[#e4eaee] flex-shrink-0" />
              <FilterDropdown label="Task" placeholder="Search Tasks" items={taskItems} selected={selTask} onChange={setSelTask} showWithout="Without Task" noDataMessage="No tasks" /></>)}
          {visibleFilters.includes('Tag') && (
            <><div className="w-px h-5 bg-[#e4eaee] flex-shrink-0" />
              <FilterDropdown label="Tag" placeholder="Search Tags" items={tagItems} selected={selTag} onChange={setSelTag} showWithout="Without Tag" noDataMessage="No tags" /></>)}
          {visibleFilters.includes('Status') && (
            <><div className="w-px h-5 bg-[#e4eaee] flex-shrink-0" />
              <FilterDropdown label="Status" placeholder="" items={STATUS_ITEMS} selected={selStatus} onChange={setSelStatus} noSearch /></>)}
          {visibleFilters.includes('Description') && (
            <DescriptionPill value={selDesc} onChange={setSelDesc} />
          )}
          <button
            onClick={() => onApply?.({ team: selTeam, lead: selLead, project: selProject, tasks: selTask, tags: selTag, status: selStatus, description: selDesc })}
            className="ml-auto px-5 h-[32px] text-[13px] font-bold uppercase tracking-wide text-white bg-[#03a9f4] hover:bg-[#0288d1] rounded-sm cursor-pointer whitespace-nowrap"
          >
            APPLY FILTER
          </button>
        </div>
      )}

      {children}
    </div>
  )
}
