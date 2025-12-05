'use client';

import React from 'react';
import {
    Home, Calculator, Users, Package, FileText,
    Settings, PanelLeftClose, PanelLeft, BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ActivityBarProps {
    onToggleSidebar: () => void;
    isSidebarVisible: boolean;
}

interface NavItem {
    id: string;
    icon: React.ReactNode;
    label: string;
    href: string;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
    onToggleSidebar,
    isSidebarVisible
}) => {
    const pathname = usePathname();

    const topItems: NavItem[] = [
        { id: 'home', icon: <Home size={20} />, label: 'Главная', href: '/' },
        { id: 'calculator', icon: <Calculator size={20} />, label: 'Калькулятор', href: '/calculator' },
        { id: 'clients', icon: <Users size={20} />, label: 'Клиенты', href: '/clients' },
        { id: 'catalog', icon: <Package size={20} />, label: 'Каталог', href: '/catalog' },
        { id: 'estimates', icon: <FileText size={20} />, label: 'Сметы', href: '/estimates' },
        { id: 'analytics', icon: <BarChart3 size={20} />, label: 'Аналитика', href: '/analytics' },
    ];

    const bottomItems: NavItem[] = [
        { id: 'settings', icon: <Settings size={20} />, label: 'Настройки', href: '/settings' },
    ];

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname?.startsWith(href);
    };

    return (
        <div className="pro-activitybar">
            <div className="pro-activitybar-top">
                {/* Sidebar Toggle */}
                <button
                    className="pro-activitybar-item"
                    onClick={onToggleSidebar}
                    title={isSidebarVisible ? 'Скрыть панель' : 'Показать панель'}
                >
                    {isSidebarVisible ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
                </button>

                {/* Navigation Items */}
                {topItems.map((item) => (
                    <Link
                        key={item.id}
                        href={item.href}
                        className={`pro-activitybar-item ${isActive(item.href) ? 'active' : ''}`}
                        title={item.label}
                    >
                        {item.icon}
                    </Link>
                ))}
            </div>

            <div className="pro-activitybar-bottom">
                {bottomItems.map((item) => (
                    <Link
                        key={item.id}
                        href={item.href}
                        className={`pro-activitybar-item ${isActive(item.href) ? 'active' : ''}`}
                        title={item.label}
                    >
                        {item.icon}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ActivityBar;
