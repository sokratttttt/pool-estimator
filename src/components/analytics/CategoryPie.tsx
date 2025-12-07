'use client';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AppleCard from '../apple/AppleCard';
import { formatCurrency } from '@/utils/analyticsUtils';

// Типы данных для категорий
export interface CategoryData {
    name: string;
    value: number; // Используем value для суммы
    count?: number; // count теперь опциональный
    color?: string;
    [key: string]: unknown; // Добавлено для совместимости с recharts
}

// Пропсы компонента
export interface CategoryPieProps {
    data?: CategoryData[];
}

// Пропсы для пользовательского тултипа
interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: CategoryData;
        value: number;
        name: string;
        color: string;
    }>;
}

// Пропсы для меток диаграммы
interface LabelProps {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    percent?: number;
    index?: number;
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

    const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
        if (active && payload && payload.length > 0) {
            const item = payload[0].payload;
            const total = data.reduce((sum, d) => sum + d.value, 0);
            const percentage = total > 0 ? (item.value / total * 100).toFixed(1) : 0;

            return (
                <div className="bg-apple-surface border border-apple-border rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-medium mb-2">{item.name}</p>
                    <div className="space-y-1">
                        {item.count !== undefined && (
                            <p className="text-xs text-apple-text-secondary">
                                Позиций: <span className="font-bold">{item.count}</span>
                            </p>
                        )}
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

    const renderCustomizedLabel = ({
        cx = 0,
        cy = 0,
        midAngle = 0,
        innerRadius = 0,
        outerRadius = 0,
        percent = 0
    }: LabelProps) => {
        if (!percent || percent < 0.05) return null; // Не показывать метки для маленьких сегментов

        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

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

    // Преобразуем данные для recharts
    const chartData = data.map(item => ({
        ...item,
        // Убедимся что все необходимые поля есть
        name: item.name || '',
        value: item.value || 0
    }));

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
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={140}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value: string) => (
                                <span style={{ color: '#1f2937', fontSize: '12px' }}>{value}</span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </AppleCard>
    );
}