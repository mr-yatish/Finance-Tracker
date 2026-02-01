"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

export function SpendingChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>

    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                    formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, 'Amount']}
                />
                <Area
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}
