'use client'

import { useState, useMemo, useEffect } from 'react'
import { useDataStore } from '@/lib/stores/data-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { cn } from '@/lib/utils'
import { TagPicker } from './tag-picker'
import { DollarSign, MoreVertical, Check, Copy } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ProjectPicker } from './project-picker'
import { DeleteConfirmation } from './delete-confirmation'
import { UndoToast } from './undo-toast'
import { BulkEditModal } from './bulk-edit-modal'
import { startOfWeek, endOfWeek, subWeeks, isWithinInterval, startOfDay } from 'date-fns'

const fmtDur = (s: number) =>
  `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}`

// Autocomplete: 130 → 1:30, 13 → 0:13, 1:30 → 1:30:00
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

function weekLabel(date: Date) {
  const now = new Date()
  const tw = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) }
  const lw = { start: startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), end: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }) }
  if (isWithinInterval(date, tw)) return 'This week'
  if (isWithinInterval(date, lw)) return 'Last week'
  return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

function dayLabel(iso: string) {
  const d = new Date(iso), now = new Date()
  const yest = new Date(now); yest.setDate(now.getDate() - 1)
  if (d.toDateString() === now.toDateString()) return 'Today'
  if (d.toDateString() === yest.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

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

function D({ children, extra = '' }: { children: React.ReactNode; extra?: string }) {
  return (
    <div className={`flex items-center justify-center border-l border-dotted border-[#e0e0e0] px-4 my-[10px] ${extra}`}>
      {children}
    </div>
  )
}

function DurCell({ dur, onSave }: { dur: number; onSave: (s: number) => void }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(fmtDur(dur))

  // Sync display when dur changes from store update
  useEffect(() => {
    if (!editing) setVal(fmtDur(dur))
  }, [dur, editing])

  const commit = (v: string) => {
    setEditing(false)
    const secs = parseDuration(v)
    if (secs == null) { setVal(fmtDur(dur)); return }
    setVal(fmtDur(secs))
    onSave(secs)
  }

  if (editing) return (
    <input autoFocus type="text" value={val} maxLength={8} placeholder="H:MM"
      onChange={e => setVal(e.target.value)}
      onBlur={e => commit(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && commit(val)}
      style={{ fontSize: 14, fontWeight: 700, color: '#222', background: 'transparent', border: 'none', outline: 'none', width: 52, fontVariantNumeric: 'tabular-nums', textAlign: 'center' }}
    />
  )
  return (
    <span onClick={() => { setEditing(true); setVal(fmtDur(dur)) }}
      style={{ fontSize: 14, fontWeight: 700, color: '#222', fontVariantNumeric: 'tabular-nums', cursor: 'pointer', width: 52, display: 'inline-block', textAlign: 'center' }}
      className="hover:text-[#03a9f4]">
      {fmtDur(dur)}
    </span>
  )
}

export function TimeEntryList({ userId }: { userId: string }) {
  const { timeEntries, projects, users, tasks, updateTimeEntry, deleteTimeEntry, deleteTimeEntries, addTimeEntry } = useDataStore()
  const { user } = useAuthStore()

  // RBAC: can this user edit a given entry?
  const canEditEntry = (entry: typeof timeEntries[0]) => {
    if (!user) return false
    if (user.role === 'project_manager') return true
    if (user.role === 'team_lead') {
      const entryProject = projects.find(p => p.id === entry.projectId)
      if (!entryProject) return entry.userId === user.id
      return entryProject.leadId === user.id || entry.userId === user.id
    }
    return entry.userId === user.id
  }
  const [bulkMode, setBulkMode] = useState(false)
  const [selIds, setSelIds] = useState<string[]>([])
  const [delId, setDelId] = useState<string | null>(null)
  const [bulkDel, setBulkDel] = useState(false)
  const [bulkEdit, setBulkEdit] = useState(false)

  const entries = useMemo(() => {
    const seen = new Set<string>()
    return timeEntries
      .filter(e => { if (e.userId !== userId || seen.has(e.id)) return false; seen.add(e.id); return true })
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  }, [timeEntries, userId])

  const weekGroups = useMemo(() => {
    const w: Record<string, Record<string, typeof entries>> = {}
    entries.forEach(e => {
      const d = new Date(e.startTime)
      const wk = startOfWeek(d, { weekStartsOn: 1 }).toISOString()
      const dk = startOfDay(d).toISOString()
      if (!w[wk]) w[wk] = {}
      if (!w[wk][dk]) w[wk][dk] = []
      w[wk][dk].push(e)
    })
    return w
  }, [entries])

  const wKeys = Object.keys(weekGroups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  const onDup = (e: typeof entries[0]) => addTimeEntry({
    description: e.description, projectId: e.projectId, taskId: e.taskId,
    tagIds: e.tagIds, billable: e.billable, userId: e.userId,
    startTime: new Date(), duration: e.duration,
  })

  return (
    <div className="w-full pb-20">
      <UndoToast />
      <DeleteConfirmation isOpen={!!delId} onClose={() => setDelId(null)}
        onConfirm={() => { if (delId) { deleteTimeEntry(delId); setDelId(null) } }} count={1} />
      <DeleteConfirmation isOpen={bulkDel} onClose={() => setBulkDel(false)}
        onConfirm={() => { deleteTimeEntries(selIds); setSelIds([]); setBulkDel(false); setBulkMode(false) }}
        count={selIds.length} />

      {wKeys.map(wKey => {
        const dayMap = weekGroups[wKey]
        const dKeys = Object.keys(dayMap).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        const wTotal = dKeys.flatMap(dk => dayMap[dk]).reduce((a, e) => a + (e.duration ?? 0), 0)

        return (
          <div key={wKey} className="mb-4">
            <div className="flex items-center justify-between px-1 py-2">
              <span style={{ fontSize: 14, color: '#333', fontWeight: 400 }}>{weekLabel(new Date(wKey))}</span>
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 12, color: '#999' }}>Week total:</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#222', fontVariantNumeric: 'tabular-nums' }}>{fmtDur(wTotal)}</span>
              </div>
            </div>

            {dKeys.map(dKey => {
              const dayEntries = dayMap[dKey]
              const dayTotal = dayEntries.reduce((a, e) => a + (e.duration ?? 0), 0)
              const allSel = dayEntries.every(e => selIds.includes(e.id))
              const someSel = dayEntries.some(e => selIds.includes(e.id))

              return (
                <div key={dKey} className="mb-3">
                  <div className="flex items-center justify-between px-4 py-[7px] border border-[#e4e8ec]" style={{ background: '#f5f7f9' }}>
                    <div className="flex items-center gap-3">
                      {bulkMode && (
                        <div onClick={() => {
                          const ids = dayEntries.map(e => e.id)
                          if (allSel) setSelIds(p => p.filter(id => !ids.includes(id)))
                          else setSelIds(p => [...new Set([...p, ...ids])])
                        }} className={cn('w-4 h-4 border rounded flex items-center justify-center cursor-pointer flex-shrink-0',
                          allSel ? 'bg-[#03a9f4] border-[#03a9f4]' : 'bg-white border-gray-300')}>
                          {allSel && <Check className="h-3 w-3 text-white stroke-[3px]" />}
                        </div>
                      )}
                      <span style={{ fontSize: 13, color: '#666' }}>{dayLabel(dKey)}</span>
                      {bulkMode && someSel && (
                        <div className="flex items-center gap-3 ml-2">
                          <button onClick={() => setBulkEdit(true)} className="text-[#03a9f4] text-[11px] font-bold uppercase tracking-widest hover:underline cursor-pointer">Bulk Edit</button>
                          <button onClick={() => setBulkDel(true)} className="text-red-500 text-[11px] font-bold uppercase tracking-widest hover:underline cursor-pointer">Delete</button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 12, color: '#999' }}>Total:</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#222', fontVariantNumeric: 'tabular-nums' }}>{fmtDur(dayTotal)}</span>
                      <Tip label="Bulk edit">
                        <button onClick={() => setBulkMode(b => !b)}
                          className={cn('p-1 rounded cursor-pointer', bulkMode ? 'text-[#03a9f4]' : 'text-[#aaa] hover:text-[#666]')}>
                          <Copy style={{ width: 16, height: 16 }} strokeWidth={1.5} />
                        </button>
                      </Tip>
                    </div>
                  </div>

                  <div className="bg-white border-x border-b border-[#e4e8ec]">
                    {dayEntries.map((entry, idx) => {
                      const proj = projects.find(p => p.id === entry.projectId)
                      const lead = users.find(u => u.id === proj?.leadId)
                      const task = tasks.find(t => t.id === entry.taskId)
                      const isSel = selIds.includes(entry.id)
                      const liveDur = timeEntries.find(e => e.id === entry.id)?.duration ?? entry.duration ?? 0
                      const canEdit = canEditEntry(entry)

                      return (
                        <div key={`${dKey}-${entry.id}-${idx}`}
                          className={cn('flex items-stretch border-b border-[#f0f0f0] last:border-b-0 hover:bg-[#fafbfc] transition-colors group', isSel && 'bg-[#f0f8ff]')}
                          style={{ height: 54 }}>

                          {bulkMode && (
                            <div className="flex items-center pl-4 pr-2 flex-shrink-0">
                              <div onClick={() => setSelIds(p => p.includes(entry.id) ? p.filter(i => i !== entry.id) : [...p, entry.id])}
                                className={cn('w-4 h-4 border rounded flex items-center justify-center cursor-pointer',
                                  isSel ? 'bg-[#03a9f4] border-[#03a9f4]' : 'bg-white border-gray-300')}>
                                {isSel && <Check className="h-3 w-3 text-white stroke-[3px]" />}
                              </div>
                            </div>
                          )}

                          <div className="flex flex-1 items-center min-w-0 overflow-hidden pl-8 pr-3 gap-3">
                            <input type="text" defaultValue={entry.description}
                              onBlur={e => canEdit && updateTimeEntry(entry.id, { description: e.target.value })}
                              readOnly={!canEdit}
                              placeholder="Add description"
                              style={{ fontSize: 13, color: '#222', background: 'transparent', outline: 'none', flexShrink: 0, width: 220, minWidth: 0, cursor: canEdit ? 'text' : 'default' }}
                              className="placeholder-[#bbb] truncate rounded px-2 py-1 border border-transparent hover:border-[#d0d8de] focus:border-[#d0d8de] transition-colors duration-150"
                            />
                            <div className="flex items-center gap-2 min-w-0 overflow-hidden flex-shrink-0">
                              {canEdit ? (
                                <ProjectPicker
                                  selectedProjectId={entry.projectId}
                                  selectedTaskId={entry.taskId}
                                  onSelect={(pid, tid) => updateTimeEntry(entry.id, { projectId: pid, taskId: tid || undefined })}
                                  onClear={() => updateTimeEntry(entry.id, { projectId: undefined, taskId: undefined })}
                                  customTrigger={
                                    proj ? (
                                      <div className="flex items-center gap-2 min-w-0 cursor-pointer hover:opacity-75 transition-opacity" onClick={e => e.stopPropagation()}>
                                        <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: proj.color, flexShrink: 0 }} />
                                        <span style={{ fontSize: 13, color: '#03a9f4' }} className="truncate">{proj.name}</span>
                                        {task && <span style={{ fontSize: 13, color: '#999', flexShrink: 0, whiteSpace: 'nowrap' }}>- {task.name}</span>}
                                        {lead && <span style={{ fontSize: 13, color: '#999', flexShrink: 0, whiteSpace: 'nowrap' }}>- {lead.name}</span>}
                                      </div>
                                    ) : undefined
                                  }
                                />
                              ) : proj ? (
                                <div className="flex items-center gap-2 min-w-0">
                                  <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: proj.color, flexShrink: 0 }} />
                                  <span style={{ fontSize: 13, color: '#03a9f4' }} className="truncate">{proj.name}</span>
                                  {task && <span style={{ fontSize: 13, color: '#999', flexShrink: 0, whiteSpace: 'nowrap' }}>- {task.name}</span>}
                                  {lead && <span style={{ fontSize: 13, color: '#999', flexShrink: 0, whiteSpace: 'nowrap' }}>- {lead.name}</span>}
                                </div>
                              ) : null}
                            </div>
                            <div className="flex-shrink-0 ml-auto" />
                          </div>

                          <D>
                            {canEdit ? (
                              <DurCell dur={liveDur} onSave={s => {
                                const start = new Date(entry.startTime)
                                const endTime = new Date(start.getTime() + s * 1000)
                                updateTimeEntry(entry.id, { startTime: start, endTime, duration: s })
                              }} />
                            ) : (
                              <span style={{ fontSize: 14, fontWeight: 700, color: '#222', fontVariantNumeric: 'tabular-nums', width: 52, display: 'inline-block', textAlign: 'center' }}>
                                {fmtDur(liveDur)}
                              </span>
                            )}
                          </D>

                          <div className="flex items-center justify-center px-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="text-[#ccc] hover:text-[#666] cursor-pointer">
                                  <MoreVertical style={{ width: 18, height: 18 }} strokeWidth={1.5} />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[130px] shadow-xl bg-white border border-gray-100 rounded-sm">
                                <DropdownMenuItem onClick={() => onDup(entry)} className="py-2.5 text-[14px] cursor-pointer">Duplicate</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDelId(entry.id)} className="py-2.5 text-[14px] text-red-500 cursor-pointer hover:bg-red-50">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}

      {bulkEdit && (
        <BulkEditModal
          entryIds={selIds}
          entryCount={selIds.length}
          onClose={() => setBulkEdit(false)}
          onSave={() => { setBulkEdit(false); setSelIds([]) }}
        />
      )}
    </div>
  )
}
