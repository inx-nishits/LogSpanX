'use client'

import { useState, useRef, useEffect } from 'react'
import { Filter, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export const ALL_FILTER_KEYS = ['Description', 'Project', 'Project Lead', 'Status', 'Tag', 'Task', 'Team'] as const
export type FilterKey = typeof ALL_FILTER_KEYS[number]

interface Props {
  visible: FilterKey[]
  onChange: (v: FilterKey[]) => void
}

export function FilterVisibilityDropdown({ visible, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const toggle = (key: FilterKey) =>
    onChange(visible.includes(key) ? visible.filter(k => k !== key) : [...visible, key])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-[14px] text-[#555] hover:text-[#333] cursor-pointer pr-4"
      >
        <Filter className="h-3.5 w-3.5" /> FILTER <ChevronDown className="h-3 w-3 text-[#aaa]" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-[#e4eaee] shadow-lg z-[300] min-w-[200px] py-1">
          {ALL_FILTER_KEYS.map(key => (
            <div
              key={key}
              onClick={() => toggle(key)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-[#f5f7f9] cursor-pointer"
            >
              <div className={cn(
                'w-[16px] h-[16px] border flex items-center justify-center flex-shrink-0 transition-colors',
                visible.includes(key) ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-[#ccc] bg-white'
              )}>
                {visible.includes(key) && <Check className="h-2.5 w-2.5 text-white stroke-[3px]" />}
              </div>
              <span className="text-[14px] text-[#333]">{key}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
