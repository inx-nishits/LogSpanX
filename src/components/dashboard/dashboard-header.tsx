'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { User } from '@/lib/types'
import { useState, useRef, useEffect } from 'react'
import { addDays, addWeeks, isSameDay } from 'date-fns'
import { DateRangePicker } from './date-range-picker'

interface DateRange {
    from: Date
    to: Date
}

interface DashboardHeaderProps {
    role: User['role']
    filters: { viewBy: string; teamScope: string; groupBy: string }
    onFilterChange: (filters: { viewBy?: string; teamScope?: string; groupBy?: string }) => void
    currentRange: DateRange
    onRangeChange: (range: DateRange) => void
}

function FilterDropdown({
    options,
    defaultValue,
    onChange
}: {
    options: { value: string; label: string }[]
    defaultValue: string
    onChange: (v: string) => void
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [selected, setSelected] = useState(defaultValue)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const selectedLabel = options.find(o => o.value === selected)?.label || ''

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium rounded-sm border cursor-pointer transition-colors
          ${isOpen
                        ? 'border-[#03a9f4] text-[#03a9f4] bg-white'
                        : 'border-[#d0d8de] text-[#555] bg-white hover:border-[#03a9f4] hover:text-[#03a9f4]'
                    }
        `}
            >
                {selectedLabel}
                <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-[#e4eaee] rounded-sm shadow-lg z-50 min-w-[140px] py-0.5">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => { setSelected(opt.value); onChange(opt.value); setIsOpen(false) }}
                            className={`
                w-full text-left px-4 py-2 text-[13px] transition-colors cursor-pointer
                ${selected === opt.value
                                    ? 'bg-[#03a9f4] text-white font-medium'
                                    : 'text-[#555] hover:bg-[#f0f4f8]'
                                }
              `}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export function DashboardHeader({ role, filters, onFilterChange, currentRange, onRangeChange }: DashboardHeaderProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-[20px] font-normal text-[#333]">Dashboard</h1>

            <div className="flex flex-wrap items-center gap-2">
                <FilterDropdown
                    options={[
                        { value: 'project', label: 'Project' },
                        { value: 'billability', label: 'Billability' },
                    ]}
                    defaultValue={filters.viewBy}
                    onChange={(v) => onFilterChange({ viewBy: v })}
                />

                <FilterDropdown
                    options={[
                        { value: 'time', label: 'By Time' },
                        { value: 'task', label: 'By Tasks' },
                    ]}
                    defaultValue={filters.groupBy}
                    onChange={(v) => onFilterChange({ groupBy: v })}
                />

                <FilterDropdown
                    options={[
                        { value: 'team', label: 'Team' },
                        { value: 'only-me', label: 'Only me' },
                    ]}
                    defaultValue={filters.teamScope}
                    onChange={(v) => onFilterChange({ teamScope: v })}
                />

                <div className="flex items-center gap-0 ml-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-[32px] w-8 text-[#999] hover:bg-[#f0f4f8] rounded-sm rounded-r-none border border-[#d0d8de] border-r-0 bg-white"
                        onClick={() => {
                            const isSingleDay = isSameDay(currentRange.from, currentRange.to)
                            if (isSingleDay) {
                                const newDate = addDays(currentRange.from, -1)
                                onRangeChange({ from: newDate, to: newDate })
                            } else {
                                const newRange = { from: addWeeks(currentRange.from, -1), to: addWeeks(currentRange.to, -1) }
                                onRangeChange(newRange)
                            }
                        }}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <DateRangePicker
                        initialRange={currentRange}
                        onRangeChange={onRangeChange}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-[32px] w-8 text-[#999] hover:bg-[#f0f4f8] rounded-sm rounded-l-none border border-[#d0d8de] border-l-0 bg-white"
                        onClick={() => {
                            const isSingleDay = isSameDay(currentRange.from, currentRange.to)
                            if (isSingleDay) {
                                const newDate = addDays(currentRange.from, 1)
                                onRangeChange({ from: newDate, to: newDate })
                            } else {
                                const newRange = { from: addWeeks(currentRange.from, 1), to: addWeeks(currentRange.to, 1) }
                                onRangeChange(newRange)
                            }
                        }}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
