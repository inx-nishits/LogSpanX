'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface DonutSlice {
  name: string
  value: number
  color: string
}

interface SummaryDonutProps {
  data: DonutSlice[]
  totalLabel: string
}

export function SummaryDonut({ data, totalLabel }: SummaryDonutProps) {
  return (
    <div className="relative w-[220px] h-[220px] flex-shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={68}
            outerRadius={105}
            paddingAngle={0}
            dataKey="value"
            strokeWidth={0}
            isAnimationActive={false}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const item = payload[0].payload as DonutSlice
              const h = Math.floor(item.value / 3600)
              const m = Math.floor((item.value % 3600) / 60)
              return (
                <div className="bg-[#333] text-white p-2 rounded-sm shadow-lg text-[12px] min-w-[140px]">
                  <p className="font-bold border-b border-[#555] pb-1 mb-1 truncate">{item.name}</p>
                  <span className="tabular-nums">{h}:{String(m).padStart(2, '0')}</span>
                </div>
              )
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[15px] text-[#333] tabular-nums">{totalLabel}</span>
      </div>
    </div>
  )
}
