'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// ============================================
// TYPES
// ============================================

export interface ShortcutConfig {
    /** Комбинация клавиш (например: 'ctrl+e', 'f2', 'ctrl+shift+s') */
    key: string;
    /** Описание для отображения пользователю */
    description: string;
    /** Функция-обработчик */
    action: () => void | Promise<void>;
    /** Условие активации (опционально) */
    condition?: () => boolean;
    /** Предотвращать стандартное поведение браузера (по умолчанию true) */
    preventDefault?: boolean;
    /** Категория для группировки в справке */
    category?: 'navigation' | 'editing' | 'export' | 'general';
    /** Работает ли в режиме редактирования input/textarea */
    worksInInput?: boolean;
}

export interface GlobalShortcutsOptions {
    /** Дополнительные shortcuts для текущей страницы */
    pageShortcuts?: ShortcutConfig[];
    /** Обработчик экспорта в Excel */
    onExportExcel?: () => void | Promise<void>;
    /** Обработчик экспорта в PDF */
    onExportPDF?: () => void | Promise<void>;
    /** Обработчик сохранения */
    onSave?: () => void | Promise<void>;
    /** Обработчик дублирования */
    onDuplicate?: () => void | Promise<void>;
    /** Обработчик открытия поиска */
    onSearch?: () => void;
    /** Обработчик создания новой сметы */
    onNewEstimate?: () => void;
}

export interface UseGlobalShortcutsReturn {
    /** Все зарегистрированные shortcuts */
    shortcuts: ShortcutConfig[];
    /** Получить shortcuts по категории */
    getShortcutsByCategory: (category: ShortcutConfig['category']) => ShortcutConfig[];
    /** Зарегистрировать временный shortcut */
    registerShortcut: (shortcut: ShortcutConfig) => () => void;
}

// ============================================
// UTILITIES
// ============================================

/**
 * Парсит строку комбинации клавиш в объект
 */
const parseKeyCombo = (combo: string): {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    meta: boolean;
    key: string;
} => {
    const parts = combo.toLowerCase().split('+');
    const key = parts[parts.length - 1];

    return {
        ctrl: parts.includes('ctrl') || parts.includes('control'),
        shift: parts.includes('shift'),
        alt: parts.includes('alt'),
        meta: parts.includes('meta') || parts.includes('cmd'),
        key
    };
};

/**
 * Проверяет, соответствует ли событие клавиатуры комбинации
 */
const matchesKeyCombo = (event: KeyboardEvent, combo: string): boolean => {
    const parsed = parseKeyCombo(combo);

    const eventKey = event.key.toLowerCase();
    const keyMatches = eventKey === parsed.key ||
        event.code.toLowerCase() === `key${parsed.key}` ||
        event.code.toLowerCase() === parsed.key;

    return (
        keyMatches &&
        event.ctrlKey === parsed.ctrl &&
        event.shiftKey === parsed.shift &&
        event.altKey === parsed.alt &&
        event.metaKey === parsed.meta
    );
};

/**
 * Проверяет, находится ли фокус в поле ввода
 */
const isInputFocused = (): boolean => {
    const activeElement = document.activeElement;
    if (!activeElement) return false;

    const tagName = activeElement.tagName.toLowerCase();
    const isContentEditable = activeElement.getAttribute('contenteditable') === 'true';

    return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || isContentEditable;
};

/**
 * Форматирует комбинацию клавиш для отображения
 */
export const formatShortcut = (combo: string): string => {
    const isMac = typeof window !== 'undefined' && navigator.platform.includes('Mac');

    return combo
        .split('+')
        .map(part => {
            switch (part.toLowerCase()) {
                case 'ctrl':
                case 'control':
                    return isMac ? '⌃' : 'Ctrl';
                case 'shift':
                    return isMac ? '⇧' : 'Shift';
                case 'alt':
                    return isMac ? '⌥' : 'Alt';
                case 'meta':
                case 'cmd':
                    return isMac ? '⌘' : 'Win';
                case 'enter':
                    return '↵';
                case 'escape':
                    return 'Esc';
                case 'backspace':
                    return '⌫';
                case 'delete':
                    return 'Del';
                case 'arrowup':
                    return '↑';
                case 'arrowdown':
                    return '↓';
                case 'arrowleft':
                    return '←';
                case 'arrowright':
                    return '→';
                default:
                    return part.toUpperCase();
            }
        })
        .join(isMac ? '' : '+');
};

// ============================================
// HOOK
// ============================================

export function useGlobalShortcuts(options: GlobalShortcutsOptions = {}): UseGlobalShortcutsReturn {
    const router = useRouter();

    const {
        pageShortcuts = [],
        onExportExcel,
        onExportPDF,
        onSave,
        onDuplicate,
        onSearch,
        onNewEstimate
    } = options;

    // Базовые глобальные shortcuts
    const baseShortcuts: ShortcutConfig[] = useMemo(() => [
        // === Навигация ===
        {
            key: 'ctrl+k',
            description: 'Открыть командную палитру',
            category: 'navigation',
            action: () => {
                // CommandPalette уже обрабатывает этот shortcut
                const event = new KeyboardEvent('keydown', {
                    key: 'k',
                    ctrlKey: true,
                    bubbles: true
                });
                document.dispatchEvent(event);
            }
        },
        {
            key: 'ctrl+1',
            description: 'Перейти к калькулятору',
            category: 'navigation',
            action: () => router.push('/calculator')
        },
        {
            key: 'ctrl+2',
            description: 'Перейти к истории',
            category: 'navigation',
            action: () => router.push('/history')
        },
        {
            key: 'ctrl+3',
            description: 'Перейти к каталогу',
            category: 'navigation',
            action: () => router.push('/catalog')
        },
        {
            key: 'ctrl+4',
            description: 'Перейти к клиентам',
            category: 'navigation',
            action: () => router.push('/clients')
        },
        {
            key: 'ctrl+5',
            description: 'Перейти к настройкам',
            category: 'navigation',
            action: () => router.push('/settings')
        },

        // === Экспорт ===
        {
            key: 'ctrl+e',
            description: 'Экспорт в Excel',
            category: 'export',
            action: async () => {
                if (onExportExcel) {
                    await onExportExcel();
                } else {
                    const event = new CustomEvent('export-excel');
                    window.dispatchEvent(event);
                    toast.info('Экспорт в Excel...');
                }
            }
        },
        {
            key: 'ctrl+p',
            description: 'Экспорт в PDF',
            category: 'export',
            preventDefault: true,
            action: async () => {
                if (onExportPDF) {
                    await onExportPDF();
                } else {
                    const event = new CustomEvent('export-pdf');
                    window.dispatchEvent(event);
                    toast.info('Экспорт в PDF...');
                }
            }
        },

        // === Общие операции ===
        {
            key: 'ctrl+s',
            description: 'Сохранить смету',
            category: 'general',
            action: async () => {
                if (onSave) {
                    await onSave();
                } else {
                    const event = new CustomEvent('save-estimate');
                    window.dispatchEvent(event);
                }
            }
        },
        {
            key: 'ctrl+n',
            description: 'Новая смета',
            category: 'general',
            action: () => {
                if (onNewEstimate) {
                    onNewEstimate();
                } else {
                    localStorage.removeItem('mos-pool-current-estimate');
                    router.push('/calculator');
                    toast.success('Создание новой сметы');
                }
            }
        },
        {
            key: 'ctrl+d',
            description: 'Дублировать смету',
            category: 'general',
            action: async () => {
                if (onDuplicate) {
                    await onDuplicate();
                } else {
                    toast.info('Выберите смету для дублирования');
                }
            }
        },
        {
            key: 'ctrl+f',
            description: 'Поиск',
            category: 'general',
            action: () => {
                if (onSearch) {
                    onSearch();
                } else {
                    // Попытка найти и сфокусировать поле поиска
                    const searchInput = document.querySelector<HTMLInputElement>(
                        '[data-search-input], #search-input, input[type="search"], input[placeholder*="поиск" i]'
                    );
                    if (searchInput) {
                        searchInput.focus();
                        searchInput.select();
                    } else {
                        // Открыть CommandPalette как fallback
                        const event = new KeyboardEvent('keydown', {
                            key: 'k',
                            ctrlKey: true,
                            bubbles: true
                        });
                        document.dispatchEvent(event);
                    }
                }
            }
        },

        // === Редактирование ===
        {
            key: 'f2',
            description: 'Редактировать выбранную ячейку',
            category: 'editing',
            condition: () => {
                const activeElement = document.activeElement;
                return !!(activeElement?.closest('[data-editable-cell]') ||
                    activeElement?.hasAttribute('data-editable-cell'));
            },
            action: () => {
                const cell = document.activeElement as HTMLElement;
                const editableCell = cell.closest('[data-editable-cell]') || cell;
                if (editableCell) {
                    const event = new CustomEvent('start-edit', { bubbles: true });
                    editableCell.dispatchEvent(event);
                }
            }
        },
        {
            key: 'escape',
            description: 'Отменить / Закрыть',
            category: 'general',
            worksInInput: true,
            action: () => {
                // Закрыть модальные окна
                const closeEvent = new CustomEvent('close-modal');
                window.dispatchEvent(closeEvent);

                // Отменить редактирование
                const editingCell = document.querySelector('[contenteditable="true"]');
                if (editingCell) {
                    (editingCell as HTMLElement).blur();
                    editingCell.setAttribute('contenteditable', 'false');
                }

                // Убрать фокус с input
                if (isInputFocused()) {
                    (document.activeElement as HTMLElement)?.blur();
                }
            }
        },

        // === Быстрые шаблоны ===
        {
            key: 'ctrl+t',
            description: 'Открыть шаблоны',
            category: 'general',
            action: () => {
                const event = new CustomEvent('open-templates');
                window.dispatchEvent(event);
                toast.info('Открытие шаблонов...');
            }
        }
    ], [router, onExportExcel, onExportPDF, onSave, onDuplicate, onSearch, onNewEstimate]);

    // Объединяем базовые и page-specific shortcuts
    const allShortcuts = useMemo(() => [
        ...baseShortcuts,
        ...pageShortcuts
    ], [baseShortcuts, pageShortcuts]);

    // Обработчик клавиатуры
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // Пропускаем, если в input и shortcut не работает в input
        const inInput = isInputFocused();

        for (const shortcut of allShortcuts) {
            if (!matchesKeyCombo(event, shortcut.key)) continue;

            // Проверяем, работает ли shortcut в input
            if (inInput && !shortcut.worksInInput) continue;

            // Проверяем условие активации
            if (shortcut.condition && !shortcut.condition()) continue;

            // Предотвращаем стандартное поведение
            if (shortcut.preventDefault !== false) {
                event.preventDefault();
                event.stopPropagation();
            }

            // Выполняем действие
            try {
                const result = shortcut.action();
                if (result instanceof Promise) {
                    result.catch(error => {
                        console.error(`Shortcut ${shortcut.key} error:`, error);
                        toast.error('Ошибка выполнения команды');
                    });
                }
            } catch (error) {
                console.error(`Shortcut ${shortcut.key} error:`, error);
                toast.error('Ошибка выполнения команды');
            }

            break; // Только один shortcut за раз
        }
    }, [allShortcuts]);

    // Регистрируем обработчик
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [handleKeyDown]);

    // Получить shortcuts по категории
    const getShortcutsByCategory = useCallback((category: ShortcutConfig['category']) => {
        return allShortcuts.filter(s => s.category === category);
    }, [allShortcuts]);

    // Динамическая регистрация shortcut
    const registerShortcut = useCallback((shortcut: ShortcutConfig) => {
        pageShortcuts.push(shortcut);

        // Возвращаем функцию отмены регистрации
        return () => {
            const index = pageShortcuts.indexOf(shortcut);
            if (index > -1) {
                pageShortcuts.splice(index, 1);
            }
        };
    }, [pageShortcuts]);

    return {
        shortcuts: allShortcuts,
        getShortcutsByCategory,
        registerShortcut
    };
}

export default useGlobalShortcuts;
