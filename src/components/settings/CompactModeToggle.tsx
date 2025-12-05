'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '@/context/SettingsContext';
import { Minimize2, Maximize2, Monitor } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface CompactModeToggleProps {
    /** Размер переключателя */
    size?: 'sm' | 'md' | 'lg';
    /** Показывать метку */
    showLabel?: boolean;
    /** Дополнительные классы */
    className?: string;
    /** Callback при изменении */
    onChange?: (isCompact: boolean) => void;
}

// ============================================
// COMPONENT
// ============================================

export const CompactModeToggle: React.FC<CompactModeToggleProps> = ({
    size = 'md',
    showLabel = true,
    className = '',
    onChange
}) => {
    const { settings, updateSetting } = useSettings();
    const isCompact = settings.compactMode;

    // Применяем атрибут data-compact к документу
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-compact', String(isCompact));
        }

        return () => {
            if (typeof document !== 'undefined') {
                document.documentElement.removeAttribute('data-compact');
            }
        };
    }, [isCompact]);

    const handleToggle = () => {
        const newValue = !isCompact;
        updateSetting('compactMode', newValue);
        onChange?.(newValue);
    };

    const sizeClasses = {
        sm: 'compact-toggle-sm',
        md: 'compact-toggle-md',
        lg: 'compact-toggle-lg'
    };

    return (
        <div className={`compact-mode-toggle ${sizeClasses[size]} ${className}`}>
            {showLabel && (
                <span className="compact-toggle-label">
                    Компактный режим
                </span>
            )}

            <button
                onClick={handleToggle}
                className={`compact-toggle-button ${isCompact ? 'active' : ''}`}
                title={isCompact ? 'Выключить компактный режим' : 'Включить компактный режим'}
                aria-pressed={isCompact}
            >
                <motion.div
                    className="compact-toggle-track"
                    animate={{
                        backgroundColor: isCompact
                            ? 'var(--color-cyan-bright, #00D9FF)'
                            : 'rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <motion.div
                        className="compact-toggle-thumb"
                        animate={{
                            x: isCompact ? '100%' : '0%'
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                        {isCompact ? (
                            <Minimize2 size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} />
                        ) : (
                            <Maximize2 size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} />
                        )}
                    </motion.div>
                </motion.div>
            </button>

            {showLabel && (
                <span className="compact-toggle-status">
                    {isCompact ? 'Вкл' : 'Выкл'}
                </span>
            )}
        </div>
    );
};

// ============================================
// EXTENDED COMPONENT: Compact Mode Panel
// ============================================

export interface CompactModePanelProps {
    className?: string;
}

export const CompactModePanel: React.FC<CompactModePanelProps> = ({
    className = ''
}) => {
    const { settings, updateSetting } = useSettings();

    return (
        <div className={`compact-mode-panel ${className}`}>
            <div className="compact-panel-header">
                <Monitor size={18} />
                <h3>Плотность интерфейса</h3>
            </div>

            <div className="compact-panel-options">
                <button
                    className={`compact-option ${!settings.compactMode ? 'active' : ''}`}
                    onClick={() => updateSetting('compactMode', false)}
                >
                    <Maximize2 size={20} />
                    <span className="option-label">Стандартный</span>
                    <span className="option-desc">Больше отступов и пространства</span>
                </button>

                <button
                    className={`compact-option ${settings.compactMode ? 'active' : ''}`}
                    onClick={() => updateSetting('compactMode', true)}
                >
                    <Minimize2 size={20} />
                    <span className="option-label">Компактный</span>
                    <span className="option-desc">Больше информации на экране</span>
                </button>
            </div>

            <p className="compact-panel-hint">
                💡 Компактный режим увеличивает плотность данных на 40%
            </p>
        </div>
    );
};

// ============================================
// STYLES
// ============================================

export const compactModeToggleStyles = `
/* Toggle Component */
.compact-mode-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.compact-toggle-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary, #8b949e);
}

.compact-toggle-status {
  font-size: 0.75rem;
  color: var(--color-text-tertiary, #6e7781);
  min-width: 2rem;
}

.compact-toggle-button {
  position: relative;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.compact-toggle-track {
  display: flex;
  align-items: center;
  width: 44px;
  height: 24px;
  border-radius: 12px;
  padding: 2px;
  transition: background-color 0.2s;
}

.compact-toggle-thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: var(--color-bg-primary, #0d1117);
  border-radius: 50%;
  color: var(--color-text-primary, #fff);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.compact-toggle-button.active .compact-toggle-thumb {
  color: #000;
  background: #fff;
}

/* Size Variants */
.compact-toggle-sm .compact-toggle-track {
  width: 36px;
  height: 18px;
}

.compact-toggle-sm .compact-toggle-thumb {
  width: 14px;
  height: 14px;
}

.compact-toggle-lg .compact-toggle-track {
  width: 52px;
  height: 28px;
}

.compact-toggle-lg .compact-toggle-thumb {
  width: 24px;
  height: 24px;
}

/* Panel Component */
.compact-mode-panel {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.compact-panel-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: var(--color-text-primary, #fff);
}

.compact-panel-header h3 {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
}

.compact-panel-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.compact-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid transparent;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--color-text-secondary, #8b949e);
}

.compact-option:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-text-primary, #fff);
}

.compact-option.active {
  border-color: var(--color-cyan-bright, #00D9FF);
  background: rgba(0, 217, 255, 0.1);
  color: var(--color-text-primary, #fff);
}

.compact-option .option-label {
  font-size: 0.875rem;
  font-weight: 600;
}

.compact-option .option-desc {
  font-size: 0.6875rem;
  text-align: center;
  opacity: 0.7;
}

.compact-panel-hint {
  font-size: 0.75rem;
  color: var(--color-text-tertiary, #6e7781);
  margin: 0;
  text-align: center;
}

/* Keyboard shortcut indicator */
.compact-toggle-shortcut {
  position: absolute;
  top: -8px;
  right: -8px;
  padding: 0.125rem 0.375rem;
  background: var(--color-bg-tertiary, #21262d);
  border-radius: 0.25rem;
  font-size: 0.5rem;
  color: var(--color-text-tertiary, #6e7781);
  opacity: 0;
  transition: opacity 0.15s;
}

.compact-toggle-button:hover .compact-toggle-shortcut,
.compact-toggle-button:focus .compact-toggle-shortcut {
  opacity: 1;
}
`;

export default CompactModeToggle;
