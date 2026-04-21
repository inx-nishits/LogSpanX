'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Settings, ChevronDown, Minus, Plus } from 'lucide-react'
import {
  startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay,
  addWeeks, subWeeks, addDays, subDays, startOfDay, endOfDay
} from 'date-fns'
import { useDataStore } from '@/lib/stores/data-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { cn } from '@/lib/utils'
import { DateRangePicker } from '@/components/dashboard/date-range-picker'

const HOUR_PX = 64

function fmtH(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

function getNowPercent() {
  const n = new Date()
  return (n.getHours() * 60 + n.getMinutes()) / (24 * 60) * 100
}

// Detect overlapping entries and assign column positions
function layoutEntries(entries: { id: string; startMin: number; endMin: number }[]) {
  const sorted = [...entries].sort((a, b) => a.startMin - b.startMin)
  const cols: { id: string; col: number; totalCols: number }[] = []
  const groups: { id: string; startMin: number; endMin: number; col: number }[][] = []

  sorted.forEach(entry => {
    let placed = false
    for (const group of groups) {
      const overlaps = group.some(e => e.startMin < entry.endMin && e.endMin > entry.startMin)
      if (overlaps) {
        const usedCols = new Set(group.map(e => e.col))
        let col = 0
        while (usedCols.has(col)) col++
        group.push({ ...entry, col })
        placed = true
        break
      }
    }
    if (!placed) groups.push([{ ...entry, col: 0 }])
  })

  groups.forEach(group => {
    const maxCol = Math.max(...group.map(e => e.col)) + 1
    group.forEach(e => cols.push({ id: e.id, col: e.col, totalCols: maxCol }))
  })

  return cols
}

export default function CalendarPage() {
  const { timeEntries, projects, users } = useDataStore()
  const { user } = useAuthStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<'week' | 'day'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedRange, setSelectedRange] = useState({
    from: startOfWeek(new Date(), { weekStartsOn: 1 }),
    to: endOfWeek(new Date(), { weekStartsOn: 1 })
  })
  const [nowPct, setNowPct] = useState(getNowPercent())
  const today = new Date()

  useEffect(() => {
    const id = setInterval(() => setNowPct(getNowPercent()), 60000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = HOUR_PX * 7
  }, [])

  const days = useMemo(() => {
    if (view === 'day') return [currentDate]
    return eachDayOfInterval({
      start: selectedRange.from,
      end: selectedRange.to,
    })
  }, [view, currentDate, selectedRange])

  const dayEntries = (date: Date) =>
    timeEntries.filter(e => {
      const t = new Date(e.startTime)
      // Only show current user's entries to avoid overcrowding
      return t >= startOfDay(date) && t <= endOfDay(date) && e.endTime && e.userId === (user?.id ?? e.userId)
    })

  const dayTotal = (date: Date) =>
    dayEntries(date).reduce((a, e) => a + (e.duration ?? 0), 0)

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-[50px] bg-white border-b border-[#e4eaee] flex-shrink-0">
        <div className="flex items-center gap-2">
          <button className="w-[26px] h-[26px] flex items-center justify-center border border-[#d0d8de] rounded text-[#555] hover:bg-[#f5f7f9] cursor-pointer">
            <Minus className="h-3 w-3" />
          </button>
          <button className="w-[26px] h-[26px] flex items-center justify-center border border-[#d0d8de] rounded text-[#555] hover:bg-[#f5f7f9] cursor-pointer">
            <Plus className="h-3 w-3" />
          </button>
          <div className="flex items-center border border-[#d0d8de] rounded overflow-hidden ml-1">
            {(['week', 'day'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-4 h-[28px] text-[13px] font-medium cursor-pointer capitalize transition-colors',
                  v !== 'week' && 'border-l border-[#d0d8de]',
                  view === v ? 'bg-[#4285f4] text-white' : 'bg-white text-[#555] hover:bg-[#f5f7f9]'
                )}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-[28px] h-[28px] flex items-center justify-center text-[#aaa] hover:text-[#555] cursor-pointer">
            <Settings className="h-4 w-4" />
          </button>
          <button className="flex items-center gap-1 px-3 h-[28px] text-[13px] text-[#555] border border-[#d0d8de] rounded hover:border-[#aaa] cursor-pointer">
            Teammates <ChevronDown className="h-3 w-3 text-[#aaa]" />
          </button>
          <div className="flex items-center">
            <DateRangePicker
              initialRange={selectedRange}
              onRangeChange={setSelectedRange}
            />
          </div>
        </div>
      </div>

      {/* Day headers */}
      <div className="flex flex-shrink-0 border-b border-[#e4eaee] bg-white">
        <div className="w-[56px] flex-shrink-0" />
        {days.map(day => {
          const isToday = isSameDay(day, today)
          const total = dayTotal(day)
          return (
            <div key={day.toISOString()} className="flex-1 text-center py-2 border-l border-[#e4eaee] min-w-0">
              <div className={cn('text-[13px]', isToday ? 'text-[#4285f4] font-semibold' : 'text-[#555]')}>
                {format(day, 'EEE, MMM d')}
              </div>
              <div className={cn('text-[12px] tabular-nums', isToday ? 'text-[#4285f4]' : 'text-[#aaa]')}>
                {fmtH(total)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Scrollable grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        <div className="flex" style={{ height: `${HOUR_PX * 24}px` }}>

          {/* Hour labels */}
          <div className="w-[56px] flex-shrink-0 relative select-none">
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="absolute w-full flex items-start justify-end pr-2" style={{ top: `${(h / 24) * 100}%`, height: `${100 / 24}%` }}>
                <span className="text-[11px] text-[#bbb] -mt-2 tabular-nums">{h === 0 ? '' : `${String(h).padStart(2, '0')}:00`}</span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map(day => {
            const isToday = isSameDay(day, today)
            const entries = dayEntries(day)

            return (
              <div key={day.toISOString()} className="flex-1 relative border-l border-[#e4eaee] min-w-0">
                {/* Hour lines */}
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} className="absolute w-full border-t border-[#f0f0f0]" style={{ top: `${(h / 24) * 100}%` }} />
                ))}
                {/* Half-hour dashed lines */}
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={`h${h}`} className="absolute w-full border-t border-dashed border-[#f8f8f8]" style={{ top: `${((h + 0.5) / 24) * 100}%` }} />
                ))}

                {/* Current time line */}
                {isToday && (
                  <div className="absolute left-0 right-0 z-20 flex items-center pointer-events-none" style={{ top: `${nowPct}%` }}>
                    <div className="w-[8px] h-[8px] rounded-full bg-[#e53935] -ml-1 flex-shrink-0" />
                    <div className="flex-1 h-[1.5px] bg-[#e53935]" />
                  </div>
                )}

                {/* Entry blocks — full width, stacked by time */}
                {entries.map(entry => {
                    const start = new Date(entry.startTime)
                    const end = new Date(entry.endTime!)
                    const proj = projects.find(p => p.id === entry.projectId)
                    const topPct = (start.getHours() * 60 + start.getMinutes()) / (24 * 60) * 100
                    const mins = (end.getTime() - start.getTime()) / 60000
                    const heightPct = Math.max(mins / (24 * 60) * 100, 0.8)
                    const heightPx = heightPct / 100 * (HOUR_PX * 24)

                    return (
                      <div
                        key={entry.id}
                        className="absolute rounded-sm overflow-hidden cursor-pointer hover:brightness-95 transition-all z-10 bg-[#f8f9fa] border border-[#e4eaee] border-l-[3px]"
                        style={{
                          top: `${topPct}%`,
                          height: `${heightPct}%`,
                          minHeight: '20px',
                          left: '1px',
                          right: '2px',
                          borderLeftColor: proj?.color || '#03a9f4',
                        }}
                      >
                        <div className="px-1.5 py-1 h-full flex flex-col overflow-hidden">
                          {heightPx >= 28 && (
                            <p className="text-[11px] text-[#333] leading-tight truncate font-medium">
                              {entry.description || '(no description)'}
                            </p>
                          )}
                          {heightPx >= 44 && proj && (
                            <p className="text-[10px] text-[#666] truncate mt-0.5">{proj.name}</p>
                          )}
                          {heightPx >= 36 && (
                            <span className="text-[10px] text-[#888] tabular-nums mt-auto">
                              {fmtH(entry.duration ?? 0)}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
