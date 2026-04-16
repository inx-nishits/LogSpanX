'use client'

import { useState } from 'react'
import { PlusCircle, DollarSign, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDataStore } from '@/lib/stores/data-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { cn } from '@/lib/utils'
import { ProjectPicker } from './project-picker'
import { CalendarPicker } from './calendar-picker'

export function TimerBar() {
  const { user, workspace } = useAuthStore()
  const { addTimeEntry } = useDataStore()

  const [description, setDescription] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [isBillable, setIsBillable] = useState(false)

  // Manual states
  const [manualDate] = useState('Today')

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
        <div className="h-full px-5 flex items-center cursor-pointer">
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

        <div className="px-5 flex items-center h-full">
          <button onClick={() => setIsBillable(!isBillable)} className={cn("transition-all cursor-pointer group flex items-center justify-center", isBillable ? "text-[#03a9f4]" : "text-gray-300 hover:text-gray-500")}>
            <div className="relative flex items-center justify-center">
              <DollarSign className="h-[18px] w-[18px] stroke-[1.2px]" />
              <div className="absolute top-1/2 -translate-y-1/2 left-full ml-1.5 bg-gray-900 text-white text-[11px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {isBillable ? 'Billable' : 'Non-billable'}
              </div>
            </div>
          </button>
        </div>

        <div className="h-8 w-[1px] border-l border-dotted border-gray-200" />

        <div className="px-5 flex items-center justify-center space-x-2 text-[13px] text-gray-400 whitespace-nowrap transition-colors group">
          <CalendarPicker date={new Date()} onChange={() => {}} triggerContent={
            <Calendar className="h-[14px] w-[14px] text-gray-400 group-hover:text-[#03a9f4] stroke-[1.5px] transition-colors cursor-pointer" />
          } />
          <span className="bg-transparent border border-transparent group-hover:text-gray-600 rounded-sm py-0.5 transition-colors cursor-default">
            {manualDate}
          </span>
        </div>

        <div className="h-8 w-[1px] border-l border-dotted border-gray-200" />

        <div className="px-5 flex items-center justify-center h-full">
          <input type="text" defaultValue="0:00" className="text-[17px] w-[60px] font-bold text-gray-800 text-center tracking-tight bg-transparent border border-transparent hover:border-gray-200 focus:border-[#03a9f4] focus:ring-1 focus:ring-[#03a9f4] rounded-sm py-1 outline-none transition-colors cursor-text" />
        </div>

        <div className="px-2">
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
