'use client'

import { useState } from 'react'
import { DollarSign, List } from 'lucide-react'
import { useDataStore } from '@/lib/stores/data-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { cn } from '@/lib/utils'
import { ProjectPicker } from './project-picker'
import { TagPicker } from './tag-picker'

// Autocomplete duration input → total seconds
// 1 → 0:01:00, 13 → 0:13:00, 130 → 1:30:00, 1300 → 13:00:00
// 1:30 → 1:30:00, 1:30:45 → 1:30:45
function parseDuration(raw: string): number | null {
  const s = raw.trim()
  if (!s) return null

  // Already has colons — parse as H:MM or H:MM:SS
  if (s.includes(':')) {
    const parts = s.split(':').map(Number)
    if (parts.some(isNaN)) return null
    if (parts.length === 2) {
      const [h, m] = parts
      if (m > 59) return null
      return h * 3600 + m * 60
    }
    if (parts.length === 3) {
      const [h, m, sec] = parts
      if (m > 59 || sec > 59) return null
      return h * 3600 + m * 60 + sec
    }
    return null
  }

  // Pure digits — autocomplete
  const digits = s.replace(/\D/g, '')
  if (digits.length === 1) {
    // 1 → 0:01:00
    return parseInt(digits) * 60
  }
  if (digits.length === 2) {
    // 13 → 0:13:00
    const m = parseInt(digits)
    if (m > 59) return null
    return m * 60
  }
  if (digits.length === 3) {
    // 130 → 1:30:00
    const h = parseInt(digits[0])
    const m = parseInt(digits.slice(1))
    if (m > 59) return null
    return h * 3600 + m * 60
  }
  if (digits.length === 4) {
    // 1300 → 13:00:00
    const h = parseInt(digits.slice(0, 2))
    const m = parseInt(digits.slice(2))
    if (m > 59) return null
    return h * 3600 + m * 60
  }
  return null
}

function fmtDuration(s: number) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
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
  const [durationInput, setDurationInput] = useState('00:00:00')
  const [durationEditing, setDurationEditing] = useState(false)

  const handleAdd = async () => {
    if (!user) return
    const durationSecs = parseDuration(durationInput)
    if (!durationSecs) return

    const endTime = new Date()
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
    } catch (err) {
      console.error('Failed to add time entry', err)
    }
  }

  const commitDuration = (val: string) => {
    setDurationEditing(false)
    const secs = parseDuration(val)
    setDurationInput(secs != null ? fmtDuration(secs) : '00:00:00')
  }

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
        <button
          onClick={() => setBillable(b => !b)}
          className={cn('cursor-pointer transition-colors', billable ? 'text-[#03a9f4]' : 'text-gray-300 hover:text-gray-500')}
          title={billable ? 'Billable' : 'Non-billable'}
        >
          <DollarSign style={{ width: 20, height: 20 }} strokeWidth={1.4} />
        </button>
      </div>

      <Sep />

      {/* Editable duration */}
      <div className="px-5 flex-shrink-0">
        {durationEditing ? (
          <input
            autoFocus
            type="text"
            value={durationInput}
            onChange={e => setDurationInput(e.target.value)}
            onBlur={e => commitDuration(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commitDuration(durationInput) }}
            className="text-[20px] font-bold tabular-nums tracking-wide text-[#333] bg-transparent border-none outline-none w-[110px] text-center"
          />
        ) : (
          <span
            onClick={() => setDurationEditing(true)}
            className="text-[20px] font-bold tabular-nums tracking-wide text-[#333] cursor-pointer hover:text-[#03a9f4] transition-colors select-none"
          >
            {durationInput}
          </span>
        )}
      </div>

      {/* ADD button */}
      <button
        onClick={handleAdd}
        className="px-7 h-10 bg-[#03a9f4] hover:bg-[#0288d1] text-white text-[14px] font-bold uppercase tracking-widest rounded-sm cursor-pointer transition-colors flex-shrink-0"
      >
        ADD
      </button>

      {/* List icon */}
      <button className="ml-3 text-gray-300 hover:text-gray-500 cursor-pointer flex-shrink-0">
        <List style={{ width: 18, height: 18 }} strokeWidth={1.4} />
      </button>
    </div>
  )
}
