'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts'

interface BarDay {
  name: string
  billable: number
  nonBillable: number
  totalLabel: string
  [key: string]: any
}

interface ProjectMeta {
  id: string
  name: string
  color: string
}

interface SummaryBarChartProps {
  data: BarDay[]
  mode?: 'billability' | 'project'
  projects?: ProjectMeta[]
}

function fmtH(hours: number) {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

function CustomStackedBar(props: any) {
  const { x, y, width, height, billable, nonBillable } = props
  if (!height || height <= 0) return null
  const total = billable + nonBillable
  if (total === 0) return null
  const billableH = (billable / total) * height
  const nonBillableH = (nonBillable / total) * height
  const cx = x + width / 2
  const cy = y + height / 2
  return (
    <g>
      <rect x={x} y={y + nonBillableH} width={width} height={billableH} fill="#6aaa1e" />
      <rect x={x} y={y} width={width} height={nonBillableH} fill="#8bc34a" />
      {height > 24 && (
        <text x={cx} y={cy + 6} textAnchor="middle" fill="white" fontSize={Math.min(18, width * 0.35)} fontWeight="bold">
          $
        </text>
      )}
    </g>
  )
}

export function SummaryBarChart({ data, mode = 'billability', projects = [] }: SummaryBarChartProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="h-[220px] w-full" />
  const isProject = mode === 'project'

  const chartData = data.map(d => ({
    name: d.name,
    total: Number((d.billable + d.nonBillable).toFixed(2)),
    billable: d.billable,
    nonBillable: d.nonBillable,
    totalLabel: d.totalLabel,
    ...( isProject ? Object.fromEntries(projects.map(p => [p.id, d[p.id] ?? 0])) : {} ),
  }))

  return (
    <div className="h-[220px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart data={chartData} margin={{ top: 20, right: 16, left: 0, bottom: 4 }} barCategoryGap="20%">
          <CartesianGrid vertical={false} stroke="#efefef" strokeDasharray="0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} dy={10} />
          <YAxis
            axisLine={false} tickLine={false}
            tick={{ fontSize: 10, fill: '#bbb' }}
            tickFormatter={v => v === 0 ? '0h' : `${Number(v).toFixed(1)}h`}
            width={46} tickCount={8}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.03)' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const d = payload[0]?.payload
              if (isProject) {
                const total = projects.reduce((a, p) => a + (d[p.id] ?? 0), 0)
                return (
                  <div className="bg-[#333] text-white px-3 py-2.5 shadow-xl text-[12px] min-w-[180px]">
                    <p className="font-semibold border-b border-[#555] pb-1.5 mb-1.5">{label}</p>
                    <div className="space-y-1 mb-1.5">
                      {projects.filter(p => (d[p.id] ?? 0) > 0).map(p => (
                        <div key={p.id} className="flex justify-between gap-6 items-center">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                            <span className="truncate max-w-[120px]">{p.name}</span>
                          </div>
                          <span className="tabular-nums">{fmtH(d[p.id])}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between border-t border-[#555] pt-1.5 font-bold">
                      <span>Total</span>
                      <span className="tabular-nums">{fmtH(total)}</span>
                    </div>
                  </div>
                )
              }
              return (
                <div className="bg-[#333] text-white px-3 py-2.5 shadow-xl text-[12px] min-w-[160px]">
                  <p className="font-semibold border-b border-[#555] pb-1.5 mb-1.5">{label}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between gap-6">
                      <span className="text-[#8bc34a]">Billable</span>
                      <span className="tabular-nums">{fmtH(d?.billable ?? 0)}</span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span className="text-[#6aaa1e]">Non-billable</span>
                      <span className="tabular-nums">{fmtH(d?.nonBillable ?? 0)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between border-t border-[#555] pt-1.5 mt-1.5 font-bold">
                    <span>Total</span>
                    <span className="tabular-nums">{fmtH((d?.billable ?? 0) + (d?.nonBillable ?? 0))}</span>
                  </div>
                </div>
              )
            }}
          />

          {isProject ? (
            projects.map((proj, index) => (
              <Bar
                key={proj.id}
                dataKey={proj.id}
                name={proj.name}
                stackId="a"
                fill={proj.color}
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {index === projects.length - 1 && (
                  <LabelList
                    dataKey="totalLabel"
                    position="top"
                    style={{ fill: '#555', fontSize: 10 }}
                    formatter={(v: any) => v?.toString() || ''}
                    offset={6}
                  />
                )}
              </Bar>
            ))
          ) : (
            <Bar
              dataKey="total"
              shape={(props: any) => <CustomStackedBar {...props} billable={props.billable} nonBillable={props.nonBillable} />}
              isAnimationActive={true}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              <LabelList
                dataKey="totalLabel"
                position="top"
                style={{ fill: '#555', fontSize: 10 }}
                formatter={(v: any) => v?.toString() || '0:00'}
                offset={6}
              />
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
