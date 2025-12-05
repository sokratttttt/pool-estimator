'use client';

import React from 'react';
import Link from 'next/link';
import {
    Calculator, Users, Package, FileText,
    Settings, BarChart3, Zap, Plus, Download, Eye
} from 'lucide-react';
import { ProButton } from '@/components/pro/ProButton';
import { ProCard } from '@/components/pro/ProCard';
import './home.css';

// Пример данных
const stats = [
    { label: 'Всего проектов', value: '42', trend: '+12%', icon: FileText },
    { label: 'Активные клиенты', value: '18', trend: '+3 новых', icon: Users },
    { label: 'Выручка', value: '12.5 млн ₽', trend: '+8.5%', icon: BarChart3 },
    { label: 'Средний чек', value: '850 000 ₽', trend: 'стабильно', icon: Calculator },
];

const recentEstimates = [
    { id: 1, name: 'Бассейн 8×4м для загородного дома', client: 'Иванов А.П.', total: 1250000, date: '05.12.2024' },
    { id: 2, name: 'СПА-зона с джакузи', client: 'Петрова М.И.', total: 680000, date: '04.12.2024' },
    { id: 3, name: 'Бесконечный бассейн 12×5м', client: 'Сидоров К.В.', total: 2100000, date: '03.12.2024' },
];

const quickActions = [
    { label: 'Калькулятор типового бассейна', icon: Calculator, href: '/calculator' },
    { label: 'Добавить нового клиента', icon: Users, href: '/clients/new' },
    { label: 'Обновить прайс-лист', icon: Package, href: '/catalog' },
    { label: 'Настроить шаблоны', icon: Settings, href: '/settings' },
];

export default function HomePage() {

    return (
        <div className="pro-home">
            {/* Quick Actions Bar */}
            <div className="pro-home-toolbar">
                <div className="toolbar-left">
                    <ProButton variant="primary" size="sm" icon={<Plus size={16} />}>
                        Новая смета
                    </ProButton>
                    <ProButton variant="outline" size="sm" icon={<Zap size={16} />}>
                        Быстрый старт
                    </ProButton>
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
                        <div className="stat-trend">{stat.trend}</div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="pro-home-grid">
                {/* Recent Estimates */}
                <ProCard
                    title="Последние сметы"
                    actions={
                        <ProButton variant="ghost" size="xs" icon={<Eye size={14} />}>
                            Все сметы
                        </ProButton>
                    }
                    className="recent-card"
                >
                    <div className="estimates-list">
                        {recentEstimates.map((estimate) => (
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
                        ))}
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
                        <div className="activity-item">
                            <div className="activity-time">10:30</div>
                            <div className="activity-content">
                                <strong>Создана смета</strong> — Бассейн для загородного дома
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-time">09:15</div>
                            <div className="activity-content">
                                <strong>Экспорт PDF</strong> — Отчет для клиента Иванов
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-time">Вчера</div>
                            <div className="activity-content">
                                <strong>Обновлены цены</strong> — 24 позиции в каталоге
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-time">02.12</div>
                            <div className="activity-content">
                                <strong>Новый клиент</strong> — Петрова М.И. добавлена в базу
                            </div>
                        </div>
                    </div>
                </ProCard>
            </div>
        </div>
    );
}
