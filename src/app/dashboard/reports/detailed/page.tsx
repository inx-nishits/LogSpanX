'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { addDays, startOfDay, endOfDay, startOfWeek, endOfWeek, format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay, isSameMonth, subMonths, addMonths } from 'date-fns'
import { ChevronDown, DollarSign, MoreVertical, Printer, Share2, ChevronLeft, ChevronRight, Calendar, Play, Check, Copy, ArrowUp, ArrowDown, Trash2, X, Plus } from 'lucide-react'
import { useDataStore } from '@/lib/stores/data-store'
import { cn } from '@/lib/utils'
import { ReportShell, DateRange } from '../_components/report-shell'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { TagPicker } from '@/components/tracker/tag-picker'
import { ProjectPicker } from '@/components/tracker/project-picker'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDur = (s: number, round?: boolean) => {
  const finalSecs = round ? Math.ceil(s / 60) * 60 : s
  const h = Math.floor(finalSecs / 3600)
  const m = Math.floor((finalSecs % 3600) / 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

const fmtTime = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

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
  const digits = s.replace(':', '')
  if (digits.length === 1) return `0${digits}:00`
  if (digits.length === 2) { const h = parseInt(digits); if (h > 23) return ''; return `${String(h).padStart(2, '0')}:00` }
  if (digits.length === 4) { const h = parseInt(digits.slice(0, 2)), m = parseInt(digits.slice(2)); if (h > 23 || m > 59) return ''; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` }
  return ''
}

// ─── Shared Components ────────────────────────────────────────────────────────

function Tip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip flex items-center justify-center">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[13px] rounded whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-[300]">
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

function TimeCell({ date, onChange, className = "" }: { date: Date; onChange: (d: Date) => void; className?: string }) {
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
      className={cn("w-[50px] text-[15px] text-[#555] bg-transparent border-none outline-none tabular-nums text-center p-0 m-0", className)}
    />
  )
  return (
    <span onClick={() => setEditing(true)}
      className={cn("text-[15px] text-[#555] tabular-nums cursor-pointer w-[50px] inline-block text-center hover:text-[#03a9f4] p-0 m-0 leading-none", className)}>
      {fmtTime(date)}
    </span>
  )
}

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
      className="w-[52px] text-[17px] font-bold text-[#333] bg-transparent border-none outline-none tabular-nums text-center p-0 m-0"
    />
  )
  return (
    <span onClick={() => setEditing(true)}
      className="text-[17px] font-bold text-[#333] tabular-nums cursor-pointer w-[52px] inline-block text-center hover:text-[#03a9f4] p-0 m-0 leading-none">
      {fmtDur(dur)}
    </span>
  )
}

function CalPicker({ date, onChange, onClose, align = 'right' }: { date: Date; onChange: (d: Date) => void; onClose: () => void; align?: 'left' | 'right' }) {
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
      style={{ top: 'calc(100% + 4px)', [align]: 0 }} onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setView(subMonths(view, 1))} className="p-1 hover:bg-gray-100 rounded cursor-pointer">
          <ChevronLeft className="h-4 w-4 text-gray-500" />
        </button>
        <span className="text-[15px] font-semibold text-gray-700">{format(view, 'MMM yyyy')}</span>
        <button onClick={() => setView(addMonths(view, 1))} className="p-1 hover:bg-gray-100 rounded cursor-pointer">
          <ChevronRight className="h-4 w-4 text-gray-500" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
          <div key={d} className="text-center text-[13px] font-bold text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((day, i) => {
          const sel = isSameDay(day, date), cur = isSameMonth(day, view), tod = isSameDay(day, new Date())
          return (
            <button key={i} onClick={() => { onChange(day); onClose() }}
              className={cn('h-8 w-full flex items-center justify-center text-[16px] rounded cursor-pointer transition-colors',
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

function CalBtn({ date, onChange, align = 'right' }: { date: Date; onChange: (d: Date) => void; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <Tip label={format(date, 'MMM d, yyyy')}>
        <button onClick={() => setOpen(o => !o)} className="text-[#ccc] hover:text-[#03a9f4] transition-colors cursor-pointer">
          <Calendar style={{ width: 20, height: 20 }} strokeWidth={1.5} />
        </button>
      </Tip>
      {open && <CalPicker date={date} align={align}
        onChange={d => { const nd = new Date(d); nd.setHours(date.getHours(), date.getMinutes(), 0, 0); onChange(nd); setOpen(false) }}
        onClose={() => setOpen(false)} />}
    </div>
  )
}

// ─── Inline Entry Bar ────────────────────────────────────────────────────────

function InlineEntryBar({ onAdd, defaultDate }: { onAdd: (e: any) => void, defaultDate: Date }) {
  const { projects, users } = useDataStore()
  const [desc, setDesc] = useState('')
  const [pid, setPid] = useState('')
  const [tagIds, setTagIds] = useState<string[]>([])
  const [billable, setBillable] = useState(false)
  const [uid, setUid] = useState(users[0]?.id || '')
  const [start, setStart] = useState(new Date())
  const [end, setEnd] = useState(new Date(new Date().getTime() + 3600 * 1000))

  const handleAdd = () => {
    if (!uid) return
    onAdd({
      description: desc, projectId: pid || undefined, tagIds, billable,
      userId: uid, startTime: start, endTime: end,
      duration: Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000))
    })
    setDesc('')
  }

  return (
    <div className="flex items-center h-[54px] bg-white border-b border-[#e4eaee] px-4 relative z-[200]">
      <div className="w-[44px] flex-shrink-0" />

      <div className="flex-1 min-w-0 pr-4">
        <input type="text" placeholder="Add description" value={desc} onChange={e => setDesc(e.target.value)}
          className="w-full text-[15px] outline-none bg-transparent placeholder-[#bbb]" />
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <D extra="border-none gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 text-[16px] text-[#555] hover:text-[#03a9f4] cursor-pointer">
                {users.find(u => u.id === uid)?.name || 'User'} <ChevronDown className="h-3.5 w-3.5 text-[#aaa]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] bg-white border border-gray-100 shadow-xl">
              {users.map(u => (
                <DropdownMenuItem key={u.id} onClick={() => setUid(u.id)} className="py-2.5 px-3 cursor-pointer text-[16px]">
                  {u.name} {u.id === uid && <Check className="h-3.5 w-3.5 ml-auto text-[#03a9f4]" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </D>

        <D extra="border-none">
          <ProjectPicker selectedProjectId={pid} onSelect={setPid} onClear={() => setPid('')} />
        </D>

        <D extra="border-none"><TagPicker selectedTagIds={tagIds} onChange={setTagIds} /></D>

        <D extra="border-none">
          <button onClick={() => setBillable(!billable)} className={cn('cursor-pointer transition-colors', billable ? 'text-[#03a9f4]' : 'text-[#ccc]')}>
            <DollarSign style={{ width: 18, height: 18 }} />
          </button>
        </D>

        <div className="w-px h-6 border-l border-dotted border-[#d0d8de]" />

        <div className="flex items-center gap-1">
          <TimeCell date={start} className="w-[55px] text-[15px]" onChange={setStart} />
          <span className="text-[#bbb]">-</span>
          <TimeCell date={end} className="w-[55px] text-[15px]" onChange={setEnd} />
        </div>

        <CalBtn date={start} onChange={d => {
          const ns = new Date(d); ns.setHours(start.getHours(), start.getMinutes(), 0, 0)
          const ne = new Date(d); ne.setHours(end.getHours(), end.getMinutes(), 0, 0)
          setStart(ns); setEnd(ne)
        }} align="right" />

        <span className="text-[16px] text-[#777]">Today</span>

        <span className="min-w-[50px] text-right font-bold text-[#333] text-[16px] tabular-nums">
          {fmtDur(Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000)))}
        </span>

        <button onClick={handleAdd} className="px-5 h-[32px] bg-[#03a9f4] hover:bg-[#0288d1] text-white text-[16px] font-bold rounded-sm cursor-pointer transition-colors uppercase tracking-wide">ADD</button>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DetailedReportPage() {
  const { timeEntries, projects, users, updateTimeEntry, addTimeEntry, deleteTimeEntry, updateTimeEntries, deleteTimeEntries } = useDataStore()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const paramFrom = searchParams.get('from')
  const paramTo = searchParams.get('to')

  const selUsers = useMemo(() => searchParams.get('users')?.split(',').filter(Boolean) || [], [searchParams])
  const selProjects = useMemo(() => searchParams.get('projects')?.split(',').filter(Boolean) || [], [searchParams])
  const selTags = useMemo(() => searchParams.get('tags')?.split(',').filter(Boolean) || [], [searchParams])
  const selTasks = useMemo(() => searchParams.get('tasks')?.split(',').filter(Boolean) || [], [searchParams])
  const selStatus = useMemo(() => searchParams.get('status')?.split(',').filter(Boolean) || [], [searchParams])
  const filterDesc = searchParams.get('description') || ''

  const [dateRange, setDateRange] = useState<DateRange>(() => ({
    from: paramFrom ? startOfDay(parseISO(paramFrom)) : startOfDay(startOfWeek(new Date(), { weekStartsOn: 1 })),
    to: paramTo ? endOfDay(parseISO(paramTo)) : endOfDay(endOfWeek(new Date(), { weekStartsOn: 1 })),
  }))

  const [selIds, setSelIds] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<string>('startTime')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [rounding, setRounding] = useState(false)
  const [showEntryBar, setShowEntryBar] = useState(false)

  const filtered = useMemo(() => {
    let entries = [...timeEntries].filter(e => {
      const t = new Date(e.startTime)
      return t >= startOfDay(dateRange.from) && t <= endOfDay(dateRange.to)
    })

    if (selUsers.length) entries = entries.filter(e => selUsers.includes(e.userId))
    if (selProjects.length) entries = entries.filter(e => e.projectId && selProjects.includes(e.projectId))
    if (selTags.length) entries = entries.filter(e => e.tagIds?.some(tid => selTags.includes(tid)))
    if (selTasks.length) entries = entries.filter(e => e.taskId && selTasks.includes(e.taskId))
    if (selStatus.length > 0 && selStatus.length < 2) {
      entries = entries.filter(e => {
        if (selStatus.includes('billable') && !e.billable) return false
        if (selStatus.includes('non-billable') && e.billable) return false
        return true
      })
    }
    if (filterDesc) entries = entries.filter(e => e.description.toLowerCase().includes(filterDesc.toLowerCase()))

    entries.sort((a, b) => {
      let valA: any = a[sortField as keyof typeof a]
      let valB: any = b[sortField as keyof typeof b]
      if (sortField === 'startTime') { valA = new Date(a.startTime).getTime(); valB = new Date(b.startTime).getTime() }
      if (sortField === 'userName') { valA = users.find(u => u.id === a.userId)?.name || ''; valB = users.find(u => u.id === b.userId)?.name || '' }
      if (sortField === 'duration') { valA = a.duration || 0; valB = b.duration || 0 }
      if (sortField === 'description') { valA = a.description || ''; valB = b.description || '' }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return entries
  }, [timeEntries, dateRange, selUsers, selProjects, selTags, selTasks, selStatus, filterDesc, users, sortField, sortOrder])

  const handleApply = (filters: any) => {
    const params = new URLSearchParams(searchParams.toString())
    if (filters.team.length) params.set('users', filters.team.join(','))
    else params.delete('users')
    if (filters.project.length) params.set('projects', filters.project.join(','))
    else params.delete('projects')
    if (filters.tags.length) params.set('tags', filters.tags.join(','))
    else params.delete('tags')
    if (filters.description) params.set('description', filters.description)
    else params.delete('description')
    router.push(`${pathname}?${params.toString()}`)
  }

  const totalSecs = useMemo(() => filtered.reduce((a, e) => a + (e.duration ?? 0), 0), [filtered])
  const billableSecs = useMemo(() => filtered.filter(e => e.billable).reduce((a, e) => a + (e.duration ?? 0), 0), [filtered])

  const dispDur = (s: number) => fmtDur(s, rounding)

  const toggleAll = () => {
    if (selIds.size === filtered.length) setSelIds(new Set())
    else setSelIds(new Set(filtered.map(e => e.id)))
  }

  const toggleOne = (id: string) => {
    const n = new Set(selIds); if (n.has(id)) n.delete(id); else n.add(id); setSelIds(n)
  }

  const handleSort = (field: string) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortOrder('desc') }
  }

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

  const onDup = (e: typeof filtered[0]) => {
    const { id, createdAt, updatedAt, ...rest } = e
    addTimeEntry({
      ...rest,
      startTime: new Date(e.startTime),
      endTime: e.endTime ? new Date(e.endTime) : undefined
    })
  }

  const bulkDelete = () => { if (confirm(`Delete ${selIds.size} entries?`)) { deleteTimeEntries(Array.from(selIds)); setSelIds(new Set()) } }
  const bulkUpdate = (data: any) => { updateTimeEntries(Array.from(selIds), data); setSelIds(new Set()) }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null
    return sortOrder === 'desc' ? <ArrowDown className="h-3.5 w-3.5 ml-1" /> : <ArrowUp className="h-3.5 w-3.5 ml-1" />
  }

  return (
    <ReportShell
      dateRange={dateRange}
      onRangeChange={setDateRange}
      initialTeam={selUsers}
      initialProject={selProjects}
      initialTags={selTags}
      initialTasks={selTasks}
      initialStatus={selStatus}
      initialDescription={filterDesc}
      onApply={handleApply}
    >
      <div className="flex-1 bg-transparent flex flex-col">

        <div className="flex items-center justify-between mb-4 px-6 pt-6">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 h-[32px] text-[16px] text-[#555] bg-white border border-[#d0d8de] rounded-sm hover:border-[#aaa] cursor-pointer shadow-sm">
              Time audit <ChevronDown className="h-3.5 w-3.5 text-[#aaa]" />
            </button>
            <button onClick={() => setShowEntryBar(!showEntryBar)} className={cn("flex items-center gap-1.5 px-3 h-[32px] text-[16px] text-[#555] border rounded-sm hover:border-[#aaa] cursor-pointer shadow-sm transition-colors", showEntryBar ? "bg-[#f2f6f8] border-[#03a9f4] text-[#03a9f4]" : "bg-white border-[#d0d8de]")}>
              Add time for others <ChevronDown className="h-3.5 w-3.5 text-[#aaa]" />
            </button>
          </div>
        </div>

        <div className="mx-6 mb-8 bg-white border border-[#e4e8ec] shadow-sm rounded-sm overflow-hidden flex flex-col">
          {/* Inline Manual Entry */}
          {showEntryBar && <InlineEntryBar onAdd={addTimeEntry} defaultDate={dateRange.from} />}

          {/* Stats bar */}
          <div className="flex items-center justify-between bg-[#f2f6f8] border-b border-[#e4eaee] px-4 h-[42px] flex-shrink-0">
            <div className="flex items-center gap-6 text-[16px]">
              <span className="text-[#777]">Total: <strong className="text-[#333] font-bold tabular-nums text-[15px]">{dispDur(totalSecs)}</strong></span>
              <span className="text-[#777]">Billable: <strong className="text-[#333] font-bold tabular-nums text-[15px]">{dispDur(billableSecs)}</strong></span>
              <span className="text-[#777]">Amount: <strong className="text-[#333] font-bold text-[15px]">0.00 USD</strong></span>
            </div>
            <div className="flex items-center gap-4 text-[15px] text-[#555]">
              <div className="flex items-center gap-2">
                <button className="hover:text-[#03a9f4] cursor-pointer flex items-center gap-1 border border-[#d0d8de] px-2.5 py-1 rounded bg-white h-[26px]">Export <ChevronDown className="h-3 w-3" /></button>
                <button className="hover:text-[#03a9f4] cursor-pointer"><Printer className="h-4 w-4" /></button>
                <button className="hover:text-[#03a9f4] cursor-pointer"><Share2 className="h-4 w-4" /></button>
              </div>
              <div className="w-px h-4 bg-[#d0d8de]" />
              <div className="flex items-center gap-2">
                <div onClick={() => setRounding(!rounding)} className={cn("relative inline-flex h-3.5 w-8 items-center rounded-full cursor-pointer transition-colors", rounding ? "bg-[#03a9f4]" : "bg-gray-200")}>
                  <span className={cn("inline-block h-2.5 w-2.5 rounded-full bg-white transition-transform", rounding ? "translate-x-4.5" : "translate-x-1")} />
                </div>
                <span className="text-[16px]">Rounding</span>
              </div>
              <button className="hover:text-[#03a9f4] cursor-pointer flex items-center gap-1 text-[15px]">Show amount <ChevronDown className="h-3.5 w-3.5" /></button>
            </div>
          </div>

          {/* Table header / Bulk Actions */}
          <div className={cn("flex items-center h-[42px] border-b border-[#e4eaee] px-4 text-[15px] font-bold uppercase tracking-wider flex-shrink-0", selIds.size > 0 ? "bg-[#333] text-white" : "bg-[#f5f7f9] text-[#aaa]")}>
            <div className="w-[44px] flex-shrink-0 flex items-center justify-center">
              <input type="checkbox" checked={selIds.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="h-4 w-4 rounded-sm accent-[#03a9f4] cursor-pointer" />
            </div>
            {selIds.size > 0 ? (
              <div className="flex-1 flex items-center gap-4 lowercase font-normal">
                <span className="font-bold uppercase tracking-wider text-[15px] text-white">{selIds.size} selected</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-[#03a9f4] hover:underline cursor-pointer">Bulk Edit</button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px] bg-white border border-gray-100 shadow-xl p-2">
                    <div className="text-[13px] text-gray-400 font-bold uppercase mb-2 px-1">Update Fields</div>
                    <ProjectPicker selectedProjectId={''} onSelect={pid => bulkUpdate({ projectId: pid })} onClear={() => { }} />
                    <div className="mt-2" />
                    <TagPicker selectedTagIds={[]} onChange={tids => bulkUpdate({ tagIds: tids })} />
                  </DropdownMenuContent>
                </DropdownMenu>
                <button className="text-red-400 hover:underline cursor-pointer" onClick={bulkDelete}>Delete</button>
              </div>
            ) : (
              <>
                <div className="flex-1 min-w-0 flex items-center gap-1 cursor-pointer hover:text-[#555]" onClick={() => handleSort('description')}>
                  Time Entry <SortIcon field="description" />
                </div>
                <div className="w-[80px] text-right flex-shrink-0 flex items-center justify-end px-2">Amount</div>
                <div className="w-[40px] flex-shrink-0" />
                <div className="w-[150px] text-right flex-shrink-0 px-2 flex items-center justify-end cursor-pointer hover:text-[#555]" onClick={() => handleSort('userName')}>
                  User <SortIcon field="userName" />
                </div>
                <div className="w-[140px] text-center flex-shrink-0 px-2 flex items-center justify-center cursor-pointer hover:text-[#555]" onClick={() => handleSort('startTime')}>
                  Time <SortIcon field="startTime" />
                </div>
                <div className="w-[90px] text-center flex-shrink-0 px-2 flex items-center justify-center cursor-pointer hover:text-[#555]" onClick={() => handleSort('duration')}>
                  Duration <SortIcon field="duration" />
                </div>
                <div className="w-[100px] flex-shrink-0" />
              </>
            )}
          </div>

          {/* Rows */}
          <div className="bg-white">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-[16px] text-[#aaa]">No entries for selected range</div>
            ) : (
              Object.entries(
                filtered.reduce((acc, entry) => {
                  const dateKey = sortField === 'startTime'
                    ? format(new Date(entry.startTime), 'EEE, MMM d')
                    : 'Results'
                  if (!acc[dateKey]) acc[dateKey] = []
                  acc[dateKey].push(entry)
                  return acc
                }, {} as Record<string, typeof filtered>)
              ).map(([dateLabel, entries]) => (
                <div key={dateLabel}>
                  {sortField === 'startTime' && (
                    <div className="bg-[#fcfdfe] border-b border-[#e4eaee] px-4 py-2.5 text-[16px] font-bold text-[#777] flex items-center">
                      <span>{dateLabel}</span>
                      <div className="flex-1 min-w-0" />
                      <div className="w-[80px] text-right flex-shrink-0 px-2 flex items-center justify-end text-[16px] font-bold text-[#333] tabular-nums">
                        {dispDur(entries.reduce((a, e) => a + (e.duration ?? 0), 0))}
                      </div>
                      <div className="w-[480px] flex-shrink-0" />
                    </div>
                  )}
                  {entries.map(entry => {
                    const proj = projects.find(p => p.id === entry.projectId)
                    const user = users.find(u => u.id === entry.userId)
                    const start = new Date(entry.startTime)
                    const end = entry.endTime ? new Date(entry.endTime) : null

                    return (
                      <div key={entry.id} className={cn("flex items-stretch min-h-[56px] bg-white border-b border-[#f0f0f0] transition-colors group relative", selIds.has(entry.id) ? "bg-[#f2f9ff]" : "hover:bg-[#fafbfc]")}>
                        <div className="w-[44px] flex-shrink-0 flex items-center justify-center border-r border-transparent">
                          <input type="checkbox" checked={selIds.has(entry.id)} onChange={() => toggleOne(entry.id)} className="h-4 w-4 rounded-sm accent-[#03a9f4] cursor-pointer" />
                        </div>

                        {/* Description + Project + Tags */}
                        <div className="flex-1 min-w-0 flex items-center px-4 py-2 group/entry">
                          <div className="flex-1 min-w-0 flex items-center gap-1.5">
                            <input type="text" defaultValue={entry.description}
                              onBlur={e => updateTimeEntry(entry.id, { description: e.target.value })}
                              placeholder="Add description"
                              className="text-[16px] text-[#333] outline-none bg-transparent placeholder-[#bbb] truncate flex-initial w-auto min-w-[120px]"
                            />
                            <div className="flex items-center gap-1.5 min-w-0 flex-shrink-0">
                              <span className="text-gray-300 flex-shrink-0">•</span>
                              <ProjectPicker selectedProjectId={entry.projectId}
                                onSelect={pid => updateTimeEntry(entry.id, { projectId: pid })}
                                onClear={() => updateTimeEntry(entry.id, { projectId: undefined })}
                                customTrigger={proj ? (
                                  <div className="flex items-center gap-1.5 min-w-0 hover:opacity-80 transition-opacity">
                                    <div className="w-[8px] h-[8px] rounded-full flex-shrink-0" style={{ backgroundColor: proj.color }} />
                                    <span className="text-[15px] truncate font-medium" style={{ color: proj.color }}>{proj.name}</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-[#03a9f4] hover:underline text-[15px] font-medium opacity-0 group-hover/entry:opacity-100 transition-opacity cursor-pointer">
                                    <Plus className="h-3 w-3" /> Project
                                  </div>
                                )}
                              />
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-auto">
                            <TagPicker iconSize={20} selectedTagIds={entry.tagIds ?? []} onChange={tagIds => updateTimeEntry(entry.id, { tagIds })} />
                          </div>
                        </div>

                        <div className="w-[80px] flex-shrink-0 flex items-center justify-end px-2 text-[16px] text-[#aaa] tabular-nums">0.00</div>

                        <div className="w-[40px] flex-shrink-0 flex items-center justify-center">
                          <button onClick={() => updateTimeEntry(entry.id, { billable: !entry.billable })}
                            className={cn('cursor-pointer transition-colors', entry.billable ? 'text-[#03a9f4]' : 'text-[#ccc]')}>
                            <DollarSign style={{ width: 18, height: 18 }} />
                          </button>
                        </div>

                        <div className="w-[150px] flex-shrink-0 flex items-center justify-end px-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="flex items-center justify-end gap-1 text-[16px] text-[#555] hover:text-[#03a9f4] cursor-pointer ml-auto max-w-[130px] truncate">
                                {user?.name || '—'} <ChevronDown className="h-3.5 w-3.5 text-[#aaa]" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px] bg-white border border-gray-100 shadow-xl">
                              {users.map(u => (
                                <DropdownMenuItem key={u.id} onClick={() => updateTimeEntry(entry.id, { userId: u.id })} className="py-2.5 px-3 cursor-pointer text-[16px]">
                                  {u.name} {u.id === entry.userId && <Check className="h-3.5 w-3.5 ml-auto text-[#03a9f4]" />}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="w-[140px] flex-shrink-0 flex flex-col items-center justify-center leading-tight">
                          <div className="flex items-center gap-1">
                            <TimeCell date={start} onChange={d => onTimeChange(entry.id, 'startTime', d)} />
                            <span className="text-[#bbb] text-[16px]">-</span>
                            {end && <TimeCell date={end} onChange={d => onTimeChange(entry.id, 'endTime', d)} />}
                          </div>
                          <span className="text-[16px] text-[#aaa] mt-1">
                            {isSameDay(start, new Date()) ? 'Today' : isSameDay(start, addDays(new Date(), -1)) ? 'Yesterday' : format(start, 'dd/MM/yyyy')}
                          </span>
                        </div>

                        <div className="w-[90px] flex-shrink-0 flex items-center justify-center">
                          <DurCell dur={entry.duration ?? 0} onSave={s => updateTimeEntry(entry.id, { duration: s, endTime: new Date(start.getTime() + s * 1000) })} />
                        </div>

                        <div className="w-[100px] flex-shrink-0 flex items-center justify-end pr-4 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <CalBtn date={start} onChange={d => onDateChange(entry.id, d)} />
                          <Tip label="Continue tracking">
                            <button className="text-[#ccc] hover:text-[#03a9f4] cursor-pointer transition-colors p-1" onClick={() => onDup(entry)}>
                              <Play style={{ width: 16, height: 16 }} />
                            </button>
                          </Tip>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-[#ccc] hover:text-[#666] cursor-pointer p-1">
                                <MoreVertical style={{ width: 16, height: 16 }} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[140px] shadow-xl bg-white border border-gray-100 rounded-sm">
                              <DropdownMenuItem onClick={() => onDup(entry)} className="py-2.5 text-[16px] cursor-pointer">Duplicate</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deleteTimeEntry(entry.id)} className="py-2.5 text-[16px] text-red-500 cursor-pointer hover:bg-red-50">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ReportShell>
  )
}
