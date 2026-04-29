'use client'

import React, { useState } from 'react'
import { X, Calendar as CalendarIcon, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useDataStore } from '@/lib/stores/data-store'

interface BulkEditModalProps {
  entryIds: string[]
  entryCount: number
  onClose: () => void
  onSave: () => void
}

export function BulkEditModal({ entryIds, entryCount, onClose, onSave }: BulkEditModalProps) {
  const { projects, tags, updateTimeEntries } = useDataStore()

  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({
    description: false,
    project: false,
    tags: false,
    billable: false,
  })

  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [tagAction, setTagAction] = useState<'add' | 'overwrite'>('add')
  const [isBillable, setIsBillable] = useState(false)

  const toggleField = (field: string) => {
    setSelectedFields(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSave = async () => {
    const updates: Record<string, unknown> = {}
    if (selectedFields.description) updates.description = description
    if (selectedFields.project) updates.projectId = projectId || undefined
    if (selectedFields.tags) updates.tagIds = selectedTagIds
    if (selectedFields.billable) updates.billable = isBillable

    if (Object.keys(updates).length > 0) {
      await updateTimeEntries(entryIds, updates)
    }
    onSave()
  }

  const CheckboxUI = ({ checked, onClick }: { checked: boolean; onClick: () => void }) => (
    <div
      onClick={onClick}
      className={cn(
        'w-4 h-4 rounded-sm border flex items-center justify-center cursor-pointer transition-colors flex-shrink-0',
        checked ? 'bg-[#03a9f4] border-[#03a9f4]' : 'bg-white border-gray-300'
      )}
    >
      {checked && <Check className="w-3 h-3 text-white stroke-[3px]" />}
    </div>
  )

  const Row = ({
    id,
    label,
    children,
    extraHeight = false,
  }: {
    id: string
    label: string
    children: React.ReactNode
    extraHeight?: boolean
  }) => (
    <div className={cn(
      'flex border-b border-gray-100 transition-colors',
      selectedFields[id] ? 'bg-[#f2f9ff]/40' : 'hover:bg-gray-50/50',
      extraHeight ? 'py-4 items-start' : 'items-center min-h-[64px] py-1'
    )}>
      <div className="w-[120px] flex items-center px-6 gap-3">
        <CheckboxUI checked={selectedFields[id]} onClick={() => toggleField(id)} />
        <span className={cn('text-[13px] font-medium', selectedFields[id] ? 'text-gray-900' : 'text-gray-500')}>{label}</span>
      </div>
      <div className="flex-1 px-4 pr-6">
        <div className={cn('transition-opacity duration-200', !selectedFields[id] && 'opacity-40 pointer-events-none')}>
          {children}
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-in fade-in duration-200 backdrop-blur-[1px]">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-[500px] flex flex-col font-sans mb-10 overflow-hidden border border-gray-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <h2 className="text-[16px] text-gray-800 font-bold tracking-tight">Bulk edit {entryCount} entries</h2>
          <button onClick={onClose} className="p-1 rounded-sm text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
            <X className="w-4 h-4 stroke-[2px]" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex flex-col flex-1 overflow-y-auto bg-white">

          <Row id="description" label="Description">
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add description..."
              className="h-[36px] text-[13px] bg-white border-[#d7e2ea] focus-visible:ring-1 focus-visible:ring-[#03a9f4] rounded-sm shadow-none w-full placeholder-gray-400 text-gray-800"
            />
          </Row>

          <Row id="project" label="Project">
            <div className="relative">
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="h-[36px] w-full text-[13px] text-gray-600 border border-[#d7e2ea] rounded-sm outline-none appearance-none px-3 py-1 focus:ring-1 focus:ring-[#03a9f4] bg-white cursor-pointer font-medium hover:border-gray-300 transition-colors"
              >
                <option value="">No project</option>
                {projects.filter(p => !p.archived).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </div>
          </Row>

          <Row id="tags" label="Tags" extraHeight={true}>
            <div className="flex flex-col gap-4 w-full">
              <div className="relative">
                <select
                  multiple
                  value={selectedTagIds}
                  onChange={e => setSelectedTagIds(Array.from(e.target.selectedOptions, o => o.value))}
                  className="h-[72px] w-full text-[13px] text-gray-600 border border-[#d7e2ea] rounded-sm outline-none px-3 py-1 focus:ring-1 focus:ring-[#03a9f4] bg-white cursor-pointer"
                >
                  {tags.filter(t => !t.archived).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-6 pl-1">
                {(['add', 'overwrite'] as const).map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                    <div className={cn('w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm', tagAction === opt ? 'border-[#03a9f4] bg-white' : 'border-gray-300 bg-white group-hover:border-[#03a9f4]')}>
                      {tagAction === opt && <div className="w-1.5 h-1.5 rounded-full bg-[#03a9f4]" />}
                    </div>
                    <span className={cn('text-[12px] font-medium transition-colors', tagAction === opt ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700')}>
                      {opt === 'add' ? 'Add to existing' : 'Overwrite existing'}
                    </span>
                    <input type="radio" className="hidden" checked={tagAction === opt} onChange={() => setTagAction(opt)} />
                  </label>
                ))}
              </div>
            </div>
          </Row>

          <Row id="billable" label="Billable">
            <div className="flex items-center gap-3 h-[36px]">
              <button
                onClick={() => setIsBillable(b => !b)}
                className={cn('w-9 h-[22px] rounded-full relative transition-colors duration-200 ease-in-out cursor-pointer shadow-inner', isBillable ? 'bg-[#03a9f4]' : 'bg-gray-200 hover:bg-gray-300')}
              >
                <div className={cn('w-[18px] h-[18px] bg-white rounded-full absolute top-[2px] transition-transform duration-200 ease-out shadow-[0_1px_2px_rgba(0,0,0,0.2)]', isBillable ? 'translate-x-[16px]' : 'translate-x-[2px]')} />
              </button>
              <span className={cn('text-[13px] font-bold w-6', isBillable ? 'text-[#03a9f4]' : 'text-gray-400')}>{isBillable ? 'YES' : 'NO'}</span>
            </div>
          </Row>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-[#f2f6f8] border-t border-gray-100 space-x-3">
          <Button variant="ghost" onClick={onClose} className="text-gray-500 font-bold uppercase tracking-widest text-[11px] hover:bg-gray-200/60 transition-colors px-4 rounded-sm cursor-pointer">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-[#03a9f4] hover:bg-[#0288d1] text-white font-bold uppercase tracking-widest text-[11px] px-8 py-2 h-[34px] rounded-sm shadow-sm cursor-pointer transition-colors">
            Save
          </Button>
        </div>

      </div>
    </div>
  )
}
