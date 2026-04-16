'use client'

import React, { useState } from 'react'
import { X, Calendar as CalendarIcon, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface BulkEditModalProps {
  entryCount: number
  onClose: () => void
  onSave: () => void
}

export function BulkEditModal({ entryCount, onClose, onSave }: BulkEditModalProps) {
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({
    description: false,
    project: false,
    tags: false,
    billable: false,
    time: false,
    date: false
  })

  const [tagAction, setTagAction] = useState<'add' | 'overwrite'>('add')
  const [isBillable, setIsBillable] = useState(false)

  const toggleField = (field: string) => {
    setSelectedFields(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const CheckboxUI = ({ checked, onClick }: { checked: boolean, onClick: () => void }) => (
    <div 
      onClick={onClick}
      className={cn(
        "w-4 h-4 rounded-sm border flex items-center justify-center cursor-pointer transition-colors flex-shrink-0",
        checked ? "bg-[#03a9f4] border-[#03a9f4]" : "bg-white border-gray-300"
      )}
    >
      {checked && <Check className="w-3 h-3 text-white stroke-[3px]" />}
    </div>
  )

  const Row = ({ 
    id, 
    label, 
    children, 
    extraHeight = false 
  }: { 
    id: string, 
    label: string, 
    children: React.ReactNode, 
    extraHeight?: boolean 
  }) => (
    <div className={cn(
        "flex border-b border-gray-100 transition-colors", 
        selectedFields[id] ? "bg-[#f2f9ff]/40" : "hover:bg-gray-50/50",
        extraHeight ? "py-4 items-start" : "items-center min-h-[64px] py-1"
      )}>
      <div className="w-[120px] flex items-center px-6 gap-3">
        <CheckboxUI checked={selectedFields[id]} onClick={() => toggleField(id)} />
        <span className={cn("text-[13px] font-medium", selectedFields[id] ? "text-gray-900" : "text-gray-500")}>{label}</span>
      </div>
      <div className="flex-1 px-4 pr-6">
        <div className={cn("transition-opacity duration-200", !selectedFields[id] && "opacity-40 pointer-events-none")}>
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
              placeholder="Add description..." 
              className="h-[36px] text-[13px] bg-white border-[#d7e2ea] focus-visible:ring-1 focus-visible:ring-[#03a9f4] rounded-sm shadow-none w-full placeholder-gray-400 text-gray-800"
            />
          </Row>

          <Row id="project" label="Project">
            <div className="relative">
              <select className="h-[36px] w-full text-[13px] text-gray-600 border border-[#d7e2ea] rounded-sm outline-none appearance-none px-3 py-1 focus:ring-1 focus:ring-[#03a9f4] bg-white cursor-pointer font-medium hover:border-gray-300 transition-colors">
                <option value="">Select Project</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5L9 1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </Row>

          <Row id="tags" label="Tags" extraHeight={true}>
            <div className="flex flex-col gap-4 w-full">
              <div className="relative">
                <select className="h-[36px] w-full text-[13px] text-gray-600 border border-[#d7e2ea] rounded-sm outline-none appearance-none px-3 py-1 focus:ring-1 focus:ring-[#03a9f4] bg-white cursor-pointer font-medium hover:border-gray-300 transition-colors">
                  <option value="">Select tags</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className="flex items-center gap-6 pl-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={cn("w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm", tagAction === 'add' ? 'border-[#03a9f4] bg-white' : 'border-gray-300 bg-white group-hover:border-[#03a9f4]')}>
                    {tagAction === 'add' && <div className="w-1.5 h-1.5 rounded-full bg-[#03a9f4]" />}
                  </div>
                  <span className={cn("text-[12px] font-medium transition-colors", tagAction === 'add' ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700')}>Add to existing</span>
                  <input type="radio" className="hidden" checked={tagAction === 'add'} onChange={() => setTagAction('add')} />
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={cn("w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm", tagAction === 'overwrite' ? 'border-[#03a9f4] bg-white' : 'border-gray-300 bg-white group-hover:border-[#03a9f4]')}>
                    {tagAction === 'overwrite' && <div className="w-1.5 h-1.5 rounded-full bg-[#03a9f4]" />}
                  </div>
                  <span className={cn("text-[12px] font-medium transition-colors", tagAction === 'overwrite' ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700')}>Overwrite existing</span>
                  <input type="radio" className="hidden" checked={tagAction === 'overwrite'} onChange={() => setTagAction('overwrite')} />
                </label>
              </div>
            </div>
          </Row>

          <Row id="billable" label="Billable">
            <div className="flex items-center gap-3 h-[36px]">
              <button 
                onClick={() => setIsBillable(!isBillable)}
                className={cn(
                  "w-9 h-[22px] rounded-full relative transition-colors duration-200 ease-in-out cursor-pointer shadow-inner",
                  isBillable ? "bg-[#03a9f4]" : "bg-gray-200 hover:bg-gray-300"
                )}
              >
                <div className={cn(
                  "w-[18px] h-[18px] bg-white rounded-full absolute top-[2px] transition-transform duration-200 ease-out shadow-[0_1px_2px_rgba(0,0,0,0.2)]",
                  isBillable ? "translate-x-[16px]" : "translate-x-[2px]"
                )} />
              </button>
              <span className={cn("text-[13px] font-bold w-6", isBillable ? "text-[#03a9f4]" : "text-gray-400")}>{isBillable ? 'YES' : 'NO'}</span>
            </div>
          </Row>

          <Row id="time" label="Time">
            <div className="flex items-center gap-2 h-[36px]">
              <Input 
                defaultValue="11:22 PM" 
                className="h-[36px] w-[100px] text-center text-[13px] font-medium text-gray-800 bg-white border-[#d7e2ea] shadow-none focus-visible:ring-1 focus-visible:ring-[#03a9f4] rounded-sm"
              />
              <span className="text-gray-400 font-medium px-1">-</span>
              <Input 
                defaultValue="12:22 AM" 
                className="h-[36px] w-[100px] text-center text-[13px] font-medium text-gray-800 bg-white border-[#d7e2ea] shadow-none focus-visible:ring-1 focus-visible:ring-[#03a9f4] rounded-sm"
              />
              <span className="text-[12px] text-gray-400 font-bold ml-1 bg-gray-100 px-1.5 py-0.5 rounded-sm">+1</span>
            </div>
          </Row>

          <Row id="date" label="Date">
            <div className="flex items-center h-[36px] relative w-[160px]">
              <Input 
                defaultValue="04/15/2026" 
                className="h-[36px] w-full pl-9 pr-3 text-[13px] font-medium text-gray-800 bg-white border-[#d7e2ea] shadow-none focus-visible:ring-1 focus-visible:ring-[#03a9f4] rounded-sm"
              />
              <CalendarIcon className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
            </div>
          </Row>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-[#f2f6f8] border-t border-gray-100 space-x-3">
          <Button variant="ghost" onClick={onClose} className="text-gray-500 font-bold uppercase tracking-widest text-[11px] hover:bg-gray-200/60 transition-colors px-4 rounded-sm cursor-pointer">
            Cancel
          </Button>
          <Button onClick={onSave} className="bg-[#03a9f4] hover:bg-[#0288d1] text-white font-bold uppercase tracking-widest text-[11px] px-8 py-2 h-[34px] rounded-sm shadow-sm cursor-pointer transition-colors">
            Save
          </Button>
        </div>

      </div>
    </div>
  )
}
