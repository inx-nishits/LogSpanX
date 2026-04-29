'use client'

import { useMemo, useState } from 'react'
import { useDataStore } from '@/lib/stores/data-store'
import { startOfDay, endOfDay } from 'date-fns'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

const AVATAR_COLORS = ['#e91e63', '#9c27b0', '#03a9f4', '#4caf50', '#ff9800', '#795548']

interface TeamActivitiesProps {
    dateRange?: { from: Date; to: Date }
}

type MemberSort = 'none' | 'asc' | 'desc'
type ActivitySort = 'none' | 'no-desc-first' | 'no-activity-first'

export function TeamActivities({ dateRange }: TeamActivitiesProps) {
    const { timeEntries, projects, users } = useDataStore()
    const [memberSort, setMemberSort] = useState<MemberSort>('none')
    const [activitySort, setActivitySort] = useState<ActivitySort>('none')

    const cycleMemSort = () => {
        setActivitySort('none')
        setMemberSort(s => s === 'none' ? 'asc' : s === 'asc' ? 'desc' : 'none')
    }
    const cycleActSort = () => {
        setMemberSort('none')
        setActivitySort(s => s === 'none' ? 'no-desc-first' : s === 'no-desc-first' ? 'no-activity-first' : 'none')
    }

    const rawMembers = useMemo(() => {
        const rangeStart = dateRange ? startOfDay(dateRange.from) : null
        const rangeEnd = dateRange ? endOfDay(dateRange.to) : null

        const filtered = rangeStart && rangeEnd
            ? timeEntries.filter(e => {
                const t = new Date(e.startTime)
                return t >= rangeStart && t <= rangeEnd
            })
            : timeEntries

        return users.map((user, i) => {
            const entries = filtered.filter(e => e.userId === user.id)
            const name = user.name || user.id

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
                    width: totalHours > 0 ? (hrs / totalHours) * 100 : 0,
                }))

            const latestDur = latest?.duration ?? 0
            const lh = Math.floor(latestDur / 3600)
            const lm = Math.floor((latestDur % 3600) / 60)
            const hasActivity = entries.length > 0
            const description = latest?.description?.trim() || ''

            return {
                id: user.id,
                name,
                role: user.role || 'member',
                hasActivity,
                description,
                latestActivity: description || '(no description)',
                latestProject: latestProject?.name || '(Without Project)',
                latestProjectColor: latestProject?.color || '#ccc',
                latestTime: `${String(lh).padStart(2, '0')}:${String(lm).padStart(2, '0')}`,
                totalHours,
                totalDisplay: `${h}:${String(m).padStart(2, '0')}`,
                barSegments,
                colorIndex: i,
            }
        })
    }, [timeEntries, projects, users, dateRange])

    const members = useMemo(() => {
        const list = [...rawMembers]

        if (memberSort === 'asc') return list.sort((a, b) => a.name.localeCompare(b.name))
        if (memberSort === 'desc') return list.sort((a, b) => b.name.localeCompare(a.name))

        if (activitySort === 'no-desc-first') {
            return list.sort((a, b) => {
                const rank = (m: typeof a) => m.hasActivity && !m.description ? 0 : 1
                return rank(a) - rank(b)
            })
        }
        if (activitySort === 'no-activity-first') {
            return list.sort((a, b) => {
                const rank = (m: typeof a) => !m.hasActivity ? 0 : !m.description ? 1 : 2
                return rank(a) - rank(b)
            })
        }

        return list.sort((a, b) => b.totalHours - a.totalHours)
    }, [rawMembers, memberSort, activitySort])

    const maxHours = useMemo(() => Math.max(...members.map(m => m.totalHours), 1), [members])

    return (
        <div className="bg-white rounded-sm border border-[#e4eaee]">
            <div className="px-6 py-2.5 border-b border-[#e4eaee] bg-[#fcfcfc]">
                <h3 className="text-[11px] font-bold text-[#999] uppercase tracking-wider">Team activities</h3>
            </div>

            <div className="grid grid-cols-12 px-6 py-2 border-b border-[#e4eaee] bg-[#fcfcfc] text-[11px] font-bold text-[#999] uppercase tracking-wider">
                <button
                    onClick={cycleMemSort}
                    className="col-span-2 flex items-center gap-1 hover:text-[#555] transition-colors cursor-pointer"
                >
                    Team Member {memberSort === 'asc' ? <ChevronUp className="h-3 w-3 text-[#03a9f4]" /> : memberSort === 'desc' ? <ChevronDown className="h-3 w-3 text-[#03a9f4]" /> : <ChevronsUpDown className="h-3 w-3 text-[#ccc]" />}
                </button>
                <button
                    onClick={cycleActSort}
                    className="col-span-4 flex items-center gap-1 hover:text-[#555] transition-colors cursor-pointer"
                >
                    Latest Activity {activitySort === 'no-desc-first' ? <ChevronUp className="h-3 w-3 text-[#03a9f4]" /> : activitySort === 'no-activity-first' ? <ChevronDown className="h-3 w-3 text-[#03a9f4]" /> : <ChevronsUpDown className="h-3 w-3 text-[#ccc]" />}
                </button>
                <div className="col-span-6 text-right">Total Tracked</div>
            </div>

            <div className="divide-y divide-[#efefef]">
                {members.map((member, memberIndex) => {
                    const initials = member.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)
                    const filledWidth = (member.totalHours / maxHours) * 100

                    return (
                        <div key={member.id || `member-${memberIndex}`} className="grid grid-cols-12 px-6 py-3 items-center hover:bg-[#fafbfc] transition-colors">
                            <div className="col-span-2 flex items-center space-x-3">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                                    style={{ backgroundColor: AVATAR_COLORS[member.colorIndex % AVATAR_COLORS.length] }}
                                >
                                    {initials}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[13px] font-medium text-[#333] truncate">{member.name}</p>
                                    <p className="text-[11px] text-[#999] capitalize">{member.role}</p>
                                </div>
                            </div>

                            <div className="col-span-4 min-w-0 pr-4">
                                {member.hasActivity ? (
                                    <>
                                        <p className="text-[13px] text-[#333] truncate">{member.latestActivity}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: member.latestProjectColor }} />
                                            <p className="text-[12px] text-[#999] truncate">{member.latestProject}</p>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-[13px] text-[#ccc] italic">No activity</p>
                                )}
                            </div>

                            <div className="col-span-6 flex items-center justify-end space-x-4">
                                <span className="text-[14px] font-bold text-[#333] tabular-nums w-[52px] text-right flex-shrink-0">
                                    {member.totalDisplay}
                                </span>
                                <div className="flex-1 max-w-[200px]">
                                    <div className="h-[12px] w-full bg-[#e4eaee] overflow-hidden flex">
                                        {member.barSegments.map((seg, si) => (
                                            <div
                                                key={`${member.id || member.name}-${si}`}
                                                className="h-full flex-shrink-0"
                                                style={{
                                                    width: `${(seg.width / 100) * filledWidth}%`,
                                                    backgroundColor: seg.color,
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
                {members.length === 0 && (
                    <div className="px-6 py-8 text-center text-[13px] text-[#bbb]">No team activity in this period</div>
                )}
            </div>
        </div>
    )
}
