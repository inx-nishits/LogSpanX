'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useDataStore } from '@/lib/stores/data-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { cn } from '@/lib/utils'
import { TagPicker } from './tag-picker'
import { DollarSign, Calendar, Play, MoreVertical, Check, Copy, ChevronLeft, ChevronRight } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ProjectPicker } from './project-picker'
import { DeleteConfirmation } from './delete-confirmation'
import { UndoToast } from './undo-toast'
import { BulkEditModal } from './bulk-edit-modal'
import {
  startOfWeek, endOfWeek, subWeeks, isWithinInterval, startOfDay,
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isSameMonth
} from 'date-fns'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt24 = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

const fmtDur = (s: number) =>
  `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}`

const toHHMM = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

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

// ─── Tooltip ─────────────────────────────────────────────────────────────────
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

// ─── Dotted divider cell ──────────────────────────────────────────────────────
// my-[10px] keeps the dotted line from touching the row's top/bottom border
function D({ children, extra = '' }: { children: React.ReactNode; extra?: string }) {
  return (
    <div className={`flex items-center justify-center border-l border-dotted border-[#e0e0e0] px-4 my-[10px] ${extra}`}>
      {children}
    </div>
  )
}

// ─── Editable time (plain text, 24h) ─────────────────────────────────────────
function TimeCell({ date, onChange }: { date: Date; onChange: (d: Date) => void }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(toHHMM(date))
  useEffect(() => { if (!editing) setVal(toHHMM(date)) }, [date, editing])

  const commit = (v: string) => {
    setEditing(false)
    const parsed = parseTimeInput(v)
    if (!parsed) { setVal(toHHMM(date)); return }
    const [h, min] = parsed.split(':').map(Number)
    const nd = new Date(date); nd.setHours(h, min, 0, 0); onChange(nd)
  }

  if (editing) return (
    <input autoFocus type="text" value={val} maxLength={5} placeholder="HH:MM"
      onChange={e => setVal(e.target.value)}
      onBlur={e => commit(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && commit(val)}
      style={{ fontSize: 16, color: '#555', background: 'transparent', border: 'none', outline: 'none', width: 50, fontVariantNumeric: 'tabular-nums', textAlign: 'center' }}
    />
  )
  return (
    <span onClick={() => setEditing(true)}
      style={{ fontSize: 16, color: '#555', fontVariantNumeric: 'tabular-nums', cursor: 'pointer', width: 50, display: 'inline-block', textAlign: 'center' }}
      className="hover:text-[#03a9f4]">
      {fmt24(date)}
    </span>
  )
}

// ─── Editable duration (plain text, bold) ────────────────────────────────────
function DurCell({ dur, onSave }: { dur: number; onSave: (s: number) => void }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(fmtDur(dur))
  useEffect(() => { if (!editing) setVal(fmtDur(dur)) }, [dur, editing])

  const commit = (v: string) => {
    setEditing(false)
    const m = v.match(/^(\d+):(\d{2})$/)
    if (!m) { setVal(fmtDur(dur)); return }
    const h = +m[1], min = +m[2]
    if (min > 59) { setVal(fmtDur(dur)); return }
    onSave(h * 3600 + min * 60)
  }

  if (editing) return (
    <input autoFocus type="text" value={val} maxLength={6} placeholder="H:MM"
      onChange={e => setVal(e.target.value)}
      onBlur={e => commit(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && commit(val)}
      style={{ fontSize: 16, fontWeight: 700, color: '#222', background: 'transparent', border: 'none', outline: 'none', width: 52, fontVariantNumeric: 'tabular-nums', textAlign: 'center' }}
    />
  )
  return (
    <span onClick={() => setEditing(true)}
      style={{ fontSize: 16, fontWeight: 700, color: '#222', fontVariantNumeric: 'tabular-nums', cursor: 'pointer', width: 52, display: 'inline-block', textAlign: 'center' }}
      className="hover:text-[#03a9f4]">
      {fmtDur(dur)}
    </span>
  )
}

// ─── Calendar date picker ─────────────────────────────────────────────────────
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
      style={{ top: 'calc(100% + 4px)', right: 0 }} onClick={e => e.stopPropagation()}>
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
      <Tip label="Change date">
        <button onClick={() => setOpen(o => !o)} className="text-[#ccc] hover:text-[#03a9f4] transition-colors cursor-pointer">
          <Calendar style={{ width: 20, height: 20 }} strokeWidth={1.5} />
        </button>
      </Tip>
      {open && <CalPicker date={date}
        onChange={d => { const nd = new Date(d); nd.setHours(date.getHours(), date.getMinutes(), 0, 0); onChange(nd); setOpen(false) }}
        onClose={() => setOpen(false)} />}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function TimeEntryList({ userId }: { userId: string }) {
  const { timeEntries, projects, users, updateTimeEntry, deleteTimeEntry, deleteTimeEntries, addTimeEntry } = useDataStore()
  const { user } = useAuthStore()
  const [bulkMode, setBulkMode] = useState(false)
  const [selIds, setSelIds] = useState<string[]>([])
  const [delId, setDelId] = useState<string | null>(null)
  const [bulkDel, setBulkDel] = useState(false)
  const [bulkEdit, setBulkEdit] = useState(false)

  const entries = useMemo(() =>
    timeEntries.filter(e => e.userId === userId && e.endTime)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()),
    [timeEntries, userId]
  )

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

  const onTimeChange = (id: string, field: 'startTime' | 'endTime', nd: Date) => {
    const e = timeEntries.find(x => x.id === id); if (!e) return
    const s = field === 'startTime' ? nd : new Date(e.startTime)
    const en = field === 'endTime' ? nd : (e.endTime ? new Date(e.endTime) : nd)
    updateTimeEntry(id, { [field]: nd, duration: Math.max(0, Math.floor((en.getTime() - s.getTime()) / 1000)) })
  }

  const onDateChange = (id: string, newDay: Date) => {
    const e = timeEntries.find(x => x.id === id); if (!e) return
    const os = new Date(e.startTime)
    const ns = new Date(newDay); ns.setHours(os.getHours(), os.getMinutes(), 0, 0)
    updateTimeEntry(id, { startTime: ns, endTime: new Date(ns.getTime() + (e.duration ?? 0) * 1000) })
  }

  const onDup = (e: typeof entries[0]) => addTimeEntry({
    description: e.description, projectId: e.projectId, taskId: e.taskId,
    tagIds: e.tagIds, billable: e.billable, userId: e.userId,
    startTime: new Date(e.startTime), endTime: e.endTime ? new Date(e.endTime) : undefined, duration: e.duration,
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
            {/* ── Week header ── */}
            <div className="flex items-center justify-between px-1 py-2">
              <span style={{ fontSize: 14, color: '#333', fontWeight: 400 }}>{weekLabel(new Date(wKey))}</span>
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 13, color: '#999' }}>Week total:</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#222', fontVariantNumeric: 'tabular-nums' }}>{fmtDur(wTotal)}</span>
              </div>
            </div>

            {dKeys.map(dKey => {
              const dayEntries = dayMap[dKey]
              const liveTotal = timeEntries.filter(e =>
                e.userId === userId && e.endTime &&
                startOfDay(new Date(e.startTime)).toISOString() === dKey
              ).reduce((a, e) => a + (e.duration ?? 0), 0)
              const allSel = dayEntries.every(e => selIds.includes(e.id))
              const someSel = dayEntries.some(e => selIds.includes(e.id))

              return (
                <div key={dKey} className="mb-3">
                  {/* ── Day header ── */}
                  <div className="flex items-center justify-between px-4 py-[7px] border border-[#e4e8ec]"
                    style={{ background: '#f5f7f9' }}>
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
                      <span style={{ fontSize: 14, color: '#666' }}>{dayLabel(dKey)}</span>
                      {bulkMode && someSel && (
                        <div className="flex items-center gap-3 ml-2">
                          <button onClick={() => setBulkEdit(true)} className="text-[#03a9f4] text-[11px] font-bold uppercase tracking-widest hover:underline cursor-pointer">Bulk Edit</button>
                          <button onClick={() => setBulkDel(true)} className="text-red-500 text-[11px] font-bold uppercase tracking-widest hover:underline cursor-pointer">Delete</button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 13, color: '#999' }}>Total:</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#222', fontVariantNumeric: 'tabular-nums' }}>{fmtDur(liveTotal)}</span>
                      <Tip label="Bulk edit">
                        <button onClick={() => setBulkMode(b => !b)}
                          className={cn('p-1 rounded cursor-pointer', bulkMode ? 'text-[#03a9f4]' : 'text-[#aaa] hover:text-[#666]')}>
                          <Copy style={{ width: 16, height: 16 }} strokeWidth={1.5} />
                        </button>
                      </Tip>
                    </div>
                  </div>

                  {/* ── Entry rows ── */}
                  <div className="bg-white border-x border-b border-[#e4e8ec]">
                    {dayEntries.map(entry => {
                      const proj = projects.find(p => p.id === entry.projectId)
                      const eu = users.find(u => u.id === entry.userId)
                      const start = new Date(entry.startTime)
                      const end = entry.endTime ? new Date(entry.endTime) : null
                      const isSel = selIds.includes(entry.id)
                      const liveDur = timeEntries.find(e => e.id === entry.id)?.duration ?? entry.duration ?? 0

                      return (
                        <div key={`${dKey}-${entry.id}`}
                          className={cn('flex items-stretch border-b border-[#f0f0f0] last:border-b-0 hover:bg-[#fafbfc] transition-colors group', isSel && 'bg-[#f0f8ff]')}
                          style={{ height: 54 }}>

                          {/* Bulk checkbox */}
                          {bulkMode && (
                            <div className="flex items-center pl-4 pr-2 flex-shrink-0">
                              <div onClick={() => setSelIds(p => p.includes(entry.id) ? p.filter(i => i !== entry.id) : [...p, entry.id])}
                                className={cn('w-4 h-4 border rounded flex items-center justify-center cursor-pointer',
                                  isSel ? 'bg-[#03a9f4] border-[#03a9f4]' : 'bg-white border-gray-300')}>
                                {isSel && <Check className="h-3 w-3 text-white stroke-[3px]" />}
                              </div>
                            </div>
                          )}

                          {/* Description + Project */}
                          <div className="flex flex-1 items-center min-w-0 overflow-hidden pl-8 pr-3 gap-3">
                            <input type="text" defaultValue={entry.description}
                              onBlur={e => updateTimeEntry(entry.id, { description: e.target.value })}
                              placeholder="Add description"
                              style={{ fontSize: 15, color: '#222', background: 'transparent', border: 'none', outline: 'none', flexShrink: 0, width: 220, minWidth: 0 }}
                              className="placeholder-[#bbb] truncate"
                            />
                            {proj ? (
                              <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                                <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: proj.color, flexShrink: 0 }} />
                                <span style={{ fontSize: 15, color: '#03a9f4' }} className="truncate">{proj.name}</span>
                                {eu && <span style={{ fontSize: 15, color: '#999', flexShrink: 0, whiteSpace: 'nowrap' }}>- {eu.name}</span>}
                              </div>
                            ) : (
                              <div className="flex-shrink-0">
                                <ProjectPicker selectedProjectId={entry.projectId}
                                  onSelect={pid => updateTimeEntry(entry.id, { projectId: pid })}
                                  onClear={() => updateTimeEntry(entry.id, { projectId: undefined })} />
                              </div>
                            )}
                          </div>

                          {/* Tag */}
                          <D>
                            <TagPicker iconSize={20} selectedTagIds={entry.tagIds ?? []}
                              onChange={tagIds => updateTimeEntry(entry.id, { tagIds })} />
                          </D>

                          {/* Billable */}
                          <D>
                            <Tip label={entry.billable ? 'Billable' : 'Non-billable'}>
                              <button onClick={() => updateTimeEntry(entry.id, { billable: !entry.billable })}
                                className={cn('cursor-pointer transition-colors', entry.billable ? 'text-[#03a9f4]' : 'text-[#ccc] hover:text-[#999]')}>
                                <DollarSign style={{ width: 20, height: 20 }} strokeWidth={1.5} />
                              </button>
                            </Tip>
                          </D>

                          {/* Time range */}
                          <D extra="gap-1">
                            <TimeCell date={start} onChange={d => onTimeChange(entry.id, 'startTime', d)} />
                            <span style={{ fontSize: 14, color: '#bbb', margin: '0 2px' }}>-</span>
                            {end && <TimeCell date={end} onChange={d => onTimeChange(entry.id, 'endTime', d)} />}
                          </D>

                          {/* Calendar */}
                          <D>
                            <CalBtn date={start} onChange={d => onDateChange(entry.id, d)} />
                          </D>

                          {/* Duration */}
                          <D>
                            <DurCell dur={liveDur}
                              onSave={s => updateTimeEntry(entry.id, { duration: s, endTime: new Date(start.getTime() + s * 1000) })} />
                          </D>

                          {/* Play — hover only */}
                          <D extra="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Tip label="Continue tracking">
                              <button className="text-[#ccc] hover:text-[#03a9f4] cursor-pointer transition-colors">
                                <Play style={{ width: 18, height: 18 }} strokeWidth={1.5} />
                              </button>
                            </Tip>
                          </D>

                          {/* Three dots — hover only */}
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
