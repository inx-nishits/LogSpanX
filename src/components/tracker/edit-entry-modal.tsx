'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, MoreVertical, ChevronDown } from 'lucide-react'
import { useDataStore } from '@/lib/stores/data-store'
import { format, isSameDay } from 'date-fns'
import { cn } from '@/lib/utils'
import { TimeEntry } from '@/lib/types'

function parseTime(raw: string): string {
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
  const d = s.replace(':', '')
  if (d.length === 1) return `0${d}:00`
  if (d.length === 2) { const h = parseInt(d); if (h > 23) return ''; return `${String(h).padStart(2, '0')}:00` }
  if (d.length === 3) { const h = parseInt(d[0]), m = parseInt(d.slice(1)); if (h > 23 || m > 59) return ''; return `0${h}:${String(m).padStart(2, '0')}` }
  if (d.length === 4) { const h = parseInt(d.slice(0, 2)), m = parseInt(d.slice(2)); if (h > 23 || m > 59) return ''; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` }
  return ''
}

function toHHMM(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function fmtDur(s: number) {
  return `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}`
}

function getDateLabel(d: Date) {
  const now = new Date()
  const yest = new Date(now); yest.setDate(now.getDate() - 1)
  if (isSameDay(d, now)) return 'Today'
  if (isSameDay(d, yest)) return 'Yesterday'
  return format(d, 'MMM d, yyyy')
}

interface Props {
  entry: TimeEntry
  onClose: () => void
}

export function EditEntryModal({ entry, onClose }: Props) {
  const { projects, tags, updateTimeEntry } = useDataStore()

  const [description, setDescription] = useState(entry.description || '')
  const [projectId, setProjectId] = useState(entry.projectId || '')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(entry.tagIds ?? [])
  const [billable, setBillable] = useState(entry.billable)
  const [startVal, setStartVal] = useState(toHHMM(new Date(entry.startTime)))
  const [endVal, setEndVal] = useState(entry.endTime ? toHHMM(new Date(entry.endTime)) : '')
  const [showProjectDrop, setShowProjectDrop] = useState(false)
  const [showTagDrop, setShowTagDrop] = useState(false)

  const start = new Date(entry.startTime)
  const end = entry.endTime ? new Date(entry.endTime) : null

  const duration = (() => {
    const sh = parseInt(startVal.split(':')[0] || '0'), sm = parseInt(startVal.split(':')[1] || '0')
    const eh = parseInt(endVal.split(':')[0] || '0'), em = parseInt(endVal.split(':')[1] || '0')
    const secs = Math.max(0, (eh * 60 + em - sh * 60 - sm) * 60)
    return secs
  })()

  const handleSave = () => {
    const dateStr = format(start, 'yyyy-MM-dd')
    const parsedStart = parseTime(startVal)
    const parsedEnd = parseTime(endVal)
    if (!parsedStart || !parsedEnd) return

    const newStart = new Date(`${dateStr}T${parsedStart}:00`)
    const newEnd = new Date(`${dateStr}T${parsedEnd}:00`)
    const dur = Math.max(0, Math.floor((newEnd.getTime() - newStart.getTime()) / 1000))

    updateTimeEntry(entry.id, {
      description,
      projectId: projectId || undefined,
      tagIds: selectedTagIds,
      billable,
      startTime: newStart,
      endTime: newEnd,
      duration: dur,
    })
    onClose()
  }

  const selectedProject = projects.find(p => p.id === projectId)

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-sm shadow-2xl w-[580px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <span className="text-[18px] font-semibold text-[#222]">Edit time entry</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
            <X style={{ width: 20, height: 20 }} strokeWidth={2} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Time and date */}
          <div>
            <div className="text-[13px] text-[#888] mb-3">Time and date</div>
            <div className="flex items-center gap-2">
              {/* Duration */}
              <div className="border border-[#d0d0d0] rounded-sm px-4 py-2 min-w-[80px] text-center">
                <span className="text-[18px] font-bold text-[#222] tabular-nums">{fmtDur(duration)}</span>
              </div>

              {/* Start time */}
              <div className="border border-[#d0d0d0] rounded-sm px-3 py-2">
                <input
                  type="text" value={startVal} maxLength={5}
                  onChange={e => setStartVal(e.target.value)}
                  onBlur={e => { const p = parseTime(e.target.value); if (p) setStartVal(p) }}
                  onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                  className="text-[14px] text-[#555] bg-transparent border-none outline-none w-[44px] tabular-nums text-center"
                />
              </div>

              <span className="text-[#bbb] text-[14px]">-</span>

              {/* End time */}
              <div className="border border-[#d0d0d0] rounded-sm px-3 py-2">
                <input
                  type="text" value={endVal} maxLength={5}
                  onChange={e => setEndVal(e.target.value)}
                  onBlur={e => { const p = parseTime(e.target.value); if (p) setEndVal(p) }}
                  onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                  className="text-[14px] text-[#555] bg-transparent border-none outline-none w-[44px] tabular-nums text-center"
                />
              </div>

              {/* Calendar icon */}
              <div className="border border-[#d0d0d0] rounded-sm px-3 py-2 flex items-center">
                <Calendar style={{ width: 18, height: 18, color: '#aaa' }} strokeWidth={1.5} />
              </div>

              {/* Date label */}
              <div className="border border-[#d0d0d0] rounded-sm px-4 py-2 flex-1 text-center">
                <span className="text-[14px] text-[#555]">{getDateLabel(start)}</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Description */}
          <div className="flex gap-6">
            <div className="w-[100px] flex-shrink-0 text-[13px] text-[#888] pt-2">Description</div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="flex-1 border border-[#d0d0d0] rounded-sm px-3 py-2 text-[14px] text-[#222] outline-none focus:border-[#03a9f4] resize-none transition-colors"
              placeholder="What have you worked on?"
            />
          </div>

          {/* Project */}
          <div className="flex items-center gap-6">
            <div className="w-[100px] flex-shrink-0 text-[13px] text-[#888]">Project</div>
            <div className="relative flex-1">
              <button
                onClick={() => setShowProjectDrop(o => !o)}
                className="w-full flex items-center justify-between border border-[#d0d0d0] rounded-sm px-3 py-2 text-[14px] cursor-pointer hover:border-[#aaa] transition-colors"
              >
                {selectedProject ? (
                  <div className="flex items-center gap-2">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: selectedProject.color, flexShrink: 0 }} />
                    <span className="text-[#03a9f4] truncate">{selectedProject.name}</span>
                  </div>
                ) : (
                  <span className="text-[#bbb]">No project</span>
                )}
                <ChevronDown style={{ width: 15, height: 15, color: '#aaa' }} />
              </button>
              {showProjectDrop && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#d0d0d0] rounded-sm shadow-xl z-[200] max-h-[200px] overflow-y-auto scrollbar-hide">
                  <div
                    onClick={() => { setProjectId(''); setShowProjectDrop(false) }}
                    className="px-4 py-2.5 text-[13px] text-[#888] hover:bg-gray-50 cursor-pointer"
                  >
                    No project
                  </div>
                  {projects.filter(p => !p.archived).map(p => (
                    <div key={p.id}
                      onClick={() => { setProjectId(p.id); setShowProjectDrop(false) }}
                      className={cn('flex items-center gap-2 px-4 py-2.5 text-[13px] hover:bg-gray-50 cursor-pointer', projectId === p.id && 'bg-[#f0f8ff]')}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: p.color, flexShrink: 0 }} />
                      <span className={projectId === p.id ? 'text-[#03a9f4]' : 'text-[#333]'}>{p.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-6">
            <div className="w-[100px] flex-shrink-0 text-[13px] text-[#888]">Tags</div>
            <div className="relative flex-1">
              <button
                onClick={() => setShowTagDrop(o => !o)}
                className="w-full flex items-center justify-between border border-[#d0d0d0] rounded-sm px-3 py-2 text-[14px] cursor-pointer hover:border-[#aaa] transition-colors"
              >
                {selectedTagIds.length > 0 ? (
                  <span className="text-[#03a9f4] truncate">
                    {selectedTagIds.map(id => tags.find(t => t.id === id)?.name).filter(Boolean).join(', ')}
                  </span>
                ) : (
                  <span className="text-[#bbb]">Add tags</span>
                )}
                <ChevronDown style={{ width: 15, height: 15, color: '#aaa' }} />
              </button>
              {showTagDrop && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#d0d0d0] rounded-sm shadow-xl z-[200] max-h-[200px] overflow-y-auto scrollbar-hide">
                  {tags.filter(t => !t.archived).map(tag => {
                    const sel = selectedTagIds.includes(tag.id)
                    return (
                      <div key={tag.id}
                        onClick={() => setSelectedTagIds(p => sel ? p.filter(i => i !== tag.id) : [...p, tag.id])}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className={cn('w-[14px] h-[14px] border rounded-sm flex items-center justify-center flex-shrink-0', sel ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-gray-300')}>
                          {sel && <span className="text-white text-[10px] font-bold">✓</span>}
                        </div>
                        <span className="text-[13px] text-[#333]">{tag.name}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Billable */}
          <div className="flex items-center gap-6">
            <div className="w-[100px] flex-shrink-0 text-[13px] text-[#888]">Billable</div>
            <div className="flex items-center gap-3">
              {/* Toggle switch */}
              <button
                onClick={() => setBillable(b => !b)}
                className={cn('relative w-[42px] h-[24px] rounded-full transition-colors cursor-pointer flex-shrink-0', billable ? 'bg-[#03a9f4]' : 'bg-gray-300')}
              >
                <div className={cn('absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform', billable ? 'translate-x-[21px]' : 'translate-x-[3px]')} />
              </button>
              <span className="text-[14px] text-[#555]">{billable ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <MoreVertical style={{ width: 18, height: 18 }} strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-[14px] text-[#555] hover:text-[#222] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#03a9f4] hover:bg-[#0288d1] text-white text-[14px] font-bold rounded-sm cursor-pointer transition-colors"
            >
              SAVE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
