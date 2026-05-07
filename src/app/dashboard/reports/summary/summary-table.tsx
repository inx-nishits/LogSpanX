'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
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
          'flex items-center h-[40px] border-b border-[#f0f0f0] transition-colors group',
          depth === 0 ? 'bg-white' : 'bg-[#fafbfc]',
          clickable ? 'hover:bg-[#f0f7fb] cursor-pointer' : 'hover:bg-[#fafbfc]'
        )}
        style={{ paddingLeft: `${16 + depth * 32}px`, paddingRight: '16px' }}
        onClick={clickable ? () => onRowClick!(row) : undefined}
      >
        <div className="w-5 flex-shrink-0 flex items-center" onClick={e => e.stopPropagation()}>
          {hasChildren ? (
            <button onClick={() => setExpanded(e => !e)} className="text-[#aaa] hover:text-[#555] cursor-pointer p-0.5">
              {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          ) : null}
        </div>

        <span className="w-7 text-center text-[12px] text-[#aaa] flex-shrink-0 mr-2 tabular-nums">
          {row.entryCount}
        </span>

        <div className="w-[9px] h-[9px] rounded-full flex-shrink-0 mr-3" style={{ backgroundColor: row.color }} />

        <span className={cn(
          'flex-1 text-[13px] truncate min-w-0',
          clickable ? 'text-[#03a9f4] group-hover:underline' : 'text-[#333]'
        )}>
          {row.title}
        </span>

        {clickable && (
          <ExternalLink className="h-3.5 w-3.5 text-[#03a9f4] opacity-0 group-hover:opacity-100 flex-shrink-0 mr-2" />
        )}

        <span className="w-[120px] text-right text-[13px] font-bold text-[#333] tabular-nums flex-shrink-0">
          {fmt(row.duration)}
        </span>

        <span className="w-[120px] text-right text-[13px] text-[#aaa] tabular-nums flex-shrink-0">
          {row.billable ? '—' : '0.00 USD'}
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
      <div className="flex items-center h-[40px] border-b border-[#e4eaee] bg-[#f5f7f9] px-4 pr-4">
        <div className="w-5 flex-shrink-0" />
        <div className="w-7 flex-shrink-0 mr-2" />
        <div className="w-[9px] mr-3 flex-shrink-0" />
        <div className="flex-1 flex items-center gap-1 text-[10px] font-bold text-[#aaa] uppercase tracking-wider">
          <ChevronDown className="h-3 w-3" />
          <span>Title</span>
        </div>
        <div className="w-[120px] text-right text-[10px] font-bold text-[#aaa] uppercase tracking-wider flex-shrink-0">
          Duration
        </div>
        <div className="w-[120px] text-right text-[10px] font-bold text-[#aaa] uppercase tracking-wider flex-shrink-0">
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
