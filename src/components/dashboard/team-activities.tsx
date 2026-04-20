'use client'

import { useDataStore } from '@/lib/stores/data-store'

const AVATAR_COLORS = ['#e91e63', '#9c27b0', '#03a9f4', '#4caf50', '#ff9800', '#795548']

const NAMES: Record<string, string> = {
    'user_1': 'Nishit Sangani',
    'user_2': 'Aiyub Munshi',
    'user_3': 'Jaydeep Vegad',
    'user_4': 'Sonu Gupta',
    'user_5': 'Vrutik Patel',
    'user_6': 'Ram Jangid',
}

export function TeamActivities() {
    const { timeEntries, projects } = useDataStore()

    const userMap: Record<string, typeof timeEntries> = {}
    timeEntries.forEach(e => {
        if (!userMap[e.userId]) userMap[e.userId] = []
        userMap[e.userId].push(e)
    })

    const members = Object.entries(userMap).map(([userId, entries]) => {
        const totalSec = entries.reduce((a, c) => a + (c.duration ?? 0), 0)
        const h = Math.floor(totalSec / 3600)
        const m = Math.floor((totalSec % 3600) / 60)

        const sorted = [...entries].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        const latest = sorted[0]
        const latestProject = projects.find(p => p.id === latest?.projectId)

        const projectHours: Record<string, number> = {}
        entries.forEach(e => {
            const pid = e.projectId ?? 'unknown'
            projectHours[pid] = (projectHours[pid] || 0) + ((e.duration ?? 0) / 3600)
        })
        const totalHours = totalSec / 3600
        const barSegments = Object.entries(projectHours)
            .sort((a, b) => b[1] - a[1])
            .map(([pid, hrs]) => ({
                color: projects.find(p => p.id === pid)?.color || '#ccc',
                width: (hrs / totalHours) * 100,
            }))

        const latestDur = latest?.duration ?? 0
        const lh = Math.floor(latestDur / 3600)
        const lm = Math.floor((latestDur % 3600) / 60)

        return {
            id: userId,
            name: NAMES[userId] || userId,
            latestActivity: latest?.description || '(no description)',
            latestProject: latestProject ? `${latestProject.name}` : '(Without Project)',
            latestTime: `${String(lh).padStart(2, '0')}:${String(lm).padStart(2, '0')}:00`,
            status: 'In progress',
            totalWeekHours: totalHours,
            totalWeekDisplay: `${h}:${String(m).padStart(2, '0')}`,
            barSegments,
        }
    }).sort((a, b) => b.totalWeekHours - a.totalWeekHours)

    const maxHours = members.length > 0 ? members[0].totalWeekHours : 1

    return (
        <div className="bg-white rounded-sm border border-[#e4eaee]">
            <div className="px-6 py-2.5 border-b border-[#e4eaee] bg-[#fcfcfc]">
                <h3 className="text-[11px] font-bold text-[#999] uppercase tracking-wider">Team activities</h3>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 px-6 py-2 border-b border-[#e4eaee] bg-[#fcfcfc] text-[11px] font-bold text-[#999] uppercase tracking-wider">
                <div className="col-span-2 flex items-center gap-1 cursor-default">Team Member <span className="text-[10px]">↕</span></div>
                <div className="col-span-4 flex items-center gap-1 cursor-default">Latest Activity <span className="text-[10px]">↕</span></div>
                <div className="col-span-6 text-right flex items-center justify-end gap-1 cursor-default">Total Tracked (This Week) <span className="text-[10px]">↕</span></div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-[#efefef]">
                {members.map((member, i) => {
                    const initials = member.name.split(' ').map(n => n[0]).join('')
                    const barTotalWidth = Math.max(20, (member.totalWeekHours / maxHours) * 100)

                    return (
                        <div key={member.id} className="grid grid-cols-12 px-6 py-3 items-center hover:bg-[#fafbfc] transition-colors">
                            {/* Avatar + Name */}
                            <div className="col-span-2 flex items-center space-x-3">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                                    style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                                >
                                    {initials}
                                </div>
                                <span className="text-[14px] font-normal text-[#333] truncate">{member.name}</span>
                            </div>

                            {/* Latest Activity */}
                            <div className="col-span-6 grid grid-cols-10 items-center">
                                <div className="col-span-6 min-w-0 pr-4">
                                    <p className="text-[14px] text-[#333] truncate">{member.latestActivity}</p>
                                    <p className="text-[12px] text-[#999] truncate font-normal">• {member.latestProject}</p>
                                </div>
                                <div className="col-span-2 text-right">
                                    <span className="text-[14px] text-[#999] tabular-nums">{member.latestTime}</span>
                                </div>
                                <div className="col-span-2 text-right">
                                    <span className="text-[14px] text-[#999] font-normal">{member.status}</span>
                                </div>
                            </div>

                            {/* Total + Bar */}
                            <div className="col-span-4 flex items-center justify-end space-x-6">
                                <span className="text-[14px] font-bold text-[#333] tabular-nums w-[60px] text-right">{member.totalWeekDisplay}</span>
                                <div className="flex-1 max-w-[240px]">
                                    <div className="h-[14px] bg-transparent rounded-none overflow-hidden flex" style={{ width: `${barTotalWidth}%`, marginLeft: 'auto' }}>
                                        {member.barSegments.map((seg, si) => (
                                            <div
                                                key={si}
                                                className="h-full"
                                                style={{ width: `${seg.width}%`, backgroundColor: seg.color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
