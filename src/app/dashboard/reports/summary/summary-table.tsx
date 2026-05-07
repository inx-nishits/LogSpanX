'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SummaryRow {
  id: string
  title: string
  color: string
  entryCount: number
  duration: number
  billable: boolean
  filterType?: 'user' | 'project' | 'lead' | 'group' | 'tag' | 'date'
  filterId?: string
  children?: SummaryRow[]
}

function fmt(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function TableRow({
  row, depth = 0, onRowClick,
}: {
  row: SummaryRow
  depth?: number
  onRowClick?: (row: SummaryRow) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = !!row.children?.length
  const clickable = !!onRowClick && !!row.filterType

  return (
    <>
      <div
        className={cn(
          'flex items-center h-[52px] border-b border-[#eef1f4] transition-colors group',
          depth === 0 ? 'bg-white' : 'bg-[#fafbfc]',
          'hover:bg-[#f5f9fc]'
        )}
        style={{ paddingLeft: `${12 + depth * 28}px`, paddingRight: '16px' }}
      >
        {/* Spacer where arrow used to be */}
        <div className="w-5 flex-shrink-0" />

        {/* Entry count badge — click to expand/collapse */}
        <div className="w-8 flex-shrink-0 flex items-center justify-center mr-3">
          <span
            onClick={hasChildren ? () => setExpanded(e => !e) : undefined}
            className={cn(
              'min-w-[22px] h-[22px] px-1.5 bg-[#e8f4fd] text-[#5b9bd5] text-[11px] font-bold rounded flex items-center justify-center tabular-nums transition-colors',
              hasChildren ? 'cursor-pointer hover:bg-[#cce4f7] hover:text-[#2a7ab8]' : 'cursor-default'
            )}
          >
            {row.entryCount}
          </span>
        </div>

        {/* Color dot */}
        <div className="w-[10px] h-[10px] rounded-full flex-shrink-0 mr-3" style={{ backgroundColor: row.color }} />

        {/* Title — click to navigate to detailed page */}
        <span
          onClick={clickable ? () => onRowClick!(row) : undefined}
          className={cn(
            'flex-1 text-[13px] truncate min-w-0 font-medium',
            clickable ? 'text-[#03a9f4] cursor-pointer hover:underline' : 'text-[#333]'
          )}
        >
          {row.title}
        </span>

        {/* Duration */}
        <span className="w-[110px] text-right text-[14px] font-bold text-[#333] tabular-nums flex-shrink-0">
          {fmt(row.duration)}
        </span>

        {/* Amount */}
        <span className="w-[120px] text-right flex-shrink-0">
          <span className="text-[14px] font-medium text-[#333]">0.00 </span>
          <span className="text-[12px] text-[#aaa]">USD</span>
        </span>
      </div>

      {expanded && hasChildren && row.children!.map(child => (
        <TableRow key={child.id} row={child} depth={depth + 1} onRowClick={onRowClick} />
      ))}
    </>
  )
}

export function SummaryTable({ rows, onRowClick }: { rows: SummaryRow[]; onRowClick?: (row: SummaryRow) => void }) {
  return (
    <div className="bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center h-[38px] border-b border-[#e4eaee] bg-[#f5f7f9] px-4 pr-4">
        <div className="w-5 flex-shrink-0" />
        <div className="w-8 flex-shrink-0 mr-3" />
        <div className="w-[10px] mr-3 flex-shrink-0" />
        <div className="flex-1 flex items-center gap-1 text-[11px] font-bold text-[#aaa] uppercase tracking-wider cursor-pointer hover:text-[#555] transition-colors">
          <ChevronDown className="h-3 w-3" />
          <span>Title</span>
        </div>
        <div className="w-[110px] text-right text-[11px] font-bold text-[#aaa] uppercase tracking-wider flex-shrink-0">
          Duration
        </div>
        <div className="w-[120px] text-right text-[11px] font-bold text-[#aaa] uppercase tracking-wider flex-shrink-0">
          Amount
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="py-16 text-center text-[14px] text-[#aaa]">No data for selected range</div>
      ) : (
        rows.map(row => <TableRow key={row.id} row={row} onRowClick={onRowClick} />)
      )}
    </div>
  )
}
