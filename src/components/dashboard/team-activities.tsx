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
            <div className="px-6 py-2.5 border-b border-[#e4eaee] bg-[#dde2e7]">
                <h3 className="text-[11px] font-bold text-[#555] uppercase tracking-wider">Team Activities</h3>
            </div>

            {/* Column headers */}
            <div className="flex items-center px-6 py-2 border-b border-[#e4eaee] text-[11px] font-bold text-[#aaa] uppercase tracking-wider bg-[#f5f7f9]">
                <button onClick={cycleMemSort} className="w-[20%] flex items-center gap-1 hover:text-[#555] transition-colors cursor-pointer text-left">
                    Team Member {memberSort === 'asc' ? <ChevronUp className="h-3 w-3 text-[#03a9f4]" /> : memberSort === 'desc' ? <ChevronDown className="h-3 w-3 text-[#03a9f4]" /> : <ChevronsUpDown className="h-3 w-3 text-[#ccc]" />}
                </button>
                <div className="w-px mx-2" />
                
                <button onClick={cycleActSort} className="flex-1 flex items-center gap-1 hover:text-[#555] transition-colors cursor-pointer text-left">
                    Latest Activity {activitySort === 'no-desc-first' ? <ChevronUp className="h-3 w-3 text-[#03a9f4]" /> : activitySort === 'no-activity-first' ? <ChevronDown className="h-3 w-3 text-[#03a9f4]" /> : <ChevronsUpDown className="h-3 w-3 text-[#ccc]" />}
                </button>
                <div className="w-px mx-2" />

                <button className="w-[10%] flex items-center justify-center gap-1 hover:text-[#555] transition-colors cursor-default text-center">
                    Time
                </button>
                <div className="w-px mx-2" />

                <button className="w-[35%] flex items-center justify-end gap-1 hover:text-[#555] transition-colors cursor-default text-right">
                    Total Tracked
                </button>
            </div>

            {/* Rows */}
            <div className="divide-y divide-[#f0f0f0]">
                {members.length === 0 ? (
                    <div className="px-6 py-10 text-center text-[13px] text-[#bbb]">No team activity in this period</div>
                ) : members.map((member, idx) => {
                    const initials = member.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                    const filledPct = (member.totalHours / maxHours) * 100

                    return (
                        <div key={member.id || `m-${idx}`} className="flex items-center px-6 py-3 transition-all relative hover:shadow-[0_2px_8px_rgba(0,0,0,0.10)] hover:z-10 bg-white">
                            {/* 1. Team Member (20%) */}
                            <div className="w-[20%] flex-shrink-0 flex items-center gap-3">
                                <div
                                    className="w-9 h-9 rounded-sm flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0 select-none"
                                    style={{ backgroundColor: AVATAR_COLORS[member.colorIndex % AVATAR_COLORS.length] }}
                                >
                                    {initials}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[13px] font-medium text-[#333] truncate leading-tight">{member.name}</p>
                                </div>
                            </div>

                            {/* Divider 1 */}
                            <div className="w-px self-stretch border-l border-dotted border-[#d0d8de] mx-2 flex-shrink-0" />

                            {/* 2. Latest Activity Column (flex-1) — Stacked Description & Project */}
                            <div className="flex-1 flex items-start gap-2 min-w-0">
                                {member.hasActivity ? (
                                    <>
                                        <div className="flex-1 flex flex-col min-w-0">
                                            <p className="text-[13px] text-[#333] truncate leading-normal">
                                                {member.description || '(no description)'}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <div className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ backgroundColor: member.latestProjectColor }} />
                                                <p className="text-[13px] text-[#333] truncate leading-normal">
                                                    {member.latestProject}
                                                </p>
                                            </div>
                                        </div>
                                        {member.latestTimeAgo && (
                                            <span className="text-[12px] text-[#aaa] flex-shrink-0 whitespace-nowrap pt-0.5">
                                                {member.latestTimeAgo}
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-[13px] text-[#ccc] italic">No activity</p>
                                )}
                            </div>

                            {/* Divider 2 */}
                            <div className="w-px self-stretch border-l border-dotted border-[#d0d8de] mx-2 flex-shrink-0" />

                            {/* 3. Latest Duration (10%) */}
                            <div className="w-[10%] flex-shrink-0 text-center">
                                {member.latestDurDisplay && (
                                    <span className="text-[13px] text-[#555] tabular-nums font-medium">
                                        {member.latestDurDisplay}
                                    </span>
                                )}
                            </div>

                            {/* Divider 3 */}
                            <div className="w-px self-stretch border-l border-dotted border-[#d0d8de] mx-2 flex-shrink-0" />

                            {/* 4. Total + bar (35%) */}
                            <div className="w-[35%] flex-shrink-0 flex items-center gap-3">
                                <span className="text-[13px] font-bold text-[#333] tabular-nums w-[48px] text-right flex-shrink-0">
                                    {member.totalDisplay}
                                </span>
                                <div className="flex-1 h-[20px] bg-[#eef1f4] overflow-hidden flex">
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