'use client';
import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

type CategoryKey = 'materials' | 'equipment' | 'work' | 'additional';

interface EstimateItem {
    name?: string;
    category?: string;
    total?: number;
}

interface CategoryData {
    name: string;
    value: number;
    color: string;
    percentage: number;
    [key: string]: unknown; // Index signature for Recharts compatibility
}

interface TopItem {
    name: string;
    value: number;
}

interface EstimateChartsProps {
    items: EstimateItem[];
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        payload: {
            percentage?: number;
        };
    }>;
}

const COLORS: Record<CategoryKey, string> = {
    materials: '#3b82f6',  // Blue
    equipment: '#10b981',  // Green
    work: '#f59e0b',      // Orange
    additional: '#8b5cf6' // Purple
};

const CATEGORY_NAMES: Record<CategoryKey, string> = {
    materials: 'Материалы',
    equipment: 'Оборудование',
    work: 'Работы',
    additional: 'Опции'
};

export default function EstimateCharts({ items }: EstimateChartsProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // Process data into categories
    const processData = (): CategoryData[] => {
        const categoryTotals: Record<CategoryKey, number> = {
            materials: 0,
            equipment: 0,
            work: 0,
            additional: 0
        };

        items.forEach((item: EstimateItem) => {
            const category = item.category?.toLowerCase() || '';

            if (category.includes('чаша') || category.includes('материал') || category.includes('бетон') || category.includes('композит')) {
                categoryTotals.materials += item.total || 0;
            } else if (category.includes('фильтр') || category.includes('подогрев') || category.includes('нагрев') || category.includes('закладн')) {
                categoryTotals.equipment += item.total || 0;
            } else if (category.includes('работ') || category.includes('монтаж') || category.includes('установк')) {
                categoryTotals.work += item.total || 0;
            } else {
                categoryTotals.additional += item.total || 0;
            }
        });

        return (Object.entries(categoryTotals) as [CategoryKey, number][])
            .filter(([, value]) => value > 0)
            .map(([key, value]) => ({
                name: CATEGORY_NAMES[key],
                value: value,
                color: COLORS[key],
                percentage: 0 // Will calculate below
            }));
    };

    const categoryData = processData();
    const total = categoryData.reduce((sum: number, item: CategoryData) => sum + item.value, 0);
    categoryData.forEach((item: CategoryData) => {
        item.percentage = parseFloat(((item.value / total) * 100).toFixed(1));
    });

    // Top items for bar chart
    const topItems: TopItem[] = [...items]
        .sort((a: EstimateItem, b: EstimateItem) => (b.total || 0) - (a.total || 0))
        .slice(0, 10)
        .map((item: EstimateItem) => ({
            name: item.name && item.name.length > 30 ? item.name.substring(0, 30) + '...' : item.name || '',
            value: item.total || 0
        }));

    const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-800">{payload[0].name}</p>
                    <p className="text-blue-600 font-mono">
                        {payload[0].value.toLocaleString('ru-RU')} ₽
                    </p>
                    {payload[0].payload.percentage && (
                        <p className="text-sm text-gray-500">{payload[0].payload.percentage}%</p>
                    )}
                </div>
            );
        }
        return null;
    };

    if (items.length === 0) return null;

    return (
        <div className="mt-8 space-y-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Аналитика сметы</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pie Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">Распределение по категориям</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(props: { name?: string; percentage?: number }) => `${props.name}: ${props.percentage}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                onMouseEnter={(_: unknown, index: number) => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                            >
                                {categoryData.map((entry: CategoryData, index: number) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">Топ-10 позиций</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topItems} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                type="number"
                                tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
                                stroke="#888"
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={150}
                                tick={{ fontSize: 11 }}
                                stroke="#888"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categoryData.map((cat: CategoryData, idx: number) => (
                    <div
                        key={idx}
                        className="bg-white rounded-xl p-4 shadow-sm border-l-4 hover:shadow-md transition-shadow"
                        style={{ borderColor: cat.color }}
                    >
                        <div className="text-sm text-gray-600 mb-1">{cat.name}</div>
                        <div className="text-2xl font-bold text-gray-800 mb-1">
                            {(cat.value / 1000).toFixed(0)}k ₽
                        </div>
                        <div className="text-xs text-gray-500">{cat.percentage}% от общей суммы</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
