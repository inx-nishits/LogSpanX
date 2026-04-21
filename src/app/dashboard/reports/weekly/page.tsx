'use client'

import { useState, useMemo } from 'react'
import { addDays, startOfDay, endOfDay, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from 'date-fns'
import { ChevronDown, Printer, Share2 } from 'lucide-react'
import { useDataStore } from '@/lib/stores/data-store'
import { cn } from '@/lib/utils'
import { ReportShell, DateRange } from '../_components/report-shell'

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

export default function WeeklyReportPage() {
  const { timeEntries, projects, users } = useDataStore()
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
    to: endOfDay(endOfWeek(new Date(), { weekStartsOn: 1 })),
  })
  const [groupBy, setGroupBy] = useState('Project')

  const from = startOfDay(dateRange.from)
  const to = endOfDay(dateRange.to)

  const days = useMemo(() => eachDayOfInterval({ start: from, end: to }), [from, to])

  const filtered = useMemo(() =>
    timeEntries.filter(e => { const t = new Date(e.startTime); return t >= from && t <= to }),
    [timeEntries, from, to]
  )

  const totalSecs = useMemo(() => filtered.reduce((a, e) => a + (e.duration ?? 0), 0), [filtered])

  // Build rows grouped by project or user
  const rows = useMemo(() => {
    const groups = groupBy === 'User' ? users : projects
    return groups.map(g => {
      const isUser = groupBy === 'User'
      const groupEntries = filtered.filter(e => isUser ? e.userId === (g as any).id : e.projectId === (g as any).id)
      if (!groupEntries.length) return null

      const dayTotals = days.map(day =>
        groupEntries.filter(e => isSameDay(new Date(e.startTime), day)).reduce((a, e) => a + (e.duration ?? 0), 0)
      )
      const total = dayTotals.reduce((a, b) => a + b, 0)
      const proj = isUser ? null : (g as typeof projects[0])
      const color = proj?.color || '#03a9f4'
      const name = (g as any).name
      const lead = proj?.leadId ? users.find(u => u.id === proj.leadId)?.name : null
      const billable = proj?.billable ?? false

      return { id: (g as any).id, name, color, lead, billable, entryCount: groupEntries.length, dayTotals, total }
    }).filter(Boolean) as { id: string; name: string; color: string; lead: string | null | undefined; billable: boolean; entryCount: number; dayTotals: number[]; total: number }[]
  }, [filtered, projects, users, days, groupBy])

  return (
    <ReportShell dateRange={dateRange} onRangeChange={setDateRange}>
      <div className="flex-1 overflow-y-auto overflow-x-auto m-6">

        {/* Stats + actions bar */}
        <div className="flex items-center justify-between bg-white border-b border-[#e4eaee] px-5 h-[48px] min-w-[900px]">
          <div className="flex items-center gap-2 text-[14px]">
            <span className="text-[#555]">Total: <strong className="text-[#333] font-bold tabular-nums">{fmtSecs(totalSecs)}</strong></span>
          </div>
          <div className="flex items-center gap-3 text-[14px] text-[#555]">
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
          <div className="flex items-center h-[40px] bg-white border-b border-[#e4eaee] px-4 text-[11px] font-semibold text-[#aaa] uppercase tracking-wider">
            <div className="w-6 flex-shrink-0 mr-2" />
            <div className="flex-1 flex items-center gap-1 cursor-pointer hover:text-[#555]">
              <ChevronDown className="h-3 w-3" /> {groupBy}
            </div>
            {days.map(day => (
              <div key={day.toISOString()} className="w-[80px] text-right flex-shrink-0 text-[11px]">
                {format(day, 'EEE, MMM d')}
              </div>
            ))}
            <div className="w-[80px] text-right flex-shrink-0 font-bold text-[#555]">Total</div>
          </div>

          {/* Rows */}
          {rows.length === 0 ? (
            <div className="py-20 text-center text-[14px] text-[#aaa] bg-white">No data for selected range</div>
          ) : (
            rows.map(row => (
              <div key={row.id} className="flex items-center h-[50px] bg-white border-b border-[#f0f0f0] px-4 hover:bg-[#fafbfc] transition-colors">
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
                {row.dayTotals.map((secs, i) => (
                  <div key={i} className="w-[80px] text-right flex-shrink-0 text-[14px] text-[#333] tabular-nums">
                    {fmtH(secs)}
                  </div>
                ))}

                {/* Total */}
                <div className="w-[80px] text-right flex-shrink-0 text-[15px] font-bold text-[#333] tabular-nums">
                  {fmtH(row.total)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ReportShell>
  )
}
