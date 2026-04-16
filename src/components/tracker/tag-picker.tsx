'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Tag as TagIcon, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDataStore } from '@/lib/stores/data-store'
import { cn } from '@/lib/utils'

interface TagPickerProps {
  selectedTagIds: string[]
  onToggle: (tagId: string) => void
}

export function TagPicker({ selectedTagIds, onToggle }: TagPickerProps) {
  const { tags } = useDataStore()
  const [search, setSearch] = useState('')

  const filteredTags = useMemo(() => {
    return tags.filter(t => 
      t.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [tags, search])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer",
          selectedTagIds.length > 0 ? "text-[#03a9f4]" : "text-gray-300"
        )}>
          <TagIcon className="h-[18px] w-[18px] stroke-[1.2px]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px] p-0 shadow-2xl bg-white border border-gray-100 rounded-sm mt-1 z-[100]">
        <div className="p-2 border-b border-gray-50 bg-gray-50/20">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-[14px] w-[14px] text-gray-400" strokeWidth={1} />
            <input
              autoFocus
              placeholder="Search tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-[#03a9f4]"
            />
          </div>
        </div>

        <div className="max-h-[250px] overflow-y-auto py-1 scrollbar-hide">
          {filteredTags.map((tag) => (
            <button
              key={tag.id}
              onClick={(e) => {
                e.preventDefault()
                onToggle(tag.id)
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer",
                selectedTagIds.includes(tag.id) && "bg-blue-50/50"
              )}
            >
              <div className="flex items-center space-x-2 truncate">
                <TagIcon className="h-[14px] w-[14px] text-gray-300 stroke-[1.2px]" />
                <span className={cn(
                  "text-sm",
                  selectedTagIds.includes(tag.id) ? "text-[#03a9f4] font-medium" : "text-gray-600"
                )}>{tag.name}</span>
              </div>
              {selectedTagIds.includes(tag.id) && (
                <Check className="h-3.5 w-3.5 text-[#03a9f4]" />
              )}
            </button>
          ))}

          {filteredTags.length === 0 && (
            <div className="px-3 py-4 text-center text-gray-400 text-xs italic">
              No tags found
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
