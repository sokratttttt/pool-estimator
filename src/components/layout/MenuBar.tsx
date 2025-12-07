'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus, Save, FolderOpen, Download, Printer, Upload
} from 'lucide-react';
import { toast } from 'sonner';

interface MenuItem {
    label: string;
    shortcut?: string;
    icon?: React.ReactNode;
    action?: () => void;
    separator?: boolean;
    disabled?: boolean;
}

interface Menu {
    label: string;
    items: MenuItem[];
}

export const MenuBar: React.FC = () => {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Функции для действий меню
    const handleNewEstimate = () => {
        router.push('/calculator');
        toast.success('Создание новой сметы');
    };

    const handleOpenHistory = () => {
        router.push('/history');
    };

    const handleExportPDF = () => {
        // Trigger global export event
        window.dispatchEvent(new CustomEvent('export-pdf'));
        toast.info('Экспорт в PDF...');
    };

    const handleExportExcel = () => {
        window.dispatchEvent(new CustomEvent('export-excel'));
        toast.info('Экспорт в Excel...');
    };

    const handleToggleTheme = (theme: 'dark' | 'light') => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        toast.success(`Тема изменена на ${theme === 'dark' ? 'тёмную' : 'светлую'}`);
    };

    const handleOpenSettings = () => {
        router.push('/settings');
    };

    const handleOpenCatalog = () => {
        router.push('/catalog');
    };

    const handleOpenAnalytics = () => {
        router.push('/analytics');
    };

    const handleOpenClients = () => {
        router.push('/clients');
    };

    const handleShowAbout = () => {
        toast.info('MOS-POOL Estimator v2.2.0\nПрофессиональный калькулятор бассейнов', {
            duration: 5000,
        });
    };

    const handleShowShortcuts = () => {
        toast.info(
            'Горячие клавиши:\n' +
            '• Ctrl+N — Новая смета\n' +
            '• Ctrl+S — Сохранить\n' +
            '• ← → — Навигация по шагам\n' +
            '• Ctrl+Z — Отменить',
            { duration: 8000 }
        );
    };

    const menus: Menu[] = [
        {
            label: 'Файл',
            items: [
                { label: 'Новая смета', shortcut: 'Ctrl+N', icon: <Plus size={14} />, action: handleNewEstimate },
                { label: 'История смет', shortcut: 'Ctrl+O', icon: <FolderOpen size={14} />, action: handleOpenHistory },
                { label: 'Сохранить', shortcut: 'Ctrl+S', icon: <Save size={14} />, action: () => window.dispatchEvent(new CustomEvent('save-estimate')) },
                { separator: true, label: '' },
                { label: 'Экспорт в PDF', shortcut: 'Ctrl+P', icon: <Download size={14} />, action: handleExportPDF },
                { label: 'Экспорт в Excel', shortcut: 'Ctrl+E', icon: <Download size={14} />, action: handleExportExcel },
                { separator: true, label: '' },
                { label: 'Импорт...', icon: <Upload size={14} />, action: () => toast.info('Импорт в разработке') },
                { separator: true, label: '' },
                { label: 'Печать...', shortcut: 'Ctrl+P', icon: <Printer size={14} />, action: () => window.print() },
            ]
        },
        {
            label: 'Редактирование',
            items: [
                { label: 'Отменить', shortcut: 'Ctrl+Z', action: () => window.dispatchEvent(new CustomEvent('undo')) },
                { label: 'Повторить', shortcut: 'Ctrl+Y', action: () => window.dispatchEvent(new CustomEvent('redo')) },
                { separator: true, label: '' },
                { label: 'Копировать смету', action: () => toast.info('Копирование в разработке') },
                { separator: true, label: '' },
                { label: 'Найти в каталоге...', shortcut: 'Ctrl+F', action: handleOpenCatalog },
            ]
        },
        {
            label: 'Вид',
            items: [
                { label: 'Тёмная тема', action: () => handleToggleTheme('dark') },
                { label: 'Светлая тема', action: () => handleToggleTheme('light') },
                { separator: true, label: '' },
                { label: 'Аналитика', action: handleOpenAnalytics },
                { label: 'Клиенты', action: handleOpenClients },
            ]
        },
        {
            label: 'Инструменты',
            items: [
                { label: 'Каталог оборудования', action: handleOpenCatalog },
                { label: 'Управление клиентами', action: handleOpenClients },
                { separator: true, label: '' },
                { label: 'Массовое обновление цен', action: () => toast.info('В разработке') },
                { label: 'Настройки', action: handleOpenSettings },
            ]
        },
        {
            label: 'Справка',
            items: [
                { label: 'Горячие клавиши', shortcut: 'Ctrl+/', action: handleShowShortcuts },
                { separator: true, label: '' },
                { label: 'О программе', action: handleShowAbout },
            ]
        }
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="pro-menubar" ref={menuRef}>
            <div className="pro-menubar-left">
                {/* Logo */}
                <div className="pro-menu-logo flex items-center">
                    <img
                        src="/logo.png"
                        alt="MOSPOOL"
                        className="h-8 w-auto object-contain mr-2"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                    />
                    <span className="hidden font-semibold text-[var(--pro-text-primary)]">MOS-POOL</span>
                </div>

                {/* Menus */}
                {menus.map((menu) => (
                    <div key={menu.label} className="pro-menu-item">
                        <button
                            className={`pro-menu-trigger ${activeMenu === menu.label ? 'active' : ''}`}
                            onClick={() => setActiveMenu(activeMenu === menu.label ? null : menu.label)}
                            onMouseEnter={() => activeMenu && setActiveMenu(menu.label)}
                        >
                            {menu.label}
                        </button>

                        {activeMenu === menu.label && (
                            <div className="pro-menu-dropdown" style={{ opacity: 1, visibility: 'visible', transform: 'translateY(0)' }}>
                                {menu.items.map((item, index) => (
                                    item.separator ? (
                                        <div key={index} className="pro-menu-separator" />
                                    ) : (
                                        <button
                                            key={index}
                                            className="pro-menu-option"
                                            onClick={() => {
                                                item.action?.();
                                                setActiveMenu(null);
                                            }}
                                            disabled={item.disabled}
                                        >
                                            <span className="pro-menu-option-icon">{item.icon}</span>
                                            <span className="pro-menu-option-label">{item.label}</span>
                                            {item.shortcut && (
                                                <span className="pro-menu-option-shortcut">{item.shortcut}</span>
                                            )}
                                        </button>
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="pro-menubar-center">
                {/* Title centered */}
            </div>

            <div className="pro-menubar-right">
                <button className="pro-toolbar-btn" title="Поиск (Ctrl+K)">
                    🔍
                </button>
                <button className="pro-toolbar-btn" title="Уведомления">
                    🔔
                </button>
                <button className="pro-toolbar-btn" title="Настройки">
                    ⚙️
                </button>
            </div>
        </div>
    );
};

export default MenuBar;
