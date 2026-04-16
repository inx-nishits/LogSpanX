'use client'

import { useState } from 'react'
import { PlusCircle, Tag as TagIcon, DollarSign, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDataStore } from '@/lib/stores/data-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { cn } from '@/lib/utils'
import { ProjectPicker } from './project-picker'
import { TagPicker } from './tag-picker'
import { CalendarPicker } from './calendar-picker'

export function TimerBar() {
  const { user, workspace } = useAuthStore()
  const { addTimeEntry } = useDataStore()

  const [description, setDescription] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [isBillable, setIsBillable] = useState(false)

  // Manual states
  const [manualStartTime, setManualStartTime] = useState('04:22 PM')
  const [manualEndTime, setManualEndTime] = useState('04:22 PM')
  const [manualDate, setManualDate] = useState('Today')

  const handleAddEntry = () => {
    alert('Entry added!')
    setDescription('')
  }

  return (
    <div className="w-full bg-white border border-gray-100 rounded-md shadow-[0_1px_4px_rgba(0,0,0,0.05)] flex items-center h-[56px]">
      {/* Description Input */}
      <div className="flex-1 flex items-center h-full px-4 min-w-0">
        <input
          type="text"
          placeholder="What have you worked on?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full text-[14px] font-normal bg-transparent border-none focus:ring-0 placeholder-gray-400 outline-none"
        />
      </div>

      {/* Action Controls Section */}
      <div className="flex items-center h-full flex-shrink-0 pr-2">
        <div className="h-full px-2 flex items-center cursor-pointer">
          <ProjectPicker 
            selectedProjectId={selectedProjectId}
            selectedTaskId={selectedTaskId}
            onSelect={(projectId, taskId) => {
              setSelectedProjectId(projectId)
              setSelectedTaskId(taskId || '')
            }}
            onClear={() => {
              setSelectedProjectId('')
              setSelectedTaskId('')
            }}
          />
        </div>

        <div className="h-8 w-[1px] border-l border-dotted border-gray-200" />

        <div className="px-5 flex items-center h-full cursor-pointer">
          <TagPicker 
            selectedTagIds={selectedTagIds}
            onToggle={(id) => setSelectedTagIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
          />
        </div>

        <div className="h-8 w-[1px] border-l border-dotted border-gray-200" />

        <button onClick={() => setIsBillable(!isBillable)} className={cn("px-5 h-full transition-all cursor-pointer group flex items-center justify-center", isBillable ? "text-[#03a9f4]" : "text-gray-300 hover:text-gray-500")}>
          <div className="relative flex items-center justify-center">
            <DollarSign className="h-[18px] w-[18px] stroke-[1.2px]" />
            <div className="absolute top-1/2 -translate-y-1/2 left-full ml-1.5 bg-gray-900 text-white text-[11px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {isBillable ? 'Billable' : 'Non-billable'}
            </div>
          </div>
        </button>

        <div className="h-8 w-[1px] border-l border-dotted border-gray-200" />

        <div className="flex items-center h-full px-4 space-x-6">
            <div className="flex items-center space-x-1 text-[13px] text-gray-700 font-medium whitespace-nowrap">
              <input type="text" value={manualStartTime} onChange={e => setManualStartTime(e.target.value)} className="w-[65px] text-center bg-transparent border border-transparent hover:border-gray-200 focus:border-[#03a9f4] focus:ring-1 focus:ring-[#03a9f4] rounded-sm py-0.5 outline-none uppercase transition-colors uppercase cursor-text" />
              <span className="text-gray-300 px-1">-</span>
              <input type="text" value={manualEndTime} onChange={e => setManualEndTime(e.target.value)} className="w-[65px] text-center bg-transparent border border-transparent hover:border-gray-200 focus:border-[#03a9f4] focus:ring-1 focus:ring-[#03a9f4] rounded-sm py-0.5 outline-none uppercase transition-colors uppercase cursor-text" />
            </div>

            <div className="flex items-center space-x-1 text-[13px] text-gray-400 whitespace-nowrap transition-colors group">
              <CalendarPicker date={new Date()} onChange={() => {}} triggerContent={
                <Calendar className="h-[14px] w-[14px] text-gray-400 group-hover:text-[#03a9f4] stroke-[1.5px] transition-colors cursor-pointer" />
              } />
              <input type="text" value={manualDate} onChange={e => setManualDate(e.target.value)} className="w-[60px] text-center bg-transparent border border-transparent group-hover:text-gray-600 hover:border-gray-200 focus:border-[#03a9f4] focus:ring-1 focus:ring-[#03a9f4] rounded-sm py-0.5 outline-none transition-colors cursor-text" />
            </div>

            <div className="h-8 w-[1px] border-l border-dotted border-gray-200 ml-2" />

            <input type="text" defaultValue="0:00" className="text-[17px] w-[70px] font-bold text-gray-800 text-center tracking-tight bg-transparent border border-transparent hover:border-gray-200 focus:border-[#03a9f4] focus:ring-1 focus:ring-[#03a9f4] rounded-sm py-1 outline-none transition-colors cursor-text" />

            <Button 
              onClick={handleAddEntry} 
              className="px-10 h-10 rounded-sm font-bold tracking-widest uppercase text-xs bg-[#03a9f4] hover:bg-[#0288d1] text-white transition-all shadow-md cursor-pointer"
            >
              ADD
            </Button>
        </div>
      </div>
    </div>
  )
}
