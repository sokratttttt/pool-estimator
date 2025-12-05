'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AppleCard from '../apple/AppleCard';
import { formatCurrency } from '@/utils/analyticsUtils';

/**
 * График продаж по месяцам
 * @param {Array} data - данные по месяцам [{month, count, amount}]
 */
interface SalesChartProps {
  data?: any;
  active?: any;
  payload?: any;
}

export default function SalesChart({  data = []  }: SalesChartProps) {
    interface CustomTooltipProps {
  data?: any;
  active?: any;
  payload?: any;
}

const CustomTooltip = ({  active, payload  }: CustomTooltipProps) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-apple-surface border border-apple-border rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-medium mb-2">{payload[0].payload.month}</p>
                    <div className="space-y-1">
                        <p className="text-xs text-apple-text-secondary">
                            Количество: <span className="font-bold text-apple-primary">{payload[0].value}</span>
                        </p>
                        <p className="text-xs text-apple-text-secondary">
                            Сумма: <span className="font-bold text-blue-500">{formatCurrency(payload[1].value)}</span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
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
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                        <XAxis
                            dataKey="month"
                            stroke="#6b7280"
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <YAxis
                            yAxisId="left"
                            stroke="#0071E3"
                            tick={{ fill: '#0071E3', fontSize: 12 }}
                            label={{ value: 'Количество', angle: -90, position: 'insideLeft', fill: '#0071E3' }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#3b82f6"
                            tick={{ fill: '#3b82f6', fontSize: 12 }}
                            tickFormatter={(value: any) => `${(value / 1000000).toFixed(1)}М`}
                            label={{ value: 'Сумма (₽)', angle: 90, position: 'insideRight', fill: '#3b82f6' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value: any) => <span style={{ color: '#1f2937' }}>{value}</span>}
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="count"
                            stroke="#0071E3"
                            strokeWidth={3}
                            dot={{ fill: '#0071E3', r: 5 }}
                            activeDot={{ r: 7 }}
                            name="Количество смет"
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="amount"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', r: 5 }}
                            activeDot={{ r: 7 }}
                            name="Сумма продаж"
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </AppleCard>
    );
}
