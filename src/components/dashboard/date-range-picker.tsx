'use client'

import { useState, useRef, useEffect } from 'react'
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
    isSameMonth,
    isPast,
    addDays,
    subDays,
    startOfYear,
    endOfYear,
    isWithinInterval,
    subWeeks
} from 'date-fns'
import { ChevronLeft, ChevronRight, CalendarDays, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DateRange {
    from: Date
    to: Date
}

interface DateRangePickerProps {
    initialRange: DateRange
    onRangeChange: (range: DateRange) => void
}

const PRESETS = [
    { label: 'Today', getValue: () => ({ from: new Date(), to: new Date() }) },
    { label: 'Yesterday', getValue: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
    { label: 'This week', getValue: () => ({ from: startOfWeek(new Date(), { weekStartsOn: 1 }), to: endOfWeek(new Date(), { weekStartsOn: 1 }) }) },
    { label: 'Last week', getValue: () => ({ from: startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }), to: endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }) }) },
    { label: 'Past two weeks', getValue: () => ({ from: startOfWeek(subWeeks(new Date(), 2), { weekStartsOn: 1 }), to: endOfWeek(subWeeks(new Date(), 0), { weekStartsOn: 1 }) }) },
    { label: 'This month', getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
    { label: 'Last month', getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
    { label: 'This year', getValue: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }) },
    { label: 'Last year', getValue: () => ({ from: startOfYear(subMonths(new Date(), 12)), to: endOfYear(subMonths(new Date(), 12)) }) },
]

export function DateRangePicker({ initialRange, onRangeChange }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [range, setRange] = useState<DateRange>(initialRange)
    const [viewDate, setViewDate] = useState(startOfMonth(initialRange.from))
    const [activePreset, setActivePreset] = useState('This week')
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handlePresetClick = (preset: typeof PRESETS[0]) => {
        const newRange = preset.getValue()
        setRange(newRange)
        setActivePreset(preset.label)
        setViewDate(startOfMonth(newRange.from))
        onRangeChange(newRange)
        setIsOpen(false)
    }

    const handleDayClick = (day: Date) => {
        setActivePreset('')
        // Simple logic: if a range is already selected, start a new one. 
        // If only 'from' matches, reset. (Actually we'll do standard from-to selection)
        if (isSameDay(range.from, range.to)) {
            if (day < range.from) {
                setRange({ from: day, to: range.from })
                onRangeChange({ from: day, to: range.from })
            } else {
                setRange({ from: range.from, to: day })
                onRangeChange({ from: range.from, to: day })
            }
        } else {
            setRange({ from: day, to: day })
            onRangeChange({ from: day, to: day })
        }
    }

    const renderMonth = (monthDate: Date) => {
        const days = eachDayOfInterval({
            start: startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 }),
            end: endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 })
        })

        return (
            <div className="w-[300px]">
                <div className="flex items-center justify-center mb-4 px-2">
                    <span className="text-[14px] font-bold text-[#333]">
                        {format(monthDate, 'MMM yyyy')}
                    </span>
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                    {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                        <div key={day} className="text-center text-[11px] font-bold text-[#999] p-2">
                            {day}
                        </div>
                    ))}
                    {days.map((day, idx) => {
                        const isSelected = isSameDay(day, range.from) || isSameDay(day, range.to)
                        const isInRange = isWithinInterval(day, { start: range.from, end: range.to })
                        const isCurrentMonth = isSameMonth(day, monthDate)

                        return (
                            <button
                                key={idx}
                                onClick={() => handleDayClick(day)}
                                className={cn(
                                    "h-9 w-10 flex items-center justify-center text-[13px] relative transition-colors cursor-pointer",
                                    !isCurrentMonth ? "text-[#ccc]" : "text-[#333] hover:bg-[#f5f7f9]",
                                    isInRange && isCurrentMonth && "bg-[#f2f9ff]",
                                    isSelected && isCurrentMonth && "bg-[#4285f4] text-white hover:bg-[#4285f4] z-10"
                                )}
                            >
                                {format(day, 'd')}
                            </button>
                        )
                    })}
                </div>
            </div>
        )
    }

    const rangeDisplay = `${format(range.from, 'dd/MM/yyyy')} - ${format(range.to, 'dd/MM/yyyy')}`

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center bg-white border border-[#d0d8de] rounded-sm h-[28px] px-3 gap-3 cursor-pointer transition-colors hover:border-[#4285f4]",
                    isOpen && "border-[#4285f4]"
                )}
            >
                <CalendarDays className="h-4 w-4 text-[#999]" />
                <span className="text-[14px] font-normal text-[#333] whitespace-nowrap min-w-[170px] text-left">
                    {rangeDisplay}
                </span>
                <ChevronDown className="h-4 w-4 text-[#999]" />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-[#e4eaee] rounded-sm shadow-xl z-[100] flex animate-in fade-in slide-in-from-top-1 duration-200">
                    {/* Preset Sidebar */}
                    <div className="w-[180px] border-r border-[#e4eaee] py-2">
                        {PRESETS.map(preset => (
                            <button
                                key={preset.label}
                                onClick={() => handlePresetClick(preset)}
                                className={cn(
                                    "w-full text-left px-5 py-2.5 text-[14px] transition-colors cursor-pointer",
                                    activePreset === preset.label
                                        ? "bg-[#4285f4] text-white"
                                        : "text-[#555] hover:bg-[#f5f7f9]"
                                )}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    {/* Calendar Area */}
                    <div className="p-4 relative">
                        {/* Navigation */}
                        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
                            <button
                                onClick={() => setViewDate(subMonths(viewDate, 1))}
                                className="p-1 hover:bg-[#f5f7f9] rounded-sm transition-colors text-[#555]"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setViewDate(addMonths(viewDate, 1))}
                                className="p-1 hover:bg-[#f5f7f9] rounded-sm transition-colors text-[#555]"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex gap-8">
                            {renderMonth(viewDate)}
                            {renderMonth(addMonths(viewDate, 1))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
