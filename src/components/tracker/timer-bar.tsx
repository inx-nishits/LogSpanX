'use client'

import { useState, useRef, useEffect } from 'react'
import { DollarSign, Clock, MoreVertical, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useDataStore } from '@/lib/stores/data-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { cn } from '@/lib/utils'
import { ProjectPicker } from './project-picker'
import { TagPicker } from './tag-picker'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, subMonths, addMonths } from 'date-fns'

// ─── Shared Components (Ported) ───────────────────────────────────────────────

function Tip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip flex items-center justify-center">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-[300]">
        {label}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  )
}

function CalPicker({ date, onChange, onClose }: { date: Date; onChange: (d: Date) => void; onClose: () => void }) {
  const [view, setView] = useState(startOfMonth(date))
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [onClose])
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(view), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(view), { weekStartsOn: 1 }),
  })
  return (
    <div ref={ref} className="absolute z-[400] bg-white border border-gray-200 shadow-2xl rounded-sm p-3 w-[240px]"
      style={{ top: 'calc(100% + 12px)', right: 0 }} onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setView(subMonths(view, 1))} className="p-1 hover:bg-gray-100 rounded cursor-pointer">
          <ChevronLeft className="h-4 w-4 text-gray-500" />
        </button>
        <span className="text-[13px] font-semibold text-gray-700">{format(view, 'MMM yyyy')}</span>
        <button onClick={() => setView(addMonths(view, 1))} className="p-1 hover:bg-gray-100 rounded cursor-pointer">
          <ChevronRight className="h-4 w-4 text-gray-500" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
          <div key={d} className="text-center text-[11px] font-bold text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((day, i) => {
          const sel = isSameDay(day, date), cur = isSameMonth(day, view), tod = isSameDay(day, new Date())
          return (
            <button key={i} onClick={() => { onChange(day); onClose() }}
              className={cn('h-8 w-full flex items-center justify-center text-[12px] rounded cursor-pointer transition-colors',
                !cur && 'text-gray-300',
                cur && !sel && 'text-gray-700 hover:bg-gray-100',
                tod && !sel && 'text-[#03a9f4] font-bold',
                sel && 'bg-[#03a9f4] text-white font-bold')}>
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CalBtn({ date, onChange }: { date: Date; onChange: (d: Date) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <Tip label={isSameDay(date, new Date()) ? 'Today' : format(date, 'MMM d, yyyy')}>
        <button onClick={() => setOpen(o => !o)} className={cn('transition-colors cursor-pointer', isSameDay(date, new Date()) ? 'text-[#ccc] hover:text-[#03a9f4]' : 'text-[#03a9f4]')}>
          <Calendar style={{ width: 20, height: 20 }} strokeWidth={1.4} />
        </button>
      </Tip>
      {open && <CalPicker date={date} onChange={onChange} onClose={() => setOpen(false)} />}
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Autocomplete time input: 9→09:00, 14→14:00, 902→09:02, 14:1→14:10, 930→09:30
function parseTimeInput(raw: string): string {
  const s = raw.replace(/[^0-9:]/g, '').trim()
  if (!s) return ''
  if (/^\d{1,2}:\d{2}$/.test(s)) {
    const [h, m] = s.split(':').map(Number)
    if (h > 23 || m > 59) return ''
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
  if (/^\d{1,2}:\d{1}$/.test(s)) {
    const [h, m] = s.split(':')
    const hh = parseInt(h), mm = parseInt(m) * 10
    if (hh > 23 || mm > 59) return ''
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
  }
  const digits = s.replace(':', '')
  if (digits.length === 1) return `0${digits}:00`
  if (digits.length === 2) { const h = parseInt(digits); if (h > 23) return ''; return `${String(h).padStart(2, '0')}:00` }
  if (digits.length === 3) { const h = parseInt(digits[0]), m = parseInt(digits.slice(1)); if (h > 23 || m > 59) return ''; return `0${h}:${String(m).padStart(2, '0')}` }
  if (digits.length === 4) { const h = parseInt(digits.slice(0, 2)), m = parseInt(digits.slice(2)); if (h > 23 || m > 59) return ''; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` }
  return ''
}

function Sep() {
  return <div className="h-6 w-px bg-gray-200 flex-shrink-0 pointer-events-none" />
}

export function TimerBar() {
  const { user } = useAuthStore()
  const { addTimeEntry } = useDataStore()

  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState('')
  const [taskId, setTaskId] = useState('')
  const [tagIds, setTagIds] = useState<string[]>([])
  const [billable, setBillable] = useState(false)
  const [focused, setFocused] = useState(false)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())

  const handleAdd = async () => {
    if (!user || !startTime || !endTime) return
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const start = new Date(`${dateStr}T${startTime}:00`)
    const end = new Date(`${dateStr}T${endTime}:00`)
    const duration = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000))
    try {
      await addTimeEntry({
        description,
        projectId: projectId || undefined,
        taskId: taskId || undefined,
        tagIds,
        billable,
        userId: user.id,
        startTime: start,
        endTime: end,
        duration,
      })
      setDescription('')
      setProjectId('')
      setTaskId('')
      setTagIds([])
      setBillable(false)
      setStartTime('')
      setEndTime('')
      setSelectedDate(new Date())
    } catch (err) {
      console.error('Failed to add time entry', err)
    }
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-md shadow-sm flex items-center h-[68px] px-5 gap-0 overflow-visible relative">

      {/* Description */}
      <input
        type="text"
        placeholder="What have you worked on?"
        value={description}
        onChange={e => setDescription(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') void handleAdd() }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          'flex-1 text-[15px] text-gray-700 bg-transparent outline-none placeholder-gray-400 min-w-0 p-2 rounded-sm border transition-colors',
          focused ? 'border-[#c9c9c9]' : 'border-transparent'
        )}
      />

      {/* Project picker — rendered as a sibling div, not inside a button */}
      <div className="px-3 flex-shrink-0 min-w-[130px]">
        <ProjectPicker
          selectedProjectId={projectId}
          selectedTaskId={taskId}
          onSelect={(pid, tid) => { setProjectId(pid); setTaskId(tid || '') }}
          onClear={() => { setProjectId(''); setTaskId('') }}
        />
      </div>

      <Sep />

      {/* Tag */}
      <div className="px-4 flex-shrink-0 relative z-[100]">
        <TagPicker iconSize={18} selectedTagIds={tagIds} onChange={setTagIds} />
      </div>

      <Sep />

      {/* Billable */}
      <div className="px-4 flex-shrink-0">
        <button
          onClick={() => setBillable(b => !b)}
          className={cn('cursor-pointer transition-colors', billable ? 'text-[#03a9f4]' : 'text-gray-300 hover:text-gray-500')}
          title={billable ? 'Billable' : 'Non-billable'}
        >
          <DollarSign style={{ width: 20, height: 20 }} strokeWidth={1.4} />
        </button>
      </div>

      <Sep />

      {/* Start time */}
      <div className="flex items-center gap-2 px-4 flex-shrink-0">
        <input
          type="text"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          onBlur={e => setStartTime(parseTimeInput(e.target.value))}
          onKeyDown={e => e.key === 'Enter' && setStartTime(parseTimeInput(startTime))}
          placeholder="--:--"
          maxLength={5}
          className="text-[16px] text-gray-500 bg-transparent border-none outline-none w-[46px] tabular-nums text-center placeholder-gray-300"
        />
        <Clock style={{ width: 19, height: 19, color: '#ccc' }} strokeWidth={1.4} />
      </div>

      <span className="text-gray-300 text-[16px] flex-shrink-0">-</span>

      {/* End time */}
      <div className="flex items-center gap-2 px-4 flex-shrink-0">
        <input
          type="text"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
          onBlur={e => setEndTime(parseTimeInput(e.target.value))}
          onKeyDown={e => e.key === 'Enter' && setEndTime(parseTimeInput(endTime))}
          placeholder="--:--"
          maxLength={5}
          className="text-[16px] text-gray-500 bg-transparent border-none outline-none w-[46px] tabular-nums text-center placeholder-gray-300"
        />
        <Clock style={{ width: 19, height: 19, color: '#ccc' }} strokeWidth={1.4} />
      </div>

      <Sep />

      {/* Calendar */}
      <div className="px-4 flex-shrink-0">
        <CalBtn date={selectedDate} onChange={setSelectedDate} />
      </div>

      <Sep />

      {/* ADD button */}
      <button
        onClick={handleAdd}
        className="ml-4 px-7 h-10 bg-[#03a9f4] hover:bg-[#0288d1] text-white text-[13px] font-bold uppercase tracking-widest rounded-sm cursor-pointer transition-colors flex-shrink-0"
      >
        ADD
      </button>

      {/* Three dots */}
      <button className="ml-3 text-gray-300 hover:text-gray-500 cursor-pointer flex-shrink-0">
        <MoreVertical style={{ width: 18, height: 18 }} strokeWidth={1.4} />
      </button>
    </div>
  )
}
