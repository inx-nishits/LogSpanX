'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, ChevronDown, Filter, Printer, Share2, Search, X, Check } from 'lucide-react'
import { startOfWeek, endOfWeek, startOfDay, endOfDay, eachDayOfInterval, format, isSameDay, addDays } from 'date-fns'
import { useDataStore } from '@/lib/stores/data-store'
import { cn } from '@/lib/utils'
import { SummaryBarChart } from './summary-bar-chart'
import { SummaryDonut } from './summary-donut'
import { SummaryTable, SummaryRow } from './summary-table'
import { FilterDropdown } from './filter-dropdown'
import { DateRangePicker } from '@/components/dashboard/date-range-picker'

// ─── Static data ─────────────────────────────────────────────────────────────

const TABS = [
  { label: 'Summary', href: '/dashboard/reports/summary' },
  { label: 'Detailed', href: '/dashboard/reports/detailed' },
  { label: 'Weekly', href: '/dashboard/reports/weekly' },
  { label: 'Shared', href: '/dashboard/reports/shared' },
]

const GROUP_OPTIONS = ['User', 'Project', 'Client', 'Tag', 'Date', 'Description']
const SUB_GROUP_OPTIONS = ['Description', 'Project', 'Tag', 'Task']

const TEAM_ITEMS = [
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

const LEAD_ITEMS = [
  { id: 'pl_1', label: 'Aiyub Munshi' },
  { id: 'pl_2', label: 'Chirag Gopiyani' },
  { id: 'pl_3', label: 'Darshan Belani' },
  { id: 'pl_4', label: 'Harin Patel' },
  { id: 'pl_5', label: 'Inheritx Solutions' },
  { id: 'pl_6', label: 'Jamal Derdivala' },
  { id: 'pl_7', label: 'Jaydeep Vegad' },
  { id: 'pl_8', label: 'Nishit Sangani' },
]

const PROJECT_ITEMS = [
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

const TASK_ITEMS = [
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

const TAG_ITEMS = [
  { id: 'tag_1', label: 'Bug' },
  { id: 'tag_2', label: 'Feature' },
  { id: 'tag_3', label: 'Review' },
  { id: 'tag_4', label: 'Meeting' },
  { id: 'tag_5', label: 'Research' },
  { id: 'tag_6', label: 'Design' },
  { id: 'tag_7', label: 'DevOps' },
  { id: 'tag_8', label: 'Testing' },
]

const STATUS_ITEMS = [
  { id: 'billable', label: 'Billable', group: 'Billable' },
  { id: 'non-billable', label: 'Non-billable', group: 'Billable' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtSecs(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

function fmtH(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

// ─── Description filter ──────────────────────────────────────────────────────

function DescriptionFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-1 px-3 h-[30px] text-[13px] border rounded transition-colors cursor-pointer',
          open || value ? 'border-[#03a9f4] text-[#03a9f4]' : 'border-[#d0d8de] text-[#555] hover:border-[#aaa]'
        )}
      >
        Description {value && <span className="ml-1 bg-[#03a9f4] text-white text-[10px] font-bold rounded-full w-[16px] h-[16px] flex items-center justify-center">1</span>}
        <ChevronDown className="h-3 w-3 text-[#aaa]" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-0.5 bg-white border border-[#ddd] shadow-lg z-[300] w-[260px] p-2">
          <div className="flex items-center border-b border-[#eee] pb-2 mb-2">
            <Search className="h-3.5 w-3.5 text-[#bbb] flex-shrink-0 mr-1.5" />
            <input
              autoFocus
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="Enter description..."
              className="flex-1 text-[13px] outline-none placeholder:text-[#bbb]"
            />
            {value && (
              <button onClick={() => onChange('')} className="text-[#aaa] hover:text-[#555] ml-1">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <label className="flex items-center gap-2 px-1 py-1 cursor-pointer hover:bg-[#f5f7f9]">
            <div
              className={cn('w-[15px] h-[15px] border flex items-center justify-center flex-shrink-0', value === '__without__' ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-[#bbb]')}
              onClick={() => onChange(value === '__without__' ? '' : '__without__')}
            >
              {value === '__without__' && <Check className="h-2.5 w-2.5 text-white stroke-[3px]" />}
            </div>
            <span className="text-[13px] text-[#333]">Without description</span>
          </label>
        </div>
      )}
    </div>
  )
}

// ─── GroupBy dropdown ─────────────────────────────────────────────────────────

function SimpleDropdown({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useState<HTMLDivElement | null>(null)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-2.5 h-[28px] text-[13px] text-[#555] bg-white border border-[#d0d8de] rounded hover:border-[#aaa] transition-colors cursor-pointer"
      >
        {value} <ChevronDown className="h-3 w-3 text-[#aaa]" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-0.5 bg-white border border-[#ddd] shadow-lg z-50 min-w-[140px] py-0.5">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false) }}
              className={cn(
                'w-full text-left px-3 py-1.5 text-[13px] transition-colors cursor-pointer',
                value === opt ? 'bg-[#03a9f4] text-white' : 'text-[#555] hover:bg-[#f0f4f8]'
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SummaryReportPage() {
  const pathname = usePathname()
  const { timeEntries, projects, users } = useDataStore()

  const [dateRange, setDateRange] = useState({
    from: startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
    to: endOfDay(endOfWeek(new Date(), { weekStartsOn: 1 })),
  })
  const [groupBy, setGroupBy] = useState('User')
  const [subGroupBy, setSubGroupBy] = useState('Description')

  const [selTeam, setSelTeam] = useState<string[]>([])
  const [selLead, setSelLead] = useState<string[]>([])
  const [selProject, setSelProject] = useState<string[]>([])
  const [selTask, setSelTask] = useState<string[]>([])
  const [selTag, setSelTag] = useState<string[]>([])
  const [selStatus, setSelStatus] = useState<string[]>([])
  const [descSearch, setDescSearch] = useState('')

  // Applied filter state — only updates when Apply Filter is clicked
  const [appliedFilters, setAppliedFilters] = useState({
    team: [] as string[],
    lead: [] as string[],
    project: [] as string[],
    task: [] as string[],
    tag: [] as string[],
    status: [] as string[],
    desc: '',
  })

  const applyFilters = () => setAppliedFilters({
    team: selTeam, lead: selLead, project: selProject,
    task: selTask, tag: selTag, status: selStatus, desc: descSearch,
  })

  const from = useMemo(() => startOfDay(dateRange.from), [dateRange.from])
  const to = useMemo(() => endOfDay(dateRange.to), [dateRange.to])

  // Map user IDs from team filter (strip group IDs that start with 'g')
  const teamUserIds = useMemo(() =>
    appliedFilters.team.filter(id => id.startsWith('user_')),
    [appliedFilters.team]
  )

  // Map project lead IDs from lead filter — match by name to project.leadId
  const leadUserIds = useMemo(() => {
    if (!appliedFilters.lead.length) return []
    const leadNames = LEAD_ITEMS.filter(l => appliedFilters.lead.includes(l.id)).map(l => l.label)
    return users.filter(u => leadNames.includes(u.name)).map(u => u.id)
  }, [appliedFilters.lead, users])

  const filtered = useMemo(() => {
    return timeEntries.filter(e => {
      const t = new Date(e.startTime)
      if (t < from || t > to) return false

      // Team filter — filter by selected user IDs
      if (teamUserIds.length > 0 && !teamUserIds.includes(e.userId)) return false

      // Project Lead filter — filter entries whose project has a matching lead
      if (leadUserIds.length > 0) {
        const proj = projects.find(p => p.id === e.projectId)
        if (!proj || !leadUserIds.includes(proj.leadId ?? '')) return false
      }

      // Project filter
      if (appliedFilters.project.length > 0) {
        const wantWithout = appliedFilters.project.includes('__without__')
        const projectIds = appliedFilters.project.filter(id => id !== '__without__')
        if (wantWithout && !e.projectId) return true
        if (projectIds.length > 0 && !projectIds.includes(e.projectId ?? '')) return false
        if (!wantWithout && projectIds.length === 0) return false
      }

      // Task filter — match by taskId
      if (appliedFilters.task.length > 0) {
        const wantWithout = appliedFilters.task.includes('__without__')
        const taskIds = appliedFilters.task.filter(id => id !== '__without__')
        if (wantWithout && !e.taskId) return true
        if (taskIds.length > 0 && !taskIds.includes(e.taskId ?? '')) return false
        if (!wantWithout && taskIds.length === 0) return false
      }

      // Status filter — billable / non-billable
      if (appliedFilters.status.length > 0 && appliedFilters.status.length < 2) {
        if (appliedFilters.status.includes('billable') && !e.billable) return false
        if (appliedFilters.status.includes('non-billable') && e.billable) return false
      }

      // Description filter
      if (appliedFilters.desc.trim()) {
        if (!e.description?.toLowerCase().includes(appliedFilters.desc.toLowerCase())) return false
      }

      return true
    })
  }, [timeEntries, from, to, teamUserIds, leadUserIds, appliedFilters, projects])

  const totalSecs = useMemo(() => filtered.reduce((a, e) => a + (e.duration ?? 0), 0), [filtered])
  const billableSecs = useMemo(() => filtered.filter(e => e.billable).reduce((a, e) => a + (e.duration ?? 0), 0), [filtered])

  const barData = useMemo(() => {
    return eachDayOfInterval({ start: from, end: to }).map(date => {
      const day = filtered.filter(e => isSameDay(new Date(e.startTime), date))
      const b = day.filter(e => e.billable).reduce((a, e) => a + (e.duration ?? 0), 0) / 3600
      const nb = day.filter(e => !e.billable).reduce((a, e) => a + (e.duration ?? 0), 0) / 3600
      return {
        name: format(date, 'EEE, MMM d'),
        billable: Number(b.toFixed(2)),
        nonBillable: Number(nb.toFixed(2)),
        totalLabel: (b + nb) > 0 ? fmtH((b + nb) * 3600) : '',
      }
    })
  }, [filtered, from, to])

  const donutData = useMemo(() => {
    const map: Record<string, number> = {}
    filtered.forEach(e => { if (e.projectId) map[e.projectId] = (map[e.projectId] || 0) + (e.duration ?? 0) })
    return Object.entries(map).map(([pid, secs]) => {
      const p = projects.find(pr => pr.id === pid)
      return { name: p?.name || 'Unknown', value: secs, color: p?.color || '#ccc' }
    }).sort((a, b) => b.value - a.value)
  }, [filtered, projects])

  const tableRows = useMemo((): SummaryRow[] => {
    if (groupBy === 'User') {
      return users.map(u => {
        const ue = filtered.filter(e => e.userId === u.id)
        if (!ue.length) return null
        const descMap: Record<string, { duration: number; count: number; projectId?: string }> = {}
        ue.forEach(e => {
          const k = e.description || '(no description)'
          if (!descMap[k]) descMap[k] = { duration: 0, count: 0, projectId: e.projectId }
          descMap[k].duration += e.duration ?? 0
          descMap[k].count++
        })
        return {
          id: u.id,
          title: u.name,
          color: '#03a9f4',
          entryCount: ue.length,
          duration: ue.reduce((a, e) => a + (e.duration ?? 0), 0),
          billable: false,
          children: Object.entries(descMap).map(([desc, d]) => {
            const proj = projects.find(p => p.id === d.projectId)
            return { id: `${u.id}-${desc}`, title: desc, color: proj?.color || '#ccc', entryCount: d.count, duration: d.duration, billable: false }
          }),
        }
      }).filter(Boolean) as SummaryRow[]
    }
    if (groupBy === 'Project') {
      return projects.map(p => {
        const pe = filtered.filter(e => e.projectId === p.id)
        if (!pe.length) return null
        return { id: p.id, title: p.name, color: p.color, entryCount: pe.length, duration: pe.reduce((a, e) => a + (e.duration ?? 0), 0), billable: p.billable }
      }).filter(Boolean) as SummaryRow[]
    }
    return filtered.map(e => {
      const proj = projects.find(p => p.id === e.projectId)
      return { id: e.id, title: e.description || '(no description)', color: proj?.color || '#ccc', entryCount: 1, duration: e.duration ?? 0, billable: e.billable }
    })
  }, [filtered, groupBy, users, projects])

  return (
    <div className="flex flex-col h-full bg-[#f2f6f8] overflow-hidden">

      {/* ── Tab bar ── */}
      <div className="flex items-center justify-between px-4 h-[48px] bg-white border-b border-[#e4eaee] flex-shrink-0">
        <div className="flex items-center gap-1">
          {/* Time Report button */}
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

        {/* Date nav */}
        <div className="flex items-center gap-0">
          <button
            onClick={() => setDateRange(r => ({ from: addDays(r.from, -1), to: addDays(r.to, -1) }))}
            className="w-[28px] h-[28px] flex items-center justify-center border border-[#d0d8de] border-r-0 rounded-l hover:bg-[#f5f7f9] text-[#999] cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <DateRangePicker initialRange={dateRange} onRangeChange={setDateRange} />
          <button
            onClick={() => setDateRange(r => ({ from: addDays(r.from, 1), to: addDays(r.to, 1) }))}
            className="w-[28px] h-[28px] flex items-center justify-center border border-[#d0d8de] border-l-0 rounded-r hover:bg-[#f5f7f9] text-[#999] cursor-pointer"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex items-center gap-1.5 px-4 h-[46px] bg-white border-b border-[#e4eaee] flex-shrink-0">
        <button className="flex items-center gap-1.5 px-3 h-[30px] text-[13px] text-[#555] border border-[#d0d8de] rounded hover:border-[#aaa] transition-colors cursor-pointer">
          <Filter className="h-3.5 w-3.5" /> Filter <ChevronDown className="h-3 w-3 text-[#aaa]" />
        </button>
        <FilterDropdown label="Team" placeholder="Search users or groups" items={TEAM_ITEMS} selected={selTeam} onChange={setSelTeam} />
        <FilterDropdown label="Project Lead" placeholder="Search Project Lead" items={LEAD_ITEMS} selected={selLead} onChange={setSelLead} showWithout="Without Project Lead" />
        <FilterDropdown label="Project" placeholder="Search Projects" items={PROJECT_ITEMS} selected={selProject} onChange={setSelProject} showWithout="Without Project" />
        <FilterDropdown label="Task" placeholder="Search Tasks" items={TASK_ITEMS} selected={selTask} onChange={setSelTask} showWithout="Without Task" />
        <FilterDropdown label="Tag" placeholder="Search Tags" items={TAG_ITEMS} selected={selTag} onChange={setSelTag} showWithout="Without Tag" />
        <FilterDropdown label="Status" placeholder="" items={STATUS_ITEMS} selected={selStatus} onChange={setSelStatus} noSearch />
        {/* Description — search input style */}
        <DescriptionFilter value={descSearch} onChange={setDescSearch} />
        <button
          onClick={applyFilters}
          className="ml-auto px-5 h-[30px] text-[13px] font-medium text-white bg-[#03a9f4] hover:bg-[#0288d1] rounded transition-colors cursor-pointer whitespace-nowrap">
          Apply Filter
        </button>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto">

        {/* Stats bar */}
        <div className="flex items-center justify-between bg-white border-b border-[#e4eaee] px-5 h-[44px] flex-wrap gap-2">
          <div className="flex items-center gap-5 text-[14px]">
            <span className="text-[#555]">Total: <strong className="text-[#333] font-bold tabular-nums">{fmtSecs(totalSecs)}</strong></span>
            <span className="text-[#555]">Billable: <strong className="text-[#333] font-bold tabular-nums">{fmtSecs(billableSecs)}</strong></span>
            <span className="text-[#555]">Amount: <strong className="text-[#333] font-bold">0.00 USD</strong></span>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-[#555]">
            <button className="hover:text-[#03a9f4] cursor-pointer">Create invoice</button>
            <button className="flex items-center gap-0.5 hover:text-[#03a9f4] cursor-pointer">Export <ChevronDown className="h-3 w-3" /></button>
            <button className="hover:text-[#03a9f4] cursor-pointer"><Printer className="h-4 w-4" /></button>
            <button className="hover:text-[#03a9f4] cursor-pointer"><Share2 className="h-4 w-4" /></button>
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-[18px] bg-[#ccc] rounded-full relative cursor-pointer flex-shrink-0">
                <div className="w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] left-[2px] shadow-sm" />
              </div>
              <span className="text-[#aaa]">Rounding</span>
            </div>
            <button className="flex items-center gap-0.5 hover:text-[#03a9f4] cursor-pointer">Show amount <ChevronDown className="h-3 w-3" /></button>
          </div>
        </div>

        {/* Bar chart section */}
        <div className="bg-white border-b border-[#e4eaee] px-5 pt-4 pb-2">
          <div className="mb-3">
            <button className="flex items-center gap-1.5 px-3 h-[28px] text-[13px] text-[#555] border border-[#d0d8de] rounded hover:border-[#aaa] cursor-pointer">
              Billability <ChevronDown className="h-3 w-3 text-[#aaa]" />
            </button>
          </div>
          <SummaryBarChart data={barData} />
        </div>

        {/* Group by + Table + Donut */}
        <div className="flex gap-0 items-start p-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-[#aaa]">Group by:</span>
              <SimpleDropdown value={groupBy} options={GROUP_OPTIONS} onChange={setGroupBy} />
              <SimpleDropdown value={subGroupBy} options={SUB_GROUP_OPTIONS} onChange={setSubGroupBy} />
            </div>
            <SummaryTable rows={tableRows} />
          </div>

          {/* Donut */}
          <div className="flex-shrink-0 pl-4 pt-8">
            <SummaryDonut data={donutData} totalLabel={fmtSecs(totalSecs)} />
          </div>
        </div>

      </div>
    </div>
  )
}
