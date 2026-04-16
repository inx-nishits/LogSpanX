'use client'

import { useState, useMemo } from 'react'
import { useDataStore } from '@/lib/stores/data-store'
import { useTimerStore } from '@/lib/stores/timer-store'
import { formatTime, formatDate, cn, parseTime, parseTimeAsDate } from '@/lib/utils'
import { MoreHorizontal, DollarSign, Calendar, ListChecks, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ProjectPicker } from './project-picker'
import { DeleteConfirmation } from './delete-confirmation'
import { UndoToast } from './undo-toast'
import { BulkEditModal } from './bulk-edit-modal'
import { CalendarPicker } from './calendar-picker'

export function TimeEntryList({ userId }: { userId: string }) {
  const { timeEntries, updateTimeEntry, deleteTimeEntry, deleteMultipleTimeEntries } = useDataStore()

  // States
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)
  const [showBulkEditModal, setShowBulkEditModal] = useState(false)

  const userEntries = useMemo(() => {
    return timeEntries
      .filter(entry => entry.userId === userId && entry.endTime)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  }, [timeEntries, userId])

  const groups = useMemo(() => {
    const g: Record<string, typeof userEntries> = {}
    userEntries.forEach(entry => {
      const date = new Date(entry.startTime).toDateString()
      if (!g[date]) g[date] = []
      g[date].push(entry)
    })
    return g
  }, [userEntries])

  const dates = Object.keys(groups)

  const handleConfirmDeleteSingle = () => {
    if (deleteId) {
      deleteTimeEntry(deleteId)
      setDeleteId(null)
    }
  }

  const handleConfirmDeleteBulk = () => {
    deleteMultipleTimeEntries(selectedIds)
    setSelectedIds([])
    setShowBulkDeleteConfirm(false)
    setIsBulkMode(false)
  }

  const formatLogSpanTime = (date: Date) => {
    try {
      if (isNaN(date.getTime())) return '--:--'
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(' ', '')
    } catch (e) {
      return '--:--'
    }
  }

  return (
    <div className="w-full space-y-6 pb-20">
      <UndoToast />

      <DeleteConfirmation
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDeleteSingle}
        count={1}
      />
      <DeleteConfirmation
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleConfirmDeleteBulk}
        count={selectedIds.length}
      />

      <div className="flex items-center justify-between px-2 pt-2 text-gray-500">
        <h2 className="text-[14px] font-black uppercase tracking-tight italic text-gray-700">This week</h2>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-gray-400 uppercase tracking-widest font-bold">Week total:</span>
          <span className="text-[18px] font-bold text-gray-800 tabular-nums font-inter">14:00</span>
        </div>
      </div>

      {dates.map(date => {
        const dayEntries = groups[date]
        const total = dayEntries.reduce((acc, e) => acc + (e.duration || 0), 0)
        const entriesAreSelected = dayEntries.some(e => selectedIds.includes(e.id))
        const allDaySelected = dayEntries.every(e => selectedIds.includes(e.id))

        return (
          <div key={date} className="relative group/day">
            <div className="flex items-center justify-between px-4 py-2 bg-[#f0f7fb] border border-[#d6e5ef] text-xs text-slate-600 rounded-t-sm">
              <div className="flex items-center space-x-3">
                {isBulkMode && (
                  <div onClick={() => {
                    const ids = dayEntries.map(e => e.id)
                    if (allDaySelected) setSelectedIds(prev => prev.filter(id => !ids.includes(id)))
                    else setSelectedIds(prev => [...new Set([...prev, ...ids])])
                  }} className={cn("w-4 h-4 rounded border border-[#03a9f4] flex items-center justify-center cursor-pointer transition-colors", allDaySelected ? "bg-[#03a9f4]" : "bg-white")}>
                    {allDaySelected && <Check className="h-3 w-3 text-white stroke-[4px]" />}
                  </div>
                )}
                <span className="font-bold uppercase tracking-tight text-gray-500">{date === new Date().toDateString() ? 'Today' : (date.includes('Mon') ? 'Yesterday' : formatDate(new Date(date)))}</span>
                {isBulkMode && entriesAreSelected && (
                  <div className="flex items-center space-x-3 ml-4">
                    <button onClick={() => setShowBulkEditModal(true)} className="text-[#03a9f4] font-bold uppercase text-[10px] tracking-widest hover:underline cursor-pointer">Bulk Edit</button>
                    <button className="text-red-500 font-bold uppercase text-[10px] tracking-widest hover:underline cursor-pointer" onClick={() => setShowBulkDeleteConfirm(true)}>Delete</button>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-[11px] text-gray-400 uppercase tracking-widest font-bold">Total:</span>
                <span className="text-[16px] font-bold text-gray-800 tracking-tight tabular-nums">{formatTime(total)}</span>
                <div className="relative group ml-1 flex items-center">
                  <button onClick={() => setIsBulkMode(!isBulkMode)} className={cn("group/bulk p-1.5 rounded transition-all cursor-pointer", isBulkMode ? "bg-[#03a9f4] text-white" : "text-gray-500 hover:bg-white hover:text-[#03a9f4] hover:shadow-sm")}>
                    <ListChecks className="h-[18px] w-[18px] stroke-[1.5px]" />
                    <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[11px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover/bulk:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      Bulk edit
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white border-x border-b border-gray-200">
              {dayEntries.map((item, index) => {
                const startTime = new Date(item.startTime)
                const endTime = item.endTime ? new Date(item.endTime) : null
                const isSelected = selectedIds.includes(item.id)

                return (
                  <div key={item.id} className={cn("group flex items-center px-4 pe-0 py-0 hover:bg-[#fcfdfe] transition-colors min-h-[54px] relative", index !== dayEntries.length - 1 && "border-b border-gray-100", isSelected && "bg-[#f2f9ff]")}>
                    {isBulkMode && (
                      <div className="flex items-center pr-4">
                        <div onClick={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])} className={cn("w-4 h-4 rounded border border-[#03a9f4] flex items-center justify-center cursor-pointer transition-colors", isSelected ? "bg-[#03a9f4]" : "bg-white")}>
                          {isSelected && <Check className="h-3 w-3 text-white stroke-[3px]" />}
                        </div>
                      </div>
                    )}
                    <div className="flex-[4] min-w-0 mr-4">
                      <input type="text" defaultValue={item.description} onBlur={(e) => updateTimeEntry(item.id, { description: e.target.value })} className="w-full text-[14px] font-normal bg-transparent border-none focus:ring-0 py-2.5 px-0 truncate outline-none text-gray-800 placeholder-gray-300 leading-normal" placeholder="What have you worked on?" />
                    </div>
                    <div className="flex-[3] min-w-0 px-4 border-l border-dotted border-gray-200 self-stretch flex items-center"><ProjectPicker selectedProjectId={item.projectId} onSelect={(pid) => updateTimeEntry(item.id, { projectId: pid })} onClear={() => updateTimeEntry(item.id, { projectId: undefined })} /></div>

                    <div className="flex items-center space-x-0 self-stretch flex-shrink-0">
                      <div className="flex items-center space-x-6 px-4 border-l border-dotted border-gray-200 h-full">
                        <div className="relative group/billable flex items-center justify-center">
                          <DollarSign
                            onClick={() => updateTimeEntry(item.id, { billable: !item.billable })}
                            className={cn("h-[18px] w-[18px] stroke-[1.2px] cursor-pointer transition-colors", item.billable ? "text-[#03a9f4]" : "text-gray-300 hover:text-gray-600")}
                          />
                          <div className="absolute top-1/2 -translate-y-1/2 left-full ml-1.5 bg-gray-900 text-white text-[11px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover/billable:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {item.billable ? 'Billable' : 'Non-billable'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 text-[13px] text-gray-700 px-4 border-l border-dotted border-gray-200 h-full text-center">
                        <CalendarPicker date={startTime} onChange={() => { }} triggerContent={
                          <Calendar className="h-4 w-4 text-gray-400 stroke-[1.2px] hover:text-[#03a9f4] cursor-pointer transition-colors" />
                        } />
                      </div>

                      {/* Editable Duration Input */}
                      <div className="w-[80px] border-l border-dotted border-gray-200 h-full flex items-center justify-center">
                        <input
                          type="text"
                          defaultValue={formatTime(item.duration || 0)}
                          onBlur={(e) => {
                            const newSeconds = parseTime(e.target.value)
                            updateTimeEntry(item.id, { duration: newSeconds })
                          }}
                          className="w-full text-center text-[17px] font-bold text-gray-900 bg-transparent border-none focus:ring-0 p-0 outline-none hover:underline cursor-pointer tabular-nums"
                        />
                      </div>

                      <div className="flex items-center space-x-2 px-4 border-l border-dotted border-gray-200 h-full">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><button className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"><MoreHorizontal className="h-4 w-4 stroke-[1.2px]" /></button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[120px] shadow-2xl bg-white border border-gray-100 rounded-sm">
                            <DropdownMenuItem className="py-2.5 text-[11px] font-bold uppercase tracking-widest cursor-pointer hover:bg-gray-50">Duplicate</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500 py-2.5 text-[11px] font-bold uppercase tracking-widest cursor-pointer hover:bg-red-50" onClick={() => setDeleteId(item.id)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
      {showBulkEditModal && (
        <BulkEditModal
          entryCount={selectedIds.length}
          onClose={() => setShowBulkEditModal(false)}
          onSave={() => {
            // Mock empty save logic
            setShowBulkEditModal(false)
            setSelectedIds([])
          }}
        />
      )}
    </div>
  )
}
