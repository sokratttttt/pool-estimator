'use client';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AppleCard from '../apple/AppleCard';
import { formatCurrency } from '@/utils/analyticsUtils';

/**
 * Круговая диаграмма категорий
 * @param {Array} data - данные по категориям [{name, value, count}]
 */
interface CategoryPieProps {
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

export default function CategoryPie({ data = [] }: CategoryPieProps) {
    // Цвета для разных категорий
    const COLORS = [
        '#0071E3', // Apple Blue
        '#00B4D8', // Cyan
        '#34C759', // Green
        '#FF9500', // Orange
        '#FF3B30', // Red
        '#AF52DE', // Purple
        '#5856D6', // Indigo
        '#FF2D55', // Pink
        '#30B0C7', // Teal
        '#FFD60A'  // Yellow
    ];

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
            const item = payload[0].payload;
            const total = data.reduce((sum: any, d: any) => sum + d.value, 0);
            const percentage = total > 0 ? (item.value / total * 100).toFixed(1) : 0;

            return (
                <div className="bg-apple-surface border border-apple-border rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-medium mb-2">{item.name}</p>
                    <div className="space-y-1">
                        <p className="text-xs text-apple-text-secondary">
                            Позиций: <span className="font-bold">{item.count}</span>
                        </p>
                        <p className="text-xs text-apple-text-secondary">
                            Сумма: <span className="font-bold text-green-500">{formatCurrency(item.value)}</span>
                        </p>
                        <p className="text-xs text-apple-text-secondary">
                            Доля: <span className="font-bold text-apple-primary">{percentage}%</span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    interface renderCustomizedLabelProps {
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

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: renderCustomizedLabelProps) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null; // Не показывать метки для маленьких сегментов

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontWeight="bold"
                fontSize="12"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <AppleCard variant="glass" className="p-6">
            <h3 className="apple-heading-3 mb-6">Распределение по категориям</h3>

            {data.length === 0 ? (
                <div className="h-96 flex items-center justify-center text-apple-text-tertiary">
                    Нет данных для отображения
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={140}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value: any) => <span style={{ color: '#1f2937', fontSize: '12px' }}>{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </AppleCard>
    );
}
