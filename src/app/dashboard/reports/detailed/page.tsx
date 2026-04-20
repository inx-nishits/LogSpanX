'use client'

import { useState, useMemo } from 'react'
import { addDays, startOfDay, endOfDay, startOfWeek, endOfWeek, format } from 'date-fns'
import { ChevronDown, DollarSign, MoreVertical, Printer, Share2, Tag } from 'lucide-react'
import { useDataStore } from '@/lib/stores/data-store'
import { cn } from '@/lib/utils'
import { ReportShell, DateRange } from '../_components/report-shell'

function fmtSecs(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

function fmtDur(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function DetailedReportPage() {
  const { timeEntries, projects, users } = useDataStore()
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
    to: endOfDay(endOfWeek(new Date(), { weekStartsOn: 1 })),
  })

  const filtered = useMemo(() =>
    timeEntries
      .filter(e => { const t = new Date(e.startTime); return t >= startOfDay(dateRange.from) && t <= endOfDay(dateRange.to) })
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()),
    [timeEntries, dateRange]
  )

  const totalSecs = useMemo(() => filtered.reduce((a, e) => a + (e.duration ?? 0), 0), [filtered])
  const billableSecs = useMemo(() => filtered.filter(e => e.billable).reduce((a, e) => a + (e.duration ?? 0), 0), [filtered])

  return (
    <ReportShell dateRange={dateRange} onRangeChange={setDateRange}>
      <div className="flex-1 overflow-y-auto">

        {/* Action bar */}
        <div className="flex items-center gap-2 px-4 h-[44px] bg-white border-b border-[#e4eaee] flex-shrink-0">
          <button className="flex items-center gap-1.5 px-3 h-[28px] text-[13px] text-[#555] border border-[#d0d8de] rounded hover:border-[#aaa] cursor-pointer">
            Time audit <ChevronDown className="h-3 w-3 text-[#aaa]" />
          </button>
          <button className="flex items-center gap-1.5 px-3 h-[28px] text-[13px] text-[#555] border border-[#d0d8de] rounded hover:border-[#aaa] cursor-pointer">
            Add time for others <ChevronDown className="h-3 w-3 text-[#aaa]" />
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between bg-white border-b border-[#e4eaee] px-5 h-[44px]">
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

        {/* Table header */}
        <div className="flex items-center h-[36px] bg-white border-b border-[#e4eaee] px-4 text-[11px] font-semibold text-[#aaa] uppercase tracking-wider">
          <div className="w-5 flex-shrink-0 mr-2">
            <div className="w-[14px] h-[14px] border border-[#ccc]" />
          </div>
          <div className="flex-1 flex items-center gap-1 cursor-pointer hover:text-[#555]">
            Time Entry <ChevronDown className="h-3 w-3" />
          </div>
          <div className="w-[80px] text-right flex-shrink-0">Amount</div>
          <div className="w-[140px] text-right flex-shrink-0 mx-4">User</div>
          <div className="w-[120px] text-right flex-shrink-0">Time</div>
          <div className="w-[80px] text-right flex-shrink-0 ml-4">Duration</div>
          <div className="w-8 flex-shrink-0" />
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-[14px] text-[#aaa] bg-white">No entries for selected range</div>
        ) : (
          filtered.map(entry => {
            const proj = projects.find(p => p.id === entry.projectId)
            const user = users.find(u => u.id === entry.userId)
            const start = new Date(entry.startTime)
            const end = entry.endTime ? new Date(entry.endTime) : null
            const isToday = new Date().toDateString() === start.toDateString()

            return (
              <div key={entry.id} className="flex items-center min-h-[56px] bg-white border-b border-[#f0f0f0] px-4 hover:bg-[#fafbfc] transition-colors group">
                {/* Checkbox */}
                <div className="w-5 flex-shrink-0 mr-2">
                  <div className="w-[14px] h-[14px] border border-[#ccc] hover:border-[#03a9f4] cursor-pointer" />
                </div>

                {/* Description + project */}
                <div className="flex-1 min-w-0 pr-4 py-2">
                  <p className="text-[13px] text-[#333] truncate">{entry.description || '(no description)'}</p>
                  {proj && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ backgroundColor: proj.color }} />
                      <span className="text-[12px] truncate" style={{ color: proj.color }}>{proj.name}</span>
                      {user && <span className="text-[12px] text-[#aaa]">- {user.name}</span>}
                    </div>
                  )}
                  <button className="mt-1 flex items-center gap-1 text-[11px] text-[#aaa] hover:text-[#03a9f4] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tag className="h-3 w-3" /> Add tags
                  </button>
                </div>

                {/* Amount */}
                <div className="w-[80px] text-right flex-shrink-0">
                  <div className="flex items-center justify-end gap-1">
                    <DollarSign className={cn('h-4 w-4', entry.billable ? 'text-[#03a9f4]' : 'text-[#ddd]')} />
                    <span className="text-[13px] text-[#333] tabular-nums">0.00</span>
                  </div>
                </div>

                {/* User */}
                <div className="w-[140px] text-right flex-shrink-0 mx-4">
                  <button className="flex items-center justify-end gap-1 text-[13px] text-[#555] hover:text-[#03a9f4] cursor-pointer ml-auto">
                    {user?.name || '—'} <ChevronDown className="h-3 w-3 text-[#aaa]" />
                  </button>
                </div>

                {/* Time range */}
                <div className="w-[120px] text-right flex-shrink-0">
                  <div className="text-[13px] text-[#333] tabular-nums">
                    {fmtTime(start)} {end ? fmtTime(end) : '...'}
                  </div>
                  <div className="text-[11px] text-[#aaa]">{isToday ? 'Today' : format(start, 'MMM d')}</div>
                </div>

                {/* Duration */}
                <div className="w-[80px] text-right flex-shrink-0 ml-4">
                  <span className="text-[14px] font-bold text-[#333] tabular-nums">{fmtDur(entry.duration ?? 0)}</span>
                </div>

                {/* More */}
                <div className="w-8 flex-shrink-0 flex items-center justify-center">
                  <button className="p-1 text-[#ccc] hover:text-[#555] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </ReportShell>
  )
}
