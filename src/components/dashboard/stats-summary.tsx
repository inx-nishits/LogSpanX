'use client'

interface StatsSummaryProps {
    totalTime: string
    topProject: string
    topLead: string
    viewBy: string
    groupBy: string
    billablePercent?: string
    totalTasks?: number
    completedTasks?: number
}

export function StatsSummary({ totalTime, topProject, topLead, viewBy, groupBy, billablePercent, totalTasks = 0, completedTasks = 0 }: StatsSummaryProps) {
    const isBillability = viewBy === 'billability'
    const isTaskView = groupBy === 'task'

    return (
        <div className="bg-[#dde2e7] rounded-none overflow-hidden border-b border-t border-[#e4eaee]">
            <div className="grid grid-cols-3 divide-x divide-[#cbd5e1]">
                <div className="px-4 py-6 text-center">
                    <p className="text-[10px] font-bold text-[#555] uppercase tracking-wider mb-2">
                        {isTaskView ? 'Total Tasks' : 'Total Time'}
                    </p>
                    <p className="text-[20px] font-normal text-[#333] tracking-tight leading-none">
                        {isTaskView ? totalTasks : totalTime}
                    </p>
                </div>
                <div className="px-4 py-6 text-center">
                    <p className="text-[10px] font-bold text-[#555] uppercase tracking-wider mb-2">
                        {isBillability ? 'Amount' : isTaskView ? 'Completed' : 'Top Project'}
                    </p>
                    <p className="text-[20px] font-normal text-[#333] tracking-tight leading-none truncate px-4">
                        {isBillability ? '0.00 USD' : isTaskView ? completedTasks : topProject}
                    </p>
                </div>
                <div className="px-4 py-6 text-center">
                    <p className="text-[10px] font-bold text-[#555] uppercase tracking-wider mb-2">
                        {isBillability ? 'Billable' : isTaskView ? 'Completion Rate' : 'Top Project Lead'}
                    </p>
                    <p className="text-[20px] font-normal text-[#333] tracking-tight leading-none">
                        {isBillability
                            ? (billablePercent || '0%')
                            : isTaskView
                                ? (totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : '0%')
                                : topLead
                        }
                    </p>
                </div>
            </div>
        </div>
    )
}
