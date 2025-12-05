'use client';

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';

// ============================================
// TYPES
// ============================================

export type EditableCellType = 'text' | 'number' | 'currency' | 'percent';

export interface EditableCellProps {
    /** Текущее значение */
    value: string | number;
    /** Callback при изменении значения */
    onChange: (newValue: string | number) => void;
    /** Тип поля */
    type?: EditableCellType;
    /** Минимальное значение (для number/currency) */
    min?: number;
    /** Максимальное значение (для number/currency) */
    max?: number;
    /** Шаг изменения (для number) */
    step?: number;
    /** Функция форматирования для отображения */
    format?: (value: string | number) => string;
    /** Функция парсинга при вводе */
    parse?: (value: string) => string | number;
    /** Валидация значения */
    validate?: (value: string | number) => boolean | string;
    /** Placeholder при пустом значении */
    placeholder?: string;
    /** CSS классы */
    className?: string;
    /** Отключено */
    disabled?: boolean;
    /** Callback при начале редактирования */
    onEditStart?: () => void;
    /** Callback при завершении редактирования */
    onEditEnd?: (saved: boolean) => void;
    /** Включить редактирование по одинарному клику */
    editOnClick?: boolean;
    /** ID для табуляции */
    tabIndex?: number;
}

// ============================================
// UTILITIES
// ============================================

/**
 * Форматирует число как валюту (рубли)
 */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(value);
};

/**
 * Форматирует число как процент
 */
export const formatPercent = (value: number): string => {
    return `${value}%`;
};

/**
 * Парсит строку с валютой в число
 */
export const parseCurrency = (value: string): number => {
    const cleaned = value.replace(/[^\d.,\-]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
};

/**
 * Парсит строку с процентами в число
 */
export const parsePercent = (value: string): number => {
    const cleaned = value.replace(/[^\d.,\-]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
};

// ============================================
// COMPONENT
// ============================================

export const EditableCell = memo(function EditableCell({
    value,
    onChange,
    type = 'text',
    min,
    max,
    step = 1,
    format,
    parse,
    validate,
    placeholder = '—',
    className = '',
    disabled = false,
    onEditStart,
    onEditEnd,
    editOnClick = false,
    tabIndex = 0
}: EditableCellProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const cellRef = useRef<HTMLTableCellElement>(null);

    // Определяем форматтер по умолчанию
    const defaultFormat = useCallback((val: string | number): string => {
        if (format) return format(val);

        const numVal = typeof val === 'string' ? parseFloat(val) : val;

        switch (type) {
            case 'currency':
                return isNaN(numVal) ? placeholder : formatCurrency(numVal);
            case 'percent':
                return isNaN(numVal) ? placeholder : formatPercent(numVal);
            case 'number':
                return isNaN(numVal) ? placeholder : numVal.toLocaleString('ru-RU');
            default:
                return val?.toString() || placeholder;
        }
    }, [format, type, placeholder]);

    // Определяем парсер по умолчанию
    const defaultParse = useCallback((val: string): string | number => {
        if (parse) return parse(val);

        switch (type) {
            case 'currency':
                return parseCurrency(val);
            case 'percent':
                return parsePercent(val);
            case 'number':
                const num = parseFloat(val.replace(',', '.'));
                return isNaN(num) ? 0 : num;
            default:
                return val;
        }
    }, [parse, type]);

    // Начать редактирование
    const startEdit = useCallback(() => {
        if (disabled) return;

        setIsEditing(true);
        setInputValue(String(value));
        setError(null);
        onEditStart?.();
    }, [disabled, value, onEditStart]);

    // Сохранить изменения
    const saveEdit = useCallback(() => {
        const parsedValue = defaultParse(inputValue);

        // Валидация
        if (validate) {
            const validationResult = validate(parsedValue);
            if (validationResult !== true) {
                setError(typeof validationResult === 'string' ? validationResult : 'Некорректное значение');
                return false;
            }
        }

        // Проверка min/max для числовых типов
        if (type !== 'text' && typeof parsedValue === 'number') {
            if (min !== undefined && parsedValue < min) {
                setError(`Минимум: ${min}`);
                return false;
            }
            if (max !== undefined && parsedValue > max) {
                setError(`Максимум: ${max}`);
                return false;
            }
        }

        onChange(parsedValue);
        setIsEditing(false);
        setError(null);
        onEditEnd?.(true);
        return true;
    }, [inputValue, defaultParse, validate, type, min, max, onChange, onEditEnd]);

    // Отменить редактирование
    const cancelEdit = useCallback(() => {
        setIsEditing(false);
        setInputValue(String(value));
        setError(null);
        onEditEnd?.(false);
    }, [value, onEditEnd]);

    // Обработка клавиш
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                if (saveEdit()) {
                    // Переход к следующей ячейке
                    const nextCell = cellRef.current?.parentElement?.nextElementSibling?.querySelector('[data-editable-cell]') as HTMLElement;
                    nextCell?.focus();
                }
                break;

            case 'Tab':
                if (saveEdit()) {
                    // Браузер сам переключит фокус
                } else {
                    e.preventDefault();
                }
                break;

            case 'Escape':
                e.preventDefault();
                cancelEdit();
                cellRef.current?.focus();
                break;

            case 'ArrowUp':
                if (type === 'number' || type === 'currency' || type === 'percent') {
                    e.preventDefault();
                    const currentVal = parseFloat(inputValue) || 0;
                    setInputValue(String(currentVal + step));
                }
                break;

            case 'ArrowDown':
                if (type === 'number' || type === 'currency' || type === 'percent') {
                    e.preventDefault();
                    const currentVal = parseFloat(inputValue) || 0;
                    setInputValue(String(Math.max(min ?? -Infinity, currentVal - step)));
                }
                break;
        }
    }, [saveEdit, cancelEdit, type, inputValue, step, min]);

    // Обработка клавиш в режиме просмотра
    const handleCellKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === 'F2' || e.key === ' ') {
            e.preventDefault();
            startEdit();
        }
    }, [startEdit]);

    // Фокус на input при начале редактирования
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    // Обработчик кастомного события
    useEffect(() => {
        const cell = cellRef.current;
        if (!cell) return;

        const handler = () => startEdit();
        cell.addEventListener('start-edit', handler);
        return () => cell.removeEventListener('start-edit', handler);
    }, [startEdit]);

    // Режим редактирования
    if (isEditing) {
        return (
            <td
                ref={cellRef}
                className={`editable-cell editing ${className} ${error ? 'has-error' : ''}`}
                data-editable-cell
            >
                <div className="editable-cell-input-wrapper">
                    <input
                        ref={inputRef}
                        type={type === 'text' ? 'text' : 'text'}
                        inputMode={type !== 'text' ? 'decimal' : 'text'}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setError(null);
                        }}
                        onKeyDown={handleKeyDown}
                        onBlur={saveEdit}
                        className="editable-cell-input"
                        placeholder={placeholder}
                    />
                    {error && (
                        <div className="editable-cell-error">{error}</div>
                    )}
                </div>
            </td>
        );
    }

    // Режим просмотра
    return (
        <td
            ref={cellRef}
            className={`editable-cell ${disabled ? 'disabled' : ''} ${className}`}
            data-editable-cell
            tabIndex={disabled ? -1 : tabIndex}
            onDoubleClick={startEdit}
            onClick={editOnClick ? startEdit : undefined}
            onKeyDown={handleCellKeyDown}
            title={disabled ? undefined : 'Двойной клик или Enter для редактирования'}
            role="gridcell"
            aria-readonly={disabled}
        >
            <span className="editable-cell-value">
                {defaultFormat(value)}
            </span>
            {!disabled && (
                <span className="editable-cell-icon" aria-hidden="true">
                    ✎
                </span>
            )}
        </td>
    );
});

// ============================================
// STYLES (inline for component portability)
// ============================================

export const editableCellStyles = `
.editable-cell {
  position: relative;
  cursor: pointer;
  transition: background-color 0.15s ease;
  padding: 0.5rem 0.75rem;
  user-select: none;
}

.editable-cell:hover:not(.disabled) {
  background-color: rgba(0, 217, 255, 0.05);
}

.editable-cell:focus {
  outline: 2px solid var(--color-cyan-bright, #00D9FF);
  outline-offset: -2px;
  background-color: rgba(0, 217, 255, 0.1);
}

.editable-cell.disabled {
  cursor: default;
  opacity: 0.6;
}

.editable-cell.editing {
  padding: 0;
}

.editable-cell-input-wrapper {
  position: relative;
}

.editable-cell-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 2px solid var(--color-cyan-bright, #00D9FF);
  border-radius: 4px;
  background: var(--color-bg-secondary, #161b22);
  color: var(--color-text-primary, #fff);
  font-size: inherit;
  font-family: inherit;
  outline: none;
}

.editable-cell-input:focus {
  box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.2);
}

.editable-cell.has-error .editable-cell-input {
  border-color: var(--color-error, #FF5252);
}

.editable-cell-error {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  padding: 0.25rem 0.5rem;
  background: var(--color-error, #FF5252);
  color: white;
  font-size: 0.75rem;
  border-radius: 0 0 4px 4px;
  z-index: 10;
}

.editable-cell-value {
  display: block;
}

.editable-cell-icon {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  font-size: 0.75rem;
  color: var(--color-text-tertiary, #6e7781);
  transition: opacity 0.15s ease;
}

.editable-cell:hover .editable-cell-icon,
.editable-cell:focus .editable-cell-icon {
  opacity: 0.6;
}

/* Compact mode styles */
[data-compact="true"] .editable-cell {
  padding: 0.25rem 0.5rem;
}

[data-compact="true"] .editable-cell-input {
  padding: 0.25rem 0.5rem;
}
`;

export default EditableCell;
