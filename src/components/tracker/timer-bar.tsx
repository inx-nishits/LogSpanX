'use client'

import { useState, useRef, useEffect } from 'react'
import { DollarSign, List, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useDataStore } from '@/lib/stores/data-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { cn } from '@/lib/utils'
import { ProjectPicker } from './project-picker'
import { TagPicker } from './tag-picker'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, isSameMonth, isToday, addMonths, subMonths } from 'date-fns'

function parseDuration(raw: string): number | null {
  const s = raw.trim()
  if (!s) return null
  if (s.includes(':')) {
    const parts = s.split(':').map(Number)
    if (parts.some(isNaN)) return null
    if (parts.length === 2) { const [h, m] = parts; if (m > 59) return null; return h * 3600 + m * 60 }
    if (parts.length === 3) { const [h, m, sec] = parts; if (m > 59 || sec > 59) return null; return h * 3600 + m * 60 + sec }
    return null
  }
  const digits = s.replace(/\D/g, '')
  if (digits.length === 1) return parseInt(digits) * 60
  if (digits.length === 2) { const m = parseInt(digits); if (m > 59) return null; return m * 60 }
  if (digits.length === 3) { const h = parseInt(digits[0]), m = parseInt(digits.slice(1)); if (m > 59) return null; return h * 3600 + m * 60 }
  if (digits.length === 4) { const h = parseInt(digits.slice(0, 2)), m = parseInt(digits.slice(2)); if (m > 59) return null; return h * 3600 + m * 60 }
  return null
}

function fmtDuration(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function Sep() {
  return <div className="h-6 w-px bg-gray-200 flex-shrink-0 pointer-events-none" />
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────
function DatePicker({ selected, onChange }: { selected: Date; onChange: (d: Date) => void }) {
  const [month, setMonth] = useState(startOfMonth(selected))
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  })

  return (
    <div className="bg-white border border-[#e4eaee] shadow-xl rounded-sm p-3 w-[260px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setMonth(m => subMonths(m, 1))} className="p-1 hover:bg-gray-100 rounded transition-colors">
          <ChevronLeft className="h-4 w-4 text-[#666]" />
        </button>
        <span className="text-[13px] font-semibold text-[#333]">{format(month, 'MMMM yyyy')}</span>
        <button onClick={() => setMonth(m => addMonths(m, 1))} className="p-1 hover:bg-gray-100 rounded transition-colors">
          <ChevronRight className="h-4 w-4 text-[#666]" />
        </button>
      </div>
      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
          <div key={d} className="text-center text-[11px] text-[#aaa] font-medium py-1">{d}</div>
        ))}
      </div>
      {/* Days */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map(day => {
          const isSelected = isSameDay(day, selected)
          const inMonth = isSameMonth(day, month)
          const todayDay = isToday(day)
          return (
            <button key={day.toISOString()} onClick={() => onChange(day)}
              className={cn(
                'h-8 w-full text-[12px] rounded transition-colors',
                isSelected ? 'bg-[#03a9f4] text-white font-bold' :
                todayDay ? 'text-[#03a9f4] font-bold hover:bg-[#eaf4fb]' :
                inMonth ? 'text-[#333] hover:bg-[#f0f4f8]' : 'text-[#ccc] hover:bg-[#f0f4f8]'
              )}>
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
      {/* Today shortcut */}
      <button onClick={() => { onChange(new Date()); setMonth(startOfMonth(new Date())) }}
        className="mt-2 w-full text-[12px] text-[#03a9f4] hover:underline text-center">
        Today
      </button>
    </div>
  )
}

// ─── Timer Bar ────────────────────────────────────────────────────────────────
export function TimerBar() {
  const { user } = useAuthStore()
  const { addTimeEntry } = useDataStore()

  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState('')
  const [taskId, setTaskId] = useState('')
  const [tagIds, setTagIds] = useState<string[]>([])
  const [billable, setBillable] = useState(false)
  const [durationInput, setDurationInput] = useState('00:00:00')
  const [durationEditing, setDurationEditing] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [calOpen, setCalOpen] = useState(false)
  const calRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (calRef.current && !calRef.current.contains(e.target as Node)) setCalOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleAdd = async () => {
    if (!user) return
    const durationSecs = parseDuration(durationInput)
    if (!durationSecs) return

    // Use selected date, set endTime to end of that day's work and startTime = end - duration
    const base = new Date(selectedDate)
    base.setHours(17, 0, 0, 0) // default end at 5pm on selected date
    const endTime = base
    const startTime = new Date(endTime.getTime() - durationSecs * 1000)

    try {
      await addTimeEntry({
        description,
        projectId: projectId || undefined,
        taskId: taskId || undefined,
        tagIds,
        billable,
        userId: user.id,
        startTime,
        endTime,
        duration: durationSecs,
      })
      setDescription('')
      setProjectId('')
      setTaskId('')
      setTagIds([])
      setBillable(false)
      setDurationInput('00:00:00')
      setSelectedDate(new Date())
    } catch (err) {
      console.error('Failed to add time entry', err)
    }
  }

  const commitDuration = (val: string) => {
    setDurationEditing(false)
    const secs = parseDuration(val)
    setDurationInput(secs != null ? fmtDuration(secs) : '00:00:00')
  }

  const dateLabel = isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM d')

  return (
    <div className="w-full bg-white border border-gray-200 rounded-md shadow-sm flex items-center h-[64px] px-5 gap-0 overflow-visible relative">

      {/* Description */}
      <input
        type="text"
        placeholder="What are you working on?"
        value={description}
        onChange={e => setDescription(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') void handleAdd() }}
        className="flex-1 text-[15px] text-gray-700 bg-transparent outline-none placeholder-gray-400 min-w-0"
      />

      {/* Project picker */}
      <div className="px-4 flex-shrink-0">
        <ProjectPicker
          selectedProjectId={projectId}
          selectedTaskId={taskId}
          onSelect={(pid, tid) => { setProjectId(pid); setTaskId(tid || '') }}
          onClear={() => { setProjectId(''); setTaskId('') }}
          customTrigger={
            projectId ? undefined : (
              <div className="flex items-center gap-1.5 text-[#03a9f4] cursor-pointer hover:text-[#0288d1] transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="8" cy="8" r="7" />
                  <line x1="8" y1="4.5" x2="8" y2="11.5" />
                  <line x1="4.5" y1="8" x2="11.5" y2="8" />
                </svg>
                <span className="text-[14px] font-medium">Project</span>
              </div>
            )
          }
        />
      </div>

      <Sep />

      {/* Tag */}
      <div className="px-4 flex-shrink-0">
        <TagPicker iconSize={18} selectedTagIds={tagIds} onChange={setTagIds} />
      </div>

      <Sep />

      {/* Billable */}
      <div className="px-4 flex-shrink-0">
        <button onClick={() => setBillable(b => !b)}
          className={cn('cursor-pointer transition-colors', billable ? 'text-[#03a9f4]' : 'text-gray-300 hover:text-gray-500')}
          title={billable ? 'Billable' : 'Non-billable'}>
          <DollarSign style={{ width: 20, height: 20 }} strokeWidth={1.4} />
        </button>
      </div>

      <Sep />

      {/* Date picker */}
      <div className="px-4 flex-shrink-0 relative" ref={calRef}>
        <button onClick={() => setCalOpen(o => !o)}
          className={cn('flex items-center gap-1.5 text-[14px] cursor-pointer transition-colors',
            calOpen || !isToday(selectedDate) ? 'text-[#03a9f4]' : 'text-gray-400 hover:text-gray-600')}>
          <Calendar style={{ width: 16, height: 16 }} strokeWidth={1.5} />
          <span>{dateLabel}</span>
        </button>
        {calOpen && (
          <div className="absolute top-full right-0 mt-2 z-[200]">
            <DatePicker selected={selectedDate} onChange={d => { setSelectedDate(d); setCalOpen(false) }} />
          </div>
        )}
      </div>

      <Sep />

      {/* Editable duration */}
      <div className="px-5 flex-shrink-0">
        {durationEditing ? (
          <input autoFocus type="text" value={durationInput}
            onChange={e => setDurationInput(e.target.value)}
            onBlur={e => commitDuration(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commitDuration(durationInput) }}
            className="text-[20px] font-bold tabular-nums tracking-wide text-[#333] bg-transparent border-none outline-none w-[110px] text-center"
          />
        ) : (
          <span onClick={() => setDurationEditing(true)}
            className="text-[20px] font-bold tabular-nums tracking-wide text-[#333] cursor-pointer hover:text-[#03a9f4] transition-colors select-none">
            {durationInput}
          </span>
        )}
      </div>

      {/* ADD button */}
      <button onClick={handleAdd}
        className="px-7 h-10 bg-[#03a9f4] hover:bg-[#0288d1] text-white text-[14px] font-bold uppercase tracking-widest rounded-sm cursor-pointer transition-colors flex-shrink-0">
        ADD
      </button>

      {/* List icon */}
      <button className="ml-3 text-gray-300 hover:text-gray-500 cursor-pointer flex-shrink-0">
        <List style={{ width: 18, height: 18 }} strokeWidth={1.4} />
      </button>
    </div>
  )
}
