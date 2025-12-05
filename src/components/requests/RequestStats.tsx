'use client';

import { motion } from 'framer-motion';
import { FileText, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import AppleCard from '../apple/AppleCard';

interface RequestStatsData {
    total_requests: number;
    new_requests: number;
    in_progress_requests: number;
    completed_requests: number;
    hot_leads: number;
    warm_leads: number;
    conversion_rate: number;
    converted_to_estimates: number;
}

interface RequestStatsProps {
    stats: RequestStatsData | null;
    loading?: boolean;
}

export default function RequestStats({ stats, loading }: RequestStatsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <AppleCard key={i} variant="premium" className="h-32 animate-pulse" />
                ))}
            </div>
        );
    }

    const statsCards = [
        {
            label: 'Всего заявок',
            value: stats?.total_requests || 0,
            icon: FileText,
            color: 'cyan',
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            label: 'Новые',
            value: stats?.new_requests || 0,
            icon: Clock,
            color: 'blue',
            gradient: 'from-blue-600 to-blue-400'
        },
        {
            label: 'В работе',
            value: stats?.in_progress_requests || 0,
            icon: AlertCircle,
            color: 'yellow',
            gradient: 'from-yellow-600 to-yellow-400'
        },
        {
            label: 'Завершено',
            value: stats?.completed_requests || 0,
            icon: CheckCircle2,
            color: 'green',
            gradient: 'from-green-600 to-green-400'
        },
        {
            label: 'Горячие лиды',
            value: stats?.hot_leads || 0,
            icon: TrendingUp,
            color: 'red',
            gradient: 'from-red-600 to-orange-500'
        },
        {
            label: 'Теплые лиды',
            value: stats?.warm_leads || 0,
            icon: TrendingUp,
            color: 'orange',
            gradient: 'from-orange-600 to-orange-400'
        },
        {
            label: 'Конверсия в сметы',
            value: `${stats?.conversion_rate || 0}%`,
            icon: CheckCircle2,
            color: 'purple',
            gradient: 'from-purple-600 to-pink-500',
            subtext: `${stats?.converted_to_estimates || 0} из ${stats?.total_requests || 0}`
        }
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
            {statsCards.map((stat, _index) => {
                const Icon = stat.icon;
                return (
                    <motion.div key={stat.label} variants={item}>
                        <AppleCard variant="premium" className="relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Icon size={64} />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                                        <Icon size={20} className="text-white" />
                                    </div>
                                    <p className="apple-body-secondary">{stat.label}</p>
                                </div>
                                <p className="text-3xl font-bold text-white mb-1">
                                    {stat.value}
                                </p>
                                {stat.subtext && (
                                    <p className="apple-caption">{stat.subtext}</p>
                                )}
                            </div>
                        </AppleCard>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
