'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Pencil, MoreVertical, Check, X, ChevronDown, Archive, Trash2, ArchiveRestore } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDataStore } from '@/lib/stores/data-store'

type ShowFilter = 'active' | 'archived' | 'all'

// ─── Show filter dropdown ─────────────────────────────────────────────────────
function ShowDropdown({ value, onChange }: { value: ShowFilter; onChange: (v: ShowFilter) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const OPTIONS: { value: ShowFilter; label: string }[] = [
    { value: 'active', label: 'Show active' },
    { value: 'archived', label: 'Show archived' },
    { value: 'all', label: 'Show all' },
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 h-[32px] text-[15px] text-[#555] bg-white border border-[#d0d8de] rounded hover:border-[#aaa] cursor-pointer"
      >
        {OPTIONS.find(o => o.value === value)?.label}
        <ChevronDown className="h-3 w-3 text-[#aaa]" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-0.5 bg-white border border-[#ddd] shadow-lg z-50 min-w-[150px] py-0.5">
          {OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={cn(
                'w-full text-left px-4 py-2 text-[15px] cursor-pointer transition-colors',
                value === opt.value ? 'bg-[#03a9f4] text-white' : 'text-[#555] hover:bg-[#f0f4f8]'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Row more menu ────────────────────────────────────────────────────────────
function MoreMenu({ archived, onEdit, onArchive, onDelete }: {
  archived: boolean
  onEdit: () => void
  onArchive: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="p-1.5 text-[#ccc] hover:text-[#555] cursor-pointer transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-0.5 bg-white border border-[#ddd] shadow-lg z-50 min-w-[140px] py-0.5">
          <button
            onClick={() => { onEdit(); setOpen(false) }}
            className="w-full text-left px-4 py-2 text-[15px] text-[#555] hover:bg-[#f0f4f8] cursor-pointer flex items-center gap-2"
          >
            <Pencil className="h-3.5 w-3.5 text-[#aaa]" /> Edit
          </button>
          <button
            onClick={() => { onArchive(); setOpen(false) }}
            className="w-full text-left px-4 py-2 text-[15px] text-[#555] hover:bg-[#f0f4f8] cursor-pointer flex items-center gap-2"
          >
            {archived
              ? <><ArchiveRestore className="h-3.5 w-3.5 text-[#aaa]" /> Restore</>
              : <><Archive className="h-3.5 w-3.5 text-[#aaa]" /> Archive</>
            }
          </button>
          <button
            onClick={() => { onDelete(); setOpen(false) }}
            className="w-full text-left px-4 py-2 text-[15px] text-red-500 hover:bg-red-50 cursor-pointer flex items-center gap-2"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TagsPage() {
  const { tags, createTag, updateTag, deleteTag } = useDataStore()
  const [showFilter, setShowFilter] = useState<ShowFilter>('active')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced search
  const handleSearchChange = (val: string) => {
    setSearchInput(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setSearchQuery(val), 300)
  }

  // Filtered list
  const visible = tags
    .filter(t => {
      if (showFilter === 'active') return !t.archived
      if (showFilter === 'archived') return t.archived
      return true
    })
    .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  // Add tag
  const handleAdd = () => {
    const name = newTagName.trim()
    if (!name) return
    void createTag(name)
    setNewTagName('')
  }

  // Inline edit save
  const handleEditSave = (id: string) => {
    const name = editingName.trim()
    if (!name) { setEditingId(null); return }
    void updateTag(id, { name })
    setEditingId(null)
  }

  // Archive toggle
  const handleArchive = (id: string) => {
    const target = tags.find((tag) => tag.id === id)
    if (!target) return
    void updateTag(id, { archived: !target.archived })
  }

  // Delete
  const handleDelete = (id: string) => {
    void deleteTag(id)
    setSelected(prev => prev.filter(s => s !== id))
  }

  // Select all visible
  const allSelected = visible.length > 0 && visible.every(t => selected.includes(t.id))
  const toggleAll = () => {
    if (allSelected) setSelected(prev => prev.filter(id => !visible.find(t => t.id === id)))
    else setSelected(prev => [...new Set([...prev, ...visible.map(t => t.id)])])
  }
  const toggleOne = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  return (
    <div className="min-h-full bg-[#f2f6f8] p-6">
      {/* Page title */}
      <h1 className="text-[22px] font-normal text-[#333] mb-5">Tags</h1>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <ShowDropdown value={showFilter} onChange={setShowFilter} />

        {/* Search with debounce */}
        <div className="flex items-center gap-2 px-3 h-[32px] bg-white border border-[#d0d8de] rounded min-w-[220px]">
          <Search className="h-3.5 w-3.5 text-[#bbb] flex-shrink-0" />
          <input
            value={searchInput}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search by name"
            className="flex-1 text-[15px] outline-none placeholder:text-[#bbb] bg-transparent"
          />
          {searchInput && (
            <button onClick={() => { setSearchInput(''); setSearchQuery('') }} className="text-[#bbb] hover:text-[#555]">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Add new tag — right side */}
        <div className="ml-auto flex items-center gap-0">
          <input
            value={newTagName}
            onChange={e => setNewTagName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Add new tag"
            className="h-[32px] px-3 text-[15px] bg-white border border-[#d0d8de] border-r-0 rounded-l outline-none placeholder:text-[#bbb] min-w-[200px] focus:border-[#03a9f4]"
          />
          <button
            onClick={handleAdd}
            className="h-[32px] px-5 text-[15px] font-medium text-white bg-[#03a9f4] hover:bg-[#0288d1] rounded-r cursor-pointer transition-colors whitespace-nowrap"
          >
            ADD
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e4eaee]">
        {/* Section label */}
        <div className="px-4 py-2 bg-[#f5f7f9] border-b border-[#e4eaee]">
          <span className="text-[16px] text-[#999] font-medium">Tags</span>
        </div>

        {/* Header */}
        <div className="flex items-center h-[38px] border-b border-[#e4eaee] px-4">
          <div
            className={cn(
              'w-[15px] h-[15px] border flex items-center justify-center flex-shrink-0 mr-4 cursor-pointer transition-colors',
              allSelected ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-[#ccc] bg-white hover:border-[#03a9f4]'
            )}
            onClick={toggleAll}
          >
            {allSelected && <Check className="h-2.5 w-2.5 text-white stroke-[3px]" />}
          </div>
          <span className="text-[13px] font-bold text-[#aaa] uppercase tracking-wider">Name</span>
        </div>

        {/* Rows */}
        {visible.length === 0 ? (
          <div className="py-16 text-center text-[16px] text-[#aaa]">
            {searchQuery ? 'No tags match your search' : 'No tags found'}
          </div>
        ) : (
          visible.map(tag => (
            <div
              key={tag.id}
              className="flex items-center h-[50px] border-b border-[#f0f0f0] px-4 hover:bg-[#fafbfc] transition-colors group"
            >
              {/* Checkbox */}
              <div
                className={cn(
                  'w-[15px] h-[15px] border flex items-center justify-center flex-shrink-0 mr-4 cursor-pointer transition-colors',
                  selected.includes(tag.id) ? 'bg-[#03a9f4] border-[#03a9f4]' : 'border-[#ccc] bg-white hover:border-[#03a9f4]'
                )}
                onClick={() => toggleOne(tag.id)}
              >
                {selected.includes(tag.id) && <Check className="h-2.5 w-2.5 text-white stroke-[3px]" />}
              </div>

              {/* Name / inline edit */}
              {editingId === tag.id ? (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input
                    autoFocus
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleEditSave(tag.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    className="flex-1 max-w-[320px] h-[28px] px-2 text-[15px] border border-[#03a9f4] outline-none rounded-sm"
                  />
                  <button onClick={() => handleEditSave(tag.id)} className="p-1 text-[#03a9f4] hover:text-[#0288d1] cursor-pointer">
                    <Check className="h-4 w-4 stroke-[2px]" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-1 text-[#aaa] hover:text-[#555] cursor-pointer">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <span className={cn('flex-1 text-[16px] text-[#333] truncate', tag.archived && 'text-[#aaa] line-through')}>
                  {tag.name}
                </span>
              )}

              {/* Actions — always visible like in the screenshot */}
              {editingId !== tag.id && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => { setEditingId(tag.id); setEditingName(tag.name) }}
                    className="p-1.5 text-[#ccc] hover:text-[#555] cursor-pointer transition-colors"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <MoreMenu
                    archived={tag.archived}
                    onEdit={() => { setEditingId(tag.id); setEditingName(tag.name) }}
                    onArchive={() => handleArchive(tag.id)}
                    onDelete={() => handleDelete(tag.id)}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#333] text-white px-5 py-3 rounded shadow-2xl flex items-center gap-4 text-[15px] z-50">
          <span className="font-medium">{selected.length} selected</span>
          <button
            onClick={() => { selected.forEach(id => handleArchive(id)); setSelected([]) }}
            className="flex items-center gap-1.5 hover:text-[#03a9f4] cursor-pointer transition-colors"
          >
            <Archive className="h-4 w-4" /> Archive
          </button>
          <button
            onClick={() => { selected.forEach(id => handleDelete(id)); setSelected([]) }}
            className="flex items-center gap-1.5 hover:text-red-400 cursor-pointer transition-colors"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
          <button onClick={() => setSelected([])} className="text-[#aaa] hover:text-white cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
