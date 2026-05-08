'use client'

import { useState, useMemo, useEffect } from 'react'
import { startOfWeek, endOfWeek, format, eachDayOfInterval, endOfDay, startOfDay } from 'date-fns'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useDataStore } from '@/lib/stores/data-store'
import { DashboardHeader } from './dashboard-header'
import { StatsSummary } from './stats-summary'
import { WeeklyBarChart } from './weekly-bar-chart'
import { ProjectDonutChart } from './project-donut-chart'
import { TeamActivities } from './team-activities'
import { ActivityList } from './activity-list'
import { Skeleton } from '@/components/ui/skeleton'
import { type TimeEntry } from '@/lib/types'
import { type DashboardStats } from '@/lib/stores/data-store'
import { DayEntriesModal } from './day-entries-modal'

export interface DonutEntry {
    name: string
    leadName?: string
    value: number
    color: string
    percentage: string
}

export interface BarDay {
    name: string
    fullDate: string
    displayTotal: string
    [key: string]: string | number
}

export function DashboardView() {
    const { user } = useAuthStore()
    const { timeEntries, projects, tasks, users, getDashboardStats } = useDataStore()
    const [filters, setFilters] = useState({ viewBy: 'project', teamScope: 'team', groupBy: 'time' })
    const [dateRange, setDateRange] = useState({
        from: startOfWeek(new Date(), { weekStartsOn: 1 }),
        to: endOfWeek(new Date(), { weekStartsOn: 1 })
    })
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [modalDay, setModalDay] = useState<string | null>(null)

    useEffect(() => {
        getDashboardStats().then(setStats).catch(() => { })
    }, [getDashboardStats])

    const [sourceEntries, setSourceEntries] = useState<TimeEntry[]>([])

    const modalEntries = useMemo(() => {
        if (!modalDay) return []
        return sourceEntries.filter(e => format(new Date(e.startTime), 'EEE, MMM d') === modalDay)
    }, [modalDay, sourceEntries])

    // Derive sourceEntries from store's timeEntries (always in sync) filtered by date range
    useEffect(() => {
        if (!user) return
        const from = startOfDay(dateRange.from)
        const to = endOfDay(dateRange.to)
        const filtered = timeEntries.filter(e => {
            const t = new Date(e.startTime)
            if (t < from || t > to) return false
            if (filters.teamScope === 'only-me' && e.userId !== user.id) return false
            return true
        })
        setSourceEntries(filtered)
        setLoading(false)
    }, [timeEntries, dateRange, filters.teamScope, user])

    // Build lead name map from store instead of hardcoding
    const leadNames = useMemo(() =>
        Object.fromEntries(users.map(u => [u.id, u.name])),
        [users]
    )

    // Derived Stats
    const totalSeconds = useMemo(() => sourceEntries.reduce((acc, e) => acc + (e.duration ?? 0), 0), [sourceEntries])

    const totalDisplay = useMemo(() => {
        const h = Math.floor(totalSeconds / 3600)
        const m = Math.floor((totalSeconds % 3600) / 60)
        return `${h}:${String(m).padStart(2, '0')}`
    }, [totalSeconds])

    const billablePercent = useMemo(() => {
        const billableSec = sourceEntries.filter(e => e.billable).reduce((a, e) => a + (e.duration ?? 0), 0)
        return totalSeconds > 0 ? Math.round((billableSec / totalSeconds) * 100) + '%' : '0%'
    }, [sourceEntries, totalSeconds])

    // Tasks in range — count tasks that have entries
    const tasksInRange = useMemo(() => {
        const taskIds = new Set(sourceEntries.map(e => e.taskId).filter(Boolean))
        return tasks.filter(t => taskIds.has(t.id))
    }, [sourceEntries, tasks])

    const donutData = useMemo((): DonutEntry[] => {
        const isTaskView = filters.groupBy === 'task'
        const isBillability = filters.viewBy === 'billability'

        if (isBillability) {
            const bH = sourceEntries.filter(e => e.billable).reduce((a, e) => a + (e.duration ?? 0), 0) / 3600
            const nH = sourceEntries.filter(e => !e.billable).reduce((a, e) => a + (e.duration ?? 0), 0) / 3600
            const total = bH + nH
            return [
                { name: 'Billable', value: Number(bH.toFixed(2)), color: '#b2d235', percentage: total > 0 ? ((bH / total) * 100).toFixed(2) : '0' },
                { name: 'Non-Billable', value: Number(nH.toFixed(2)), color: '#e4eaee', percentage: total > 0 ? ((nH / total) * 100).toFixed(2) : '0' },
            ].filter(d => d.value > 0)
        }
        if (isTaskView) {
            const taskMap: Record<string, number> = {}
            const noTaskProjMap: Record<string, number> = {}
            let noTaskNoProjectHours = 0

            sourceEntries.forEach(e => {
                if (e.taskId) {
                    taskMap[e.taskId] = (taskMap[e.taskId] || 0) + ((e.duration ?? 0) / 3600)
                } else if (e.projectId) {
                    noTaskProjMap[e.projectId] = (noTaskProjMap[e.projectId] || 0) + ((e.duration ?? 0) / 3600)
                } else {
                    noTaskNoProjectHours += (e.duration ?? 0) / 3600
                }
            })

            const entries: DonutEntry[] = []
            let totalT = 0

            Object.entries(taskMap).forEach(([tid, val]) => {
                if (val <= 0) return
                const t = tasks.find(x => x.id === tid)
                const p = projects.find(x => x.id === t?.projectId)
                entries.push({
                    name: `${t?.name || 'Unknown Task'}`,
                    leadName: leadNames[p?.leadId || ''] || '',
                    value: Number(val.toFixed(2)),
                    color: p?.color || '#cbd5e1',
                    percentage: '0'
                })
                totalT += val
            })

            Object.entries(noTaskProjMap).forEach(([pid, val]) => {
                if (val <= 0) return
                const p = projects.find(x => x.id === pid)
                entries.push({
                    name: `${p?.name || 'Unknown'} (Without task)`,
                    leadName: leadNames[p?.leadId || ''] || '',
                    value: Number(val.toFixed(2)),
                    color: '#9e9e9e',
                    percentage: '0'
                })
                totalT += val
            })

            if (noTaskNoProjectHours > 0) {
                entries.push({
                    name: '(Without Project)',
                    leadName: '',
                    value: Number(noTaskNoProjectHours.toFixed(2)),
                    color: '#9e9e9e',
                    percentage: '0'
                })
                totalT += noTaskNoProjectHours
            }

            entries.forEach(e => {
                e.percentage = totalT > 0 ? ((e.value / totalT) * 100).toFixed(2) : '0'
            })
            return entries.sort((a, b) => b.value - a.value)
        }

        // Time per project (default) — include entries without a project
        const pMap: Record<string, number> = {}
        let noProjectHours = 0
        sourceEntries.forEach(e => {
            if (e.projectId) {
                pMap[e.projectId] = (pMap[e.projectId] || 0) + ((e.duration ?? 0) / 3600)
            } else {
                noProjectHours += (e.duration ?? 0) / 3600
            }
        })
        const totalH = Object.values(pMap).reduce((a, b) => a + b, 0) + noProjectHours
        const result: DonutEntry[] = Object.entries(pMap).map(([id, val]) => {
            const p = projects.find(proj => proj.id === id)
            return {
                name: p?.name || 'Unknown',
                leadName: leadNames[p?.leadId || ''] || '',
                value: Number(val.toFixed(2)),
                color: p?.color || '#cbd5e1',
                percentage: totalH > 0 ? ((val / totalH) * 100).toFixed(2) : '0'
            }
        })
        if (noProjectHours > 0) {
            result.push({
                name: '(Without Project)',
                leadName: '',
                value: Number(noProjectHours.toFixed(2)),
                color: '#9e9e9e',
                percentage: totalH > 0 ? ((noProjectHours / totalH) * 100).toFixed(2) : '0'
            })
        }
        return result.sort((a, b) => b.value - a.value)
    }, [sourceEntries, projects, tasksInRange, leadNames, filters.groupBy, filters.viewBy])

    const barData = useMemo((): BarDay[] => {
        const isTaskView = filters.groupBy === 'task'
        const isBillability = filters.viewBy === 'billability'
        const daysInInterval = eachDayOfInterval({ start: dateRange.from, end: dateRange.to })

        const entriesByDay: Record<string, TimeEntry[]> = {}
        sourceEntries.forEach(e => {
            const dk = format(new Date(e.startTime), 'yyyy-MM-dd')
            if (!entriesByDay[dk]) entriesByDay[dk] = []
            entriesByDay[dk].push(e)
        })

        return daysInInterval.map((date): BarDay => {
            const dk = format(date, 'yyyy-MM-dd')
            const entriesForDay = entriesByDay[dk] || []
            const dayTotalSec = entriesForDay.reduce((a, e) => a + (e.duration ?? 0), 0)
            const dh = Math.floor(dayTotalSec / 3600)
            const dm = Math.floor((dayTotalSec % 3600) / 60)

            const dayObj: BarDay = {
                name: format(date, 'EEE, MMM d'),
                fullDate: format(date, 'EEE, MMM d'),
                displayTotal: dayTotalSec > 0 ? `${dh}:${String(dm).padStart(2, '0')}` : ''
            }

            if (isBillability) {
                dayObj['billable'] = Number((entriesForDay.filter(e => e.billable).reduce((a, e) => a + (e.duration ?? 0), 0) / 3600).toFixed(2))
                dayObj['non-billable'] = Number((entriesForDay.filter(e => !e.billable).reduce((a, e) => a + (e.duration ?? 0), 0) / 3600).toFixed(2))
            } else if (isTaskView) {
                const tMap: Record<string, number> = {}
                let noProjectTaskTime = 0
                entriesForDay.forEach(e => {
                    if (e.taskId) {
                        tMap[`t_${e.taskId}`] = (tMap[`t_${e.taskId}`] || 0) + ((e.duration ?? 0) / 3600)
                    } else if (e.projectId) {
                        tMap[`p_${e.projectId}`] = (tMap[`p_${e.projectId}`] || 0) + ((e.duration ?? 0) / 3600)
                    } else {
                        noProjectTaskTime += (e.duration ?? 0) / 3600
                    }
                })
                Object.entries(tMap).forEach(([id, val]) => {
                    dayObj[id] = Number(val.toFixed(2))
                })
                if (noProjectTaskTime > 0) {
                    dayObj['__no_project__'] = Number(noProjectTaskTime.toFixed(2))
                }
            } else {
                const projTime: Record<string, number> = {}
                let noProjectTime = 0
                entriesForDay.forEach(e => {
                    if (e.projectId) {
                        projTime[e.projectId] = (projTime[e.projectId] || 0) + ((e.duration ?? 0) / 3600)
                    } else {
                        noProjectTime += (e.duration ?? 0) / 3600
                    }
                })
                Object.entries(projTime).forEach(([pid, val]) => {
                    dayObj[pid] = Number(val.toFixed(2))
                })
                if (noProjectTime > 0) {
                    dayObj['__no_project__'] = Number(noProjectTime.toFixed(2))
                }
            }
            return dayObj
        })
    }, [sourceEntries, projects, tasks, dateRange, filters.groupBy, filters.viewBy])

    const dashboardData = useMemo(() => {
        if (!user) return null

        const isBillability = filters.viewBy === 'billability'
        const topProjectName = donutData[0]?.name || 'N/A'
        const topProjectObj = projects.find(p => p.name === topProjectName)
        const topLeadName = leadNames[topProjectObj?.leadId || ''] || 'N/A'

        // Check if any entries lack a projectId
        const hasNoProjectEntries = sourceEntries.some(e => !e.projectId)

        const barProjects = isBillability
            ? [{ id: 'billable', name: 'Billable', color: '#b2d235' }, { id: 'non-billable', name: 'Non-Billable', color: '#e4eaee' }]
            : filters.groupBy === 'task'
                ? [
                    ...tasksInRange.map(t => ({ id: `t_${t.id}`, name: t.name, color: projects.find(p => p.id === t.projectId)?.color || '#cbd5e1' })),
                    ...projects.map(p => ({ id: `p_${p.id}`, name: `${p.name} (Without task)`, color: '#9e9e9e' })),
                    ...(hasNoProjectEntries ? [{ id: '__no_project__', name: '(Without Project)', color: '#9e9e9e' }] : [])
                ]
                : [
                    ...projects,
                    ...(hasNoProjectEntries ? [{ id: '__no_project__', name: '(Without Project)', color: '#9e9e9e' }] : [])
                ]

        return {
            totalTime: stats?.weekHours != null
                ? `${Math.floor(stats.weekHours / 3600)}:${String(Math.floor((stats.weekHours % 3600) / 60)).padStart(2, '0')}`
                : totalDisplay,
            topProject: stats?.topProject || topProjectName,
            topLead: topLeadName,
            billablePercent,
            totalTasks: tasksInRange.length,
            completedTasks: tasksInRange.filter(t => t.completed).length,
            donutData,
            barData,
            barProjects,
            isTaskView: filters.groupBy === 'task',
        }
    }, [user, donutData, barData, projects, tasksInRange, leadNames, filters, totalDisplay, billablePercent, stats])


    if (!user || !dashboardData) return null

    const isPersonal = filters.teamScope === 'only-me'

    return (
        <div className="p-4 lg:p-6 space-y-2 bg-[#f2f6f8] min-h-full">
            {modalDay && (
                <DayEntriesModal
                    date={modalDay}
                    entries={modalEntries}
                    projects={projects}
                    users={users}
                    onClose={() => setModalDay(null)}
                />
            )}
            <div className="bg-[#dde2e7] px-6 py-3 border-b border-[#e4eaee] -mx-6 -mt-6 mb-6">
                <DashboardHeader
                    role={user?.role || 'team_member'}
                    filters={filters}
                    onFilterChange={(f) => setFilters(prev => ({ ...prev, ...f }))}
                    currentRange={dateRange}
                    onRangeChange={setDateRange}
                />
            </div>
            {loading ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                    </div>
                    <Skeleton className="h-[300px] w-full" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <Skeleton className="lg:col-span-2 h-[400px] w-full" />
                        <Skeleton className="lg:col-span-1 h-[400px] w-full" />
                    </div>
                </div>
            ) : isPersonal ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-3 space-y-2">
                        <StatsSummary
                            totalTime={dashboardData.totalTime}
                            topProject={dashboardData.topProject}
                            topLead={dashboardData.topLead}
                            viewBy={filters.viewBy}
                            groupBy={filters.groupBy}
                            billablePercent={dashboardData.billablePercent}
                            totalTasks={dashboardData.totalTasks}
                            completedTasks={dashboardData.completedTasks}
                        />
                        <WeeklyBarChart data={dashboardData.barData} projects={dashboardData.barProjects} isTaskView={dashboardData.isTaskView} onBarClick={setModalDay} />
                        <ProjectDonutChart data={dashboardData.donutData} totalTime={dashboardData.totalTime} isTaskView={dashboardData.isTaskView} />
                    </div>
                    <div className="lg:col-span-1">
                        <ActivityList entries={sourceEntries} />
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    <StatsSummary
                        totalTime={dashboardData.totalTime}
                        topProject={dashboardData.topProject}
                        topLead={dashboardData.topLead}
                        viewBy={filters.viewBy}
                        groupBy={filters.groupBy}
                        billablePercent={dashboardData.billablePercent}
                        totalTasks={dashboardData.totalTasks}
                        completedTasks={dashboardData.completedTasks}
                    />
                    <WeeklyBarChart data={dashboardData.barData} projects={dashboardData.barProjects} isTaskView={dashboardData.isTaskView} onBarClick={setModalDay} />
                    <ProjectDonutChart data={dashboardData.donutData} totalTime={dashboardData.totalTime} isTaskView={dashboardData.isTaskView} />
                    <TeamActivities entries={sourceEntries} />
                </div>
            )}
        </div>
    )
}
