'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface StatsDonutProps {
    data?: any;
    active?: any;
    payload?: any;
    cx?: any;
    cy?: any;
    midAngle?: any;
    innerRadius?: any;
    outerRadius?: any;
    percent?: any;
}

export default function StatsDonut({ data }: StatsDonutProps) {
    const COLORS = {
        'Черновик': '#FFB800',
        'Завершена': '#00E5A0',
        'Отправлена': '#00D9FF',
        'В работе': '#A78BFA'
    };

    interface CustomTooltipProps {
        data?: any;
        active?: any;
        payload?: any;
        cx?: any;
        cy?: any;
        midAngle?: any;
        innerRadius?: any;
        outerRadius?: any;
        percent?: any;
    }

    const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-apple-surface border border-apple-border rounded-lg p-3 shadow-xl">
                    <p className="text-sm text-apple-text-secondary mb-1">{payload[0].name}</p>
                    <p className="text-lg font-bold" style={{ color: payload[0].payload.fill }}>
                        {payload[0].value} смет
                    </p>
                </div>
            );
        }
        return null;
    };

    interface renderCustomLabelProps {
        data?: any;
        active?: any;
        payload?: any;
        cx?: any;
        cy?: any;
        midAngle?: any;
        innerRadius?: any;
        outerRadius?: any;
        percent?: any;
    }

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: renderCustomLabelProps) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null;

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="text-sm font-bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
        >
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={80}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                    >
                        {data.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.label] || entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value: any, _entry: any) => (
                            <span className="text-sm text-apple-text-primary">{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </motion.div>
    );
}
