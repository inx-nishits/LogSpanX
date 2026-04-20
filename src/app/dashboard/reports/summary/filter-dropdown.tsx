'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FilterItem {
  id: string
  label: string
  group?: string
}

interface FilterDropdownProps {
  label: string
  placeholder: string
  items: FilterItem[]
  selected: string[]
  onChange: (ids: string[]) => void
  showWithout?: string
  noSearch?: boolean
}

export function FilterDropdown({ label, placeholder, items, selected, onChange, showWithout, noSearch }: FilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredItems = search
    ? items.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
    : items

  const groups: Record<string, FilterItem[]> = {}
  const ungrouped: FilterItem[] = []
  filteredItems.forEach(item => {
    if (item.group) {
      if (!groups[item.group]) groups[item.group] = []
      groups[item.group].push(item)
    } else {
      ungrouped.push(item)
    }
  })

  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id])

  const allIds = items.map(i => i.id)
  const allSelected = allIds.length > 0 && allIds.every(id => selected.includes(id))
  const hasSelected = selected.length > 0

  const CheckBox = ({ id }: { id: string }) => (
    <div
      onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(id) }}
      className={cn(
        'w-[15px] h-[15px] border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer',
        selected.includes(id) ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-[#bbb] bg-white hover:border-[#03a9f4]'
      )}
    >
      {selected.includes(id) && <Check className="h-2.5 w-2.5 text-white stroke-[3px]" />}
    </div>
  )

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-1 px-3 h-[30px] text-[13px] border rounded transition-colors cursor-pointer select-none',
          open || hasSelected
            ? 'border-[#03a9f4] text-[#03a9f4] bg-white'
            : 'border-[#d0d8de] text-[#555] bg-white hover:border-[#aaa]'
        )}
      >
        {label}
        {hasSelected && (
          <span className="ml-1 bg-[#03a9f4] text-white text-[10px] font-bold rounded-full w-[16px] h-[16px] flex items-center justify-center leading-none">
            {selected.length}
          </span>
        )}
        <ChevronDown className="h-3 w-3 text-[#aaa] ml-0.5" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-0.5 bg-white border border-[#ddd] shadow-lg z-[300] w-[280px] flex flex-col"
          style={{ maxHeight: '340px' }}
        >
          {/* Search row */}
          {!noSearch && (
            <div className="flex items-center border-b border-[#eee] px-2 py-1.5">
              <Search className="h-3.5 w-3.5 text-[#bbb] flex-shrink-0 mr-1.5" />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={placeholder}
                className="flex-1 text-[13px] outline-none placeholder:text-[#bbb] bg-transparent"
              />
            </div>
          )}

          {/* SHOW / Active header */}
          {!noSearch && (
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#eee]">
              <span className="text-[11px] font-semibold text-[#aaa] uppercase tracking-wider">Show</span>
              <button className="flex items-center gap-0.5 text-[12px] text-[#555] hover:text-[#03a9f4] cursor-pointer">
                Active <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Scrollable list with left blue indicator */}
          <div className="overflow-y-auto flex-1 relative" style={{ maxHeight: '240px' }}>
            {/* Left blue scroll indicator bar */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#03a9f4]" />

            {/* Select all */}
            <div
              className="flex items-center gap-2.5 pl-4 pr-3 py-[7px] hover:bg-[#f5f7f9] cursor-pointer"
              onClick={() => onChange(allSelected ? [] : allIds)}
            >
              <div className={cn(
                'w-[15px] h-[15px] border flex items-center justify-center flex-shrink-0 transition-colors',
                allSelected ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-[#bbb] bg-white'
              )}>
                {allSelected && <Check className="h-2.5 w-2.5 text-white stroke-[3px]" />}
              </div>
              <span className="text-[13px] text-[#333]">Select all</span>
            </div>

            {/* Without option */}
            {showWithout && (
              <div
                className="flex items-center gap-2.5 pl-4 pr-3 py-[7px] hover:bg-[#f5f7f9] cursor-pointer"
                onClick={() => toggle('__without__')}
              >
                <div className={cn(
                  'w-[15px] h-[15px] border flex items-center justify-center flex-shrink-0',
                  selected.includes('__without__') ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-[#bbb] bg-white'
                )}>
                  {selected.includes('__without__') && <Check className="h-2.5 w-2.5 text-white stroke-[3px]" />}
                </div>
                <span className="text-[13px] text-[#333]">{showWithout}</span>
              </div>
            )}

            {/* Grouped items */}
            {Object.entries(groups).map(([group, groupItems]) => (
              <div key={group}>
                <div className="pl-4 pr-3 pt-2 pb-0.5 text-[10px] font-bold text-[#aaa] uppercase tracking-widest">
                  {group}
                </div>
                {groupItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2.5 pl-4 pr-3 py-[7px] hover:bg-[#f5f7f9] cursor-pointer"
                    onClick={() => toggle(item.id)}
                  >
                    <CheckBox id={item.id} />
                    <span className="text-[13px] text-[#333] truncate">{item.label}</span>
                  </div>
                ))}
              </div>
            ))}

            {/* Ungrouped items */}
            {ungrouped.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-2.5 pl-4 pr-3 py-[7px] hover:bg-[#f5f7f9] cursor-pointer"
                onClick={() => toggle(item.id)}
              >
                <CheckBox id={item.id} />
                <span className="text-[13px] text-[#333] truncate">{item.label}</span>
              </div>
            ))}

            {filteredItems.length === 0 && ungrouped.length === 0 && (
              <div className="pl-4 py-4 text-[13px] text-[#aaa]">No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
