'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { addDays, startOfDay, endOfDay, startOfWeek, endOfWeek, format, parseISO } from 'date-fns'
import { ChevronDown, DollarSign, MoreVertical, Printer, Share2, X } from 'lucide-react'
import { useDataStore } from '@/lib/stores/data-store'
import { cn } from '@/lib/utils'
import { ReportShell, DateRange } from '../_components/report-shell'
import { useSearchParams, useRouter } from 'next/navigation'

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

function EntryMenu() {
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
    <div className="w-[32px] flex-shrink-0 flex items-center justify-center relative" ref={ref}>
      <button className="p-1 text-[#ccc] hover:text-[#555] cursor-pointer" onClick={() => setOpen(o => !o)}>
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-0.5 bg-white border border-[#e4eaee] shadow-lg z-50 min-w-[120px] py-1">
          <button className="w-full text-left px-4 py-2 text-[14px] text-[#333] hover:bg-[#f5f7f9] cursor-pointer" onClick={() => setOpen(false)}>Duplicate</button>
          <button className="w-full text-left px-4 py-2 text-[14px] text-red-500 hover:bg-red-50 cursor-pointer" onClick={() => setOpen(false)}>Delete</button>
        </div>
      )}
    </div>
  )
}

export default function DetailedReportPage() {
  const { timeEntries, projects, users } = useDataStore()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Read filter from URL params (set when clicking from summary page)
  const paramFrom      = searchParams.get('from')
  const paramTo        = searchParams.get('to')
  const filterType     = searchParams.get('filterType') as 'user' | 'project' | 'lead' | 'group' | null
  const filterId       = searchParams.get('filterId')
  const filterLabel    = searchParams.get('filterLabel')

  const [dateRange, setDateRange] = useState<DateRange>(() => ({
    from: paramFrom ? startOfDay(parseISO(paramFrom)) : startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
    to:   paramTo   ? endOfDay(parseISO(paramTo))     : endOfDay(endOfWeek(new Date(), { weekStartsOn: 1 })),
  }))

  const clearFilter = () => {
    router.replace('/dashboard/reports/detailed')
  }

  const filtered = useMemo(() => {
    let entries = timeEntries.filter(e => {
      const t = new Date(e.startTime)
      return t >= startOfDay(dateRange.from) && t <= endOfDay(dateRange.to)
    })

    if (filterType && filterId) {
      if (filterType === 'user' || filterType === 'group') {
        entries = entries.filter(e => e.userId === filterId)
      } else if (filterType === 'project') {
        entries = entries.filter(e => e.projectId === filterId)
      } else if (filterType === 'lead') {
        // filter entries whose project has this lead
        const leadProjectIds = new Set(
          projects.filter(p => p.leadId === filterId).map(p => p.id)
        )
        entries = entries.filter(e => e.projectId && leadProjectIds.has(e.projectId))
      }
    }

    return entries.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  }, [timeEntries, dateRange, filterType, filterId, projects])

  const totalSecs    = useMemo(() => filtered.reduce((a, e) => a + (e.duration ?? 0), 0), [filtered])
  const billableSecs = useMemo(() => filtered.filter(e => e.billable).reduce((a, e) => a + (e.duration ?? 0), 0), [filtered])

  const filterTypeLabel: Record<string, string> = {
    user: 'User', project: 'Project', lead: 'Project Lead', group: 'Group',
  }

  return (
    <ReportShell dateRange={dateRange} onRangeChange={setDateRange}>
      <div className="flex-1 m-6 overflow-y-auto bg-white">

        {/* Active filter badge */}
        {filterType && filterId && filterLabel && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f0f7fb] border-b border-[#d0e8f5]">
            <span className="text-[13px] text-[#555]">
              Filtered by <span className="font-semibold text-[#03a9f4]">{filterTypeLabel[filterType]}</span>:
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#03a9f4] text-white text-[13px] rounded-full">
              {filterLabel}
              <button onClick={clearFilter} className="hover:opacity-70 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-2 py-3 bg-[#f2f6f8] border-b border-[#e4eaee]">
          <button className="flex items-center gap-1.5 px-3 h-[30px] text-[15px] text-[#555] bg-white border border-[#d0d8de] rounded hover:border-[#aaa] cursor-pointer">
            Time audit <ChevronDown className="h-3 w-3 text-[#aaa]" />
          </button>
          <button className="flex items-center gap-1.5 px-3 h-[30px] text-[15px] text-[#555] bg-white border border-[#d0d8de] rounded hover:border-[#aaa] cursor-pointer">
            Add time for others <ChevronDown className="h-3 w-3 text-[#aaa]" />
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between bg-[#e4eaee] border-b border-[#e4eaee] px-4 h-[38px]">
          <div className="flex items-center gap-5 text-[15px]">
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

        {/* Table header */}
        <div className="flex items-center h-[38px] bg-[#f5f7f9] border-b border-[#e4eaee] px-4 text-[12px] font-bold text-[#aaa] uppercase tracking-wider">
          <div className="w-5 flex-shrink-0 mr-3">
            <div className="w-[14px] h-[14px] border border-[#ccc] rounded-sm" />
          </div>
          <div className="flex-1 flex items-center gap-1 cursor-pointer hover:text-[#555]">
            Time Entry <span className="text-[11px]">↕</span>
          </div>
          <div className="w-[100px] text-right flex-shrink-0 flex items-center justify-end gap-1 cursor-pointer hover:text-[#555]">Amount <span className="text-[11px]">↕</span></div>
          <div className="w-[150px] text-right flex-shrink-0 mx-3 flex items-center justify-end gap-1 cursor-pointer hover:text-[#555]">User <span className="text-[11px]">↕</span></div>
          <div className="w-[120px] text-right flex-shrink-0 flex items-center justify-end gap-1 cursor-pointer hover:text-[#555]">Time <span className="text-[11px]">↕</span></div>
          <div className="w-[90px] text-right flex-shrink-0 ml-3 flex items-center justify-end gap-1 cursor-pointer hover:text-[#555]">Duration <span className="text-[11px]">↕</span></div>
          <div className="w-[32px] flex-shrink-0" />
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[15px] text-[#aaa]">No entries for selected range</div>
        ) : (
          filtered.map(entry => {
            const proj = projects.find(p => p.id === entry.projectId)
            const user = users.find(u => u.id === entry.userId)
            const start = new Date(entry.startTime)
            const end = entry.endTime ? new Date(entry.endTime) : null
            const isToday = new Date().toDateString() === start.toDateString()

            return (
              <div key={entry.id} className="flex items-center h-[58px] bg-white border-b border-[#f0f0f0] px-4 hover:bg-[#fafbfc] transition-colors group relative">
                <div className="w-5 flex-shrink-0 mr-3">
                  <div className="w-[14px] h-[14px] border border-[#ccc] rounded-sm hover:border-[#03a9f4] cursor-pointer" />
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
                  <span className="text-[15px] text-[#333] truncate max-w-[38%] flex-shrink-0">{entry.description || '(no description)'}</span>
                  {proj && (
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <div className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ backgroundColor: proj.color }} />
                      <span className="text-[14px] truncate flex-1" style={{ color: proj.color }}>{proj.name}</span>
                    </div>
                  )}
                </div>
                <button className="flex-shrink-0 ml-1 mr-2 px-2 h-[22px] text-[12px] text-[#aaa] border border-[#d0d8de] rounded hover:border-[#03a9f4] hover:text-[#03a9f4] cursor-pointer whitespace-nowrap">
                  Add tags
                </button>
                <div className="w-px h-8 border-l border-dotted border-[#d0d8de] flex-shrink-0" />
                <div className="w-[100px] flex items-center justify-end gap-2 flex-shrink-0 px-2">
                  <span className="text-[14px] text-[#333] tabular-nums">0.00</span>
                  <button className={cn('flex items-center justify-center w-[26px] h-[22px] rounded-full border cursor-pointer transition-colors', entry.billable ? 'border-[#03a9f4] text-[#03a9f4] hover:bg-[#e8f7fe]' : 'border-[#ddd] text-[#ddd]')}>
                    <DollarSign className="h-[13px] w-[13px]" />
                  </button>
                </div>
                <div className="w-px h-8 border-l border-dotted border-[#d0d8de] flex-shrink-0" />
                <div className="w-[150px] text-right flex-shrink-0 px-2">
                  <button className="flex items-center justify-end gap-0.5 text-[14px] text-[#555] hover:text-[#03a9f4] cursor-pointer ml-auto">
                    {user?.name || '—'} <ChevronDown className="h-3 w-3 text-[#aaa]" />
                  </button>
                </div>
                <div className="w-px h-8 border-l border-dotted border-[#d0d8de] flex-shrink-0" />
                <div className="w-[120px] text-right flex-shrink-0 px-2">
                  <div className="text-[15px] text-[#333] tabular-nums">{fmtTime(start)} {end ? fmtTime(end) : '...'}</div>
                  <div className="text-[13px] text-[#aaa] mt-[2px]">{isToday ? 'Today' : format(start, 'dd/MM/yyyy')}</div>
                </div>
                <div className="w-px h-8 border-l border-dotted border-[#d0d8de] flex-shrink-0" />
                <div className="w-[90px] text-right flex-shrink-0 px-2">
                  <span className="text-[17px] font-bold text-[#333] tabular-nums">{fmtDur(entry.duration ?? 0)}</span>
                </div>
                <div className="w-px h-8 border-l border-dotted border-[#d0d8de] flex-shrink-0" />
                <EntryMenu />
              </div>
            )
          })
        )}
      </div>
    </ReportShell>
  )
}
