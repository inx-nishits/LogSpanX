'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth
} from 'date-fns'
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

  const getDaysInMonth = () => {
    const days = eachDayOfInterval({
      start: startOfWeek(startOfMonth(currentView), { weekStartsOn: 0 }),
      end: endOfWeek(endOfMonth(currentView), { weekStartsOn: 0 })
    })
    return days
  }

  const handleDayClick = (day: Date) => {
    onChange(day)
    setIsOpen(false)
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
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45 transform z-0" />
          
          <div className="relative bg-white z-10">
            <div className="flex items-center justify-between px-1 py-1 mb-2">
              <button 
                onClick={() => setCurrentView(subMonths(currentView, 1))}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-800 border-none bg-transparent"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5px]" />
              </button>
              <div className="text-[13px] font-bold text-gray-800">
                {format(currentView, 'MMM yyyy')}
              </div>
              <button 
                onClick={() => setCurrentView(addMonths(currentView, 1))}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-800 border-none bg-transparent"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5px]" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0 mb-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-[12px] font-bold text-gray-800 py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1 gap-x-0">
              {days.map((day, i) => {
                const isSelected = isSameDay(day, date)
                const isCurrentMonth = isSameMonth(day, currentView)
                
                return (
                  <div key={i} className="flex justify-center">
                    <button 
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        "w-7 h-7 text-[12px] flex items-center justify-center font-medium rounded-sm transition-colors border-none bg-transparent",
                        isSelected ? "bg-[#3f88c5] text-white" : 
                        !isCurrentMonth ? "text-gray-300" : "text-gray-600 hover:bg-gray-100 cursor-pointer"
                      )}
                    >
                      {format(day, 'd')}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
