'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
    Calculator, Users, Package, FileText,
    Settings, BarChart3, Zap, Plus, Download, Eye
} from 'lucide-react';
import { ProButton } from '@/components/pro/ProButton';
import { ProCard } from '@/components/pro/ProCard';
import { useHistory } from '@/context/HistoryContext';
import './home.css';

const quickActions = [
    { label: 'Калькулятор типового бассейна', icon: Calculator, href: '/calculator' },
    { label: 'Добавить нового клиента', icon: Users, href: '/clients/new' },
    { label: 'Обновить прайс-лист', icon: Package, href: '/catalog' },
    { label: 'Настроить шаблоны', icon: Settings, href: '/settings' },
];

export default function HomePage() {
    const { estimates } = useHistory();

    // Calculate real stats from estimates
    const stats = useMemo(() => {
        const totalProjects = estimates.length;

        // Unique clients
        const uniqueClients = new Set(
            estimates.map(e => e.clientInfo?.name || e.clientInfo?.id).filter(Boolean)
        );
        const activeClients = uniqueClients.size;

        // Total revenue
        const totalRevenue = estimates.reduce((sum, e) => sum + (e.total || 0), 0);
        const revenueFormatted = totalRevenue >= 1000000
            ? `${(totalRevenue / 1000000).toFixed(1)} млн ₽`
            : `${(totalRevenue / 1000).toFixed(0)} тыс ₽`;

        // Average check
        const avgCheck = totalProjects > 0 ? Math.round(totalRevenue / totalProjects) : 0;
        const avgCheckFormatted = avgCheck >= 1000
            ? `${(avgCheck / 1000).toFixed(0)} 000 ₽`
            : `${avgCheck} ₽`;

        return [
            { label: 'Всего проектов', value: String(totalProjects), trend: '', icon: FileText },
            { label: 'Активные клиенты', value: String(activeClients), trend: '', icon: Users },
            { label: 'Выручка', value: revenueFormatted, trend: '', icon: BarChart3 },
            { label: 'Средний чек', value: avgCheckFormatted, trend: '', icon: Calculator },
        ];
    }, [estimates]);

    // Recent estimates (last 3)
    const recentEstimates = useMemo(() => {
        return estimates
            .slice(0, 3)
            .map((e, index) => ({
                id: e.id || String(index + 1),
                name: e.name || 'Без названия',
                client: e.clientInfo?.name || 'Без клиента',
                total: e.total || 0,
                date: e.createdAt
                    ? new Date(e.createdAt).toLocaleDateString('ru-RU')
                    : new Date().toLocaleDateString('ru-RU')
            }));
    }, [estimates]);

    // Activity from recent estimates
    const activity = useMemo(() => {
        return estimates.slice(0, 4).map((e, i) => {
            const date = e.createdAt ? new Date(e.createdAt) : new Date();
            const today = new Date();
            const isToday = date.toDateString() === today.toDateString();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const isYesterday = date.toDateString() === yesterday.toDateString();

            let timeStr = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
            if (isToday) timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            if (isYesterday) timeStr = 'Вчера';

            return {
                id: i,
                time: timeStr,
                action: 'Создана смета',
                detail: e.name || 'Без названия'
            };
        });
    }, [estimates]);

    return (
        <div className="pro-home">
            {/* Quick Actions Bar */}
            <div className="pro-home-toolbar">
                <div className="toolbar-left">
                    <Link href="/calculator">
                        <ProButton variant="primary" size="sm" icon={<Plus size={16} />}>
                            Новая смета
                        </ProButton>
                    </Link>
                    <Link href="/calculator/new">
                        <ProButton variant="outline" size="sm" icon={<Zap size={16} />}>
                            Быстрый старт
                        </ProButton>
                    </Link>
                </div>
                <div className="toolbar-right">
                    <span className="toolbar-hint">Ctrl+N — новая смета</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="pro-stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="pro-stat-card">
                        <div className="stat-header">
                            <stat.icon size={18} className="stat-icon" />
                            <span className="stat-label">{stat.label}</span>
                        </div>
                        <div className="stat-value">{stat.value}</div>
                        {stat.trend && <div className="stat-trend">{stat.trend}</div>}
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="pro-home-grid">
                {/* Recent Estimates */}
                <ProCard
                    title="Последние сметы"
                    actions={
                        <Link href="/history">
                            <ProButton variant="ghost" size="xs" icon={<Eye size={14} />}>
                                Все сметы
                            </ProButton>
                        </Link>
                    }
                    className="recent-card"
                >
                    <div className="estimates-list">
                        {recentEstimates.length > 0 ? (
                            recentEstimates.map((estimate) => (
                                <Link
                                    key={estimate.id}
                                    href={`/estimates/${estimate.id}`}
                                    className="estimate-item"
                                >
                                    <div className="estimate-info">
                                        <div className="estimate-name">{estimate.name}</div>
                                        <div className="estimate-client">{estimate.client}</div>
                                    </div>
                                    <div className="estimate-meta">
                                        <div className="estimate-total">
                                            {estimate.total.toLocaleString('ru-RU')} ₽
                                        </div>
                                        <div className="estimate-date">{estimate.date}</div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                Нет сохраненных смет
                            </div>
                        )}
                    </div>

                    <div className="card-footer">
                        <ProButton variant="outline" size="sm" icon={<Download size={14} />}>
                            Экспорт отчета
                        </ProButton>
                    </div>
                </ProCard>

                {/* Quick Actions */}
                <ProCard title="Быстрые действия" className="actions-card">
                    <div className="quick-actions-list">
                        {quickActions.map((action, index) => (
                            <Link key={index} href={action.href} className="quick-action-item">
                                <action.icon size={18} />
                                <span>{action.label}</span>
                            </Link>
                        ))}
                    </div>
                </ProCard>

                {/* Activity Feed */}
                <ProCard title="Активность" className="activity-card">
                    <div className="activity-list">
                        {activity.length > 0 ? (
                            activity.map((item) => (
                                <div key={item.id} className="activity-item">
                                    <div className="activity-time">{item.time}</div>
                                    <div className="activity-content">
                                        <strong>{item.action}</strong> — {item.detail}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-400">
                                Нет активности
                            </div>
                        )}
                    </div>
                </ProCard>
            </div>
        </div>
    );
}

