'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import {
  ChevronLeft, ChevronRight, Settings, ChevronDown,
  DollarSign, Minus, Plus
} from 'lucide-react'
import { DateRangePicker } from '@/components/dashboard/date-range-picker'
import {
  startOfWeek, eachDayOfInterval, format, isSameDay,
  addWeeks, subWeeks, addDays, subDays, startOfDay, endOfDay,
  isThisWeek
} from 'date-fns'
import { useDataStore } from '@/lib/stores/data-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { EditEntryModal } from '@/components/tracker/edit-entry-modal'
import { TimeEntry } from '@/lib/types'

const HOUR_PX = 60
const TOTAL_H = HOUR_PX * 24
const LABEL_W = 64

function fmtH(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

function getNowPct() {
  const n = new Date()
  return (n.getHours() * 60 + n.getMinutes()) / 1440 * 100
}

function layoutEntries(entries: { id: string; startMin: number; endMin: number }[]) {
  const sorted = [...entries].sort((a, b) => a.startMin - b.startMin)
  const result: { id: string; col: number; totalCols: number }[] = []
  const groups: { id: string; startMin: number; endMin: number; col: number }[][] = []

  for (const entry of sorted) {
    let placed = false
    for (const group of groups) {
      if (group.some(e => e.startMin < entry.endMin && e.endMin > entry.startMin)) {
        const used = new Set(group.map(e => e.col))
        let col = 0
        while (used.has(col)) col++
        group.push({ ...entry, col })
        placed = true
        break
      }
    }
    if (!placed) groups.push([{ ...entry, col: 0 }])
  }

  for (const group of groups) {
    const maxCol = Math.max(...group.map(e => e.col)) + 1
    for (const e of group) result.push({ id: e.id, col: e.col, totalCols: maxCol })
  }
  return result
}

const MIN_HOUR_PX = 30
const MAX_HOUR_PX = 120
const ZOOM_STEP = 10

export default function CalendarPage() {
  const { timeEntries, projects, users, updateTimeEntry } = useDataStore()
  const { user } = useAuthStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<'week' | 'day'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [selectedRange, setSelectedRange] = useState({
    from: startOfWeek(new Date(), { weekStartsOn: 1 }),
    to: addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 6),
  })
  const [hourPx, setHourPx] = useState(HOUR_PX)
  const [nowPct, setNowPct] = useState(getNowPct())
  const [hoveredDay, setHoveredDay] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  // drag state
  const dragInfo = useRef<{ entryId: string; offsetMinutes: number; duration: number } | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const today = new Date()

  useEffect(() => {
    const id = setInterval(() => setNowPct(getNowPct()), 60000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = HOUR_PX * 7
  }, [])

  const days = useMemo(() =>
    view === 'day'
      ? [currentDate]
      : eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) }),
    [view, currentDate, weekStart]
  )

  const navigatePrev = () => {
    if (view === 'week') {
      const newStart = subWeeks(weekStart, 1)
      setWeekStart(newStart)
      setSelectedRange({ from: newStart, to: addDays(newStart, 6) })
      setSelectedDay(null)
    } else {
      const newDate = subDays(currentDate, 1)
      setCurrentDate(newDate)
      setSelectedDay(newDate)
      setSelectedRange({ from: newDate, to: newDate })
    }
  }

  const navigateNext = () => {
    if (view === 'week') {
      const newStart = addWeeks(weekStart, 1)
      setWeekStart(newStart)
      setSelectedRange({ from: newStart, to: addDays(newStart, 6) })
      setSelectedDay(null)
    } else {
      const newDate = addDays(currentDate, 1)
      setCurrentDate(newDate)
      setSelectedDay(newDate)
      setSelectedRange({ from: newDate, to: newDate })
    }
  }

  const handleRangeChange = (range: { from: Date; to: Date }) => {
    setSelectedRange(range)
    const newWeekStart = startOfWeek(range.from, { weekStartsOn: 1 })
    setWeekStart(newWeekStart)
    if (isSameDay(range.from, range.to)) {
      setCurrentDate(range.from)
      setSelectedDay(range.from)
      setView('day')
    } else {
      setSelectedDay(null)
      setView('week')
    }
  }

  // DatePicker label: day view → 'Apr 15, 2026', week view → '13/04/2026 - 19/04/2026'
  const datePickerLabel = useMemo(() => {
    if (view === 'day') return format(currentDate, 'MMM d, yyyy')
    return undefined // DateRangePicker shows range by default
  }, [view, currentDate])

  const getDayEntries = (date: Date) =>
    timeEntries.filter(e => {
      const t = new Date(e.startTime)
      return (
        t >= startOfDay(date) &&
        t <= endOfDay(date) &&
        !!e.endTime &&
        e.userId === user?.id
      )
    })

  const getDayTotal = (date: Date) =>
    getDayEntries(date).reduce((a, e) => a + (e.duration ?? 0), 0)

  const handleDragStart = (e: React.DragEvent, entry: typeof timeEntries[0], colEl: HTMLElement) => {
    const rect = colEl.closest('[data-col]')!.getBoundingClientRect()
    const totalH = hourPx * 24
    const yInCol = e.clientY - rect.top + (scrollRef.current?.scrollTop ?? 0)
    const minutesFromTop = (yInCol / totalH) * 1440
    const entryStartMin = new Date(entry.startTime).getHours() * 60 + new Date(entry.startTime).getMinutes()
    const offsetMinutes = minutesFromTop - entryStartMin
    const duration = entry.duration ?? 0
    dragInfo.current = { entryId: entry.id, offsetMinutes, duration }
    setDraggingId(entry.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, day: Date) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropTarget(day.toISOString())
  }

  const handleDrop = (e: React.DragEvent, day: Date, colEl: HTMLElement) => {
    e.preventDefault()
    if (!dragInfo.current) return
    const { entryId, offsetMinutes, duration } = dragInfo.current
    const rect = colEl.getBoundingClientRect()
    const totalH = hourPx * 24
    const yInCol = e.clientY - rect.top + (scrollRef.current?.scrollTop ?? 0)
    const droppedMin = Math.round(((yInCol / totalH) * 1440 - offsetMinutes) / 15) * 15
    const clampedMin = Math.max(0, Math.min(droppedMin, 1440 - Math.ceil(duration / 60)))
    const newStartH = Math.floor(clampedMin / 60)
    const newStartM = clampedMin % 60
    const dateStr = format(day, 'yyyy-MM-dd')
    const newStart = new Date(`${dateStr}T${String(newStartH).padStart(2, '0')}:${String(newStartM).padStart(2, '0')}:00`)
    const newEnd = new Date(newStart.getTime() + duration * 1000)
    updateTimeEntry(entryId, { startTime: newStart, endTime: newEnd })
    dragInfo.current = null
    setDraggingId(null)
    setDropTarget(null)
  }

  const handleDragEnd = () => {
    dragInfo.current = null
    setDraggingId(null)
    setDropTarget(null)
  }

  // ── Shared button style ───────────────────────────────────────────────────
  const btn = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fff',
    border: '1px solid #d8d8d8',
    borderRadius: 4,
    cursor: 'pointer',
    color: '#666',
    ...extra,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#fff' }}>
      {editingEntry && (
        <EditEntryModal entry={editingEntry} onClose={() => setEditingEntry(null)} />
      )}

      {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 46, flexShrink: 0, background: '#fff',
        margin: '24px 24px 24px 24px', paddingRight: 12,

      }}>
        {/* CALENDAR + Week + Day */}
        <div style={{ display: 'flex', alignItems: 'center', height: '100%', border: '1px solid #d0d0d0', margin : 0, padding: '0 12px', borderRadius: 4, background: '#f9f9f9' }}>
          {/* CALENDAR — bordered box like Clockify */}
          <div style={{
            fontSize: 12, fontWeight: 400, color: '#555',
            letterSpacing: '0.04em',
            padding: '4px 8px', marginRight: 12,
            borderRadius: 3,
            background: '#fff',
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}>
            CALENDAR
          </div>
          {(['week', 'day'] as const).map(v => (
            <button key={v} onClick={() => {
              setView(v)
              if (v === 'week') {
                setSelectedDay(null)
                const newRange = { from: weekStart, to: addDays(weekStart, 6) }
                setSelectedRange(newRange)
              } else {
                // switching to day: use currentDate
                setSelectedRange({ from: currentDate, to: currentDate })
              }
            }} style={{
              height: '100%', padding: '0 14px',
              fontSize: 14, fontWeight: view === v ? 700 : 400,
              color: view === v ? '#222' : '#888',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: view === v ? '2px solid #333' : '2px solid transparent',
              position: 'relative', top: 1,
            }}>
              {v === 'week' ? 'Week' : 'Day'}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button style={btn({ width: 36, height: 36 })}>
            <Settings style={{ width: 18, height: 18, strokeWidth: 1.5 }} />
          </button>

          <button style={btn({ gap: 6, padding: '0 14px', height: 36, fontSize: 15, color: '#444' })}>
            Teammates
            <ChevronDown style={{ width: 15, height: 15, color: '#aaa' }} />
          </button>

          <button onClick={navigatePrev} style={btn({ width: 32, height: 36 })}>
            <ChevronLeft style={{ width: 17, height: 17 }} />
          </button>

          <DateRangePicker
            key={selectedRange.from.toISOString()}
            initialRange={selectedRange}
            onRangeChange={handleRangeChange}
            label={datePickerLabel}
          />

          <button onClick={navigateNext} style={btn({ width: 32, height: 36 })}>
            <ChevronRight style={{ width: 17, height: 17 }} />
          </button>
        </div>
      </div>

      {/* ── DAY HEADERS ─────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', flexShrink: 0,
        background: '#f0f2f5', borderBottom: '1px solid #e0e0e0', height: 52,
      }}>
        {/* — + zoom buttons */}
        <div style={{
          width: LABEL_W, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          borderRight: '1px solid #e0e0e0',
        }}>
          <button onClick={() => setHourPx(h => Math.max(h - 10, 30))} style={{
            width: 22, height: 22,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid #ccc', borderRadius: 3,
            background: '#fff', cursor: 'pointer', color: '#666',
          }}>
            <Minus style={{ width: 10, height: 10 }} />
          </button>
          <button onClick={() => setHourPx(h => Math.min(h + 10, 120))} style={{
            width: 22, height: 22,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid #ccc', borderRadius: 3,
            background: '#fff', cursor: 'pointer', color: '#666',
          }}>
            <Plus style={{ width: 10, height: 10 }} />
          </button>
        </div>

        {days.map(day => {
          const isToday = isSameDay(day, today)
          const isSelected = selectedDay ? isSameDay(day, selectedDay) : false
          const isHovered = hoveredDay === day.toISOString()
          return (
            <div
              key={day.toISOString()}
              onClick={() => {
                setSelectedDay(day)
                setView('day')
                setCurrentDate(day)
                setSelectedRange({ from: day, to: day })
              }}
              onMouseEnter={() => setHoveredDay(day.toISOString())}
              onMouseLeave={() => setHoveredDay(null)}
              style={{
                flex: 1, minWidth: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                borderRight: '1px solid #e0e0e0',
                cursor: 'pointer',
                background: isSelected ? '#e8f4fd' : isHovered ? '#f5f9fd' : 'transparent',
                transition: 'background 0.15s',
                borderBottom: isSelected ? '2px solid #03a9f4' : '2px solid transparent',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: isToday ? '#03a9f4' : isSelected ? '#03a9f4' : '#333', lineHeight: 1.4 }}>
                {format(day, 'EEE, MMM d')}
              </span>
              <span style={{ fontSize: 13, color: isToday ? '#03a9f4' : isSelected ? '#03a9f4' : '#888', lineHeight: 1.4, fontVariantNumeric: 'tabular-nums' }}>
                {fmtH(getDayTotal(day))}
              </span>
            </div>
          )
        })}
      </div>

      {/* ── SCROLLABLE GRID ─────────────────────────────────────────────────── */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }} className="scrollbar-hide">
        <div style={{ display: 'flex', height: hourPx * 24 }}>

          {/* Hour labels */}
          <div style={{
            width: LABEL_W, flexShrink: 0, position: 'relative',
            background: '#fff', borderRight: '1px solid #e0e0e0', userSelect: 'none',
          }}>
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} style={{
                position: 'absolute', width: '100%',
                top: `${(h / 24) * 100}%`, height: `${100 / 24}%`,
                display: 'flex', alignItems: 'flex-start',
                justifyContent: 'flex-end', paddingRight: 8,
              }}>
                <span style={{ fontSize: 11, color: '#bbb', marginTop: -8, fontVariantNumeric: 'tabular-nums' }}>
                  {h === 0 ? '' : `${String(h).padStart(2, '0')}:00`}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map(day => {
            const isToday = isSameDay(day, today)
            const isSelected = selectedDay ? isSameDay(day, selectedDay) : false
            const isColHovered = hoveredDay === day.toISOString()
            const entries = getDayEntries(day)

            const layoutMap = new Map(
              layoutEntries(entries.map(e => ({
                id: e.id,
                startMin: new Date(e.startTime).getHours() * 60 + new Date(e.startTime).getMinutes(),
                endMin: new Date(e.endTime!).getHours() * 60 + new Date(e.endTime!).getMinutes(),
              }))).map(l => [l.id, l])
            )

            return (
              <div
                key={day.toISOString()}
                data-col
                onMouseEnter={() => setHoveredDay(day.toISOString())}
                onMouseLeave={() => setHoveredDay(null)}
                onDragOver={e => handleDragOver(e, day)}
                onDragLeave={() => setDropTarget(null)}
                onDrop={e => handleDrop(e, day, e.currentTarget)}
                style={{
                  flex: 1, minWidth: 0, position: 'relative',
                  background: dropTarget === day.toISOString() ? '#f0f8ff' : isSelected ? '#f5fbff' : isColHovered ? '#fafcff' : '#fff',
                  borderRight: '1px solid #e0e0e0',
                  transition: 'background 0.1s',
                }}
              >
                {/* Hour lines */}
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} style={{
                    position: 'absolute', top: `${(h / 24) * 100}%`,
                    left: 0, right: 0, borderTop: '1px dashed #e8e8e8',
                  }} />
                ))}
                {/* Half-hour lines */}
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={`hh${h}`} style={{
                    position: 'absolute', top: `${((h + 0.5) / 24) * 100}%`,
                    left: 0, right: 0, borderTop: '1px dashed #f2f2f2',
                  }} />
                ))}

                {/* Now indicator */}
                {isToday && (
                  <div style={{
                    position: 'absolute', top: `${nowPct}%`,
                    left: 0, right: 0, zIndex: 20,
                    display: 'flex', alignItems: 'center', pointerEvents: 'none',
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#e53935', marginLeft: -4, flexShrink: 0 }} />
                    <div style={{ flex: 1, height: 1.5, background: '#e53935' }} />
                  </div>
                )}

                {/* Entry blocks */}
                {entries.map(entry => {
                  const start = new Date(entry.startTime)
                  const end = new Date(entry.endTime!)
                  const proj = projects.find(p => p.id === entry.projectId)
                  const entryUser = users.find(u => u.id === entry.userId)
                  const layout = layoutMap.get(entry.id)

                  const startMin = start.getHours() * 60 + start.getMinutes()
                  const endMin = end.getHours() * 60 + end.getMinutes()
                  const durMin = Math.max(endMin - startMin, 15)
                  const topPct = (startMin / 1440) * 100
                  const heightPct = (durMin / 1440) * 100
                  const heightPx = (heightPct / 100) * (hourPx * 24)

                  const totalCols = layout?.totalCols ?? 1
                  const col = layout?.col ?? 0
                  const colW = 100 / totalCols
                  const leftPct = col * colW

                  const projectLabel = [proj?.name, entryUser?.name].filter(Boolean).join(' - ')
                  const descLines = heightPx >= 90 ? 3 : heightPx >= 55 ? 2 : 1
                  const projLines = heightPx >= 110 ? 3 : 2

                  const projColor = proj?.color || '#03a9f4'
                  const isDragging = draggingId === entry.id

                  return (
                    <div
                      key={entry.id}
                      draggable
                      onDragStart={e => handleDragStart(e, entry, e.currentTarget)}
                      onDragEnd={handleDragEnd}
                      onClick={e => { if (!draggingId) { e.stopPropagation(); setEditingEntry(entry) } }}
                      style={{
                      position: 'absolute',
                      top: `${topPct}%`,
                      height: `${heightPct}%`,
                      minHeight: 22,
                      left: `calc(${leftPct}% + 2px)`,
                      width: `calc(${colW}% - 6px)`,
                      background: '#f0f6ff',
                      borderTop: '1px solid #c5d9f0',
                      borderRight: '1px solid #c5d9f0',
                      borderBottom: '1px solid #c5d9f0',
                      borderLeft: `3px solid ${projColor}`,
                      zIndex: isDragging ? 50 : 10,
                      cursor: 'grab',
                      opacity: isDragging ? 0.4 : 1,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '5px 7px 5px 6px',
                      boxSizing: 'border-box',
                      transition: 'opacity 0.1s',
                    }}>
                      {heightPx >= 20 && (
                        <span style={{
                          fontSize: 13, fontWeight: 400, color: '#222',
                          lineHeight: 1.4, wordBreak: 'break-word',
                          overflow: 'hidden', display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: descLines,
                        } as React.CSSProperties}>
                          {entry.description || '(no description)'}
                        </span>
                      )}

                      {heightPx >= 38 && projectLabel && (
                        <span style={{
                          fontSize: 13, color: projColor,
                          lineHeight: 1.4, marginTop: 1,
                          wordBreak: 'break-word', overflow: 'hidden',
                          display: '-webkit-box', WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: projLines,
                        } as React.CSSProperties}>
                          {projectLabel}
                        </span>
                      )}

                      <div style={{ flex: 1 }} />

                      {heightPx >= 46 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <DollarSign style={{
                            width: 13, height: 13, flexShrink: 0,
                            color: entry.billable ? '#03a9f4' : '#ccc',
                          }} />
                          <span style={{ fontSize: 13, color: '#555', fontVariantNumeric: 'tabular-nums' }}>
                            {fmtH(entry.duration ?? 0)}
                          </span>
                        </div>
                      )}
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
