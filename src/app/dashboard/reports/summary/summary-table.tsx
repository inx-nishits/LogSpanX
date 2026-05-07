'use client'

import { useState } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
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

// shared column widths
const COL = {
  badge: 'w-8 flex-shrink-0 mr-4',
  dot: 'w-[10px] flex-shrink-0 mr-3',
  duration: 'w-[110px] flex-shrink-0',
  amount: 'w-[120px] flex-shrink-0',
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
          'flex items-center h-[60px] border-b border-[#eef1f4] transition-all group relative bg-white',
          'hover:shadow-[0_2px_8px_rgba(0,0,0,0.10)] hover:z-10'
        )}
        style={{ paddingLeft: `${16 + depth * 28}px`, paddingRight: '16px' }}
      >
        {/* Entry count badge */}
        <div className={COL.badge + ' flex items-center justify-center'}>
          <span
            onClick={hasChildren ? () => setExpanded(e => !e) : undefined}
            className={cn(
              'min-w-[24px] h-[24px] px-1.5 bg-[#e8f4fd] text-[#5b9bd5] text-[12px] font-bold rounded flex items-center justify-center tabular-nums transition-colors',
              hasChildren ? 'cursor-pointer hover:bg-[#cce4f7] hover:text-[#2a7ab8]' : 'cursor-default'
            )}
          >
            {row.entryCount}
          </span>
        </div>

        {/* Color dot */}
        <div className={COL.dot + ' h-[10px] rounded-full'} style={{ backgroundColor: row.color }} />

        {/* Title */}
        <span
          onClick={clickable ? () => onRowClick!(row) : undefined}
          className={cn(
            'flex-1 text-[13px] truncate min-w-0',
            clickable ? 'text-[#03a9f4] cursor-pointer' : 'text-[#333]'
          )}
        >
          {row.title}
        </span>

        {/* Duration */}
        <span className={COL.duration + ' text-right text-[13px] font-normal text-[#555] tabular-nums'}>
          {fmt(row.duration)}
        </span>

        {/* Amount */}
        <span className={COL.amount + ' text-right'}>
          <span className="text-[13px] font-bold text-[#333]">0.00 </span>
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
  const [sortField, setSortField] = useState<'title' | 'duration'>('title')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const sorted = [...rows].sort((a, b) => {
    if (sortField === 'title') {
      return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    }
    return sortOrder === 'asc' ? a.duration - b.duration : b.duration - a.duration
  })

  const toggleSort = (field: 'title' | 'duration') => {
    if (sortField === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortOrder('asc') }
  }

  return (
    <div className="bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center h-[38px] border-b border-[#e4eaee] bg-[#f5f7f9] px-4">
        <div className={COL.badge} />
        <div className={COL.dot} />
        <button
          onClick={() => toggleSort('title')}
          className="flex-1 flex items-center gap-1 text-[11px] font-bold text-[#aaa] uppercase tracking-wider hover:text-[#555] transition-colors cursor-pointer"
        >
          <span>Title</span>
          {sortField === 'title' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
        </button>
        <button
          onClick={() => toggleSort('duration')}
          className={COL.duration + ' text-right text-[11px] font-bold uppercase tracking-wider hover:text-[#555] transition-colors cursor-pointer flex items-center justify-end gap-1 ' + (sortField === 'duration' ? 'text-[#555]' : 'text-[#aaa]')}
        >
          <span>Duration</span>
          {sortField === 'duration' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
        </button>
        <div className={COL.amount + ' text-right text-[11px] font-bold text-[#aaa] uppercase tracking-wider'}>
          Amount
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="py-16 text-center text-[14px] text-[#aaa]">No data for selected range</div>
      ) : (
        sorted.map(row => <TableRow key={row.id} row={row} onRowClick={onRowClick} />)
      )}
    </div>
  )
}
