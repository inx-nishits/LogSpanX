'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Search, Copy, MoreVertical, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TimeReportDropdown } from '../_components/time-report-dropdown'
import { TABS } from '../_components/report-shell'

const DUMMY_SHARED = [
  { id: '1', name: 'Itai project', token: '68d3a3fd72d8c', isPublic: true },
  { id: '2', name: 'Weekly Summary - InheritX', token: 'a1b2c3d4e5f6g7', isPublic: false },
  { id: '3', name: 'Billable Hours Report', token: 'x9y8z7w6v5u4t3', isPublic: true },
]

export default function SharedReportPage() {
  const pathname = usePathname()
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const filtered = DUMMY_SHARED.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(`https://logspanx.app/shared/${token}`)
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="flex flex-col h-full bg-[#f2f6f8] overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center px-6 m-6 h-[65px] bg-white border-b border-[#e4eaee] flex-shrink-0">
        <div className="flex items-center gap-1">
          <TimeReportDropdown />
          {TABS.map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'px-4 h-[56px] flex items-center text-[14px] transition-colors border-b-2 -mb-px',
                pathname === tab.href
                  ? 'text-[#333] font-bold border-b-[#333]'
                  : 'text-[#777] hover:text-[#333] border-b-transparent font-normal'
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="flex items-center gap-3 px-6 m-6 h-[65px] bg-white border-b border-[#e4eaee] flex-shrink-0">
        <button className="flex items-center gap-1.5 px-3 h-[34px] text-[14px] text-[#555] bg-white border border-[#d0d8de] rounded hover:border-[#aaa] cursor-pointer">
          All reports <ChevronDown className="h-3.5 w-3.5 text-[#aaa]" />
        </button>
        <div className="flex items-center gap-2 px-3 h-[34px] bg-white border border-[#d0d8de] rounded min-w-[240px] hover:border-[#aaa]">
          <Search className="h-4 w-4 text-[#bbb] flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name"
            className="flex-1 text-[14px] outline-none placeholder:text-[#bbb] bg-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white border border-[#e4eaee]">
          {/* Section header */}
          <div className="px-4 py-2.5 bg-[#f5f7f9] border-b border-[#e4eaee]">
            <span className="text-[13px] text-[#555] font-medium">Shared reports</span>
          </div>

          {/* Table header */}
          <div className="flex items-center h-[36px] border-b border-[#e4eaee] px-4 text-[11px] font-semibold text-[#aaa] uppercase tracking-wider">
            <div className="flex-1">Name</div>
            <div className="w-[160px] flex-shrink-0">Label</div>
            <div className="flex-1 text-right">URL</div>
            <div className="w-8 flex-shrink-0" />
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-[14px] text-[#aaa]">No shared reports found</div>
          ) : (
            filtered.map(report => (
              <div key={report.id} className="flex items-center h-[48px] border-b border-[#f0f0f0] px-4 hover:bg-[#fafbfc] transition-colors group">
                {/* Name */}
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <span className="text-[14px] text-[#333]">{report.name}</span>
                  <Users className="h-3.5 w-3.5 text-[#aaa]" />
                </div>

                {/* Label */}
                <div className="w-[160px] flex-shrink-0">
                  <span className={cn(
                    'px-2.5 py-0.5 text-[12px] rounded border',
                    report.isPublic
                      ? 'text-[#03a9f4] border-[#03a9f4] bg-[#f0f9ff]'
                      : 'text-[#555] border-[#d0d8de] bg-white'
                  )}>
                    {report.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>

                {/* URL */}
                <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
                  <span className="text-[12px] text-[#aaa] truncate max-w-[260px] font-mono">
                    https://logspanx.app/shared/{report.token}
                  </span>
                  <button
                    onClick={() => handleCopy(report.token)}
                    className={cn(
                      'px-3 h-[26px] text-[12px] border rounded flex-shrink-0 cursor-pointer transition-colors',
                      copied === report.token
                        ? 'border-[#4caf50] text-[#4caf50] bg-[#f0fff4]'
                        : 'border-[#d0d8de] text-[#555] hover:border-[#03a9f4] hover:text-[#03a9f4]'
                    )}
                  >
                    {copied === report.token ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                {/* More */}
                <div className="w-8 flex-shrink-0 flex items-center justify-center">
                  <button className="p-1 text-[#ccc] hover:text-[#555] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
