'use client'

import { useState, useMemo, useEffect } from 'react'
import { addDays, startOfDay, endOfDay, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from 'date-fns'
import { ChevronDown, Printer, Share2 } from 'lucide-react'
import { useDataStore } from '@/lib/stores/data-store'
import { cn } from '@/lib/utils'
import { ReportShell, DateRange } from '../_components/report-shell'
import { Skeleton } from '@/components/ui/skeleton'

function fmtSecs(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

function fmtH(s: number) {
  if (s === 0) return '—'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

function SimpleDropdown({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 px-2.5 h-[26px] text-[14px] text-[#555] bg-white border border-[#d0d8de] rounded hover:border-[#aaa] cursor-pointer">
        {value} <ChevronDown className="h-3 w-3 text-[#aaa]" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-0.5 bg-white border border-[#ddd] shadow-lg z-50 min-w-[130px] py-0.5">
          {options.map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false) }}
              className={cn('w-full text-left px-3 py-1.5 text-[14px] cursor-pointer', value === opt ? 'bg-[#03a9f4] text-white' : 'text-[#555] hover:bg-[#f0f4f8]')}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

import { getTimeEntries } from '@/lib/api/time-entries'
import { mapApiTimeEntry } from '@/lib/api/mappers'
import { DayEntriesModal } from '@/components/dashboard/day-entries-modal'

export default function WeeklyReportPage() {
  const { timeEntries, projects, users, groups } = useDataStore()
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
    to: endOfDay(endOfWeek(new Date(), { weekStartsOn: 1 })),
  })
  const [groupBy, setGroupBy] = useState('Project')
  const [selUsers, setSelUsers] = useState<string[]>([])
  const [selProjects, setSelProjects] = useState<string[]>([])
  const [selLeads, setSelLeads] = useState<string[]>([])
  const [selTasks, setSelTasks] = useState<string[]>([])
  const [selTags, setSelTags] = useState<string[]>([])
  const [selStatus, setSelStatus] = useState<string[]>([])
  const [descSearch, setDescSearch] = useState('')

  const fromStr = format(startOfDay(dateRange.from), 'yyyy-MM-dd')
  const toStr = format(endOfDay(dateRange.to), 'yyyy-MM-dd')

  const days = useMemo(() =>
    eachDayOfInterval({ start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) }),
    [fromStr, toStr]
  )

  const [filtered, setFiltered] = useState<typeof timeEntries>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const params: any = {
      startDate: fromStr,
      endDate: toStr,
    }

    setLoading(true)
    getTimeEntries(params)
      .then((res: any) => {
        if (!active) return
        let entries = Array.isArray(res) ? res : (res?.items || res?.entries || [])
        if (!Array.isArray(entries)) {
          entries = Object.values(res || {}).find(v => Array.isArray(v)) || []
        }

        entries = entries.map(mapApiTimeEntry)

        if (selLeads.length > 0) {
          const wantWithout = selLeads.includes('__without__')
          const leadIds = selLeads.filter(l => l !== '__without__')
          const matchingProjectIds = new Set(
            projects
              .filter(p => wantWithout ? !p.leadId : leadIds.includes(p.leadId ?? ''))
              .map(p => p.id)
          )
          entries = entries.filter((e: any) => {
            if (!e.projectId) return wantWithout
            return matchingProjectIds.has(e.projectId)
          })
        }
        if (selUsers.length > 0) {
          // Expand group IDs into member user IDs
          const selectedGroupIds = selUsers.filter(id => groups.find(g => g.id === id))
          const selectedUserIds = selUsers.filter(id => !groups.find(g => g.id === id))
          const groupMemberIds = selectedGroupIds.flatMap(gid => {
            const group = groups.find(g => g.id === gid)
            return (group?.memberIds ?? []).map(m =>
              typeof m === 'string' ? m : (m as { _id?: string; id?: string })._id ?? (m as { _id?: string; id?: string }).id ?? ''
            ).filter(Boolean)
          })
          const allUserIds = new Set<string>([...selectedUserIds, ...groupMemberIds])
          entries = entries.filter((e: any) => allUserIds.has(e.userId))
        }
        if (selProjects.length > 0) {
          const wantWithout = selProjects.includes('__without__')
          const projectIds = selProjects.filter(p => p !== '__without__')
          entries = entries.filter((e: any) => {
            if (!e.projectId) return wantWithout
            return projectIds.length === 0 ? wantWithout : projectIds.includes(e.projectId)
          })
        }
        if (selTags.length > 0) {
          const wantWithout = selTags.includes('__without__')
          const tagIds = selTags.filter(t => t !== '__without__')
          entries = entries.filter((e: any) => {
            if (!e.tagIds?.length) return wantWithout
            return tagIds.length === 0 ? wantWithout : e.tagIds.some((t: string) => tagIds.includes(t))
          })
        }
        if (selTasks.length > 0) {
          const wantWithout = selTasks.includes('__without__')
          const taskIds = selTasks.filter(t => t !== '__without__')
          entries = entries.filter((e: any) => {
            if (!e.taskId) return wantWithout
            return taskIds.length === 0 ? wantWithout : taskIds.includes(e.taskId)
          })
        }
        const hasBillable = selStatus.includes('billable')
        const hasNonBillable = selStatus.includes('non-billable')
        if (hasBillable && !hasNonBillable) entries = entries.filter((e: any) => e.billable === true)
        else if (hasNonBillable && !hasBillable) entries = entries.filter((e: any) => e.billable !== true)

        if (descSearch) {
          if (descSearch === '__without__') {
            entries = entries.filter((e: any) => !e.description?.trim())
          } else {
            entries = entries.filter((e: any) => e.description?.toLowerCase().includes(descSearch.toLowerCase()))
          }
        }

        setFiltered(entries)
      })
      .catch(err => console.error(err))
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [fromStr, toStr, selUsers, selLeads, selProjects, selTasks, selTags, selStatus, descSearch, projects, groups])

  const totalSecs = useMemo(() => filtered.reduce((a, e) => a + (e.duration ?? 0), 0), [filtered])

  // Build rows grouped by project or user
  const rows = useMemo(() => {
    const isUserGroup = groupBy === 'User'
    const grouped: Record<string, Record<string, number>> = {}
    const groupMeta: Record<string, { count: number }> = {}

    filtered.forEach(e => {
      const gid = isUserGroup ? e.userId : (e.projectId || '__none__')
      const d = new Date(e.startTime)
      if (isNaN(d.getTime())) return
      const dateKey = format(d, 'yyyy-MM-dd')

      if (!grouped[gid]) grouped[gid] = {}
      if (!groupMeta[gid]) groupMeta[gid] = { count: 0 }

      grouped[gid][dateKey] = (grouped[gid][dateKey] || 0) + (e.duration ?? 0)
      groupMeta[gid].count++
    })

    const groups = isUserGroup ? users : projects
    const dateKeys = days.map(d => format(d, 'yyyy-MM-dd'))

    return groups.map(g => {
      const gid = (g as any).id
      if (!grouped[gid]) return null

      const dayTotals = dateKeys.map(key => grouped[gid][key] || 0)
      const total = dayTotals.reduce((a, b) => a + b, 0)

      const proj = isUserGroup ? null : (g as typeof projects[0])
      const color = proj?.color || '#03a9f4'
      const lead = proj?.leadId ? users.find(u => u.id === proj.leadId)?.name : null
      const billable = proj?.billable ?? false

      return { id: gid, name: (g as any).name, color, lead, billable, entryCount: groupMeta[gid].count, dayTotals, total }
    }).filter(Boolean) as any[]
  }, [filtered, projects, users, days, groupBy, fromStr, toStr])

  const [modalDay, setModalDay] = useState<string | null>(null)

  const modalEntries = useMemo(() => {
    if (!modalDay) return []
    return filtered.filter(e => format(new Date(e.startTime), 'EEE, MMM d') === modalDay)
  }, [modalDay, filtered])

  const handleApply = (filters: any) => {
    setSelUsers(filters.team)
    setSelLeads(filters.lead)
    setSelProjects(filters.project)
    setSelTasks(filters.tasks)
    setSelTags(filters.tags)
    setSelStatus(filters.status)
    setDescSearch(filters.description)
  }

  return (
    <ReportShell
      dateRange={dateRange}
      onRangeChange={setDateRange}
      initialTeam={selUsers}
      initialProject={selProjects}
      initialDescription={descSearch}
      onApply={handleApply}
    >
      {modalDay && (
        <DayEntriesModal
          date={modalDay}
          entries={modalEntries}
          projects={projects}
          users={users}
          onClose={() => setModalDay(null)}
        />
      )}
      <div className="flex-1 overflow-y-auto overflow-x-auto m-6">

        {/* Stats + actions bar */}
        <div className="flex items-center justify-between bg-white border-b border-[#e4eaee] px-5 h-[40px] min-w-[900px]">
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-[#555]">Total: <strong className="text-[#333] font-bold tabular-nums">{fmtSecs(totalSecs)}</strong></span>
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
            <SimpleDropdown value={`Group by: ${groupBy}`} options={['Group by: Project', 'Group by: User']} onChange={v => setGroupBy(v.replace('Group by: ', ''))} />
            <button className="flex items-center gap-0.5 hover:text-[#03a9f4] cursor-pointer">Show time <ChevronDown className="h-3 w-3" /></button>
          </div>
        </div>

        {/* Table */}
        <div className="min-w-[900px]">
          {/* Header */}
          <div className="flex items-center h-[36px] bg-white border-b border-[#e4eaee] px-4 text-[12px] font-semibold text-[#aaa] uppercase tracking-wider">
            <div className="w-6 flex-shrink-0 mr-2" />
            <div className="flex-1 flex items-center gap-1 cursor-pointer hover:text-[#555]">
              <ChevronDown className="h-3 w-3" /> {groupBy}
            </div>
            {days.map(day => (
              <div
                key={day.toISOString()}
                className="w-[80px] text-right flex-shrink-0 text-[12px] cursor-pointer hover:text-[#03a9f4] transition-colors"
                onClick={() => setModalDay(format(day, 'EEE, MMM d'))}
              >
                {format(day, 'EEE, MMM d')}
              </div>
            ))}
            <div className="w-[80px] text-right flex-shrink-0 font-bold text-[#555]">Total</div>
          </div>

          {/* Rows */}
          <div className="bg-white">
            {loading ? (
              <div className="p-4 space-y-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : rows.length === 0 ? (
              <div className="py-20 text-center text-[14px] text-[#aaa] bg-white">No data for selected range</div>
            ) : (
              rows.map(row => (
                <div key={row.id} className="flex items-center h-[40px] bg-white border-b border-[#f0f0f0] px-4 hover:bg-[#fafbfc] transition-colors">
                  {/* Count */}
                  <div className="w-6 flex-shrink-0 mr-2 text-[14px] text-[#aaa] tabular-nums text-center">{row.entryCount}</div>

                  {/* Name */}
                  <div className="flex-1 min-w-0 flex items-center gap-2 pr-4">
                    <div className="w-[8px] h-[8px] rounded-full flex-shrink-0" style={{ backgroundColor: row.color }} />
                    <span className={cn('text-[14px] truncate', row.billable ? '' : 'text-[#e91e63]')} style={row.billable ? { color: row.color } : {}}>
                      {row.name}
                    </span>
                    {row.lead && <span className="text-[14px] text-[#aaa] truncate">- {row.lead}</span>}
                  </div>

                  {/* Day columns */}
                  {(row.dayTotals as number[]).map((secs: number, i: number) => (
                    <div key={i} className="w-[80px] text-right flex-shrink-0 text-[14px] text-[#333] tabular-nums">
                      {fmtH(secs)}
                    </div>
                  ))}

                  {/* Total */}
                  <div className="w-[80px] text-right flex-shrink-0 text-[14px] font-bold text-[#333] tabular-nums">
                    {fmtH(row.total)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ReportShell>
  )
}
