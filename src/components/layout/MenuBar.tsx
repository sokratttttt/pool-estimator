'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Plus, Save, FolderOpen, Download, Printer, Upload
} from 'lucide-react';

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

    const menus: Menu[] = [
        {
            label: 'Файл',
            items: [
                { label: 'Новая смета', shortcut: 'Ctrl+N', icon: <Plus size={14} />, action: () => { } },
                { label: 'Открыть...', shortcut: 'Ctrl+O', icon: <FolderOpen size={14} />, action: () => { } },
                { label: 'Сохранить', shortcut: 'Ctrl+S', icon: <Save size={14} />, action: () => { } },
                { label: 'Сохранить как...', shortcut: 'Ctrl+Shift+S', action: () => { } },
                { separator: true, label: '' },
                { label: 'Экспорт в PDF', shortcut: 'Ctrl+P', icon: <Download size={14} />, action: () => { } },
                { label: 'Экспорт в Excel', shortcut: 'Ctrl+E', icon: <Download size={14} />, action: () => { } },
                { separator: true, label: '' },
                { label: 'Импорт...', icon: <Upload size={14} />, action: () => { } },
                { separator: true, label: '' },
                { label: 'Печать...', shortcut: 'Ctrl+P', icon: <Printer size={14} />, action: () => window.print() },
            ]
        },
        {
            label: 'Редактирование',
            items: [
                { label: 'Отменить', shortcut: 'Ctrl+Z', action: () => { } },
                { label: 'Повторить', shortcut: 'Ctrl+Y', action: () => { } },
                { separator: true, label: '' },
                { label: 'Вырезать', shortcut: 'Ctrl+X', action: () => { } },
                { label: 'Копировать', shortcut: 'Ctrl+C', action: () => { } },
                { label: 'Вставить', shortcut: 'Ctrl+V', action: () => { } },
                { separator: true, label: '' },
                { label: 'Найти...', shortcut: 'Ctrl+F', action: () => { } },
                { label: 'Заменить...', shortcut: 'Ctrl+H', action: () => { } },
            ]
        },
        {
            label: 'Вид',
            items: [
                { label: 'Увеличить', shortcut: 'Ctrl++', action: () => { } },
                { label: 'Уменьшить', shortcut: 'Ctrl+-', action: () => { } },
                { label: 'Сбросить масштаб', shortcut: 'Ctrl+0', action: () => { } },
                { separator: true, label: '' },
                { label: 'Боковая панель', shortcut: 'Ctrl+B', action: () => { } },
                { label: 'Панель свойств', shortcut: 'Ctrl+Shift+P', action: () => { } },
                { separator: true, label: '' },
                { label: 'Тёмная тема', action: () => { } },
                { label: 'Светлая тема', action: () => { } },
                { label: 'Компактный режим', action: () => { } },
            ]
        },
        {
            label: 'Инструменты',
            items: [
                { label: 'Калькулятор материалов', action: () => { } },
                { label: 'Конвертер единиц', action: () => { } },
                { separator: true, label: '' },
                { label: 'Массовое обновление цен', action: () => { } },
                { label: 'Менеджер шаблонов', action: () => { } },
                { label: 'Генератор отчётов', action: () => { } },
            ]
        },
        {
            label: 'Справка',
            items: [
                { label: 'Документация', action: () => window.open('/docs') },
                { label: 'Горячие клавиши', shortcut: 'Ctrl+/', action: () => { } },
                { separator: true, label: '' },
                { label: 'Проверить обновления', action: () => { } },
                { separator: true, label: '' },
                { label: 'О программе', action: () => { } },
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
                <div className="pro-menu-logo">
                    <span style={{ fontSize: '16px', marginRight: '8px' }}>🏊</span>
                    <span style={{ fontWeight: 600, color: 'var(--pro-text-primary)' }}>Pool Estimator</span>
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
