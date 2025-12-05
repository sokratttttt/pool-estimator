'use client';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import AppleCard from '../apple/AppleCard';
import { formatCurrency } from '@/utils/analyticsUtils';

// Тип данных для продаж по месяцам
export interface SalesData {
    month: string;
    count: number;
    amount: number;
    year?: number;
}

// Пропсы компонента
export interface SalesChartProps {
    data?: SalesData[];
}

// Тип для данных в тултипе
interface TooltipPayloadItem {
    payload: SalesData;
    value: number;
    dataKey: string;
    color: string;
    name: string;
}

// Пропсы для кастомного тултипа
interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
}

export default function SalesChart({ data = [] }: SalesChartProps) {
    const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
        if (active && payload && payload.length > 0) {
            const monthData = payload[0].payload;
            const countItem = payload.find(p => p.dataKey === 'count');
            const amountItem = payload.find(p => p.dataKey === 'amount');

            return (
                <div className="bg-apple-surface border border-apple-border rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-medium mb-2">{monthData.month}</p>
                    <div className="space-y-1">
                        {countItem && (
                            <p className="text-xs text-apple-text-secondary">
                                Количество: <span className="font-bold text-apple-primary">
                                    {countItem.value.toLocaleString()}
                                </span>
                            </p>
                        )}
                        {amountItem && (
                            <p className="text-xs text-apple-text-secondary">
                                Сумма: <span className="font-bold text-blue-500">
                                    {formatCurrency(amountItem.value)}
                                </span>
                            </p>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    // Функция для форматирования значений на оси Y
    const formatYAxisValue = (value: number): string => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
        }
        return value.toString();
    };

    // Функция для форматирования легенды
    const renderLegendText = (value: string): React.ReactNode => {
        return <span style={{ color: '#1f2937' }}>{value}</span>;
    };

    return (
        <AppleCard variant="glass" className="p-6">
            <h3 className="apple-heading-3 mb-6">Динамика продаж</h3>

            {data.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-apple-text-tertiary">
                    Нет данных для отображения
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={320}>
                    <LineChart
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e5e7eb"
                            opacity={0.3}
                        />
                        <XAxis
                            dataKey="month"
                            stroke="#6b7280"
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <YAxis
                            yAxisId="left"
                            stroke="#0071E3"
                            tick={{ fill: '#0071E3', fontSize: 12 }}
                            label={{
                                value: 'Количество',
                                angle: -90,
                                position: 'insideLeft',
                                fill: '#0071E3',
                                offset: -10
                            }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#3b82f6"
                            tick={{ fill: '#3b82f6', fontSize: 12 }}
                            tickFormatter={formatYAxisValue}
                            label={{
                                value: 'Сумма (₽)',
                                angle: 90,
                                position: 'insideRight',
                                fill: '#3b82f6',
                                offset: -10
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={renderLegendText}
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="count"
                            stroke="#0071E3"
                            strokeWidth={3}
                            dot={{
                                fill: '#0071E3',
                                r: 5,
                                strokeWidth: 2,
                                stroke: '#ffffff'
                            }}
                            activeDot={{
                                r: 7,
                                strokeWidth: 2,
                                stroke: '#ffffff'
                            }}
                            name="Количество смет"
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="amount"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{
                                fill: '#3b82f6',
                                r: 5,
                                strokeWidth: 2,
                                stroke: '#ffffff'
                            }}
                            activeDot={{
                                r: 7,
                                strokeWidth: 2,
                                stroke: '#ffffff'
                            }}
                            name="Сумма продаж"
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </AppleCard>
    );
}