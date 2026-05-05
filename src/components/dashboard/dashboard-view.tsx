'use client'

import { useState, useMemo, useEffect } from 'react'
import { startOfWeek, endOfWeek, isWithinInterval, format, eachDayOfInterval, isSameDay, endOfDay, startOfDay } from 'date-fns'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useDataStore } from '@/lib/stores/data-store'
import { DashboardHeader } from './dashboard-header'
import { StatsSummary } from './stats-summary'
import { WeeklyBarChart } from './weekly-bar-chart'
import { ProjectDonutChart } from './project-donut-chart'
import { TeamActivities } from './team-activities'
import { ActivityList } from './activity-list'
import { getTimeEntries } from '@/lib/api/time-entries'
import { mapApiTimeEntry } from '@/lib/api/mappers'
import { Skeleton } from '@/components/ui/skeleton'

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
    const [stats, setStats] = useState<{ todayHours: number; weekHours: number; activeProjects: number; topProject: string } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getDashboardStats().then(setStats).catch(() => { })
    }, [getDashboardStats])

    const [sourceEntries, setSourceEntries] = useState<TimeEntry[]>([])

    useEffect(() => {
        let active = true
        if (!user) return

        const params: TimeEntryParams = {
            startDate: startOfDay(dateRange.from).toISOString(),
            endDate: endOfDay(dateRange.to).toISOString(),
        }

        if (filters.teamScope === 'only-me') {
            params.userId = user.id
        }

        setLoading(true)
        getTimeEntries(params)
            .then((res: unknown) => {
                if (!active) return
                // Robust extraction of entries from various possible API response shapes
                let entries: any[] = []
                if (Array.isArray(res)) {
                    entries = res
                } else if (res && typeof res === 'object') {
                    const r = res as Record<string, any>
                    entries = r.items || r.entries || []
                    if (!Array.isArray(entries)) {
                        entries = Object.values(r).find(v => Array.isArray(v)) || []
                    }
                }
                
                const mappedEntries = entries.map(mapApiTimeEntry)
                setSourceEntries(mappedEntries)
            })
            .catch(console.error)
            .finally(() => { if (active) setLoading(false) })

        return () => { active = false }
    }, [user, dateRange, filters.teamScope])

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

    // Tasks in range — count unique tasks whose project has entries in range
    const tasksInRange = useMemo(() => {
        const projectIdsInRange = new Set(sourceEntries.map(e => e.projectId).filter(Boolean))
        return tasks.filter(t => projectIdsInRange.has(t.projectId))
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
            tasksInRange.forEach(t => { taskMap[t.projectId] = (taskMap[t.projectId] || 0) + 1 })
            const totalT = Object.values(taskMap).reduce((a, b) => a + b, 0)
            return Object.entries(taskMap).map(([pid, count]) => {
                const p = projects.find(proj => proj.id === pid)
                return {
                    name: p?.name || 'Unknown',
                    leadName: leadNames[p?.leadId || ''] || '',
                    value: count,
                    color: p?.color || '#cbd5e1',
                    percentage: totalT > 0 ? ((count / totalT) * 100).toFixed(2) : '0'
                }
            }).sort((a, b) => b.value - a.value)
        }

        // Time per project (default)
        const pMap: Record<string, number> = {}
        sourceEntries.forEach(e => { 
            if (e.projectId) {
                pMap[e.projectId] = (pMap[e.projectId] || 0) + ((e.duration ?? 0) / 3600) 
            }
        })
        const totalH = Object.values(pMap).reduce((a, b) => a + b, 0)
        return Object.entries(pMap).map(([id, val]) => {
            const p = projects.find(proj => proj.id === id)
            return {
                name: p?.name || 'Unknown',
                leadName: leadNames[p?.leadId || ''] || '',
                value: Number(val.toFixed(2)),
                color: p?.color || '#cbd5e1',
                percentage: totalH > 0 ? ((val / totalH) * 100).toFixed(2) : '0'
            }
        }).sort((a, b) => b.value - a.value)
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
                const dayProjectIds = new Set(entriesForDay.map(e => e.projectId).filter(Boolean))
                let dayTaskCount = 0
                projects.forEach(p => {
                    if (!dayProjectIds.has(p.id)) return
                    const count = tasks.filter(t => t.projectId === p.id).length
                    if (count > 0) {
                        dayObj[p.id] = count
                        dayTaskCount += count
                    }
                })
                dayObj.displayTotal = dayTaskCount > 0 ? `${dayTaskCount} tasks` : ''
            } else {
                const projTime: Record<string, number> = {}
                entriesForDay.forEach(e => {
                    if (e.projectId) projTime[e.projectId] = (projTime[e.projectId] || 0) + ((e.duration ?? 0) / 3600)
                })
                Object.entries(projTime).forEach(([pid, val]) => {
                    dayObj[pid] = Number(val.toFixed(2))
                })
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

        const barProjects = isBillability
            ? [{ id: 'billable', name: 'Billable', color: '#b2d235' }, { id: 'non-billable', name: 'Non-Billable', color: '#e4eaee' }]
            : projects

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
        <div className="p-4 lg:p-10 space-y-4 bg-[#f2f6f8] min-h-full">
            <DashboardHeader
                role={user.role}
                filters={filters}
                onFilterChange={(f) => setFilters(prev => ({ ...prev, ...f }))}
                currentRange={dateRange}
                onRangeChange={setDateRange}
            />
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
                    <div className="lg:col-span-3 space-y-4">
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
                        <WeeklyBarChart data={dashboardData.barData} projects={dashboardData.barProjects} isTaskView={dashboardData.isTaskView} />
                        <ProjectDonutChart data={dashboardData.donutData} totalTime={dashboardData.totalTime} isTaskView={dashboardData.isTaskView} />
                    </div>
                    <div className="lg:col-span-1">
                        <ActivityList entries={sourceEntries} />
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
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
                    <WeeklyBarChart data={dashboardData.barData} projects={dashboardData.barProjects} isTaskView={dashboardData.isTaskView} />
                    <ProjectDonutChart data={dashboardData.donutData} totalTime={dashboardData.totalTime} isTaskView={dashboardData.isTaskView} />
                    <TeamActivities entries={sourceEntries} />
                </div>
            )}
        </div>
    )
}
