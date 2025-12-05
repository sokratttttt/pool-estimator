'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Cpu, HardDrive } from 'lucide-react';

interface StatusBarProps {
    onToggleProperties: () => void;
    isPropertiesVisible: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
    onToggleProperties,
    isPropertiesVisible
}) => {
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            }));
        };

        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="pro-statusbar">
            <div className="pro-statusbar-left">
                <div className="pro-status-item">
                    <Cpu size={12} />
                    <span>Готов</span>
                </div>

                <div className="pro-status-separator" />

                <div className="pro-status-item">
                    <span>📄</span>
                    <span>Новая смета</span>
                </div>

                <div className="pro-status-separator" />

                <div className="pro-status-item">
                    <span>∑</span>
                    <span>0 позиций</span>
                </div>

                <div className="pro-status-separator" />

                <div className="pro-status-item pro-text-accent">
                    <span>💰</span>
                    <span style={{ fontFamily: 'var(--pro-font-mono)' }}>0 ₽</span>
                </div>
            </div>

            <div className="pro-statusbar-right">
                <button
                    className="pro-status-item clickable"
                    onClick={onToggleProperties}
                    title={isPropertiesVisible ? 'Скрыть свойства' : 'Показать свойства'}
                >
                    {isPropertiesVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                    <span>Свойства</span>
                </button>

                <div className="pro-status-separator" />

                <div className="pro-status-item">
                    <HardDrive size={12} />
                    <span>Сохранено</span>
                </div>

                <div className="pro-status-separator" />

                <div className="pro-status-item">
                    <span>v2.1.0</span>
                </div>

                <div className="pro-status-separator" />

                <div className="pro-status-item">
                    <span>{currentTime}</span>
                </div>
            </div>
        </div>
    );
};

export default StatusBar;
