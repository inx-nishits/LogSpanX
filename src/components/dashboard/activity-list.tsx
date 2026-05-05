'use client'

import { useMemo } from 'react'
import { useDataStore } from '@/lib/stores/data-store'
import { TimeEntry } from '@/lib/types'

export function ActivityList({ entries }: { entries: TimeEntry[] }) {
    const { projects, users } = useDataStore()

    // Group by description+project, sum durations, take top 10
    const activities = useMemo(() => {
        const map: Record<string, { description: string; projectId?: string; totalSec: number }> = {}

        entries.forEach(e => {
            const key = `${e.description || ''}__${e.projectId || ''}`
            if (!map[key]) map[key] = { description: e.description || '', projectId: e.projectId, totalSec: 0 }
            map[key].totalSec += e.duration ?? 0
        })

        return Object.values(map)
            .sort((a, b) => b.totalSec - a.totalSec)
            .slice(0, 10)
            .map(a => {
                const proj = projects.find(p => p.id === a.projectId)
                const lead = proj?.leadId ? users.find(u => u.id === proj.leadId) : undefined
                const h = Math.floor(a.totalSec / 3600)
                const m = Math.floor((a.totalSec % 3600) / 60)
                return {
                    title: a.description || '(no description)',
                    project: proj?.name || '(no Project)',
                    projectColor: proj?.color || '#ccc',
                    lead: lead?.name,
                    time: `${h}:${String(m).padStart(2, '0')}`,
                }
            })
    }, [entries, projects])

    return (
        <div className="bg-white border border-[#e4eaee] rounded-sm flex flex-col h-full">
            <div className="px-4 py-3 border-b border-[#e4eaee] flex items-center justify-between">
                <h2 className="text-[15px] font-normal text-[#555]">Most tracked activities</h2>
                <span className="text-[13px] font-semibold text-[#03a9f4]">Top {activities.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {activities.map((activity, i) => (
                    <div key={i} className="px-4 py-3.5 border-b border-[#f5f5f5] flex items-start justify-between hover:bg-[#fafbfc] transition-colors cursor-default">
                        <div className="flex flex-col truncate pr-3 min-w-0">
                            <span className="text-[14px] font-medium text-[#333] truncate mb-1">{activity.title}</span>
                            <div className="flex items-center space-x-1.5 truncate">
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: activity.projectColor }} />
                                <span className="text-[13px] text-[#999] truncate">{activity.project}</span>
                                {activity.lead && <span className="text-[13px] text-[#bbb] flex-shrink-0">- {activity.lead}</span>}
                            </div>
                        </div>
                        <span className="text-[14px] font-semibold text-[#333] tabular-nums ml-auto flex-shrink-0">{activity.time}</span>
                    </div>
                ))
                }
                {
                    activities.length === 0 && (
                        <div className="px-4 py-8 text-center text-[13px] text-[#bbb]">No activities yet</div>
                    )
                }
            </div >
        </div >
    )
}
