'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CalendarPickerProps {
  date: Date
  onChange: (date: Date) => void
  triggerContent?: React.ReactNode
}

export function CalendarPicker({ date, onChange, triggerContent }: CalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentView, setCurrentView] = useState(new Date(date))

  // Very basic mock calendar generator for visual purposes
  const getDaysInMonth = () => {
    // Generate static mockup grid pointing exactly to April 2026 from screenshot
    // Su Mo Tu We Th Fr Sa
    const days = [
      { d: 29, out: true }, { d: 30, out: true }, { d: 31, out: true }, { d: 1, out: false }, { d: 2, out: false }, { d: 3, out: false }, { d: 4, out: false },
      { d: 5, out: false }, { d: 6, out: false }, { d: 7, out: false }, { d: 8, out: false }, { d: 9, out: false }, { d: 10, out: false }, { d: 11, out: false },
      { d: 12, out: false }, { d: 13, out: false }, { d: 14, out: false }, { d: 15, out: false, selected: true }, { d: 16, out: false }, { d: 17, out: false }, { d: 18, out: false },
      { d: 19, out: false }, { d: 20, out: false }, { d: 21, out: false }, { d: 22, out: false }, { d: 23, out: false }, { d: 24, out: false }, { d: 25, out: false },
      { d: 26, out: false }, { d: 27, out: false }, { d: 28, out: false }, { d: 29, out: false }, { d: 30, out: false }, { d: 1, out: true }, { d: 2, out: true },
      { d: 3, out: true }, { d: 4, out: true }, { d: 5, out: true }, { d: 6, out: true }, { d: 7, out: true }, { d: 8, out: true }, { d: 9, out: true }
    ]
    return days
  }

  const days = getDaysInMonth()

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div className="cursor-pointer flex items-center justify-center">
          {triggerContent || <CalendarIcon className="h-4 w-4 text-gray-400 hover:text-[#03a9f4] stroke-[1.5px] transition-colors" />}
        </div>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="center" 
        sideOffset={8}
        className="bg-white rounded-md shadow-[0_4px_16px_rgba(0,0,0,0.15)] border border-gray-200 p-2 w-[220px] z-[100] animate-in fade-in slide-in-from-top-1 duration-150 overflow-visible"
      >
        <div className="relative bg-white z-10 w-full">
          {/* Triangular arrow on top - Manual implementation to match existing design */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45 transform z-0" />
          
          <div className="relative bg-white z-10">
            {/* Header */}
            <div className="flex items-center justify-between px-1 py-1 mb-2">
              <button className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-800 border-none bg-transparent">
                <ChevronLeft className="w-4 h-4 stroke-[2.5px]" />
              </button>
              <div className="text-[13px] font-bold text-gray-800">
                Apr 2026
              </div>
              <button className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-800 border-none bg-transparent">
                <ChevronRight className="w-4 h-4 stroke-[2.5px]" />
              </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-0 mb-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-[12px] font-bold text-gray-800 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-1 gap-x-0">
              {days.map((item, i) => (
                <div 
                  key={i} 
                  onClick={() => {
                      if (!item.out) {
                         setIsOpen(false)
                      }
                  }}
                  className="flex justify-center"
                >
                  <button 
                    className={cn(
                      "w-7 h-7 text-[12px] flex items-center justify-center font-medium rounded-sm transition-colors border-none bg-transparent",
                      item.selected ? "bg-[#3f88c5] text-white" : 
                      item.out ? "text-gray-300 pointer-events-none" : "text-gray-600 hover:bg-gray-100 cursor-pointer"
                    )}
                  >
                    {item.d}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
