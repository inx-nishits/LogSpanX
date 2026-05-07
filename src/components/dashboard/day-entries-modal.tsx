'use client'

import { X } from 'lucide-react'
import { TimeEntry, Project, User } from '@/lib/types'

function fmtDur(s: number) {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    return `${h}:${String(m).padStart(2, '0')}`
}

interface DayEntriesModalProps {
    date: string
    entries: TimeEntry[]
    projects: Project[]
    users: User[]
    onClose: () => void
}

export function DayEntriesModal({ date, entries, projects, users, onClose }: DayEntriesModalProps) {
    const totalSecs = entries.reduce((a, e) => a + (e.duration ?? 0), 0)

    // Group by project, sum durations
    const projectMap: Record<string, { name: string; color: string; billable: boolean; leadName?: string; secs: number }> = {}
    entries.forEach(e => {
        const proj = projects.find(p => p.id === e.projectId)
        const key = e.projectId || '__none__'
        if (!projectMap[key]) {
            const lead = proj?.leadId ? users.find(u => u.id === proj.leadId)?.name : undefined
            projectMap[key] = {
                name: proj?.name || 'No Project',
                color: proj?.color || '#ccc',
                billable: proj?.billable ?? false,
                leadName: lead,
                secs: 0,
            }
        }
        projectMap[key].secs += e.duration ?? 0
    })

    const rows = Object.values(projectMap)
        .sort((a, b) => b.secs - a.secs)

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40" onClick={onClose}>
            <div
                className="bg-white rounded-sm shadow-2xl w-full max-w-[520px] mx-4 max-h-[80vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e4eaee]">
                    <h2 className="text-[18px] font-normal text-[#333]">{date}</h2>
                    <button onClick={onClose} className="text-[#bbb] hover:text-[#555] cursor-pointer transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Table header */}
                <div className="flex items-center px-6 py-2 border-b border-[#f0f0f0] text-[12px] font-bold text-[#aaa] uppercase tracking-wider">
                    <span className="flex-1">Project</span>
                    <span className="w-[60px] text-right">{fmtDur(totalSecs)}</span>
                    <span className="w-[50px] text-right">%</span>
                </div>

                {/* Rows */}
                <div className="overflow-y-auto flex-1">
                    {rows.length === 0 ? (
                        <div className="py-10 text-center text-[14px] text-[#aaa]">No entries</div>
                    ) : rows.map((row, i) => {
                        const pct = totalSecs > 0 ? ((row.secs / totalSecs) * 100).toFixed(2) : '0'
                        return (
                            <div key={i} className="flex items-center px-6 py-3 border-b border-[#f5f5f5] hover:bg-[#fafbfc] transition-colors">
                                <div className="flex-1 min-w-0 flex items-center gap-2 pr-4">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: row.color }} />
                                    <span className="text-[13px] text-[#333] truncate">
                                        {row.name}
                                        {row.billable ? ' : Billable' : ' : Non-Billable'}
                                    </span>
                                    {row.leadName && (
                                        <span className="text-[12px] text-[#aaa] flex-shrink-0">- {row.leadName}</span>
                                    )}
                                </div>
                                <span className="w-[60px] text-right text-[13px] font-bold text-[#333] tabular-nums">
                                    {fmtDur(row.secs)}
                                </span>
                                <span className="w-[50px] text-right text-[13px] text-[#aaa] tabular-nums">
                                    {pct}%
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
