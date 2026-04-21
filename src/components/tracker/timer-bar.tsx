'use client'

import { useState } from 'react'
import { Plus, Tag, DollarSign, Clock, MoreVertical } from 'lucide-react'
import { useDataStore } from '@/lib/stores/data-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { cn } from '@/lib/utils'
import { ProjectPicker } from './project-picker'
import { TagPicker } from './tag-picker'

// Autocomplete time input: 9→09:00, 14→14:00, 902→09:02, 14:1→14:10, 930→09:30
function parseTimeInput(raw: string): string {
  const s = raw.replace(/[^0-9:]/g, '').trim()
  if (!s) return ''

  // Already HH:MM format
  if (/^\d{1,2}:\d{2}$/.test(s)) {
    const [h, m] = s.split(':').map(Number)
    if (h > 23 || m > 59) return ''
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  // Partial with colon e.g. 14:1 → 14:10
  if (/^\d{1,2}:\d{1}$/.test(s)) {
    const [h, m] = s.split(':')
    const hh = parseInt(h), mm = parseInt(m) * 10
    if (hh > 23 || mm > 59) return ''
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
  }

  // Pure digits
  const digits = s.replace(':', '')
  if (digits.length === 1) {
    // 9 → 09:00
    return `0${digits}:00`
  }
  if (digits.length === 2) {
    // 14 → 14:00, 09 → 09:00
    const h = parseInt(digits)
    if (h > 23) return ''
    return `${String(h).padStart(2, '0')}:00`
  }
  if (digits.length === 3) {
    // 902 → 09:02, 930 → 09:30
    const h = parseInt(digits[0]), m = parseInt(digits.slice(1))
    if (h > 23 || m > 59) return ''
    return `0${h}:${String(m).padStart(2, '0')}`
  }
  if (digits.length === 4) {
    // 1430 → 14:30, 0902 → 09:02
    const h = parseInt(digits.slice(0, 2)), m = parseInt(digits.slice(2))
    if (h > 23 || m > 59) return ''
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
  return ''
}

// Divider between sections
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

  const handleAdd = () => {
    if (!user || !startTime || !endTime) return
    const today = new Date().toISOString().split('T')[0]
    const start = new Date(`${today}T${startTime}:00`)
    const end = new Date(`${today}T${endTime}:00`)
    const duration = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000))
    addTimeEntry({
      description,
      projectId: projectId || undefined,
      taskId: taskId || undefined,
      tagIds,
      billable,
      userId: user.id,
      workspaceId: user.workspaceId,
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
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-md shadow-sm flex items-center h-[68px] px-5 gap-0 overflow-visible relative">

      {/* Description */}
      <input
        type="text"
        placeholder="What have you worked on?"
        value={description}
        onChange={e => setDescription(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAdd()}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          'flex-1 text-[15px] text-gray-700 bg-transparent outline-none placeholder-gray-400 min-w-0 p-2 rounded-sm border transition-colors',
          focused ? 'border-[#c9c9c9]' : 'border-transparent'
        )}
      />

      {/* Project picker — no separator, sits right after description */}
      <div className="px-3 flex-shrink-0 min-w-[130px]">
        {projectId ? (
          <ProjectPicker
            selectedProjectId={projectId}
            selectedTaskId={taskId}
            onSelect={(pid, tid) => { setProjectId(pid); setTaskId(tid || '') }}
            onClear={() => { setProjectId(''); setTaskId('') }}
          />
        ) : (
          <button
            onClick={() => {}}
            className="flex items-center gap-1.5 text-[#03a9f4] hover:text-[#0288d1] cursor-pointer transition-colors"
          >
            <ProjectPicker
              selectedProjectId={projectId}
              selectedTaskId={taskId}
              onSelect={(pid, tid) => { setProjectId(pid); setTaskId(tid || '') }}
              onClear={() => { setProjectId(''); setTaskId('') }}
            />
          </button>
        )}
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
