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

// Custom bar shape — dark green bottom, light green top, $ icon in center
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
      {/* Dark green — billable (bottom) */}
      <rect x={x} y={y + nonBillableH} width={width} height={billableH} fill="#6aaa1e" />
      {/* Light green — non-billable (top) */}
      <rect x={x} y={y} width={width} height={nonBillableH} fill="#8bc34a" />
      {/* $ icon centered */}
      {height > 24 && (
        <text x={cx} y={cy + 6} textAnchor="middle" fill="white" fontSize={Math.min(18, width * 0.35)} fontWeight="bold">
          $
        </text>
      )}
    </g>
  )
}

export function SummaryBarChart({ data }: { data: BarDay[] }) {
  const chartData = data.map(d => ({
    name: d.name,
    total: Number((d.billable + d.nonBillable).toFixed(2)),
    billable: d.billable,
    nonBillable: d.nonBillable,
    totalLabel: d.totalLabel,
  }))

  return (
    <div className="h-[420px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart
          data={chartData}
          margin={{ top: 32, right: 16, left: 0, bottom: 8 }}
          barCategoryGap="20%"
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
            tickFormatter={v => v === 0 ? '0h' : `${Number(v).toFixed(1)}h`}
            width={46}
            tickCount={8}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.03)' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const d = payload[0]?.payload
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
          <Bar
            dataKey="total"
            shape={(props: any) => <CustomStackedBar {...props} billable={props.billable} nonBillable={props.nonBillable} />}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="totalLabel"
              position="top"
              style={{ fill: '#555', fontSize: 12 }}
              formatter={(v: string) => v || '0:00'}
              offset={6}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
