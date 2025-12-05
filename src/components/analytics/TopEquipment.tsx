'use client';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import AppleCard from '../apple/AppleCard';
import { formatCurrency } from '@/utils/analyticsUtils';

// Тип данных для оборудования
export interface EquipmentData {
    name: string;
    count: number;
    totalAmount: number;
    category: string;
}

// Тип данных для отображения в графике
interface ChartEquipmentData extends EquipmentData {
    displayName: string;
}

// Пропсы компонента
export interface TopEquipmentProps {
    data?: EquipmentData[];
    maxLength?: number;
}

// Пропсы для кастомного тултипа
interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: ChartEquipmentData;
        value: number;
        dataKey: string;
        color: string;
        name: string;
    }>;
    label?: string;
}

export default function TopEquipment({
    data = [],
    maxLength = 30
}: TopEquipmentProps) {
    // Ограничить название для отображения
    const truncateName = (name: string, maxLen: number = maxLength): string => {
        if (name.length > maxLen) {
            return name.substring(0, maxLen - 3) + '...';
        }
        return name;
    };

    // Подготовка данных для графика
    const chartData: ChartEquipmentData[] = data.map(item => ({
        ...item,
        displayName: truncateName(item.name, 25)
    }));

    const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
        if (active && payload && payload.length > 0) {
            const item = payload[0].payload;
            return (
                <div className="bg-apple-surface border border-apple-border rounded-lg p-3 shadow-lg max-w-xs">
                    <p className="text-sm font-medium mb-2">{item.name}</p>
                    <div className="space-y-1">
                        <p className="text-xs text-apple-text-secondary">
                            Категория: <span className="font-bold">{item.category}</span>
                        </p>
                        <p className="text-xs text-apple-text-secondary">
                            Количество использований: <span className="font-bold text-apple-primary">
                                {item.count.toLocaleString()}
                            </span>
                        </p>
                        <p className="text-xs text-apple-text-secondary">
                            Общая сумма: <span className="font-bold text-green-500">
                                {formatCurrency(item.totalAmount)}
                            </span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Функция для форматирования оси X
    const formatXAxisTick = (value: number): string => {
        return value.toLocaleString();
    };

    return (
        <AppleCard variant="glass" className="p-6">
            <h3 className="apple-heading-3 mb-6">Топ-10 оборудования</h3>

            {chartData.length === 0 ? (
                <div className="h-96 flex items-center justify-center text-apple-text-tertiary">
                    Нет данных для отображения
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e5e7eb"
                            opacity={0.3}
                            horizontal={false}
                        />
                        <XAxis
                            type="number"
                            stroke="#6b7280"
                            tick={{
                                fill: '#6b7280',
                                fontSize: 12
                            }}
                            tickFormatter={formatXAxisTick}
                        />
                        <YAxis
                            type="category"
                            dataKey="displayName"
                            stroke="#6b7280"
                            tick={{
                                fill: '#6b7280',
                                fontSize: 11
                            }}
                            width={140}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{
                                fill: 'rgba(0, 113, 227, 0.1)',
                                stroke: '#0071E3',
                                strokeWidth: 1,
                                strokeDasharray: '3 3'
                            }}
                        />
                        <Bar
                            dataKey="count"
                            name="Количество использований"
                            fill="#0071E3"
                            radius={[0, 8, 8, 0]}
                            animationDuration={1500}
                            animationBegin={0}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </AppleCard>
    );
}