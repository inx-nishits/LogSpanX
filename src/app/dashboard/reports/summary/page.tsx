'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Search, X, Check } from 'lucide-react'
import { startOfWeek, endOfWeek, startOfDay, endOfDay, eachDayOfInterval, format, isSameDay } from 'date-fns'
import { useDataStore } from '@/lib/stores/data-store'
import { cn } from '@/lib/utils'
import { SummaryBarChart } from './summary-bar-chart'
import { SummaryDonut } from './summary-donut'
import { SummaryTable, SummaryRow } from './summary-table'
import { ReportShell } from '../_components/report-shell'
import { TimeEntry } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'

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
  const totalMinutes = Math.round(s / 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

type ExportFormat = 'pdf' | 'excel' | 'csv'

interface ExportRow {
  title: string
  entryCount: number
  duration: string
  amount: string
  level: number
}

function flattenRows(rows: SummaryRow[], level = 0): ExportRow[] {
  return rows.flatMap(row => [
    {
      title: `${'  '.repeat(level)}${row.title}`,
      entryCount: row.entryCount,
      duration: fmtSecs(row.duration),
      amount: row.billable ? '-' : '0.00 USD',
      level,
    },
    ...flattenRows(row.children ?? [], level + 1),
  ])
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function csvEscape(value: string | number) {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function htmlEscape(value: string | number) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function pdfEscape(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function createPdfBlob(lines: string[]) {
  const pageWidth = 595
  const pageHeight = 842
  const margin = 42
  const lineHeight = 15
  const maxLines = Math.floor((pageHeight - margin * 2) / lineHeight)
  const pages: string[][] = []

  for (let i = 0; i < lines.length; i += maxLines) {
    pages.push(lines.slice(i, i + maxLines))
  }

  const objects: string[] = []
  const catalogId = 1
  const pagesId = 2
  const fontId = 3
  const pageIds = pages.map((_, index) => 4 + index * 2)
  const contentIds = pages.map((_, index) => 5 + index * 2)

  objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`
  objects[pagesId] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`
  objects[fontId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'

  pages.forEach((pageLines, index) => {
    const pageId = pageIds[index]
    const contentId = contentIds[index]
    const text = pageLines
      .map((line, lineIndex) => {
        const y = pageHeight - margin - lineIndex * lineHeight
        return `BT /F1 9 Tf ${margin} ${y} Td (${pdfEscape(line.slice(0, 105))}) Tj ET`
      })
      .join('\n')

    objects[pageId] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`
    objects[contentId] = `<< /Length ${text.length} >>\nstream\n${text}\nendstream`
  })

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  for (let id = 1; id < objects.length; id++) {
    offsets[id] = pdf.length
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`
  }

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`
  for (let id = 1; id < objects.length; id++) {
    pdf += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return new Blob([pdf], { type: 'application/pdf' })
}

function ExportDropdown({ onExport }: { onExport: (format: ExportFormat) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const options: Array<{ label: string; format: ExportFormat }> = [
    { label: 'Export as PDF', format: 'pdf' },
    { label: 'Export as Excel', format: 'excel' },
    { label: 'Export as CSV', format: 'csv' },
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(value => !value)}
        className="flex items-center gap-0.5 hover:text-[#03a9f4] cursor-pointer"
      >
        Export <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-[#d0d8de] shadow-lg z-[200] min-w-[150px] py-1">
          {options.map(option => (
            <button
              key={option.format}
              onClick={() => {
                onExport(option.format)
                setOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-[13px] text-[#555] hover:bg-[#f5f7f9] hover:text-[#03a9f4] cursor-pointer"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

import { extractArray } from '@/lib/api/utils'

// ─── Description filter ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        className="flex items-center gap-2 px-2 h-[26px] min-w-[80px] text-[13px] text-[#333] bg-white border border-[#d0d8de] rounded hover:border-[#aaa] transition-colors cursor-pointer"
      >
        <span className="flex-1 text-left truncate">{value}</span>
        <ChevronDown className="h-3 w-3 text-[#aaa]" />
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

import { getTimeEntries, TimeEntryParams } from '@/lib/api/time-entries'
import { ApiTimeEntry, mapApiTimeEntry } from '@/lib/api/mappers'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SummaryReportPage() {
  const router = useRouter()
  const { projects, users, tags, groups, tasks } = useDataStore()

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

  const [filtered, setFiltered] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const params: TimeEntryParams = {
      startDate: from.toISOString(),
      endDate: to.toISOString(),
    }

    setLoading(true)
    getTimeEntries(params)
      .then((res) => {
        if (!active) return
        let entries = extractArray<ApiTimeEntry>(res).map(mapApiTimeEntry)

        if (leadUserIds.length > 0) {
          const wantWithout = leadUserIds.includes('__without__')
          const leadIds = leadUserIds.filter(l => l !== '__without__')
          const matchingProjectIds = new Set(
            projects
              .filter(p => wantWithout ? !p.leadId : leadIds.includes(p.leadId ?? ''))
              .map(p => p.id)
          )
          entries = entries.filter(e => {
            if (!e.projectId) return wantWithout
            return matchingProjectIds.has(e.projectId)
          })
        }
        if (teamUserIds.length > 0) {
          entries = entries.filter(e => teamUserIds.includes(e.userId))
        }
        if (appliedFilters.project.length > 0) {
          const wantWithout = appliedFilters.project.includes('__without__')
          const projectIds = appliedFilters.project.filter(p => p !== '__without__')
          entries = entries.filter(e => {
            if (!e.projectId) return wantWithout
            return projectIds.includes(e.projectId)
          })
        }
        if (appliedFilters.tag.length > 0) {
          const wantWithout = appliedFilters.tag.includes('__without__')
          const tagIds = appliedFilters.tag.filter(t => t !== '__without__')
          entries = entries.filter(e => {
            if (!e.tagIds?.length) return wantWithout
            return e.tagIds.some(t => tagIds.includes(t))
          })
        }
        if (appliedFilters.task.length > 0) {
          const wantWithout = appliedFilters.task.includes('__without__')
          const taskIds = appliedFilters.task.filter(t => t !== '__without__')
          entries = entries.filter(e => {
            if (!e.taskId) return wantWithout
            return taskIds.includes(e.taskId)
          })
        }
        const hasBillable = appliedFilters.status.includes('billable')
        const hasNonBillable = appliedFilters.status.includes('non-billable')
        if (hasBillable && !hasNonBillable) entries = entries.filter(e => e.billable === true)
        else if (hasNonBillable && !hasBillable) entries = entries.filter(e => e.billable !== true)

        if (appliedFilters.desc) {
          if (appliedFilters.desc === '__without__') {
            entries = entries.filter(e => !e.description?.trim())
          } else {
            entries = entries.filter(e => e.description?.toLowerCase().includes(appliedFilters.desc.toLowerCase()))
          }
        }

        setFiltered(entries)
      })
      .catch(err => console.error(err))
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [from, to, teamUserIds, leadUserIds, appliedFilters, projects])

  const totalSecs = useMemo(() => filtered.reduce((a, e) => a + (e.duration ?? 0), 0), [filtered])
  const billableSecs = useMemo(() => filtered.filter(e => e.billable).reduce((a, e) => a + (e.duration ?? 0), 0), [filtered])

  const barData = useMemo(() => {
    const days = eachDayOfInterval({ start: from, end: to })

    // Pre-group entries by day for O(N) performance
    const entriesByDay: Record<string, TimeEntry[]> = {}
    filtered.forEach(e => {
      const dateKey = format(new Date(e.startTime), 'yyyy-MM-dd')
      if (!entriesByDay[dateKey]) entriesByDay[dateKey] = []
      entriesByDay[dateKey].push(e)
    })

    const buildDay = (date: Date) => {
      const dateKey = format(date, 'yyyy-MM-dd')
      const dayEntries = entriesByDay[dateKey] || []

      let b = 0, nb = 0
      const perProject: Record<string, number> = {}

      dayEntries.forEach(e => {
        const hrs = (e.duration ?? 0) / 3600
        if (e.billable) b += hrs; else nb += hrs
        if (e.projectId) perProject[e.projectId] = (perProject[e.projectId] || 0) + Number(hrs.toFixed(2))
      })

      return {
        name: format(date, 'EEE, MMM d'),
        billable: Number(b.toFixed(2)),
        nonBillable: Number(nb.toFixed(2)),
        totalLabel: fmtH((b + nb) * 3600),
        ...perProject
      }
    }

    if (groupBy === 'Month') {
      const monthMap: Record<string, { b: number; nb: number;[k: string]: number }> = {}
      filtered.forEach(e => {
        const d = new Date(e.startTime)
        if (isNaN(d.getTime())) return
        const key = format(d, 'MMM yyyy')
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
        const d = new Date(e.startTime)
        if (isNaN(d.getTime())) return
        const key = `Week of ${format(d, 'MMM d')}`
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
    // Helper to get dominant project color for a set of entries
    const getDominantProjectColor = (entrs: TimeEntry[]) => {
      const pMap: Record<string, number> = {}
      entrs.forEach(e => { if (e.projectId) pMap[e.projectId] = (pMap[e.projectId] || 0) + (e.duration ?? 0) })
      const domPid = Object.entries(pMap).sort((a, b) => b[1] - a[1])[0]?.[0]
      return domPid ? projects.find(p => p.id === domPid)?.color || '#9e9e9e' : '#9e9e9e'
    }

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
          const lead = p?.leadId ? users.find(u => u.id === p.leadId) : null
          const title = p ? `${p.name}${lead ? ` - ${lead.name}` : ''}` : '(Without Project)'
          return { id: `${parentId}-${pid}`, title, color: p?.color || '#ccc', entryCount: d.count, duration: d.duration, billable: p?.billable ?? false }
        })
      }

      if (subGroupBy === 'Task') {
        const map: Record<string, { duration: number; count: number; name: string; entries: typeof filtered }> = {}
        entries.forEach(e => {
          const key = e.taskId || '__none__'
          const taskName = e.taskId ? (tasks.find(t => t.id === e.taskId)?.name || e.taskId) : '(Without Task)'
          if (!map[key]) map[key] = { duration: 0, count: 0, name: taskName, entries: [] }
          map[key].duration += e.duration ?? 0
          map[key].count++
          map[key].entries.push(e)
        })
        return Object.entries(map).sort((a, b) => b[1].duration - a[1].duration).map(([tid, d]) => {
          const domProj = getDominantProjectColor(d.entries)
          return { id: `${parentId}-${tid}`, title: d.name, color: domProj, entryCount: d.count, duration: d.duration, billable: false }
        })
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
        const map: Record<string, { duration: number; count: number; entries: typeof filtered }> = {}
        entries.forEach(e => {
          const key = e.description?.trim() || '(no description)'
          if (!map[key]) map[key] = { duration: 0, count: 0, entries: [] }
          map[key].duration += e.duration ?? 0
          map[key].count++
          map[key].entries.push(e)
        })
        return Object.entries(map).sort((a, b) => b[1].duration - a[1].duration).map(([title, d]) => {
          const domProj = getDominantProjectColor(d.entries)
          return { id: `${parentId}-desc-${title}`, title, color: domProj, entryCount: d.count, duration: d.duration, billable: false }
        })
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
        const domProj = getDominantProjectColor(ue)
        return {
          id: uid, title: u?.name || 'Unknown User', color: domProj,
          entryCount: ue.length,
          duration: ue.reduce((a, e) => a + (e.duration ?? 0), 0),
          billable: false,
          filterType: 'user' as const, filterId: uid,
          children: buildChildren(ue, uid),
        }
      }).sort((a, b) => a.title.localeCompare(b.title))
    }

    if (groupBy === 'Project') {
      const pIds = Array.from(new Set(filtered.map(e => e.projectId || '__none__')))
      return pIds.map(pid => {
        const p = projects.find(proj => proj.id === pid)
        const pe = filtered.filter(e => (e.projectId || '__none__') === pid)
        const lead = p?.leadId ? users.find(u => u.id === p.leadId) : null
        const title = p ? `${p.name}${lead ? ` - ${lead.name}` : ''}` : '(Without Project)'
        return {
          id: pid, title, color: p?.color || '#ccc',
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
      return Object.entries(leadMap).sort((a, b) => b[1].duration - a[1].duration).map(([id, d]) => {
        const domProj = getDominantProjectColor(d.entries)
        return {
          id: `lead-${id}`, title: d.name, color: domProj, entryCount: d.count, duration: d.duration, billable: false, filterType: 'lead' as const, filterId: id,
          children: buildChildren(d.entries, `lead-${id}`)
        }
      })
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
        const domProj = getDominantProjectColor(d.entries)
        return {
          id: tid, title: t?.name || '(Without Tag)', color: domProj, entryCount: d.count, duration: d.duration, billable: false,
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
      return Object.entries(monthMap).map(([title, d]) => {
        const domProj = getDominantProjectColor(d.entries)
        return {
          id: title, title, color: domProj, entryCount: d.count, duration: d.duration, billable: false,
          children: buildChildren(d.entries, title)
        }
      })
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
      return Object.entries(weekMap).map(([title, d]) => {
        const domProj = getDominantProjectColor(d.entries)
        return {
          id: title, title, color: domProj, entryCount: d.count, duration: d.duration, billable: false,
          children: buildChildren(d.entries, title)
        }
      })
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
      return Object.entries(dateMap).map(([title, d]) => {
        const domProj = getDominantProjectColor(d.entries)
        return {
          id: title, title, color: domProj, entryCount: d.count, duration: d.duration, billable: false,
          children: buildChildren(d.entries, title)
        }
      })
    }

    // Default flat list
    return filtered.map(e => {
      const proj = projects.find(p => p.id === e.projectId)
      return { id: String(e.id), title: e.description || '(no description)', color: proj?.color || '#ccc', entryCount: 1, duration: e.duration ?? 0, billable: e.billable }
    })
  }, [filtered, groupBy, subGroupBy, users, projects, tags, tasks])

  const handleExport = (exportFormat: ExportFormat) => {
    const rows = flattenRows(tableRows)
    const fromLabel = format(dateRange.from, 'dd_MM_yyyy')
    const toLabel = format(dateRange.to, 'dd_MM_yyyy')
    const fileBase = `Trackify_Time_Report_Summary_${fromLabel}-${toLabel}`
    const metadata = [
      ['Report', 'Summary'],
      ['Date range', `${fromLabel} to ${toLabel}`],
      ['Group by', groupBy],
      ['Sub group by', subGroupBy],
      ['Total duration', fmtSecs(totalSecs)],
      ['Billable duration', fmtSecs(billableSecs)],
    ]

    if (exportFormat === 'csv') {
      const lines = [
        ...metadata.map(([key, value]) => `${csvEscape(key)},${csvEscape(value)}`),
        '',
        ['Title', 'Entries', 'Duration', 'Amount'].map(csvEscape).join(','),
        ...rows.map(row => [row.title, row.entryCount, row.duration, row.amount].map(csvEscape).join(',')),
      ]
      downloadBlob(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' }), `${fileBase}.csv`)
      return
    }

    if (exportFormat === 'excel') {
      const userGroups: Record<string, TimeEntry[]> = {}
      filtered.forEach(e => {
        const u = users.find(usr => usr.id === e.userId)
        const name = u?.name || 'Unknown User'
        if (!userGroups[name]) userGroups[name] = []
        userGroups[name].push(e)
      })

      const htmlRows: string[] = []
      
      htmlRows.push(`
        <tr style="background-color: #f2f2f2; font-weight: bold;">
          <th align="left" style="border: 1px solid #e4eaee; padding: 4px;">User</th>
          <th align="left" style="border: 1px solid #e4eaee; padding: 4px;">Description</th>
          <th align="right" style="border: 1px solid #e4eaee; padding: 4px;">Time (h)</th>
          <th align="right" style="border: 1px solid #e4eaee; padding: 4px;">Time (decimal)</th>
          <th align="right" style="border: 1px solid #e4eaee; padding: 4px;">Amount (USD)</th>
        </tr>
      `)

      const sortedUsers = Object.keys(userGroups).sort()
      let grandTotalSecs = 0

      sortedUsers.forEach(userName => {
        const entries = userGroups[userName]
        const userTotalSecs = entries.reduce((acc, e) => acc + (e.duration ?? 0), 0)
        const userTotalMinutes = Math.round(userTotalSecs / 60)
        grandTotalSecs += userTotalSecs
        
        htmlRows.push(`
          <tr style="font-weight: bold;">
            <td style="border: 1px solid #e4eaee; padding: 4px;">${htmlEscape(userName)}</td>
            <td style="border: 1px solid #e4eaee; padding: 4px;"></td>
            <td align="right" style="border: 1px solid #e4eaee; padding: 4px; mso-number-format:'\\@';">${htmlEscape(fmtH(userTotalSecs))}</td>
            <td align="right" style="border: 1px solid #e4eaee; padding: 4px; mso-number-format:'0\\.00';">${(userTotalMinutes / 60).toFixed(2)}</td>
            <td align="right" style="border: 1px solid #e4eaee; padding: 4px; mso-number-format:'0\\.00';">0.00</td>
          </tr>
        `)

        entries.forEach(e => {
          const dur = e.duration ?? 0
          const entryMinutes = Math.round(dur / 60)
          htmlRows.push(`
            <tr>
              <td style="border: 1px solid #e4eaee; padding: 4px;"></td>
              <td style="border: 1px solid #e4eaee; padding: 4px;">${htmlEscape(e.description || '(no description)')}</td>
              <td align="right" style="border: 1px solid #e4eaee; padding: 4px; mso-number-format:'\\@';">${htmlEscape(fmtH(dur))}</td>
              <td align="right" style="border: 1px solid #e4eaee; padding: 4px; mso-number-format:'0\\.00';">${(entryMinutes / 60).toFixed(2)}</td>
              <td align="right" style="border: 1px solid #e4eaee; padding: 4px; mso-number-format:'0\\.00';">0.00</td>
            </tr>
          `)
        })
      })

      const grandTotalMinutes = Math.round(grandTotalSecs / 60)
      const grandTotalH = fmtH(grandTotalSecs)
      const grandTotalDecimal = (grandTotalMinutes / 60).toFixed(2)
      const rangeLabel = `Total (${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')})`

      htmlRows.push(`
        <tr style="font-weight: bold;">
          <td style="border: 1px solid #e4eaee; padding: 4px;">${htmlEscape(rangeLabel)}</td>
          <td style="border: 1px solid #e4eaee; padding: 4px;"></td>
          <td align="right" style="border: 1px solid #e4eaee; padding: 4px; mso-number-format:'\\@';">${htmlEscape(grandTotalH)}</td>
          <td align="right" style="border: 1px solid #e4eaee; padding: 4px; mso-number-format:'0\\.00';">${grandTotalDecimal}</td>
          <td align="right" style="border: 1px solid #e4eaee; padding: 4px; mso-number-format:'0\\.00';">0.00</td>
        </tr>
      `)

      const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
          <head>
            <meta charset="utf-8" />
            <!--[if gte mso 9]>
            <xml>
              <x:ExcelWorkbook>
                <x:ExcelWorksheets>
                  <x:ExcelWorksheet>
                    <x:Name>Summary report</x:Name>
                    <x:WorksheetOptions>
                      <x:DisplayGridlines/>
                    </x:WorksheetOptions>
                  </x:ExcelWorksheet>
                </x:ExcelWorksheets>
              </x:ExcelWorkbook>
            </xml>
            <![endif]-->
          </head>
          <body>
            <table style="border-collapse: collapse;">
              ${htmlRows.join('')}
            </table>
          </body>
        </html>
      `
      downloadBlob(new Blob([html], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' }), `${fileBase}.xls`)
      return
    }

    const pdfLines = [
      'Trackify Summary Report',
      `Date range: ${fromLabel} to ${toLabel}`,
      `Group by: ${groupBy} / ${subGroupBy}`,
      `Total: ${fmtSecs(totalSecs)}    Billable: ${fmtSecs(billableSecs)}`,
      '',
      'Title                                                       Entries   Duration   Amount',
      '-------------------------------------------------------------------------------------',
      ...rows.map(row => {
        const title = row.title.padEnd(58, ' ').slice(0, 58)
        return `${title} ${String(row.entryCount).padStart(7, ' ')}   ${row.duration.padStart(8, ' ')}   ${row.amount}`
      }),
    ]
    downloadBlob(createPdfBlob(pdfLines), `${fileBase}.pdf`)
  }

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
            <div className="flex items-center gap-6 text-[15px]">
              <span className="text-[#777]">Total: <strong className="text-[#333] font-bold tabular-nums text-[15px]">{fmtSecs(totalSecs)}</strong></span>
              <span className="text-[#777]">Billable: <strong className="text-[#333] font-bold tabular-nums text-[15px]">{fmtSecs(billableSecs)}</strong></span>
              <span className="text-[#777]">Amount: <strong className="text-[#333] font-bold text-[15px]">0.00 USD</strong></span>
            </div>
            <div className="flex items-center gap-4 text-[13px] text-[#555]">
              <ExportDropdown onExport={handleExport} />
            </div>
          </div>

          {/* Billability + Bar chart */}
          <div className="px-6 pt-5 pb-6 bg-white">
            <div className="mb-4">
              <BillabilityDropdown mode={billabilityMode} onChange={setBillabilityMode} />
            </div>
            {loading ? (
              <div className="h-[320px] w-full flex flex-col gap-4">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <SummaryBarChart data={barData} mode={billabilityMode} projects={projects} />
            )}
          </div>

          {/* Gap between sections */}
          <div className="h-4 bg-[#e4e8ec]" />

          {/* Group by row + Table + Donut — all in one attached block */}
          <div className="mt-6 flex flex-col border-t border-[#e4eaee]">
            {/* Group by row */}
            <div className="flex items-center gap-3 px-6 py-3 bg-[#dde2e7] border-b border-[#e4eaee] flex-shrink-0">
              <span className="text-[12px] text-[#999] font-medium">Group by:</span>
              <SimpleDropdown value={groupBy} options={GROUP_OPTIONS} onChange={setGroupBy} />
              <SimpleDropdown value={subGroupBy} options={SUB_GROUP_OPTIONS} onChange={setSubGroupBy} />
            </div>
            {/* Table + Donut side by side */}
            <div className="flex items-start min-h-[300px]">
              <div className="w-[75%] flex-shrink-0 border-r border-[#e4eaee] flex flex-col">
                {loading ? (
                  <div className="p-4 flex flex-col gap-3">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <SummaryTable rows={tableRows} onRowClick={(row) => {
                    const params = new URLSearchParams()
                    params.set('from', dateRange.from.toISOString())
                    params.set('to', dateRange.to.toISOString())

                    if (appliedFilters.team.length) params.set('users', appliedFilters.team.join(','))
                    if (appliedFilters.project.length) params.set('projects', appliedFilters.project.join(','))
                    if (appliedFilters.tag.length) params.set('tags', appliedFilters.tag.join(','))
                    if (appliedFilters.desc) params.set('description', appliedFilters.desc)

                    if (row.filterType === 'project' && row.filterId && row.filterId !== '__none__') {
                      params.set('projects', row.filterId)
                    } else if (row.filterType === 'user' && row.filterId) {
                      params.set('users', row.filterId)
                    } else if (row.filterType === 'tag' && row.filterId && row.filterId !== '__none__') {
                      params.set('tags', row.filterId)
                    }

                    router.push(`/dashboard/reports/detailed?${params.toString()}`)
                  }} />
                )}
              </div>
              <div className="flex-1 flex items-center justify-center py-10 overflow-hidden px-4">
                {loading ? (
                  <Skeleton className="h-[200px] w-[200px] rounded-full" />
                ) : (
                  <SummaryDonut data={donutData} totalLabel={fmtSecs(totalSecs)} />
                )}
              </div>
            </div>
            {/* Bottom gray line matching bar graph */}
            <div className="h-4 bg-[#e4e8ec]" />
          </div>
        </div>
      </div>
    </ReportShell>
  )
}
