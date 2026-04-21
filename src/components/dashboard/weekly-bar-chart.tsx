'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts'

interface WeeklyBarChartProps {
    data: any[]
    projects: { id: string; name: string; color: string }[]
    isTaskView?: boolean
}

export function WeeklyBarChart({ data, projects, isTaskView }: WeeklyBarChartProps) {
    return (
        <div className="bg-white rounded-sm border border-[#e4eaee]">
            <div className="px-4 pt-4 pb-1 border-b border-[#f5f5f5] flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#999] uppercase tracking-wider">
                    {isTaskView ? 'Tasks per Day by Project' : 'Time Tracked per Day'}
                </span>
            </div>
            <div className="h-[380px] w-full pl-2 pr-6 pt-5 pb-3">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart
                        data={data}
                        margin={{ top: 28, right: 5, left: 5, bottom: 5 }}
                        barCategoryGap="10%"
                        barGap={0}
                    >
                        <CartesianGrid vertical={false} stroke="#efefef" strokeDasharray="0" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#999', fontWeight: 400 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 13, fill: '#999', fontWeight: 400 }}
                            domain={[0, 'auto']}
                            allowDecimals={!isTaskView}
                            tickFormatter={(v) => isTaskView ? `${v}` : `${Number(v).toFixed(1)}h`}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                            content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null
                                const total = payload.reduce((acc, p) => acc + (Number(p.value) || 0), 0)
                                const th = Math.floor(total)
                                const tm = Math.round((total - th) * 60)
                                return (
                                    <div className="bg-[#333] text-white p-3 shadow-xl rounded-sm min-w-[200px] text-[12px]">
                                        <p className="font-bold border-b border-[#555] pb-2 mb-2 uppercase tracking-tight">{label}</p>
                                        <div className="space-y-1.5 mb-2 max-h-[200px] overflow-y-auto">
                                            {payload.filter(p => Number(p.value) > 0).map((p, i) => (
                                                <div key={i} className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2 truncate">
                                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                                                        <span className="truncate opacity-90">{p.name}</span>
                                                    </div>
                                                    <span className="font-bold tabular-nums ml-2">
                                                        {isTaskView ? `${p.value} tasks` : `${Number(p.value).toFixed(1)}h`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between border-t border-[#555] pt-2">
                                            <span className="opacity-70 uppercase">Total</span>
                                            <span className="font-bold text-[14px]">
                                                {isTaskView ? `${total} tasks` : `${th}:${String(tm).padStart(2, '0')}:00`}
                                            </span>
                                        </div>
                                    </div>
                                )
                            }}
                        />
                        {projects.map((proj, index) => (
                            <Bar
                                key={proj.id}
                                dataKey={proj.id}
                                name={proj.name}
                                stackId="a"
                                fill={proj.color}
                                radius={[0, 0, 0, 0]}
                                isAnimationActive={true}
                                animationBegin={0}
                                animationDuration={800}
                                animationEasing="ease-out"
                            >
                                {index === projects.length - 1 && (
                                    <LabelList
                                        dataKey="displayTotal"
                                        position="top"
                                        style={{ fill: '#333', fontSize: 12, fontWeight: 400 }}
                                        formatter={(v: any) => v || ''}
                                        offset={8}
                                    />
                                )}
                            </Bar>
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
