'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X, Search, Command } from 'lucide-react';
import { useGlobalShortcuts, formatShortcut, type ShortcutConfig } from '@/hooks/useGlobalShortcuts';

// ============================================
// TYPES
// ============================================

export interface ShortcutsHelpProps {
  /** Показывать как модальное окно */
  isOpen: boolean;
  /** Callback при закрытии */
  onClose: () => void;
  /** Дополнительные shortcuts для отображения */
  additionalShortcuts?: ShortcutConfig[];
}

interface CategoryInfo {
  id: ShortcutConfig['category'];
  label: string;
  icon: React.ReactNode;
}

// ============================================
// CONSTANTS
// ============================================

const CATEGORIES: CategoryInfo[] = [
  { id: 'navigation', label: 'Навигация', icon: <Command size={16} /> },
  { id: 'general', label: 'Общие', icon: <Keyboard size={16} /> },
  { id: 'editing', label: 'Редактирование', icon: '✏️' },
  { id: 'export', label: 'Экспорт', icon: '📤' },
];

// ============================================
// COMPONENT
// ============================================

export const ShortcutsHelp: React.FC<ShortcutsHelpProps> = ({
  isOpen,
  onClose,
  additionalShortcuts = []
}) => {
  const { shortcuts } = useGlobalShortcuts({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Объединяем все shortcuts
  const allShortcuts = useMemo(() => [
    ...shortcuts,
    ...additionalShortcuts
  ], [shortcuts, additionalShortcuts]);

  // Фильтрация и группировка
  const groupedShortcuts = useMemo(() => {
    let filtered = allShortcuts;

    // Поиск
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = allShortcuts.filter(s =>
        s.description.toLowerCase().includes(q) ||
        s.key.toLowerCase().includes(q)
      );
    }

    // Фильтр по категории
    if (activeCategory) {
      filtered = filtered.filter(s => s.category === activeCategory);
    }

    // Группировка
    const groups: Record<string, ShortcutConfig[]> = {};
    filtered.forEach(shortcut => {
      const category = shortcut.category || 'general';
      if (!groups[category]) groups[category] = [];
      groups[category].push(shortcut);
    });

    return groups;
  }, [allShortcuts, searchQuery, activeCategory]);

  // Закрытие по Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="shortcuts-help-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="shortcuts-help-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="shortcuts-help-header">
              <div className="shortcuts-help-title">
                <Keyboard size={24} />
                <h2>Горячие клавиши</h2>
              </div>
              <button onClick={onClose} className="shortcuts-close-btn">
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="shortcuts-search">
              <Search size={16} className="shortcuts-search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск команды..."
                className="shortcuts-search-input"
                autoFocus
              />
            </div>

            {/* Category Tabs */}
            <div className="shortcuts-categories">
              <button
                onClick={() => setActiveCategory(null)}
                className={`shortcuts-category-btn ${!activeCategory ? 'active' : ''}`}
              >
                Все
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id || null)}
                  className={`shortcuts-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Shortcuts List */}
            <div className="shortcuts-list">
              {Object.entries(groupedShortcuts).map(([category, items]) => {
                const categoryInfo = CATEGORIES.find(c => c.id === category);

                return (
                  <div key={category} className="shortcuts-group">
                    <h3 className="shortcuts-group-title">
                      {categoryInfo?.icon}
                      {categoryInfo?.label || category}
                    </h3>

                    <div className="shortcuts-items">
                      {items.map((shortcut, index) => (
                        <motion.div
                          key={shortcut.key}
                          className="shortcut-item"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                        >
                          <span className="shortcut-description">
                            {shortcut.description}
                          </span>
                          <kbd className="shortcut-key">
                            {formatShortcut(shortcut.key)}
                          </kbd>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {Object.keys(groupedShortcuts).length === 0 && (
                <div className="shortcuts-empty">
                  <p>Ничего не найдено</p>
                  <button onClick={() => {
                    setSearchQuery('');
                    setActiveCategory(null);
                  }}>
                    Сбросить фильтры
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shortcuts-footer">
              <p>
                💡 Нажмите <kbd>?</kbd> или <kbd>Ctrl+/</kbd> чтобы открыть эту справку
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// STYLES
// ============================================

export const shortcutsHelpStyles = `
.shortcuts-help-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.shortcuts-help-modal {
  background: var(--color-bg-secondary, #161b22);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  width: 100%;
  max-width: 560px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.shortcuts-help-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.shortcuts-help-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-text-primary, #fff);
}

.shortcuts-help-title h2 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.shortcuts-close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem;
  color: var(--color-text-secondary, #8b949e);
  cursor: pointer;
  transition: all 0.15s;
}

.shortcuts-close-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: var(--color-text-primary, #fff);
}

.shortcuts-search {
  position: relative;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.shortcuts-search-icon {
  position: absolute;
  left: 2rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary, #6e7781);
}

.shortcuts-search-input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: var(--color-text-primary, #fff);
  font-size: 0.875rem;
}

.shortcuts-search-input:focus {
  outline: none;
  border-color: var(--color-cyan-bright, #00D9FF);
}

.shortcuts-categories {
  display: flex;
  gap: 0.375rem;
  padding: 0.75rem 1.5rem;
  overflow-x: auto;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.shortcuts-category-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2rem;
  color: var(--color-text-secondary, #8b949e);
  font-size: 0.75rem;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s;
}

.shortcuts-category-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-primary, #fff);
}

.shortcuts-category-btn.active {
  background: var(--color-cyan-bright, #00D9FF);
  border-color: var(--color-cyan-bright, #00D9FF);
  color: #000;
}

.shortcuts-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
}

.shortcuts-group {
  margin-bottom: 1.5rem;
}

.shortcuts-group:last-child {
  margin-bottom: 0;
}

.shortcuts-group-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-tertiary, #6e7781);
  margin: 0 0 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.shortcuts-items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.shortcut-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  transition: background 0.15s;
}

.shortcut-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.shortcut-description {
  font-size: 0.8125rem;
  color: var(--color-text-primary, #fff);
}

.shortcut-key {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.25rem;
  font-family: var(--font-mono, monospace);
  font-size: 0.6875rem;
  color: var(--color-text-secondary, #8b949e);
}

.shortcuts-empty {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-tertiary, #6e7781);
}

.shortcuts-empty button {
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 0.375rem;
  color: var(--color-text-primary, #fff);
  font-size: 0.8125rem;
  cursor: pointer;
}

.shortcuts-footer {
  padding: 0.75rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.shortcuts-footer p {
  font-size: 0.75rem;
  color: var(--color-text-tertiary, #6e7781);
  margin: 0;
}

.shortcuts-footer kbd {
  padding: 0.125rem 0.375rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
  font-family: var(--font-mono, monospace);
  font-size: 0.625rem;
}
`;

export default ShortcutsHelp;
