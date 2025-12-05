'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AppleCard from '../apple/AppleCard';
import { formatCurrency } from '@/utils/analyticsUtils';

/**
 * Топ оборудования
 * @param {Array} data - топ оборудования [{name, count, totalAmount, category}]
 */
interface TopEquipmentProps {
    data?: any;
    name?: any;
    maxLength?: any;
    active?: any;
    payload?: any;
}

export default function TopEquipment({ data = [] }: TopEquipmentProps) {
    // Ограничить название для отображения
    interface truncateNameProps {
        data?: any;
        name?: any;
        maxLength?: any;
        active?: any;
        payload?: any;
    }

    const truncateName = ({ name, maxLength = 30 }: truncateNameProps) => {
        return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
    };

    const chartData = data.map(item => ({
        ...item,
        displayName: truncateName({ name: item.name, maxLength: 25 })
    }));

    interface CustomTooltipProps {
        data?: any;
        name?: any;
        maxLength?: any;
        active?: any;
        payload?: any;
    }

    const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            return (
                <div className="bg-apple-surface border border-apple-border rounded-lg p-3 shadow-lg max-w-xs">
                    <p className="text-sm font-medium mb-2">{item.name}</p>
                    <div className="space-y-1">
                        <p className="text-xs text-apple-text-secondary">
                            Категория: <span className="font-bold">{item.category}</span>
                        </p>
                        <p className="text-xs text-apple-text-secondary">
                            Количество использований: <span className="font-bold text-apple-primary">{item.count}</span>
                        </p>
                        <p className="text-xs text-apple-text-secondary">
                            Общая сумма: <span className="font-bold text-green-500">{formatCurrency(item.totalAmount)}</span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <AppleCard variant="glass" className="p-6">
            <h3 className="apple-heading-3 mb-6">Топ-10 оборудов ания</h3>

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
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                        <XAxis
                            type="number"
                            stroke="#6b7280"
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <YAxis
                            type="category"
                            dataKey="displayName"
                            stroke="#6b7280"
                            tick={{ fill: '#6b7280', fontSize: 11 }}
                            width={140}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="count"
                            fill="#0071E3"
                            radius={[0, 8, 8, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </AppleCard>
    );
}
