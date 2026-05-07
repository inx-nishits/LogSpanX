'use client'

import { useMemo, useState } from 'react'
import { useDataStore } from '@/lib/stores/data-store'
import { formatDistanceToNow } from 'date-fns'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { TimeEntry } from '@/lib/types'

const AVATAR_COLORS = ['#e91e63', '#9c27b0', '#03a9f4', '#4caf50', '#ff9800', '#795548', '#607d8b', '#f44336', '#00bcd4', '#8bc34a']

function roleLabel(role: string) {
    if (role === 'project_manager' || role === 'owner') return 'Project Manager'
    if (role === 'team_lead' || role === 'admin') return 'Team Lead'
    return 'Team Member'
}

interface TeamActivitiesProps {
    entries: TimeEntry[]
}

type MemberSort = 'none' | 'asc' | 'desc'
type ActivitySort = 'none' | 'no-desc-first' | 'no-activity-first'

export function TeamActivities({ entries }: TeamActivitiesProps) {
    const { projects, users } = useDataStore()
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
        const storeUserIds = users.map(u => u.id)
        const activeUserIds = Array.from(new Set(entries.map(e => e.userId)))
        const allIds = Array.from(new Set([...activeUserIds, ...storeUserIds])).filter(Boolean)

        return allIds.map((uid, i) => {
            const userObj = users.find(u => u.id === uid)
            const userEntries = entries.filter(e => e.userId === uid)

            const name = userObj?.name || userEntries.find(e => e.userName)?.userName || `User (${uid?.substring(0, 4) ?? '?'})`
            const role = userObj?.role || 'team_member'

            const totalSec = userEntries.reduce((a, c) => a + (c.duration ?? 0), 0)
            const h = Math.floor(totalSec / 3600)
            const m = Math.floor((totalSec % 3600) / 60)

            const sorted = [...userEntries].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
            const latest = sorted[0]
            const latestProject = projects.find(p => p.id === latest?.projectId)

            const latestDur = latest?.duration ?? 0
            const lh = Math.floor(latestDur / 3600)
            const lm = Math.floor((latestDur % 3600) / 60)

            const latestTimeAgo = latest?.startTime
                ? formatDistanceToNow(new Date(latest.startTime), { addSuffix: true })
                : null

            // Build per-project bar segments
            const projectHours: Record<string, number> = {}
            userEntries.forEach(e => {
                const pid = e.projectId ?? '__none__'
                projectHours[pid] = (projectHours[pid] || 0) + ((e.duration ?? 0) / 3600)
            })
            const totalHours = totalSec / 3600
            const barSegments = Object.entries(projectHours)
                .sort((a, b) => b[1] - a[1])
                .map(([pid, hrs]) => ({
                    color: projects.find(p => p.id === pid)?.color || '#d0d8de',
                    pct: totalHours > 0 ? (hrs / totalHours) * 100 : 0,
                }))

            return {
                id: uid,
                name,
                role,
                hasActivity: userEntries.length > 0,
                description: latest?.description?.trim() || '',
                latestProject: latestProject?.name || '(Without Project)',
                latestProjectColor: latestProject?.color || '#d0d8de',
                latestDurDisplay: latestDur > 0 ? `${lh}:${String(lm).padStart(2, '0')}` : null,
                latestTimeAgo,
                totalHours,
                totalDisplay: `${h}:${String(m).padStart(2, '0')}`,
                barSegments,
                colorIndex: i,
            }
        })
    }, [entries, projects, users])

    const members = useMemo(() => {
        const list = [...rawMembers]
        if (memberSort === 'asc') return list.sort((a, b) => a.name.localeCompare(b.name))
        if (memberSort === 'desc') return list.sort((a, b) => b.name.localeCompare(a.name))
        if (activitySort === 'no-desc-first') return list.sort((a, b) => {
            const rank = (m: typeof a) => m.hasActivity && !m.description ? 0 : 1
            return rank(a) - rank(b)
        })
        if (activitySort === 'no-activity-first') return list.sort((a, b) => {
            const rank = (m: typeof a) => !m.hasActivity ? 0 : !m.description ? 1 : 2
            return rank(a) - rank(b)
        })
        return list.sort((a, b) => b.totalHours - a.totalHours)
    }, [rawMembers, memberSort, activitySort])

    const maxHours = useMemo(() => Math.max(...members.map(m => m.totalHours), 1), [members])

    return (
        <div className="bg-white rounded-sm border border-[#e4eaee] shadow-sm">
            {/* Header */}
            <div className="px-6 py-2.5 border-b border-[#e4eaee] bg-[#fcfcfc]">
                <h3 className="text-[11px] font-bold text-[#999] uppercase tracking-wider">Team Activities</h3>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-12 px-6 py-2 border-b border-[#e4eaee] text-[11px] font-bold text-[#aaa] uppercase tracking-wider">
                <button onClick={cycleMemSort} className="col-span-2 flex items-center gap-1 hover:text-[#555] transition-colors cursor-pointer text-left">
                    Team Member {memberSort === 'asc' ? <ChevronUp className="h-3 w-3 text-[#03a9f4]" /> : memberSort === 'desc' ? <ChevronDown className="h-3 w-3 text-[#03a9f4]" /> : <ChevronsUpDown className="h-3 w-3 text-[#ccc]" />}
                </button>
                <button onClick={cycleActSort} className="col-span-6 flex items-center gap-1 hover:text-[#555] transition-colors cursor-pointer text-left">
                    Latest Activity {activitySort === 'no-desc-first' ? <ChevronUp className="h-3 w-3 text-[#03a9f4]" /> : activitySort === 'no-activity-first' ? <ChevronDown className="h-3 w-3 text-[#03a9f4]" /> : <ChevronsUpDown className="h-3 w-3 text-[#ccc]" />}
                </button>
                <div className="col-span-4 text-right">Total Tracked (This Week)</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-[#f0f0f0]">
                {members.length === 0 ? (
                    <div className="px-6 py-10 text-center text-[13px] text-[#bbb]">No team activity in this period</div>
                ) : members.map((member, idx) => {
                    const initials = member.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                    const filledPct = (member.totalHours / maxHours) * 100

                    return (
                        <div key={member.id || `m-${idx}`} className="flex items-center px-6 py-3 transition-all relative hover:shadow-[0_2px_8px_rgba(0,0,0,0.10)] hover:z-10">
                            {/* Avatar + Name */}
                            <div className="w-[22%] flex-shrink-0 flex items-center gap-3">
                                <div
                                    className="w-9 h-9 rounded-sm flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0 select-none"
                                    style={{ backgroundColor: AVATAR_COLORS[member.colorIndex % AVATAR_COLORS.length] }}
                                >
                                    {initials}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[13px] font-medium text-[#333] truncate leading-tight">{member.name}</p>
                                    <p className="text-[11px] text-[#aaa] leading-tight mt-0.5">{roleLabel(member.role)}</p>
                                </div>
                            </div>

                            {/* Dotted divider */}
                            <div className="w-px self-stretch border-l border-dotted border-[#d0d8de] mx-4 flex-shrink-0" />

                            {/* Latest Activity — all in one line */}
                            <div className="flex-1 flex items-center gap-2 min-w-0 pr-4">
                                {member.hasActivity ? (
                                    <>
                                        <p className="text-[13px] text-[#333] truncate min-w-0">
                                            {member.description || '(no description)'}
                                        </p>
                                        <span className="text-[#ddd] flex-shrink-0">•</span>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <div className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ backgroundColor: member.latestProjectColor }} />
                                            <p className="text-[12px] text-[#aaa] whitespace-nowrap">{member.latestProject}</p>
                                        </div>
                                        {member.latestDurDisplay && (
                                            <>
                                                <span className="text-[#ddd] flex-shrink-0">•</span>
                                                <span className="text-[13px] text-[#555] tabular-nums flex-shrink-0 font-medium">
                                                    {member.latestDurDisplay}
                                                </span>
                                            </>
                                        )}
                                        {member.latestTimeAgo && (
                                            <span className="text-[12px] text-[#aaa] flex-shrink-0 whitespace-nowrap ml-auto">
                                                {member.latestTimeAgo}
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-[13px] text-[#ccc] italic">No activity</p>
                                )}
                            </div>

                            {/* Dotted divider */}
                            <div className="w-px self-stretch border-l border-dotted border-[#d0d8de] mx-4 flex-shrink-0" />

                            {/* Total + bar */}
                            <div className="w-[30%] flex-shrink-0 flex items-center gap-3">
                                <span className="text-[13px] font-bold text-[#333] tabular-nums w-[48px] text-right flex-shrink-0">
                                    {member.totalDisplay}
                                </span>
                                <div className="flex-1 h-[14px] bg-[#eef1f4] overflow-hidden flex rounded-sm">
                                    {member.barSegments.map((seg, si) => (
                                        <div
                                            key={si}
                                            className="h-full flex-shrink-0 transition-all duration-500"
                                            style={{
                                                width: `${(seg.pct / 100) * filledPct}%`,
                                                backgroundColor: seg.color,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}