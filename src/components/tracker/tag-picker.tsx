'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Tag, Search, Check } from 'lucide-react'
import { useDataStore } from '@/lib/stores/data-store'
import { cn } from '@/lib/utils'

interface TagPickerProps {
  selectedTagIds: string[]
  onChange: (tagIds: string[]) => void
  iconSize?: number
  children?: React.ReactNode
}

export function TagPicker({ selectedTagIds, onChange, iconSize = 19, children }: TagPickerProps) {
  const { tags } = useDataStore()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (
        ref.current && !ref.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [])

  const openDropdown = (e: React.PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + window.scrollY + 6,
        right: window.innerWidth - rect.right,
      })
    }
    setOpen(o => !o)
  }

  const filtered = tags.filter(t =>
    !t.archived && t.name.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (id: string) => {
    onChange(selectedTagIds.includes(id)
      ? selectedTagIds.filter(t => t !== id)
      : [...selectedTagIds, id]
    )
  }

  const hasSelected = selectedTagIds.length > 0
  const selectedNames = selectedTagIds
    .map(id => tags.find(t => t.id === id)?.name)
    .filter(Boolean)
    .join(', ')

  return (
    <div className="relative" ref={ref}>
      {/* Trigger: chip if tags selected, icon if not */}
      {children ? (
        <div onPointerDown={openDropdown}>{children}</div>
      ) : hasSelected ? (
        <button
          type="button"
          onPointerDown={openDropdown}
          className="flex items-center gap-1 bg-[#e8f4fd] border border-[#b3d9f5] rounded px-2 py-0.5 max-w-[200px] hover:bg-[#d4ecf7] transition-colors cursor-pointer"
        >
          <span className="text-[12px] text-[#03a9f4] truncate max-w-[180px]">{selectedNames}</span>
        </button>
      ) : (
        <button
          type="button"
          onPointerDown={openDropdown}
          title="Tags"
          className="relative flex items-center justify-center text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
        >
          <Tag style={{ width: iconSize, height: iconSize }} strokeWidth={1.8} />
        </button>
      )}

      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          className="fixed bg-white border border-gray-200 shadow-2xl z-[9999] w-[260px] rounded-sm"
          style={{ top: dropdownPos.top, right: dropdownPos.right }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
            <Search className="h-[15px] w-[15px] text-gray-400 flex-shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Add/Search tags"
              className="flex-1 text-[14px] outline-none placeholder-gray-400 bg-transparent"
            />
          </div>
          <div className="max-h-[280px] overflow-y-auto py-1 scrollbar-hide">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-[13px] text-gray-400">No tags found</div>
            ) : (
              filtered.map(tag => {
                const isSelected = selectedTagIds.includes(tag.id)
                return (
                  <div
                    key={tag.id}
                    onPointerDown={e => { e.stopPropagation(); e.preventDefault(); toggle(tag.id) }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className={cn(
                      'w-[15px] h-[15px] border flex items-center justify-center flex-shrink-0 rounded-sm transition-colors',
                      isSelected ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-gray-300 bg-white'
                    )}>
                      {isSelected && <Check className="h-[10px] w-[10px] text-white stroke-[3px]" />}
                    </div>
                    <span className="text-[14px] text-gray-700">{tag.name}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
