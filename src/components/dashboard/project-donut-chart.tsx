'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface LegendItem {
    name: string
    leadName?: string
    value: number
    color: string
    percentage: string
}

interface ProjectDonutChartProps {
    data: LegendItem[]
    totalTime: string
    isTaskView?: boolean
}

export function ProjectDonutChart({ data, totalTime, isTaskView }: ProjectDonutChartProps) {
    const [visibleCount, setVisibleCount] = useState(10)
    const visibleData = data.slice(0, visibleCount)
    const remaining = data.length - visibleCount
    const maxValue = data.length > 0 ? data[0].value : 1

    return (
        <div className="bg-white rounded-sm border border-[#e4eaee] py-8 px-6 lg:px-12">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-8">
                {/* Donut Chart */}
                <div className="w-[320px] flex-shrink-0 relative h-[320px]" style={{ minWidth: 0, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={85}
                                outerRadius={140}
                                paddingAngle={0}
                                dataKey="value"
                                strokeWidth={0}
                                isAnimationActive={true}
                                animationBegin={0}
                                animationDuration={900}
                                animationEasing="ease-out"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const item = payload[0].payload as LegendItem
                                        const h = Math.floor(item.value); const m = Math.round((item.value % 1) * 60)
                                        return (
                                            <div className="bg-[#333] text-white p-2 border border-[#333] shadow-lg rounded-sm text-[12px] min-w-[150px]">
                                                <p className="font-bold border-b border-[#555] pb-1 mb-1">{item.name}</p>
                                                <div className="flex items-center justify-between">
                                                    <span>{h}:{String(m).padStart(2, '0')}</span>
                                                    <span>{item.percentage}%</span>
                                                </div>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Center Label */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <p className="text-[15px] font-normal text-[#333]">
                            {isTaskView ? `${data.reduce((a, d) => a + d.value, 0)} tasks` : totalTime}
                        </p>
                    </div>
                </div>

                {/* Legend Area */}
                <div className="flex-1 w-full min-w-0">
                    <div className="space-y-0">
                        {visibleData.map((item, i) => {
                            const hours = Math.floor(item.value)
                            const minutes = Math.round((item.value % 1) * 60)
                            const displayTime = `${hours}:${String(minutes).padStart(2, '0')}`
                            const barFillWidth = Math.max(2, (item.value / maxValue) * 100)

                            return (
                                <div key={i} className="flex items-center py-[9px] border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafbfc] px-1 rounded-sm">
                                    <div className="flex-1 min-w-0 mr-6 text-right">
                                        <div className="text-[14px] truncate leading-tight">
                                            <span className="text-[#333]">{item.name}</span>
                                            {item.leadName && <span className="text-[#999] ml-1.5">- {item.leadName}</span>}
                                        </div>
                                    </div>
                                    <div className="w-[80px] text-right flex-shrink-0 mr-6">
                                        <span className="text-[14px] font-normal text-[#333] tabular-nums">
                                            {isTaskView ? `${item.value} tasks` : displayTime}
                                        </span>
                                    </div>
                                    <div className="w-[240px] h-[16px] bg-[#f2f6f8] flex-shrink-0 mr-6">
                                        <div className="h-full" style={{ width: `${barFillWidth}%`, backgroundColor: item.color }} />
                                    </div>
                                    <div className="w-[60px] text-right flex-shrink-0">
                                        <span className="text-[14px] text-[#999] tabular-nums">{item.percentage}%</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {remaining > 0 && (
                        <div className="mt-8 pt-4 border-t border-[#f5f5f5] flex justify-center">
                            <button
                                onClick={() => setVisibleCount(prev => prev + 10)}
                                className="text-[13px] text-[#777] border border-[#dce0e4] px-4 py-1.5 rounded-sm hover:bg-[#f5f7f9] hover:text-[#333] transition-colors cursor-pointer bg-white"
                            >
                                Load more ({remaining} left)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
