'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface DonutSlice {
  name: string
  value: number
  color: string
}

export function SummaryDonut({ data, totalLabel }: { data: DonutSlice[]; totalLabel: string }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="w-[200px] h-[200px]" />

  return (
    <div className="relative w-[200px] h-[200px] flex-shrink-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <PieChart>
          <Pie
            data={data.length ? data : [{ name: '', value: 1, color: '#e4eaee' }]}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={0}
            dataKey="value"
            strokeWidth={0}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={900}
            animationEasing="ease-out"
          >
            {(data.length ? data : [{ name: '', value: 1, color: '#e4eaee' }]).map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length || !data.length) return null
              const item = payload[0].payload as DonutSlice
              const h = Math.floor(item.value / 3600)
              const m = Math.floor((item.value % 3600) / 60)
              return (
                <div className="bg-[#333] text-white p-2 shadow-lg text-[12px] min-w-[140px]">
                  <p className="font-bold border-b border-[#555] pb-1 mb-1 truncate">{item.name}</p>
                  <span className="tabular-nums">{h}:{String(m).padStart(2, '0')}</span>
                </div>
              )
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[14px] font-medium text-[#333] tabular-nums">{totalLabel}</span>
      </div>
    </div>
  )
}
