'use client';
import { useState, useEffect, useMemo } from 'react';
import { useHistory } from '@/context/HistoryContext';
import {
    calculateKPIs,
    getSalesByMonth,
    getTopEquipment,
    getSalesByCategory,
    filterByDateRange,
    filterByManager,
    filterByStatus,
    formatCurrency,
    formatPercent
} from '@/utils/analyticsUtils';
import KPICard from '@/components/analytics/KPICard';
import SalesChart from '@/components/analytics/SalesChart';
import TopEquipment from '@/components/analytics/TopEquipment';
import CategoryPie from '@/components/analytics/CategoryPie';
import { TrendingUp, DollarSign, FileText, Target, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';
import AppleButton from '@/components/apple/AppleButton';

export default function AnalyticsPage() {
    const { estimates } = useHistory();
    const [loading, setLoading] = useState(true);

    // Фильтры
    const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'quarter', 'year', 'all'
    const [selectedManager] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    useEffect(() => {
        setLoading(false);
    }, []);

    // Фильтрация данных
    const filteredEstimates = useMemo(() => {
        let filtered = estimates;

        // Фильтр по дате
        if (dateRange !== 'all') {
            const now = new Date();
            let startDate = new Date();

            switch (dateRange) {
                case 'week':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case 'quarter':
                    startDate.setMonth(now.getMonth() - 3);
                    break;
                case 'year':
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
            }

            filtered = filterByDateRange(filtered, startDate, now);
        }

        // Фильтр по менеджеру
        filtered = filterByManager(filtered, selectedManager);

        // Фильтр по статусу
        filtered = filterByStatus(filtered, selectedStatus);

        return filtered;
    }, [estimates, dateRange, selectedManager, selectedStatus]);

    // Расчет метрик
    const kpis = useMemo(() => calculateKPIs(filteredEstimates), [filteredEstimates]);
    const salesByMonth = useMemo(() => getSalesByMonth(filteredEstimates), [filteredEstimates]);
    const topEquipment = useMemo(() => getTopEquipment(filteredEstimates, 10), [filteredEstimates]);
    const categoryData = useMemo(() => getSalesByCategory(filteredEstimates), [filteredEstimates]);


    if (loading) {
        return (
            <div className="min-h-screen bg-apple-bg-primary flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-apple-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-apple-text-secondary">Загрузка аналитики...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-apple-bg-primary">
            <div className="apple-container apple-section">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="apple-heading-1 mb-2">Аналитика продаж</h1>
                    <p className="apple-body-secondary">
                        Анализ эффективности и динамики продаж
                    </p>
                </motion.div>

                {/* Фильтры */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8 flex flex-wrap gap-4"
                >
                    <div className="flex items-center gap-2">
                        <Calendar size={20} className="text-apple-text-tertiary" />
                        <select
                            value={dateRange}
                            onChange={(e: React.ChangeEvent<any>) => setDateRange(e.target.value)}
                            className="apple-input w-auto"
                        >
                            <option value="week">Последняя неделя</option>
                            <option value="month">Последний месяц</option>
                            <option value="quarter">Последний квартал</option>
                            <option value="year">Последний год</option>
                            <option value="all">Все время</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <User size={20} className="text-apple-text-tertiary" />
                        <select
                            onChange={(e: React.ChangeEvent<any>) => setSelectedStatus(e.target.value)}
                            className="apple-input w-auto"
                        >
                            <option value="all">Все статусы</option>
                            <option value="draft">Черновик</option>
                            <option value="sent">Отправлено</option>
                            <option value="won">Выиграно</option>
                            <option value="lost">Проиграно</option>
                        </select>
                    </div>
                </motion.div>

                {/* KPI Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    <KPICard
                        label="Всего смет"
                        value={kpis.totalEstimates}
                        icon={<FileText size={24} />}
                    />
                    <KPICard
                        label="Общая сумма"
                        value={formatCurrency(kpis.totalAmount)}
                        icon={<DollarSign size={24} />}
                    />
                    <KPICard
                        label="Средний чек"
                        value={formatCurrency(kpis.averageCheck)}
                        icon={<TrendingUp size={24} />}
                    />
                    <KPICard
                        label="Конверсия"
                        value={formatPercent(kpis.conversionRate)}
                        icon={<Target size={24} />}
                        trend={kpis.conversionRate > 0.5 ? 'up' : 'neutral'}
                    />
                </motion.div>

                {/* Графики */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
                >
                    <div className="lg:col-span-2">
                        <SalesChart data={salesByMonth} />
                    </div>
                    <TopEquipment data={topEquipment} />
                    <CategoryPie data={categoryData} />
                </motion.div>

                {/* Пустое состояние */}
                {
                    filteredEstimates.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16"
                        >
                            <FileText size={64} className="mx-auto mb-4 text-apple-text-tertiary" />
                            <h3 className="apple-heading-3 mb-2">Нет данных для выбранных фильтров</h3>
                            <p className="apple-body-secondary mb-6">
                                Попробуйте изменить фильтры или создать первую смету
                            </p>
                            <AppleButton variant="primary" onClick={() => window.location.href = '/calculator'}>
                                Создать смету
                            </AppleButton>
                        </motion.div>
                    )
                }
            </div >
        </div >
    );
}
