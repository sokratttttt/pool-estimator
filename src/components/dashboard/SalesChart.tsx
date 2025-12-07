'use client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface ChartDataPoint {
    label: string;
    value: number;
}

interface SalesChartProps {
    data?: ChartDataPoint[];
    type?: 'line' | 'bar';
}

export default function SalesChart({ data, type = 'line' }: SalesChartProps) {
    interface CustomTooltipProps {
        active?: boolean;
        payload?: Array<{
            value: number;
            payload: ChartDataPoint;
        }>;
    }

    const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-apple-surface border border-apple-border rounded-lg p-3 shadow-xl">
                    <p className="text-sm text-apple-text-secondary mb-1">{payload[0].payload.label}</p>
                    <p className="text-lg font-bold text-cyan-bright">
                        {payload[0].value.toLocaleString('ru-RU')} ₽
                    </p>
                </div>
            );
        }
        return null;
    };

    const ChartComponent = type === 'bar' ? BarChart : LineChart;
    const DataComponent = type === 'bar' ? Bar : Line;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
        >
            <ResponsiveContainer width="100%" height="100%">
                <ChartComponent data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#00D9FF" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis
                        dataKey="label"
                        stroke="#94A3B8"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#94A3B8"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <DataComponent
                        type={type === 'line' ? 'monotone' : undefined}
                        dataKey="value"
                        stroke="#00D9FF"
                        strokeWidth={3}
                        fill="url(#colorValue)"
                        dot={{ fill: '#00D9FF', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#00E5A0' }}
                    />
                </ChartComponent>
            </ResponsiveContainer>
        </motion.div>
    );
}
