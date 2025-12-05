'use client';

import { TrendingUp, Target, DollarSign, Percent } from 'lucide-react';

interface DealStatsProps {
    deals?: any;
    stages?: any;
}

export default function DealStats({ deals }: DealStatsProps) {
    const totalValue = deals.reduce((sum: any, d: any) => sum + (d.value || 0), 0);
    const avgDealSize = deals.length > 0 ? totalValue / deals.length : 0;

    const completedDeals = deals.filter(d => d.stage === 'completed');
    const winRate = deals.length > 0 ? (completedDeals.length / deals.length) * 100 : 0;

    const weightedValue = deals.reduce((sum: any, d: any) =>
        sum + (d.value || 0) * (d.probability || 0) / 100, 0
    );

    const stats = [
        {
            label: 'Общая сумма',
            value: `${(totalValue / 1000000).toFixed(1)}M ₽`,
            icon: DollarSign,
            color: 'text-green-400'
        },
        {
            label: 'Прогноз',
            value: `${(weightedValue / 1000000).toFixed(1)}M ₽`,
            icon: TrendingUp,
            color: 'text-blue-400'
        },
        {
            label: 'Средний чек',
            value: `${(avgDealSize / 1000000).toFixed(1)}M ₽`,
            icon: Target,
            color: 'text-purple-400'
        },
        {
            label: 'Конверсия',
            value: `${winRate.toFixed(0)}%`,
            icon: Percent,
            color: 'text-orange-400'
        }
    ];

    return (
        <div className="bg-navy-light border-b border-gray-700 p-4">
            <div className="max-w-[2000px] mx-auto grid grid-cols-4 gap-4">
                {stats.map((stat: any, index: number) => (
                    <div
                        key={index}
                        className="bg-gray-800 rounded-lg p-4 flex items-center gap-4"
                    >
                        <div className={`p-3 rounded-full bg-gray-700 ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">{stat.label}</p>
                            <p className="text-white text-xl font-bold">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
