'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, ChevronDown, Filter, Printer, Share2, Search, X, Check } from 'lucide-react'
import { startOfWeek, endOfWeek, startOfDay, endOfDay, eachDayOfInterval, format, isSameDay, addDays } from 'date-fns'
import { useDataStore } from '@/lib/stores/data-store'
import { cn } from '@/lib/utils'
import { TimeReportDropdown } from '../_components/time-report-dropdown'
import { SummaryBarChart } from './summary-bar-chart'
import { SummaryDonut } from './summary-donut'
import { SummaryTable, SummaryRow } from './summary-table'
import { FilterDropdown } from './filter-dropdown'
import { FilterVisibilityDropdown, FilterKey, ALL_FILTER_KEYS } from '../_components/filter-visibility-dropdown'
import { DateRangePicker } from '@/components/dashboard/date-range-picker'

// ─── Static data ─────────────────────────────────────────────────────────────

const TABS = [
  { label: 'Summary', href: '/dashboard/reports/summary' },
  { label: 'Detailed', href: '/dashboard/reports/detailed' },
  { label: 'Weekly', href: '/dashboard/reports/weekly' },
  { label: 'Shared', href: '/dashboard/reports/shared' },
]

const GROUP_OPTIONS = ['Project', 'Project Lead', 'User', 'Group', 'Tag', 'Month', 'Week', 'Date']
const SUB_GROUP_OPTIONS = ['(None)', 'Project', 'Task', 'Project Lead', 'Tag', 'Description', 'Month', 'Week', 'Date']

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
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
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
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-1 px-4 h-[52px] text-[14px] transition-colors cursor-pointer',
          open || value ? 'text-[#03a9f4]' : 'text-[#555] hover:text-[#333]'
        )}
      >
        Description
        {value && value !== '__without__' && (
          <span className="ml-1 bg-[#03a9f4] text-white text-[11px] font-bold rounded-full w-[16px] h-[16px] flex items-center justify-center">1</span>
        )}
        <ChevronDown className="h-3 w-3 text-[#aaa]" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-0.5 bg-white border border-[#e4eaee] shadow-lg z-[300] w-[300px] py-3 px-3">
          {/* Search box matching screenshot */}
          <div className="flex items-center gap-2 px-3 h-[38px] border border-[#d0d8de] rounded bg-white mb-3">
            <Search className="h-4 w-4 text-[#bbb] flex-shrink-0" />
            <input
              autoFocus
              value={value === '__without__' ? '' : value}
              onChange={e => onChange(e.target.value)}
              placeholder="Enter description..."
              className="flex-1 text-[14px] outline-none placeholder:text-[#bbb] bg-transparent"
            />
            {value && value !== '__without__' && (
              <button onClick={() => onChange('')} className="text-[#bbb] hover:text-[#555]">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {/* Without description checkbox */}
          <div
            className="flex items-center gap-2.5 px-1 py-1.5 cursor-pointer hover:bg-[#f5f7f9] rounded"
            onClick={() => onChange(value === '__without__' ? '' : '__without__')}
          >
            <div className={cn(
              'w-[15px] h-[15px] border flex items-center justify-center flex-shrink-0 transition-colors',
              value === '__without__' ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-[#bbb] bg-white'
            )}>
              {value === '__without__' && <Check className="h-2.5 w-2.5 text-white stroke-[3px]" />}
            </div>
            <span className="text-[14px] text-[#333]">Without description</span>
          </div>
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

// ─── Billability dropdown ───────────────────────────────────────────────────

const BILLABILITY_OPTIONS = ['Billability', 'Project']

function BillabilityDropdown({ mode, onChange }: { mode: 'billability' | 'project'; onChange: (m: 'billability' | 'project') => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = mode === 'project' ? 'Project' : 'Billability'

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
        className="flex items-center gap-1.5 px-3 h-[28px] text-[13px] text-[#555] border border-[#d0d8de] rounded hover:border-[#aaa] cursor-pointer"
      >
        {selected} <ChevronDown className="h-3 w-3 text-[#aaa]" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-0.5 bg-white border border-[#ddd] shadow-lg z-50 min-w-[130px] py-0.5">
          {BILLABILITY_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt === 'Project' ? 'project' : 'billability'); setOpen(false) }}
              className={cn(
                'w-full text-left px-3 py-2 text-[13px] transition-colors cursor-pointer flex items-center justify-between',
                selected === opt ? 'bg-[#f0f4f8] text-[#333] font-medium' : 'text-[#555] hover:bg-[#f5f5f5]'
              )}
            >
              {opt}
              {selected === opt && <Check className="h-3.5 w-3.5 text-[#03a9f4]" />}
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
  const router = useRouter()
  const { timeEntries, projects, users } = useDataStore()

  const [dateRange, setDateRange] = useState({
    from: startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
    to: endOfDay(endOfWeek(new Date(), { weekStartsOn: 1 })),
  })
  const [groupBy, setGroupBy] = useState('User')
  const [subGroupBy, setSubGroupBy] = useState('Description')
  const [billabilityMode, setBillabilityMode] = useState<'billability' | 'project'>('billability')

  const [selTeam, setSelTeam] = useState<string[]>([])
  const [selLead, setSelLead] = useState<string[]>([])
  const [selProject, setSelProject] = useState<string[]>([])
  const [selTask, setSelTask] = useState<string[]>([])
  const [selTag, setSelTag] = useState<string[]>([])
  const [selStatus, setSelStatus] = useState<string[]>([])
  const [descSearch, setDescSearch] = useState('')
  const [visibleFilters, setVisibleFilters] = useState<FilterKey[]>([...ALL_FILTER_KEYS])

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

  // Map project lead IDs from lead filter — match lead item labels to user names in store
  const leadUserIds = useMemo(() => {
    if (!appliedFilters.lead.length) return []
    const selectedLeadNames = LEAD_ITEMS
      .filter(l => appliedFilters.lead.includes(l.id))
      .map(l => l.label)
    return users
      .filter(u => selectedLeadNames.includes(u.name))
      .map(u => u.id)
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
        if (!e.projectId) {
          if (!wantWithout) return false
        } else {
          if (projectIds.length > 0 && !projectIds.includes(e.projectId)) return false
          if (projectIds.length === 0 && !wantWithout) return false
        }
      }

      // Task filter — match by taskId
      if (appliedFilters.task.length > 0) {
        const wantWithout = appliedFilters.task.includes('__without__')
        const taskIds = appliedFilters.task.filter(id => id !== '__without__')
        if (!e.taskId) {
          if (!wantWithout) return false
        } else {
          if (taskIds.length > 0 && !taskIds.includes(e.taskId)) return false
          if (taskIds.length === 0 && !wantWithout) return false
        }
      }

      // Status filter — billable / non-billable
      if (appliedFilters.status.length > 0 && appliedFilters.status.length < 2) {
        if (appliedFilters.status.includes('billable') && !e.billable) return false
        if (appliedFilters.status.includes('non-billable') && e.billable) return false
      }

      // Description filter
      if (appliedFilters.desc) {
        if (appliedFilters.desc === '__without__') {
          if (e.description?.trim()) return false
        } else {
          if (!e.description?.toLowerCase().includes(appliedFilters.desc.toLowerCase())) return false
        }
      }

      return true
    })
  }, [timeEntries, from, to, teamUserIds, leadUserIds, appliedFilters, projects])

  const totalSecs = useMemo(() => filtered.reduce((a, e) => a + (e.duration ?? 0), 0), [filtered])
  const billableSecs = useMemo(() => filtered.filter(e => e.billable).reduce((a, e) => a + (e.duration ?? 0), 0), [filtered])

  const barData = useMemo(() => {
    const days = eachDayOfInterval({ start: from, end: to })

    const buildDay = (date: Date) => {
      const day = filtered.filter(e => isSameDay(new Date(e.startTime), date))
      const b = day.filter(e => e.billable).reduce((a, e) => a + (e.duration ?? 0), 0) / 3600
      const nb = day.filter(e => !e.billable).reduce((a, e) => a + (e.duration ?? 0), 0) / 3600
      const base = { name: format(date, 'EEE, MMM d'), billable: Number(b.toFixed(2)), nonBillable: Number(nb.toFixed(2)), totalLabel: fmtH((b + nb) * 3600) }
      // always inject per-project hours so project mode works
      const perProject: Record<string, number> = {}
      projects.forEach(p => {
        const hrs = day.filter(e => e.projectId === p.id).reduce((a, e) => a + (e.duration ?? 0), 0) / 3600
        perProject[p.id] = Number(hrs.toFixed(2))
      })
      return { ...base, ...perProject }
    }

    if (groupBy === 'Month') {
      const monthMap: Record<string, { b: number; nb: number; [k: string]: number }> = {}
      filtered.forEach(e => {
        const key = format(new Date(e.startTime), 'MMM yyyy')
        if (!monthMap[key]) { monthMap[key] = { b: 0, nb: 0 }; projects.forEach(p => { monthMap[key][p.id] = 0 }) }
        const hrs = (e.duration ?? 0) / 3600
        if (e.billable) monthMap[key].b += hrs; else monthMap[key].nb += hrs
        if (e.projectId) monthMap[key][e.projectId] = (monthMap[key][e.projectId] || 0) + hrs
      })
      return Object.entries(monthMap).map(([name, v]) => ({
        name, billable: Number(v.b.toFixed(2)), nonBillable: Number(v.nb.toFixed(2)),
        totalLabel: fmtH((v.b + v.nb) * 3600),
        ...Object.fromEntries(projects.map(p => [p.id, Number((v[p.id] || 0).toFixed(2))]))
      }))
    }

    if (groupBy === 'Week') {
      const weekMap: Record<string, { b: number; nb: number; [k: string]: number }> = {}
      filtered.forEach(e => {
        const key = `Week of ${format(new Date(e.startTime), 'MMM d')}`
        if (!weekMap[key]) { weekMap[key] = { b: 0, nb: 0 }; projects.forEach(p => { weekMap[key][p.id] = 0 }) }
        const hrs = (e.duration ?? 0) / 3600
        if (e.billable) weekMap[key].b += hrs; else weekMap[key].nb += hrs
        if (e.projectId) weekMap[key][e.projectId] = (weekMap[key][e.projectId] || 0) + hrs
      })
      return Object.entries(weekMap).map(([name, v]) => ({
        name, billable: Number(v.b.toFixed(2)), nonBillable: Number(v.nb.toFixed(2)),
        totalLabel: fmtH((v.b + v.nb) * 3600),
        ...Object.fromEntries(projects.map(p => [p.id, Number((v[p.id] || 0).toFixed(2))]))
      }))
    }

    return days.map(buildDay)
  }, [filtered, from, to, groupBy, projects])

  const donutData = useMemo(() => {
    if (billabilityMode === 'project') {
      const map: Record<string, number> = {}
      filtered.forEach(e => { if (e.projectId) map[e.projectId] = (map[e.projectId] || 0) + (e.duration ?? 0) })
      return Object.entries(map).map(([pid, secs]) => {
        const p = projects.find(pr => pr.id === pid)
        return { name: p?.name || 'Unknown', value: secs, color: p?.color || '#ccc' }
      }).sort((a, b) => b.value - a.value)
    }
    // billability mode
    const billable = filtered.filter(e => e.billable).reduce((a, e) => a + (e.duration ?? 0), 0)
    const nonBillable = filtered.filter(e => !e.billable).reduce((a, e) => a + (e.duration ?? 0), 0)
    return [
      { name: 'Billable', value: billable, color: '#6aaa1e' },
      { name: 'Non-billable', value: nonBillable, color: '#8bc34a' },
    ].filter(d => d.value > 0)
  }, [filtered, projects, billabilityMode])

  const tableRows = useMemo((): SummaryRow[] => {
    // ── sub-group children builder ──────────────────────────────────────────
    const buildChildren = (entries: typeof filtered, parentId: string): SummaryRow[] => {
      if (subGroupBy === '(None)') return []

      if (subGroupBy === 'Project') {
        const map: Record<string, { duration: number; count: number }> = {}
        entries.forEach(e => {
          const pid = e.projectId || '__none__'
          if (!map[pid]) map[pid] = { duration: 0, count: 0 }
          map[pid].duration += e.duration ?? 0
          map[pid].count++
        })
        return Object.entries(map).sort((a, b) => b[1].duration - a[1].duration).map(([pid, d]) => {
          const p = projects.find(pr => pr.id === pid)
          return { id: `${parentId}-${pid}`, title: p?.name || '(Without Project)', color: p?.color || '#ccc', entryCount: d.count, duration: d.duration, billable: p?.billable ?? false }
        })
      }

      if (subGroupBy === 'Task') {
        const map: Record<string, { duration: number; count: number; name: string }> = {}
        entries.forEach(e => {
          const key = e.taskId || '__none__'
          if (!map[key]) map[key] = { duration: 0, count: 0, name: '(Without Task)' }
          map[key].duration += e.duration ?? 0
          map[key].count++
        })
        return Object.entries(map).sort((a, b) => b[1].duration - a[1].duration).map(([tid, d]) => ({
          id: `${parentId}-${tid}`, title: d.name, color: '#9e9e9e', entryCount: d.count, duration: d.duration, billable: false
        }))
      }

      if (subGroupBy === 'Project Lead') {
        const map: Record<string, { duration: number; count: number; name: string }> = {}
        entries.forEach(e => {
          const proj = projects.find(p => p.id === e.projectId)
          const leadId = proj?.leadId || '__none__'
          const leadName = users.find(u => u.id === leadId)?.name || '(No Lead)'
          if (!map[leadId]) map[leadId] = { duration: 0, count: 0, name: leadName }
          map[leadId].duration += e.duration ?? 0
          map[leadId].count++
        })
        return Object.entries(map).sort((a, b) => b[1].duration - a[1].duration).map(([lid, d]) => ({
          id: `${parentId}-${lid}`, title: d.name, color: '#03a9f4', entryCount: d.count, duration: d.duration, billable: false
        }))
      }

      if (subGroupBy === 'Tag' || subGroupBy === 'Description') {
        const map: Record<string, { duration: number; count: number }> = {}
        entries.forEach(e => {
          const key = e.description?.trim() || '(no description)'
          if (!map[key]) map[key] = { duration: 0, count: 0 }
          map[key].duration += e.duration ?? 0
          map[key].count++
        })
        return Object.entries(map).sort((a, b) => b[1].duration - a[1].duration).map(([title, d]) => ({
          id: `${parentId}-${title}`, title, color: '#f9a825', entryCount: d.count, duration: d.duration, billable: false
        }))
      }

      if (subGroupBy === 'Month') {
        const map: Record<string, { duration: number; count: number }> = {}
        entries.forEach(e => {
          const key = format(new Date(e.startTime), 'MMMM yyyy')
          if (!map[key]) map[key] = { duration: 0, count: 0 }
          map[key].duration += e.duration ?? 0
          map[key].count++
        })
        return Object.entries(map).map(([title, d]) => ({
          id: `${parentId}-${title}`, title, color: '#03a9f4', entryCount: d.count, duration: d.duration, billable: false
        }))
      }

      if (subGroupBy === 'Week') {
        const map: Record<string, { duration: number; count: number }> = {}
        entries.forEach(e => {
          const key = `Week of ${format(new Date(e.startTime), 'MMM d, yyyy')}`
          if (!map[key]) map[key] = { duration: 0, count: 0 }
          map[key].duration += e.duration ?? 0
          map[key].count++
        })
        return Object.entries(map).map(([title, d]) => ({
          id: `${parentId}-${title}`, title, color: '#03a9f4', entryCount: d.count, duration: d.duration, billable: false
        }))
      }

      if (subGroupBy === 'Date') {
        const map: Record<string, { duration: number; count: number }> = {}
        entries.forEach(e => {
          const key = format(new Date(e.startTime), 'EEE, MMM d yyyy')
          if (!map[key]) map[key] = { duration: 0, count: 0 }
          map[key].duration += e.duration ?? 0
          map[key].count++
        })
        return Object.entries(map).map(([title, d]) => ({
          id: `${parentId}-${title}`, title, color: '#03a9f4', entryCount: d.count, duration: d.duration, billable: false
        }))
      }

      return []
    }
    // ────────────────────────────────────────────────────────────────────────
    if (groupBy === 'User') {
      return users.map(u => {
        const ue = filtered.filter(e => e.userId === u.id)
        if (!ue.length) return null
        const projMap: Record<string, { duration: number; count: number; project: typeof projects[0] | undefined }> = {}
        ue.forEach(e => {
          const pid = e.projectId || '__none__'
          if (!projMap[pid]) projMap[pid] = { duration: 0, count: 0, project: projects.find(p => p.id === pid) }
          projMap[pid].duration += e.duration ?? 0
          projMap[pid].count++
        })
        return {
          id: u.id, title: u.name, color: '#03a9f4',
          entryCount: ue.length,
          duration: ue.reduce((a, e) => a + (e.duration ?? 0), 0),
          billable: false,
          filterType: 'user' as const, filterId: u.id,
          children: buildChildren(ue, u.id),
        }
      }).filter(Boolean) as SummaryRow[]
    }

    if (groupBy === 'Project') {
      return projects.map(p => {
        const pe = filtered.filter(e => e.projectId === p.id)
        if (!pe.length) return null
        // children: users who tracked on this project
        const userMap: Record<string, { duration: number; count: number }> = {}
        pe.forEach(e => {
          if (!userMap[e.userId]) userMap[e.userId] = { duration: 0, count: 0 }
          userMap[e.userId].duration += e.duration ?? 0
          userMap[e.userId].count++
        })
        return { id: p.id, title: p.name, color: p.color, entryCount: pe.length, duration: pe.reduce((a, e) => a + (e.duration ?? 0), 0), billable: p.billable, filterType: 'project' as const, filterId: p.id, children: buildChildren(pe, p.id) }
      }).filter(Boolean) as SummaryRow[]
    }

    if (groupBy === 'Project Lead') {
      const leadMap: Record<string, { duration: number; count: number; name: string; projects: Record<string, { duration: number; count: number }> }> = {}
      filtered.forEach(e => {
        const proj = projects.find(p => p.id === e.projectId)
        const leadId = proj?.leadId || '__none__'
        const leadName = users.find(u => u.id === leadId)?.name || '(No Lead)'
        if (!leadMap[leadId]) leadMap[leadId] = { duration: 0, count: 0, name: leadName, projects: {} }
        leadMap[leadId].duration += e.duration ?? 0
        leadMap[leadId].count++
        const pid = e.projectId || '__none__'
        if (!leadMap[leadId].projects[pid]) leadMap[leadId].projects[pid] = { duration: 0, count: 0 }
        leadMap[leadId].projects[pid].duration += e.duration ?? 0
        leadMap[leadId].projects[pid].count++
      })
      return Object.entries(leadMap).sort((a, b) => b[1].duration - a[1].duration).map(([id, d]) => ({
        id, title: d.name, color: '#03a9f4', entryCount: d.count, duration: d.duration, billable: false, filterType: 'lead' as const, filterId: id,
        children: buildChildren(filtered.filter(e => {
          const proj = projects.find(p => p.id === e.projectId)
          return (proj?.leadId || '__none__') === id
        }), id)
      }))
    }

    if (groupBy === 'Group') {
      return users.map(u => {
        const ue = filtered.filter(e => e.userId === u.id)
        if (!ue.length) return null
        return { id: u.id, title: u.name, color: '#8e24aa', entryCount: ue.length, duration: ue.reduce((a, e) => a + (e.duration ?? 0), 0), billable: false, filterType: 'user' as const, filterId: u.id, children: buildChildren(ue, u.id) }
      }).filter(Boolean) as SummaryRow[]
    }

    if (groupBy === 'Tag') {
      const tagMap: Record<string, { duration: number; count: number; entries: typeof filtered }> = {}
      filtered.forEach(e => {
        const key = e.description || '(no description)'
        if (!tagMap[key]) tagMap[key] = { duration: 0, count: 0, entries: [] }
        tagMap[key].duration += e.duration ?? 0
        tagMap[key].count++
        tagMap[key].entries.push(e)
      })
      return Object.entries(tagMap).sort((a, b) => b[1].duration - a[1].duration).map(([title, d]) => ({
        id: title, title, color: '#f9a825', entryCount: d.count, duration: d.duration, billable: false,
        children: buildChildren(d.entries, title)
      }))
    }

    if (groupBy === 'Month') {
      const monthMap: Record<string, { duration: number; count: number; entries: typeof filtered }> = {}
      filtered.forEach(e => {
        const key = format(new Date(e.startTime), 'MMMM yyyy')
        if (!monthMap[key]) monthMap[key] = { duration: 0, count: 0, entries: [] }
        monthMap[key].duration += e.duration ?? 0
        monthMap[key].count++
        monthMap[key].entries.push(e)
      })
      return Object.entries(monthMap).map(([title, d]) => ({
        id: title, title, color: '#03a9f4', entryCount: d.count, duration: d.duration, billable: false,
        children: buildChildren(d.entries, title)
      }))
    }

    if (groupBy === 'Week') {
      const weekMap: Record<string, { duration: number; count: number; entries: typeof filtered }> = {}
      filtered.forEach(e => {
        const key = `Week of ${format(new Date(e.startTime), 'MMM d, yyyy')}`
        if (!weekMap[key]) weekMap[key] = { duration: 0, count: 0, entries: [] }
        weekMap[key].duration += e.duration ?? 0
        weekMap[key].count++
        weekMap[key].entries.push(e)
      })
      return Object.entries(weekMap).map(([title, d]) => ({
        id: title, title, color: '#03a9f4', entryCount: d.count, duration: d.duration, billable: false,
        children: buildChildren(d.entries, title)
      }))
    }

    if (groupBy === 'Date') {
      const dateMap: Record<string, { duration: number; count: number; entries: typeof filtered }> = {}
      filtered.forEach(e => {
        const key = format(new Date(e.startTime), 'EEE, MMM d yyyy')
        if (!dateMap[key]) dateMap[key] = { duration: 0, count: 0, entries: [] }
        dateMap[key].duration += e.duration ?? 0
        dateMap[key].count++
        dateMap[key].entries.push(e)
      })
      return Object.entries(dateMap).map(([title, d]) => ({
        id: title, title, color: '#03a9f4', entryCount: d.count, duration: d.duration, billable: false,
        children: buildChildren(d.entries, title)
      }))
    }

    // Default flat list
    return filtered.map(e => {
      const proj = projects.find(p => p.id === e.projectId)
      return { id: e.id, title: e.description || '(no description)', color: proj?.color || '#ccc', entryCount: 1, duration: e.duration ?? 0, billable: e.billable }
    })
  }, [filtered, groupBy, subGroupBy, users, projects])

  return (
    <div className="flex flex-col h-full bg-[#f2f6f8] overflow-hidden">

      {/* ── Tab bar ── */}
      <div className="flex items-center justify-between px-6 m-6 h-[56px] bg-white border-b border-[#e4eaee] flex-shrink-0">
        <div className="flex items-center gap-1">
          <TimeReportDropdown />
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
          <button onClick={() => setDateRange(r => ({ from: addDays(r.from, -7), to: addDays(r.to, -7) }))} className="w-[28px] h-[28px] flex items-center justify-center border border-[#d0d8de] border-r-0 rounded-l hover:bg-[#f5f7f9] text-[#999] cursor-pointer">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <DateRangePicker initialRange={dateRange} onRangeChange={setDateRange} />
          <button onClick={() => setDateRange(r => ({ from: addDays(r.from, 7), to: addDays(r.to, 7) }))} className="w-[28px] h-[28px] flex items-center justify-center border border-[#d0d8de] border-l-0 rounded-r hover:bg-[#f5f7f9] text-[#999] cursor-pointer">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex items-center px-6 h-[65px] m-6 bg-white border-b border-[#e4eaee] flex-shrink-0">
        <FilterVisibilityDropdown visible={visibleFilters} onChange={setVisibleFilters} />
        {visibleFilters.includes('Team') && <><div className="w-px h-5 bg-[#e4eaee] flex-shrink-0" /><FilterDropdown label="Team" placeholder="Search users or groups" items={TEAM_ITEMS} selected={selTeam} onChange={setSelTeam} /></>}
        {visibleFilters.includes('Project Lead') && <><div className="w-px h-5 bg-[#e4eaee] flex-shrink-0" /><FilterDropdown label="Project Lead" placeholder="Search Project Lead" items={LEAD_ITEMS} selected={selLead} onChange={setSelLead} showWithout="Without Project Lead" /></>}
        {visibleFilters.includes('Project') && <><div className="w-px h-5 bg-[#e4eaee] flex-shrink-0" /><FilterDropdown label="Project" placeholder="Search Projects" items={PROJECT_ITEMS} selected={selProject} onChange={setSelProject} showWithout="Without Project" /></>}
        {visibleFilters.includes('Task') && <><div className="w-px h-5 bg-[#e4eaee] flex-shrink-0" /><FilterDropdown label="Task" placeholder="Search Tasks" items={TASK_ITEMS} selected={selTask} onChange={setSelTask} showWithout="Without Task" /></>}
        {visibleFilters.includes('Tag') && <><div className="w-px h-5 bg-[#e4eaee] flex-shrink-0" /><FilterDropdown label="Tag" placeholder="Search Tags" items={TAG_ITEMS} selected={selTag} onChange={setSelTag} showWithout="Without Tag" /></>}
        {visibleFilters.includes('Status') && <><div className="w-px h-5 bg-[#e4eaee] flex-shrink-0" /><FilterDropdown label="Status" placeholder="" items={STATUS_ITEMS} selected={selStatus} onChange={setSelStatus} noSearch /></>}
        {visibleFilters.includes('Description') && <><div className="w-px h-5 bg-[#e4eaee] flex-shrink-0" /><DescriptionFilter value={descSearch} onChange={setDescSearch} /></>}
        <button onClick={applyFilters} className="ml-auto px-5 h-[32px] text-[13px] font-bold uppercase tracking-wide text-white bg-[#03a9f4] hover:bg-[#0288d1] rounded-sm cursor-pointer whitespace-nowrap">
          APPLY FILTER
        </button>
      </div>

      {/* Clear filters */}
      {(appliedFilters.team.length > 0 || appliedFilters.lead.length > 0 || appliedFilters.project.length > 0 || appliedFilters.task.length > 0 || appliedFilters.tag.length > 0 || appliedFilters.status.length > 0 || appliedFilters.desc) && (
        <div className="flex justify-end px-4 py-1 bg-white border-b border-[#e4eaee]">
          <button onClick={() => { setSelTeam([]); setSelLead([]); setSelProject([]); setSelTask([]); setSelTag([]); setSelStatus([]); setDescSearch(''); setAppliedFilters({ team: [], lead: [], project: [], task: [], tag: [], status: [], desc: '' }) }} className="text-[13px] text-[#03a9f4] hover:underline cursor-pointer">
            Clear filters
          </button>
        </div>
      )}

      {/* ── Scrollable content ── */}
      <div className="flex-1 m-6 overflow-y-auto bg-[#f2f6f8]">

        {/* Stats bar */}
        <div className="flex items-center justify-between px-6 h-[48px] bg-[#e4eaee] border-b border-[#e4eaee]">
          <div className="flex items-center gap-6 text-[14px]">
            <span className="text-[#777]">Total: <strong className="text-[#333] font-bold tabular-nums text-[15px]">{fmtSecs(totalSecs)}</strong></span>
            <span className="text-[#777]">Billable: <strong className="text-[#333] font-bold tabular-nums text-[15px]">{fmtSecs(billableSecs)}</strong></span>
            <span className="text-[#777]">Amount: <strong className="text-[#333] font-bold text-[15px]">0.00 USD</strong></span>
          </div>
          <div className="flex items-center gap-4 text-[13px] text-[#555]">
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

        {/* Billability + Bar chart */}
        <div className="px-6 pt-5 pb-6 bg-white border-b border-[#e4eaee]">
          <div className="mb-4">
            <BillabilityDropdown mode={billabilityMode} onChange={setBillabilityMode} />
          </div>
          <SummaryBarChart data={barData} mode={billabilityMode} projects={projects} />
        </div>

        {/* Group by row */}
        <div className="flex items-center gap-2 px-4 py-2.5 my-4 text-[15px] bg-[#f5f7f9] border-b border-[#e4eaee]">
          <span className="text-[15px] text-[#555]">Group by :</span>
          <SimpleDropdown value={groupBy} options={GROUP_OPTIONS} onChange={setGroupBy} />
          <SimpleDropdown value={subGroupBy} options={SUB_GROUP_OPTIONS} onChange={setSubGroupBy} />
        </div>

        {/* Table + Donut side by side */}
        <div className="flex items-start">
          <div className="w-[60%] flex-shrink-0 border-r border-[#e4eaee]">
            <SummaryTable rows={tableRows} onRowClick={(row) => {
              if (!row.filterType || !row.filterId) return
              const from = dateRange.from.toISOString()
              const to = dateRange.to.toISOString()
              const params = new URLSearchParams({ from, to, filterType: row.filterType, filterId: row.filterId, filterLabel: row.title })
              router.push(`/dashboard/reports/detailed?${params.toString()}`)
            }} />
          </div>
          <div className="flex-1 flex items-center justify-center py-10">
            <SummaryDonut data={donutData} totalLabel={fmtSecs(totalSecs)} />
          </div>
        </div>

      </div>
    </div>
  )
}
