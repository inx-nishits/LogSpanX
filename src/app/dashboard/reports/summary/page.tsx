'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, Printer, Share2, Search, X, Check } from 'lucide-react'
import { startOfWeek, endOfWeek, startOfDay, endOfDay, eachDayOfInterval, format, isSameDay } from 'date-fns'
import { useDataStore } from '@/lib/stores/data-store'
import { cn } from '@/lib/utils'
import { SummaryBarChart } from './summary-bar-chart'
import { SummaryDonut } from './summary-donut'
import { SummaryTable, SummaryRow } from './summary-table'
import { ReportShell } from '../_components/report-shell'

// ─── Static data ─────────────────────────────────────────────────────────────

const GROUP_OPTIONS = ['Project', 'Project Lead', 'User', 'Group', 'Tag', 'Month', 'Week', 'Date']
const SUB_GROUP_OPTIONS = ['(None)', 'Project', 'Task', 'Project Lead', 'Tag', 'Description', 'Month', 'Week', 'Date']

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
          'flex items-center gap-1 px-4 h-[52px] text-[16px] transition-colors cursor-pointer',
          open || value ? 'text-[#03a9f4]' : 'text-[#555] hover:text-[#333]'
        )}
      >
        Description
        {value && value !== '__without__' && (
          <span className="ml-1 bg-[#03a9f4] text-white text-[13px] font-bold rounded-full w-[16px] h-[16px] flex items-center justify-center">1</span>
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
              className="flex-1 text-[16px] outline-none placeholder:text-[#bbb] bg-transparent"
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
            <span className="text-[16px] text-[#333]">Without description</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── GroupBy dropdown ─────────────────────────────────────────────────────────

function SimpleDropdown({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-2.5 h-[28px] text-[15px] text-[#555] bg-white border border-[#d0d8de] rounded hover:border-[#aaa] transition-colors cursor-pointer"
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
                'w-full text-left px-3 py-1.5 text-[15px] transition-colors cursor-pointer',
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
        className="flex items-center gap-1.5 px-3 h-[28px] text-[15px] text-[#555] border border-[#d0d8de] rounded hover:border-[#aaa] cursor-pointer"
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
                'w-full text-left px-3 py-2 text-[15px] transition-colors cursor-pointer flex items-center justify-between',
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

import { getTimeEntries } from '@/lib/api/time-entries'
import { mapApiTimeEntry } from '@/lib/api/mappers'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SummaryReportPage() {
  const pathname = usePathname()
  const router = useRouter()
  const { timeEntries, projects, users, tags, groups } = useDataStore()

  const [dateRange, setDateRange] = useState({
    from: startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
    to: endOfDay(endOfWeek(new Date(), { weekStartsOn: 1 })),
  })
  const [groupBy, setGroupBy] = useState('User')
  const [subGroupBy, setSubGroupBy] = useState('Description')
  const [billabilityMode, setBillabilityMode] = useState<'billability' | 'project'>('billability')
  const [appliedFilters, setAppliedFilters] = useState({
    team: [] as string[],
    lead: [] as string[],
    project: [] as string[],
    task: [] as string[],
    tag: [] as string[],
    status: [] as string[],
    desc: '',
  })

  const handleApply = (filters: { team: string[]; lead: string[]; project: string[]; tasks: string[]; tags: string[]; status: string[]; description: string }) => {
    setAppliedFilters({
      team: filters.team,
      lead: filters.lead,
      project: filters.project,
      task: filters.tasks,
      tag: filters.tags,
      status: filters.status,
      desc: filters.description,
    })
  }

  const from = useMemo(() => startOfDay(dateRange.from), [dateRange.from])
  const to = useMemo(() => endOfDay(dateRange.to), [dateRange.to])

  // Build group membership map from real store groups
  const groupMembership = useMemo(() => {
    const map: Record<string, string[]> = {}
    groups.forEach(g => { map[g.id] = g.memberIds })
    return map
  }, [groups])

  const teamUserIds = useMemo(() => {
    if (!appliedFilters.team.length) return []
    const ids = new Set<string>()
    appliedFilters.team.forEach(id => {
      // check if it's a group id or user id
      if (groupMembership[id]) groupMembership[id].forEach(uid => ids.add(uid))
      else ids.add(id)
    })
    return Array.from(ids)
  }, [appliedFilters.team, groupMembership])

  const leadUserIds = useMemo(() => {
    if (!appliedFilters.lead.length) return []
    return appliedFilters.lead // lead filter stores user IDs directly
  }, [appliedFilters.lead])

  const [filtered, setFiltered] = useState<typeof timeEntries>([])

  useEffect(() => {
    let active = true

    // Only one value per filter for simplistic passing to API as per normal backend params
    const params: any = {
      startDate: from.toISOString(),
      endDate: to.toISOString(),
    }

    // Convert array filters to strings or omit if empty. 
    // Usually arrays are comma separated or just pick the first.
    if (appliedFilters.team.length) params.userId = appliedFilters.team[0]
    if (appliedFilters.project.length) params.projectId = appliedFilters.project[0]
    // The backend endpoints primarily support userId, projectId, billable, tagId
    if (appliedFilters.tag.length) params.tagId = appliedFilters.tag[0]
    if (appliedFilters.status.length === 1 && appliedFilters.status.includes('billable')) params.billable = 'true'
    if (appliedFilters.status.length === 1 && appliedFilters.status.includes('non-billable')) params.billable = 'false'

    getTimeEntries(params)
      .then((res: any) => {
        if (!active) return
        let entries = Array.isArray(res) ? res : (res?.items || res?.entries || [])
        if (!Array.isArray(entries)) {
          entries = Object.values(res || {}).find(v => Array.isArray(v)) || []
        }

        // Map raw API entries to the expected TimeEntry format
        entries = entries.map(mapApiTimeEntry)

        // Keep local filtering for anything backend might not support comprehensively
        entries = entries.filter((e: any) => {
          // Team filter
          if (teamUserIds.length > 0 && !teamUserIds.includes(e.userId)) return false

          // Project Lead filter
          if (leadUserIds.length > 0) {
            const proj = projects.find(p => p.id === e.projectId)
            if (!proj || !leadUserIds.includes(proj.leadId ?? '')) return false
          }

          // Task filter
          if (appliedFilters.task.length > 0) {
            const wantWithout = appliedFilters.task.includes('__without__')
            const tIds = appliedFilters.task.filter(id => id !== '__without__')
            if (!e.taskId) {
              if (!wantWithout) return false
            } else {
              if (tIds.length > 0 && !tIds.includes(e.taskId)) return false
              if (tIds.length === 0 && !wantWithout) return false
            }
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

        setFiltered(entries)
      })
      .catch(err => console.error(err))

    return () => { active = false }
  }, [from, to, teamUserIds, leadUserIds, appliedFilters, projects])

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
      const monthMap: Record<string, { b: number; nb: number;[k: string]: number }> = {}
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
      const weekMap: Record<string, { b: number; nb: number;[k: string]: number }> = {}
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
          const leadId = String(proj?.leadId || '__none__')
          const leadName = users.find(u => u.id === leadId)?.name || '(No Lead)'
          if (!map[leadId]) map[leadId] = { duration: 0, count: 0, name: leadName }
          map[leadId].duration += e.duration ?? 0
          map[leadId].count++
        })
        return Object.entries(map).sort((a, b) => b[1].duration - a[1].duration).map(([lid, d]) => ({
          id: `${parentId}-lead-${lid}`, title: d.name, color: '#03a9f4', entryCount: d.count, duration: d.duration, billable: false
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
          id: `${parentId}-desc-${title}`, title, color: '#f9a825', entryCount: d.count, duration: d.duration, billable: false
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
    if (groupBy === 'User' || groupBy === 'Group') {
      const userIds = Array.from(new Set(filtered.map(e => e.userId)))
      return userIds.map(uid => {
        const u = users.find(usr => usr.id === uid)
        const ue = filtered.filter(e => e.userId === uid)
        return {
          id: uid, title: u?.name || 'Unknown User', color: '#03a9f4',
          entryCount: ue.length,
          duration: ue.reduce((a, e) => a + (e.duration ?? 0), 0),
          billable: false,
          filterType: 'user' as const, filterId: uid,
          children: buildChildren(ue, uid),
        }
      }).sort((a, b) => b.duration - a.duration)
    }

    if (groupBy === 'Project') {
      const pIds = Array.from(new Set(filtered.map(e => e.projectId || '__none__')))
      return pIds.map(pid => {
        const p = projects.find(proj => proj.id === pid)
        const pe = filtered.filter(e => (e.projectId || '__none__') === pid)
        return {
          id: pid, title: p?.name || '(Without Project)', color: p?.color || '#ccc',
          entryCount: pe.length,
          duration: pe.reduce((a, e) => a + (e.duration ?? 0), 0),
          billable: p?.billable ?? false,
          filterType: 'project' as const, filterId: pid,
          children: buildChildren(pe, pid)
        }
      }).sort((a, b) => b.duration - a.duration)
    }

    if (groupBy === 'Project Lead') {
      const leadMap: Record<string, { duration: number; count: number; name: string; entries: typeof filtered }> = {}
      filtered.forEach(e => {
        const proj = projects.find(p => p.id === e.projectId)
        const leadId = String(proj?.leadId || '__none__')
        const leadName = users.find(u => u.id === leadId)?.name || '(No Lead)'
        if (!leadMap[leadId]) leadMap[leadId] = { duration: 0, count: 0, name: leadName, entries: [] }
        leadMap[leadId].duration += e.duration ?? 0
        leadMap[leadId].count++
        leadMap[leadId].entries.push(e)
      })
      return Object.entries(leadMap).sort((a, b) => b[1].duration - a[1].duration).map(([id, d]) => ({
        id: `lead-${id}`, title: d.name, color: '#03a9f4', entryCount: d.count, duration: d.duration, billable: false, filterType: 'lead' as const, filterId: id,
        children: buildChildren(d.entries, `lead-${id}`)
      }))
    }

    if (groupBy === 'Tag') {
      const tagMap: Record<string, { duration: number; count: number; entries: typeof filtered }> = {}
      filtered.forEach(e => {
        // If the entry has tags, group by each tag? Or just primary tag? 
        // For simplicity, let's group by description if no tags, or just "Without Tag"
        const key = e.tagIds?.[0] || '__none__'
        if (!tagMap[key]) tagMap[key] = { duration: 0, count: 0, entries: [] }
        tagMap[key].duration += e.duration ?? 0
        tagMap[key].count++
        tagMap[key].entries.push(e)
      })
      return Object.entries(tagMap).sort((a, b) => b[1].duration - a[1].duration).map(([tid, d]) => {
        const t = tags.find(tg => tg.id === tid)
        return {
          id: tid, title: t?.name || '(Without Tag)', color: '#f9a825', entryCount: d.count, duration: d.duration, billable: false,
          children: buildChildren(d.entries, tid)
        }
      })
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
      return { id: String(e.id), title: e.description || '(no description)', color: proj?.color || '#ccc', entryCount: 1, duration: e.duration ?? 0, billable: e.billable }
    })
  }, [filtered, groupBy, subGroupBy, users, projects, tags])

  return (
    <ReportShell
      dateRange={dateRange}
      onRangeChange={setDateRange}
      initialTeam={appliedFilters.team}
      initialLead={appliedFilters.lead}
      initialProject={appliedFilters.project}
      initialTags={appliedFilters.tag}
      initialTasks={appliedFilters.task}
      initialStatus={appliedFilters.status}
      initialDescription={appliedFilters.desc}
      onApply={handleApply}
    >

      {/* Clear filters */}
      {(appliedFilters.team.length > 0 || appliedFilters.lead.length > 0 || appliedFilters.project.length > 0 || appliedFilters.task.length > 0 || appliedFilters.tag.length > 0 || appliedFilters.status.length > 0 || appliedFilters.desc) && (
        <div className="flex justify-end px-4 py-1 bg-white border-b border-[#e4eaee]">
          <button onClick={() => setAppliedFilters({ team: [], lead: [], project: [], task: [], tag: [], status: [], desc: '' })} className="text-[15px] text-[#03a9f4] hover:underline cursor-pointer">
            Clear filters
          </button>
        </div>
      )}

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto bg-[#f2f6f8] min-h-0">
        <div className="m-6">
          {/* Stats bar */}
          <div className="flex items-center justify-between px-6 h-[48px] bg-[#e4eaee] border-b border-[#e4eaee]">
            <div className="flex items-center gap-6 text-[16px]">
              <span className="text-[#777]">Total: <strong className="text-[#333] font-bold tabular-nums text-[15px]">{fmtSecs(totalSecs)}</strong></span>
              <span className="text-[#777]">Billable: <strong className="text-[#333] font-bold tabular-nums text-[15px]">{fmtSecs(billableSecs)}</strong></span>
              <span className="text-[#777]">Amount: <strong className="text-[#333] font-bold text-[15px]">0.00 USD</strong></span>
            </div>
            <div className="flex items-center gap-4 text-[15px] text-[#555]">
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
          <div className="flex items-start h-[450px]">
            <div className="w-[60%] flex-shrink-0 border-r border-[#e4eaee] overflow-y-auto">
              <SummaryTable rows={tableRows} onRowClick={(row) => {
                const params = new URLSearchParams()
                params.set('from', dateRange.from.toISOString())
                params.set('to', dateRange.to.toISOString())

                // Propagate global applied filters
                if (appliedFilters.team.length) params.set('users', appliedFilters.team.join(','))
                if (appliedFilters.project.length) params.set('projects', appliedFilters.project.join(','))
                if (appliedFilters.tag.length) params.set('tags', appliedFilters.tag.join(','))
                if (appliedFilters.desc) params.set('description', appliedFilters.desc)

                // Add row-specific specificity
                if (row.filterType === 'project' && row.filterId && row.filterId !== '__none__') {
                  params.set('projects', row.filterId)
                } else if (row.filterType === 'user' && row.filterId) {
                  params.set('users', row.filterId)
                } else if (row.filterType === 'tag' && row.filterId && row.filterId !== '__none__') {
                  params.set('tags', row.filterId)
                }

                router.push(`/dashboard/reports/detailed?${params.toString()}`)
              }} />
            </div>
            <div className="flex-1 flex items-center justify-center py-10 overflow-hidden">
              <SummaryDonut data={donutData} totalLabel={fmtSecs(totalSecs)} />
            </div>
          </div>

        </div>
      </div>
    </ReportShell>
  )
}
