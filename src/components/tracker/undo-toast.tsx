'use client'

import { useEffect, useState } from 'react'
import { X, RotateCcw } from 'lucide-react'
import { useDataStore } from '@/lib/stores/data-store'

export function UndoToast() {
  const { lastDeletedEntries, undoDelete } = useDataStore()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (lastDeletedEntries.length > 0) {
      const showTimer = setTimeout(() => setIsVisible(true), 10)
      const hideTimer = setTimeout(() => setIsVisible(false), 8000)
      return () => {
        clearTimeout(showTimer)
        clearTimeout(hideTimer)
      }
    }
  }, [lastDeletedEntries])

  if (!isVisible || lastDeletedEntries.length === 0) return null

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="bg-[#444] text-white px-6 py-3 rounded-md shadow-2xl flex items-center space-x-6 min-w-[320px]">
        <div className="flex items-center space-x-3">
          <RotateCcw className="h-4 w-4 text-[#03a9f4] stroke-[1.5px]" />
          <span className="text-[14px] font-medium tracking-tight">
            {lastDeletedEntries.length > 1 
              ? `${lastDeletedEntries.length} entries deleted.` 
              : "Time entry deleted."}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
            <button 
                onClick={() => { undoDelete(); setIsVisible(false) }}
                className="text-[#03a9f4] font-bold text-[13px] uppercase tracking-widest hover:underline px-2"
            >
                Undo
            </button>
            <button onClick={() => setIsVisible(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <X className="h-4 w-4 text-gray-400 stroke-[1.2px]" />
            </button>
        </div>
      </div>
    </div>
  )
}
