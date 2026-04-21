'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts'

interface BarDay {
  name: string
  billable: number
  nonBillable: number
  totalLabel: string
}

function fmtH(hours: number) {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

export function SummaryBarChart({ data }: { data: BarDay[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 28, right: 16, left: 0, bottom: 8 }}
          barCategoryGap="30%"
          barGap={0}
        >
          <CartesianGrid vertical={false} stroke="#efefef" strokeDasharray="0" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#999' }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#bbb' }}
            tickFormatter={v => `${v}h`}
            width={36}
            tickCount={5}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.03)' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const b = Number(payload.find(p => p.dataKey === 'billable')?.value || 0)
              const nb = Number(payload.find(p => p.dataKey === 'nonBillable')?.value || 0)
              return (
                <div className="bg-[#333] text-white px-3 py-2.5 shadow-xl text-[12px] min-w-[160px]">
                  <p className="font-semibold border-b border-[#555] pb-1.5 mb-1.5">{label}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between gap-6">
                      <span className="text-[#b2d235]">Billable</span>
                      <span className="tabular-nums">{fmtH(b)}</span>
                    </div>
                    <div className="flex justify-between gap-6">
                      <span className="text-[#8bc34a]">Non-billable</span>
                      <span className="tabular-nums">{fmtH(nb)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between border-t border-[#555] pt-1.5 mt-1.5 font-bold">
                    <span>Total</span>
                    <span className="tabular-nums">{fmtH(b + nb)}</span>
                  </div>
                </div>
              )
            }}
          />
          {/* Billable — dark green, bottom */}
          <Bar dataKey="billable" name="Billable" stackId="a" fill="#7cb342" isAnimationActive={false} />
          {/* Non-billable — light green, top */}
          <Bar dataKey="nonBillable" name="Non-billable" stackId="a" fill="#b2d235" isAnimationActive={false} radius={[2, 2, 0, 0]}>
            <LabelList
              dataKey="totalLabel"
              position="top"
              style={{ fill: '#555', fontSize: 12 }}
              formatter={(v: any) => v || ''}
              offset={6}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
