'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SummaryRow {
  id: string
  title: string
  color: string
  entryCount: number
  duration: number
  billable: boolean
  children?: SummaryRow[]
}

function fmt(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function TableRow({ row, depth = 0 }: { row: SummaryRow; depth?: number }) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = !!row.children?.length

  return (
    <>
      <div
        className={cn(
          'flex items-center h-[48px] border-b border-[#f0f0f0] hover:bg-[#fafbfc] transition-colors',
          depth === 0 ? 'bg-white' : 'bg-[#fafbfc]'
        )}
        style={{ paddingLeft: `${16 + depth * 32}px`, paddingRight: '16px' }}
      >
        {/* Chevron */}
        <div className="w-5 flex-shrink-0 flex items-center">
          {hasChildren ? (
            <button onClick={() => setExpanded(e => !e)} className="text-[#aaa] hover:text-[#555] cursor-pointer p-0.5">
              {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          ) : null}
        </div>

        {/* Count badge */}
        <span className="w-7 text-center text-[12px] text-[#aaa] flex-shrink-0 mr-2 tabular-nums">
          {row.entryCount}
        </span>

        {/* Color dot */}
        <div className="w-[9px] h-[9px] rounded-full flex-shrink-0 mr-3" style={{ backgroundColor: row.color }} />

        {/* Title */}
        <span className="flex-1 text-[14px] text-[#333] truncate min-w-0">{row.title}</span>

        {/* Duration */}
        <span className="w-[120px] text-right text-[14px] font-bold text-[#333] tabular-nums flex-shrink-0">
          {fmt(row.duration)}
        </span>

        {/* Amount */}
        <span className="w-[120px] text-right text-[14px] text-[#aaa] tabular-nums flex-shrink-0">
          0.00 USD
        </span>
      </div>

      {expanded && hasChildren && row.children!.map(child => (
        <TableRow key={child.id} row={child} depth={depth + 1} />
      ))}
    </>
  )
}

export function SummaryTable({ rows }: { rows: SummaryRow[] }) {
  return (
    <div className="bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center h-[40px] border-b border-[#e4eaee] bg-[#f5f7f9] px-4 pr-4">
        <div className="w-5 flex-shrink-0" />
        <div className="w-7 flex-shrink-0 mr-2" />
        <div className="w-[9px] mr-3 flex-shrink-0" />
        <div className="flex-1 flex items-center gap-1 text-[11px] font-bold text-[#aaa] uppercase tracking-wider cursor-pointer hover:text-[#555]">
          <ChevronDown className="h-3 w-3" />
          <span>Title</span>
          <span className="text-[10px] ml-0.5">↑</span>
        </div>
        <div className="w-[120px] text-right text-[11px] font-bold text-[#aaa] uppercase tracking-wider flex-shrink-0 cursor-pointer hover:text-[#555] flex items-center justify-end gap-1">
          Duration <span className="text-[10px]">↕</span>
        </div>
        <div className="w-[120px] text-right text-[11px] font-bold text-[#aaa] uppercase tracking-wider flex-shrink-0 cursor-pointer hover:text-[#555] flex items-center justify-end gap-1">
          Amount <span className="text-[10px]">↕</span>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="py-16 text-center text-[14px] text-[#aaa]">No data for selected range</div>
      ) : (
        rows.map(row => <TableRow key={row.id} row={row} />)
      )}
    </div>
  )
}
