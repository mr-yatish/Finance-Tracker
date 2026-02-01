"use client"

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface AnalyticsChartsProps {
    type: "pie" | "bar"
    data: any[]
}

export function AnalyticsCharts({ type, data }: AnalyticsChartsProps) {
    if (!data || data.length === 0) {
        return <div className="flex h-[300px] items-center justify-center text-muted-foreground">No data available</div>
    }

    if (type === "pie") {
        return (
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value: any) => [`₹${value}`, 'Amount']}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        )
    }

    if (type === "bar") {
        return (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} stroke="#888888" fontSize={12} />
                    <YAxis axisLine={false} tickLine={false} stroke="#888888" fontSize={12} tickFormatter={(value) => `₹${value}`} />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value: any) => [`₹${value}`, 'Amount']}
                    />
                    <Legend />
                    <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
                    <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expense" />
                </BarChart>
            </ResponsiveContainer>
        )
    }

    return null
}
