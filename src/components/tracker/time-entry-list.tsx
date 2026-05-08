'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useDataStore } from '@/lib/stores/data-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { TimeEntry } from '@/lib/types'
import { cn } from '@/lib/utils'
import { TagPicker } from './tag-picker'
import { DollarSign, MoreVertical, Check, Copy, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ProjectPicker } from './project-picker'
import { DeleteConfirmation } from './delete-confirmation'
import { UndoToast } from './undo-toast'
import { BulkEditModal } from './bulk-edit-modal'
import { canViewAllTimeEntries } from '@/lib/rbac'
import { startOfWeek, endOfWeek, subWeeks, isWithinInterval, startOfDay, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, addMonths, subMonths } from 'date-fns'

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
        <button onClick={e => { e.stopPropagation(); setMonth(m => subMonths(m, 1)) }} className="p-1 hover:bg-gray-100 rounded transition-colors">
          <ChevronLeft className="h-4 w-4 text-[#666]" />
        </button>
        <span className="text-[13px] font-semibold text-[#333]">{format(month, 'MMMM yyyy')}</span>
        <button onClick={e => { e.stopPropagation(); setMonth(m => addMonths(m, 1)) }} className="p-1 hover:bg-gray-100 rounded transition-colors">
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
            <button key={day.toISOString()} onClick={e => { e.stopPropagation(); onChange(day) }}
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
      <button onClick={e => { e.stopPropagation(); onChange(new Date()); setMonth(startOfMonth(new Date())) }}
        className="mt-2 w-full text-[12px] text-[#03a9f4] hover:underline text-center">
        Today
      </button>
    </div>
  )
}

function DateCell({ date, onSave }: { date: Date | string; onSave: (d: Date) => void }) {
  const d = new Date(date)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        portalRef.current && !portalRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX })
    }
    setOpen(o => !o)
  }

  return (
    <div className="relative" ref={triggerRef}>
      <div
        className="flex items-center justify-center gap-2 group/date cursor-pointer hover:bg-[#f5f7f9] rounded px-2 py-1 transition-colors"
        style={{ width: 130 }}
        onClick={handleOpen}
      >
        <Calendar className={cn("h-3.5 w-3.5 transition-colors", open ? "text-[#03a9f4]" : "text-[#aaa] group-hover/date:text-[#03a9f4]")} />
        <span className={cn("text-[12px] whitespace-nowrap transition-colors", open ? "text-[#333]" : "text-[#999] group-hover/date:text-[#333]")}>
          {format(d, 'MMM d, yyyy')}
        </span>
      </div>
      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={portalRef}
          style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 9999 }}
        >
          <DatePicker selected={d} onChange={newDate => {
            onSave(newDate)
            setOpen(false)
          }} />
        </div>,
        document.body
      )}
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

export function TimeEntryList({ userId, refreshKey }: { userId: string; refreshKey?: number }) {
  const { projects, users, tasks, updateTimeEntry, deleteTimeEntry, deleteTimeEntries, addTimeEntry, isInitialized } = useDataStore()
  const { user } = useAuthStore()
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [fetchLoading, setFetchLoading] = useState(true)

  // Fetch entries directly from API — single source of truth
  useEffect(() => {
    if (!isInitialized) return
    setFetchLoading(true)
    import('@/lib/api/time-entries').then(({ getTimeEntries }) =>
      getTimeEntries({ userId }).then(res =>
        import('@/lib/api/utils').then(({ extractArray }) =>
          import('@/lib/api/mappers').then(({ mapApiTimeEntry }) => {
            const raw = extractArray<Parameters<typeof mapApiTimeEntry>[0]>(res)
            setEntries(raw.map(mapApiTimeEntry))
            setFetchLoading(false)
          })
        )
      ).catch(() => setFetchLoading(false))
    )
  }, [isInitialized, userId, refreshKey])

  // RBAC: matches backend canManageTimeEntryForUser
  const canEditEntry = (entry: TimeEntry) => {
    if (!user) return false
    if (user.role === 'owner') return true
    if (user.role === 'admin') {
      const entryUser = users.find(u => u.id === entry.userId)
      // admin can edit any entry except those belonging to an owner
      return entryUser?.role !== 'owner'
    }
    if (user.role === 'group_lead') {
      // own entries always editable
      if (entry.userId === user.id) return true
      // entries of members on projects this group_lead leads
      const ledProjectIds = new Set(projects.filter(p => p.leadId === user.id).map(p => p.id))
      if (entry.projectId && ledProjectIds.has(entry.projectId)) return true
      // entries of members who are on any project this group_lead leads
      const ledMemberIds = new Set(
        projects
          .filter(p => p.leadId === user.id)
          .flatMap(p => p.members.map(m => typeof m === 'string' ? m : m.userId))
      )
      return ledMemberIds.has(entry.userId)
    }
    return entry.userId === user.id
  }

  // Local update handlers that immediately patch state
  const handleUpdateEntry = async (id: string, updates: Partial<TimeEntry>, existing: TimeEntry) => {
    // Optimistic update
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
    try {
      const synced = await updateTimeEntry(id, updates, existing)
      if (synced) {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, ...synced } : e))
      }
    } catch (err) {
      // Rollback on failure
      setEntries(prev => prev.map(e => e.id === id ? existing : e))
      console.error('Update failed:', err)
    }
  }

  const handleDeleteEntry = async (id: string) => {
    const entry = entries.find(e => e.id === id)
    if (!entry) return
    // Optimistic delete
    setEntries(prev => prev.filter(e => e.id !== id))
    try {
      await deleteTimeEntry(id)
    } catch (err) {
      // Rollback on failure
      setEntries(prev => [...prev, entry].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()))
      console.error('Delete failed:', err)
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    const entriesToDelete = entries.filter(e => ids.includes(e.id))
    // Optimistic delete
    setEntries(prev => prev.filter(e => !ids.includes(e.id)))
    try {
      await deleteTimeEntries(ids)
    } catch (err) {
      // Rollback on failure
      setEntries(prev => [...prev, ...entriesToDelete].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()))
      console.error('Bulk delete failed:', err)
    }
  }

  const handleDuplicate = async (entry: TimeEntry) => {
    const newEntry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'> = {
      description: entry.description,
      projectId: entry.projectId,
      taskId: entry.taskId,
      tagIds: entry.tagIds,
      billable: entry.billable,
      userId: entry.userId,
      startTime: new Date(),
      duration: entry.duration,
    }
    try {
      await addTimeEntry(newEntry)
      // Re-fetch to get the new entry with server-assigned ID
      const { getTimeEntries } = await import('@/lib/api/time-entries')
      const { extractArray } = await import('@/lib/api/utils')
      const { mapApiTimeEntry } = await import('@/lib/api/mappers')
      const res = await getTimeEntries({ userId })
      const raw = extractArray<Parameters<typeof mapApiTimeEntry>[0]>(res)
      const mapped = raw.map(mapApiTimeEntry)
      setEntries(mapped)
    } catch (err) {
      console.error('Duplicate failed:', err)
    }
  }

  const [bulkMode, setBulkMode] = useState(false)
  const [selIds, setSelIds] = useState<string[]>([])
  const [delId, setDelId] = useState<string | null>(null)
  const [bulkDel, setBulkDel] = useState(false)
  const [bulkEdit, setBulkEdit] = useState(false)

  const sortedEntries = useMemo(() => {
    const seen = new Set<string>()
    return entries
      .filter(e => { if (seen.has(e.id)) return false; seen.add(e.id); return true })
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  }, [entries])

  const weekGroups = useMemo(() => {
    const w: Record<string, Record<string, TimeEntry[]>> = {}
    sortedEntries.forEach(e => {
      const d = new Date(e.startTime)
      const wk = startOfWeek(d, { weekStartsOn: 1 }).toISOString()
      const dk = startOfDay(d).toISOString()
      if (!w[wk]) w[wk] = {}
      if (!w[wk][dk]) w[wk][dk] = []
      w[wk][dk].push(e)
    })
    return w
  }, [sortedEntries])

  const wKeys = Object.keys(weekGroups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  return (
    <div className="w-full pb-20">
      <UndoToast />
      <DeleteConfirmation isOpen={!!delId} onClose={() => setDelId(null)}
        onConfirm={() => { if (delId) { handleDeleteEntry(delId); setDelId(null) } }} count={1} />
      <DeleteConfirmation isOpen={bulkDel} onClose={() => setBulkDel(false)}
        onConfirm={() => { handleBulkDelete(selIds); setSelIds([]); setBulkDel(false); setBulkMode(false) }}
        count={selIds.length} />

      {fetchLoading && entries.length === 0 && (
        <div className="space-y-3 mt-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-[54px] bg-white border border-[#e4e8ec] rounded animate-pulse" />
          ))}
        </div>
      )}

      {!fetchLoading && wKeys.length === 0 && (
        <div className="text-center py-16 text-[#aaa] text-[14px]">No time entries yet</div>
      )}

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
              const canEditDayEntries = dayEntries.every(canEditEntry)
              const dayTotal = dayEntries.reduce((a, e) => a + (e.duration ?? 0), 0)
              const allSel = dayEntries.every(e => selIds.includes(e.id))
              const someSel = dayEntries.some(e => selIds.includes(e.id))

              return (
                <div key={dKey} className="mb-6">
                  <div className="flex items-center justify-between px-4 py-[7px] border border-[#e4e8ec]" style={{ background: '#e8eaed' }}>
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
                      {bulkMode && someSel && canEditDayEntries && (
                        <div className="flex items-center gap-3 ml-2">
                          <button onClick={() => setBulkEdit(true)} className="text-[#03a9f4] text-[11px] font-bold uppercase tracking-widest hover:underline cursor-pointer">Bulk Edit</button>
                          <button onClick={() => setBulkDel(true)} className="text-red-500 text-[11px] font-bold uppercase tracking-widest hover:underline cursor-pointer">Delete</button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 12, color: '#999' }}>Total:</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#222', fontVariantNumeric: 'tabular-nums' }}>{fmtDur(dayTotal)}</span>
                      {user && canViewAllTimeEntries(user.role) && canEditDayEntries && (
                        <Tip label="Bulk edit">
                          <button onClick={() => setBulkMode(b => !b)}
                            className={cn('p-1 rounded cursor-pointer', bulkMode ? 'text-[#03a9f4]' : 'text-[#aaa] hover:text-[#666]')}>
                            <Copy style={{ width: 16, height: 16 }} strokeWidth={1.5} />
                          </button>
                        </Tip>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border-x border-b-4 border-[#e4e8ec] mb-[3px] border-b-[#d0d5da]">
                    {dayEntries.map((entry, idx) => {
                      const proj = projects.find((p: { id: string }) => p.id === entry.projectId)
                      const lead = users.find((u: { id: string }) => u.id === (proj as { leadId?: string } | undefined)?.leadId)
                      const task = tasks.find((t: { id: string }) => t.id === entry.taskId)
                      const isSel = selIds.includes(entry.id)
                      const liveDur = entry.duration ?? 0
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
                              key={entry.id + entry.description}
                              onBlur={e => canEdit && handleUpdateEntry(entry.id, { description: e.target.value }, entry)}
                              readOnly={!canEdit}
                              placeholder="Add description"
                              style={{ fontSize: 13, color: '#222', background: 'transparent', outline: 'none', flexShrink: 0, width: 340, minWidth: 0, cursor: canEdit ? 'text' : 'default' }}
                              className="placeholder-[#bbb] truncate rounded px-2 py-1 border border-transparent hover:border-[#d0d8de] focus:border-[#d0d8de] transition-colors duration-150"
                            />
                            <div className="flex items-center gap-2 min-w-0 overflow-hidden flex-shrink-0">
                              {canEdit ? (
                                <ProjectPicker
                                  selectedProjectId={entry.projectId}
                                  selectedTaskId={entry.taskId}
                                  onSelect={(pid, tid) => handleUpdateEntry(entry.id, { projectId: pid, taskId: tid || undefined }, entry)}
                                  onClear={() => handleUpdateEntry(entry.id, { projectId: undefined, taskId: undefined }, entry)}
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

                          <D extra="w-[120px]">
                            {canEdit ? (
                              <DateCell date={entry.startTime} onSave={newDate => {
                                const old = new Date(entry.startTime)
                                newDate.setHours(old.getHours())
                                newDate.setMinutes(old.getMinutes())
                                newDate.setSeconds(old.getSeconds())
                                const newEndTime = entry.endTime
                                  ? new Date(newDate.getTime() + (entry.duration ?? 0) * 1000)
                                  : undefined
                                handleUpdateEntry(entry.id, { startTime: newDate, endTime: newEndTime }, entry)
                              }} />
                            ) : (
                              <span style={{ fontSize: 12, color: '#999', width: 110, textAlign: 'center' }}>
                                {new Date(entry.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                          </D>

                          <D>
                            {canEdit ? (
                              <DurCell dur={liveDur} onSave={s => {
                                const start = new Date(entry.startTime)
                                const endTime = new Date(start.getTime() + s * 1000)
                                handleUpdateEntry(entry.id, { startTime: start, endTime, duration: s }, entry)
                              }} />
                            ) : (
                              <span style={{ fontSize: 14, fontWeight: 700, color: '#222', fontVariantNumeric: 'tabular-nums', width: 52, display: 'inline-block', textAlign: 'center' }}>
                                {fmtDur(liveDur)}
                              </span>
                            )}
                          </D>

                          {canEdit && <div className="flex items-center justify-center px-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="text-[#ccc] hover:text-[#666] cursor-pointer">
                                  <MoreVertical style={{ width: 18, height: 18 }} strokeWidth={1.5} />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[130px] shadow-xl bg-white border border-gray-100 rounded-sm">
                                <DropdownMenuItem onClick={() => handleDuplicate(entry)} className="py-2.5 text-[14px] cursor-pointer">Duplicate</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDelId(entry.id)} className="py-2.5 text-[14px] text-red-500 cursor-pointer hover:bg-red-50">Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>}
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
