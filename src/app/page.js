'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
    Plus,
    TrendingUp,
    Users,
    FileText,
    DollarSign,
} from 'lucide-react';
import AppleCard from '../components/apple/AppleCard';
import AppleButton from '../components/apple/AppleButton';
import SalesChart from '../components/dashboard/SalesChart';
import StatsDonut from '../components/dashboard/StatsDonut';
import { SkeletonStats, SkeletonChart } from '@/components/Skeleton';
import { useHistory } from '@/context/HistoryContext';
import { useSync } from '@/context/SyncContext';
import StickyNotes from '@/components/StickyNotes';

export default function Dashboard() {
    const { estimates: history } = useHistory();
    const { user } = useSync();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEstimates: 0,
        totalValue: 0,
        thisMonth: 0
    });

    const [chartData, setChartData] = useState({
        sales: [],
        status: []
    });

    useEffect(() => {
        // Simulate initial loading
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (history) {
            const total = history.reduce((acc, item) => acc + (item.total || 0), 0);
            const thisMonth = history.filter(item => {
                const date = new Date(item.updatedAt || item.createdAt);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length;

            setStats({
                totalEstimates: history.length,
                totalValue: total,
                thisMonth
            });

            // Prepare Sales Data (Last 7 days)
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                return d;
            });

            const sales = last7Days.map(date => {
                const dayStr = date.toLocaleDateString('ru-RU', { weekday: 'short' });
                const dateStr = date.toISOString().split('T')[0];

                const dayTotal = history
                    .filter(h => (h.updatedAt || h.createdAt).startsWith(dateStr))
                    .reduce((sum, h) => sum + (h.total || 0), 0);

                return { label: dayStr, value: dayTotal };
            });

            // Prepare Status Data
            const statusCounts = history.reduce((acc, item) => {
                const status = item.status || 'draft';
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {});

            const statusMap = {
                'draft': { label: 'Черновик', color: '#FFB800' },
                'completed': { label: 'Завершена', color: '#00E5A0' },
                'sent': { label: 'Отправлена', color: '#00D9FF' },
                'in_progress': { label: 'В работе', color: '#A78BFA' },
            };

            const status = Object.entries(statusCounts).map(([key, value]) => ({
                label: statusMap[key]?.label || key,
                value,
                color: statusMap[key]?.color || '#94A3B8'
            }));

            setChartData({ sales, status });
        }
    }, [history]);

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
        <div className="p-6 max-w-[1800px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                        Добро пожаловать, {user?.email?.split('@')[0] || 'Гость'}! 👋
                    </h1>
                    <p className="text-gray-400">
                        Вот обзор ваших проектов и активности на сегодня.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/calculator">
                        <AppleButton variant="primary" icon={<Plus size={20} />}>
                            Новая смета
                        </AppleButton>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            {isLoading ? (
                <SkeletonStats />
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 3xl:grid-cols-4 gap-6 mb-8"
                >
                    <motion.div variants={item}>
                        <AppleCard variant="premium" className="h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <FileText size={64} />
                            </div>
                            <div className="relative z-10">
                                <p className="text-gray-400 text-sm font-medium mb-1">Всего смет</p>
                                <h3 className="text-3xl font-bold text-white mb-2">{stats.totalEstimates}</h3>
                                <div className="flex items-center gap-1 text-emerald-400 text-sm">
                                    <TrendingUp size={14} />
                                    <span>+{stats.thisMonth} в этом месяце</span>
                                </div>
                            </div>
                        </AppleCard>
                    </motion.div>

                    <motion.div variants={item}>
                        <AppleCard variant="premium" className="h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <DollarSign size={64} />
                            </div>
                            <div className="relative z-10">
                                <p className="text-gray-400 text-sm font-medium mb-1">Общая сумма</p>
                                <h3 className="text-3xl font-bold text-white mb-2">
                                    {(stats.totalValue / 1000000).toFixed(1)}M ₽
                                </h3>
                                <p className="text-gray-500 text-xs">Суммарная стоимость проектов</p>
                            </div>
                        </AppleCard>
                    </motion.div>

                    <motion.div variants={item}>
                        <AppleCard variant="premium" className="h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Users size={64} />
                            </div>
                            <div className="relative z-10">
                                <p className="text-gray-400 text-sm font-medium mb-1">Клиенты</p>
                                <h3 className="text-3xl font-bold text-white mb-2">
                                    {new Set(history.map(h => h.clientName || h.clientInfo?.name).filter(Boolean)).size}
                                </h3>
                                <p className="text-gray-500 text-xs">Активные заказчики</p>
                            </div>
                        </AppleCard>
                    </motion.div>

                    <motion.div variants={item}>
                        <AppleCard variant="glass" className="h-full flex flex-col justify-center items-center text-center cursor-pointer hover:bg-white/5 transition-colors group" onClick={() => window.location.href = '/calculator'}>
                            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-glow">
                                <Plus size={24} className="text-white" />
                            </div>
                            <h3 className="font-bold text-white">Быстрый старт</h3>
                            <p className="text-sm text-gray-400">Создать новый расчет</p>
                        </AppleCard>
                    </motion.div>
                </motion.div>
            )}

            {/* Charts Section */}
            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2">
                        <AppleCard variant="premium">
                            <SkeletonChart type="bar" />
                        </AppleCard>
                    </div>
                    <AppleCard variant="premium">
                        <SkeletonChart type="donut" />
                    </AppleCard>
                </div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
                >
                    <motion.div variants={item} className="lg:col-span-2">
                        <SalesChart data={chartData.sales} />
                    </motion.div>
                    <motion.div variants={item}>
                        <StatsDonut data={chartData.status} />
                    </motion.div>
                </motion.div>
            )}

            {/* Sticky Notes Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
            >
                <StickyNotes />
            </motion.div>

            {/* Recent Activity + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 3xl:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">Последние проекты</h2>
                        <Link href="/history" className="text-sm text-cyan-bright hover:text-cyan-400 transition-colors">
                            Смотреть все
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {history.slice(0, 5).map((estimate, idx) => (
                            <motion.div
                                key={estimate.id || idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <AppleCard variant="glass" className="p-4 flex items-center gap-4 group hover:bg-white/5 transition-colors cursor-pointer" onClick={() => window.location.href = '/history'}>
                                    <div className="w-10 h-10 rounded-lg bg-navy-light flex items-center justify-center text-cyan-bright">
                                        <FileText size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-white truncate">{estimate.name}</h4>
                                        <p className="text-sm text-gray-400">
                                            {new Date(estimate.createdAt).toLocaleDateString('ru-RU')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gold">{estimate.total?.toLocaleString('ru-RU')} ₽</p>
                                    </div>
                                </AppleCard>
                            </motion.div>
                        ))}
                        {history.length === 0 && (
                            <AppleCard variant="flat" className="p-8 text-center">
                                <FileText size={48} className="mx-auto text-gray-500 mb-3" />
                                <p className="text-gray-400">Нет сохраненных смет</p>
                                <p className="text-sm text-gray-500 mb-4">Создайте первую смету в калькуляторе</p>
                                <Link href="/calculator">
                                    <AppleButton variant="primary" size="sm">
                                        Создать смету
                                    </AppleButton>
                                </Link>
                            </AppleCard>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-4">Быстрые действия</h2>
                    <div className="space-y-3">
                        <Link href="/calculator">
                            <AppleCard variant="glass" className="p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                                <h4 className="font-medium text-white mb-1 group-hover:text-cyan-bright transition-colors">Новая смета</h4>
                                <p className="text-sm text-gray-400">Создать расчет бассейна</p>
                            </AppleCard>
                        </Link>
                        <Link href="/clients">
                            <AppleCard variant="glass" className="p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                                <h4 className="font-medium text-white mb-1 group-hover:text-cyan-bright transition-colors">Клиенты</h4>
                                <p className="text-sm text-gray-400">Управление базой клиентов</p>
                            </AppleCard>
                        </Link>
                        <Link href="/templates">
                            <AppleCard variant="glass" className="p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                                <h4 className="font-medium text-white mb-1 group-hover:text-cyan-bright transition-colors">Шаблоны</h4>
                                <p className="text-sm text-gray-400">Сохраненные конфигурации</p>
                            </AppleCard>
                        </Link>
                    </div>
                </div>
            </div >
        </div >
    );
}
