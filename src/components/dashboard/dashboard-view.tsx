'use client'

import { useState, useMemo } from 'react'
import { startOfWeek, endOfWeek, isWithinInterval, format, eachDayOfInterval, isSameDay, endOfDay, startOfDay } from 'date-fns'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useDataStore } from '@/lib/stores/data-store'
import { DashboardHeader } from './dashboard-header'
import { StatsSummary } from './stats-summary'
import { WeeklyBarChart } from './weekly-bar-chart'
import { ProjectDonutChart } from './project-donut-chart'
import { TeamActivities } from './team-activities'
import { ActivityList } from './activity-list'

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
    const { timeEntries, projects, tasks, users } = useDataStore()
    const [filters, setFilters] = useState({ viewBy: 'project', teamScope: 'team', groupBy: 'time' })
    const [dateRange, setDateRange] = useState({
        from: startOfWeek(new Date(), { weekStartsOn: 1 }),
        to: endOfWeek(new Date(), { weekStartsOn: 1 })
    })

    // Build lead name map from store instead of hardcoding
    const leadNames = useMemo(() =>
        Object.fromEntries(users.map(u => [u.id, u.name])),
        [users]
    )

    const dashboardData = useMemo(() => {
        if (!user) return null

        // 1. Date + Scope Filtering — use startOfDay/endOfDay so single-day picks include all entries
        const rangeStart = startOfDay(dateRange.from)
        const rangeEnd = endOfDay(dateRange.to)
        let sourceEntries = timeEntries.filter(e => {
            const t = new Date(e.startTime)
            return t >= rangeStart && t <= rangeEnd
        })

        if (filters.teamScope === 'only-me') {
            sourceEntries = sourceEntries.filter(e => e.userId === user.id)
        } else if (filters.teamScope === 'team' && user.role === 'admin') {
            const leadProjectIds = new Set(projects.filter(p => p.leadId === user.id).map(p => p.id))
            sourceEntries = sourceEntries.filter(e => leadProjectIds.has(e.projectId ?? '') || e.userId === user.id)
        }

        // 2. Stats
        const totalSeconds = sourceEntries.reduce((acc, e) => acc + (e.duration ?? 0), 0)
        const totalDisplay = `${Math.floor(totalSeconds / 3600)}:${String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')}`
        const billableSec = sourceEntries.filter(e => e.billable).reduce((a, e) => a + (e.duration ?? 0), 0)
        const billablePercent = totalSeconds > 0 ? Math.round((billableSec / totalSeconds) * 100) + '%' : '0%'

        // 3. Tasks in range — count per project
        const tasksInRange = tasks.filter(t => {
            const projectEntries = sourceEntries.filter(e => e.projectId === t.projectId)
            return projectEntries.length > 0
        })
        const totalTasks = tasksInRange.length
        const completedTasks = tasksInRange.filter(t => t.completed).length

        // 4. Donut + Legend Data
        const isTaskView = filters.groupBy === 'task'
        const isBillability = filters.viewBy === 'billability'
        let donutData: DonutEntry[] = []

        if (isBillability) {
            const bH = sourceEntries.filter(e => e.billable).reduce((a, e) => a + (e.duration ?? 0), 0) / 3600
            const nH = sourceEntries.filter(e => !e.billable).reduce((a, e) => a + (e.duration ?? 0), 0) / 3600
            const total = bH + nH
            donutData = [
                { name: 'Billable', value: Number(bH.toFixed(2)), color: '#b2d235', percentage: total > 0 ? ((bH / total) * 100).toFixed(2) : '0' },
                { name: 'Non-Billable', value: Number(nH.toFixed(2)), color: '#e4eaee', percentage: total > 0 ? ((nH / total) * 100).toFixed(2) : '0' },
            ].filter(d => d.value > 0)
        } else if (isTaskView) {
            // Tasks per project as count
            const taskMap: Record<string, number> = {}
            tasksInRange.forEach(t => { taskMap[t.projectId] = (taskMap[t.projectId] || 0) + 1 })
            const totalT = Object.values(taskMap).reduce((a, b) => a + b, 0)
            donutData = Object.entries(taskMap).map(([pid, count]) => {
                const p = projects.find(proj => proj.id === pid)
                return {
                    name: p?.name || 'Unknown',
                    leadName: leadNames[p?.leadId || ''] || '',
                    value: count,
                    color: p?.color || '#cbd5e1',
                    percentage: totalT > 0 ? ((count / totalT) * 100).toFixed(2) : '0'
                }
            }).sort((a, b) => b.value - a.value)
        } else {
            // Time per project
            const pMap: Record<string, number> = {}
            sourceEntries.forEach(e => { if (e.projectId) pMap[e.projectId] = (pMap[e.projectId] || 0) + ((e.duration ?? 0) / 3600) })
            const totalH = Object.values(pMap).reduce((a, b) => a + b, 0)
            donutData = Object.entries(pMap).map(([id, val]) => {
                const p = projects.find(proj => proj.id === id)
                return {
                    name: p?.name || 'Unknown',
                    leadName: leadNames[p?.leadId || ''] || '',
                    value: Number(val.toFixed(2)),
                    color: p?.color || '#cbd5e1',
                    percentage: totalH > 0 ? ((val / totalH) * 100).toFixed(2) : '0'
                }
            }).sort((a, b) => b.value - a.value)
        }

        // 5. Top project & lead
        const topProjectName = donutData[0]?.name || 'N/A'
        const topProjectObj = projects.find(p => p.name === topProjectName)
        const topLeadName = leadNames[topProjectObj?.leadId || ''] || 'N/A'

        // 6. Bar Chart
        const daysInInterval = eachDayOfInterval({ start: dateRange.from, end: dateRange.to })

        const barData = daysInInterval.map((date): BarDay => {
            const entriesForDay = sourceEntries.filter(e => isSameDay(new Date(e.startTime), date))
            const dayTotalSec = entriesForDay.reduce((a, e) => a + (e.duration ?? 0), 0)
            const dh = Math.floor(dayTotalSec / 3600)
            const dm = Math.floor((dayTotalSec % 3600) / 60)

            const dayObj: BarDay = {
                name: format(date, 'EEE'),
                fullDate: format(date, 'EEE, MMM d'),
                displayTotal: dayTotalSec > 0 ? `${dh}:${String(dm).padStart(2, '0')}` : ''
            }

            if (isBillability) {
                dayObj['billable'] = Number((entriesForDay.filter(e => e.billable).reduce((a, e) => a + (e.duration ?? 0), 0) / 3600).toFixed(2))
                dayObj['non-billable'] = Number((entriesForDay.filter(e => !e.billable).reduce((a, e) => a + (e.duration ?? 0), 0) / 3600).toFixed(2))
            } else if (isTaskView) {
                // Bar shows task count per project per day
                const dayProjectIds = new Set(entriesForDay.map(e => e.projectId).filter(Boolean))
                projects.forEach(p => {
                    if (!dayProjectIds.has(p.id)) return
                    const count = tasks.filter(t => t.projectId === p.id).length
                    if (count > 0) dayObj[p.id] = count
                })
                // Override displayTotal for task view
                const dayTaskCount = projects
                    .filter(p => dayProjectIds.has(p.id))
                    .reduce((a, p) => a + tasks.filter(t => t.projectId === p.id).length, 0)
                dayObj.displayTotal = dayTaskCount > 0 ? `${dayTaskCount} tasks` : ''
            } else {
                projects.forEach(p => {
                    const val = entriesForDay.filter(e => e.projectId === p.id).reduce((a, e) => a + ((e.duration ?? 0) / 3600), 0)
                    if (val > 0) dayObj[p.id] = Number(val.toFixed(2))
                })
            }
            return dayObj
        })

        const barProjects = isBillability
            ? [{ id: 'billable', name: 'Billable', color: '#b2d235' }, { id: 'non-billable', name: 'Non-Billable', color: '#e4eaee' }]
            : projects

        return {
            totalTime: totalDisplay,
            topProject: topProjectName,
            topLead: topLeadName,
            billablePercent,
            totalTasks,
            completedTasks,
            donutData,
            barData,
            barProjects,
            isTaskView,
        }
    }, [user, timeEntries, projects, tasks, users, filters, dateRange, leadNames])

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

            {isPersonal ? (
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
                        <ActivityList />
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
                    <TeamActivities />
                </div>
            )}
        </div>
    )
}
