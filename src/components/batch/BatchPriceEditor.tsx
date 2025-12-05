'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Percent, CheckSquare, Square } from 'lucide-react';
import { formatCurrency } from '@/components/editable/EditableCell';

// ============================================
// TYPES
// ============================================

export interface EstimateItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit?: string;
  section?: string;
}

export type BatchOperation = 'increase' | 'decrease' | 'set' | 'round';
export type BatchUnit = 'percent' | 'absolute';

export interface BatchUpdate {
  itemId: string;
  oldPrice: number;
  newPrice: number;
  difference: number;
  percentChange: number;
}

export interface BatchPriceEditorProps {
  /** Список позиций */
  items: EstimateItem[];
  /** Callback при применении изменений */
  onUpdate: (updates: Record<string, Partial<EstimateItem>>) => void;
  /** Callback при закрытии */
  onClose?: () => void;
  /** Показывать как модальное окно */
  isModal?: boolean;
  /** Дополнительные классы */
  className?: string;
}

// ============================================
// COMPONENT
// ============================================

export const BatchPriceEditor: React.FC<BatchPriceEditorProps> = memo(function BatchPriceEditor({
  items,
  onUpdate,
  onClose,
  isModal = true,
  className = ''
}) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [operation, setOperation] = useState<BatchOperation>('increase');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<BatchUnit>('percent');
  const [showPreview, setShowPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Фильтрованный список
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.section?.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  // Группировка по секциям
  const groupedItems = useMemo(() => {
    const groups: Record<string, EstimateItem[]> = {};
    filteredItems.forEach(item => {
      const section = item.section || 'Без категории';
      if (!groups[section]) groups[section] = [];
      groups[section].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Расчёт предпросмотра изменений
  const previewUpdates = useMemo((): BatchUpdate[] => {
    const numericValue = parseFloat(value.replace(',', '.'));
    if (isNaN(numericValue) || numericValue === 0) return [];

    return Array.from(selectedItems).map(itemId => {
      const item = items.find(i => i.id === itemId);
      if (!item) return null;

      let newPrice = item.price;

      switch (operation) {
        case 'increase':
          newPrice = unit === 'percent'
            ? item.price * (1 + numericValue / 100)
            : item.price + numericValue;
          break;

        case 'decrease':
          newPrice = unit === 'percent'
            ? item.price * (1 - numericValue / 100)
            : item.price - numericValue;
          break;

        case 'set':
          newPrice = numericValue;
          break;

        case 'round':
          // Округление до ближайшего значения
          const roundTo = numericValue || 100;
          newPrice = Math.round(item.price / roundTo) * roundTo;
          break;
      }

      newPrice = Math.max(0, newPrice);
      const difference = newPrice - item.price;
      const percentChange = item.price > 0 ? (difference / item.price) * 100 : 0;

      return {
        itemId,
        oldPrice: item.price,
        newPrice,
        difference,
        percentChange
      };
    }).filter(Boolean) as BatchUpdate[];
  }, [selectedItems, items, operation, value, unit]);

  // Общая сумма изменений
  const totalDifference = useMemo(() => {
    return previewUpdates.reduce((sum, u) => {
      const item = items.find(i => i.id === u.itemId);
      const qty = item?.quantity || 1;
      return sum + (u.difference * qty);
    }, 0);
  }, [previewUpdates, items]);

  // Выбрать/снять все
  const handleSelectAll = useCallback(() => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  }, [selectedItems, filteredItems]);

  // Выбрать по секции
  const handleSelectSection = useCallback((section: string) => {
    const sectionItems = groupedItems[section] || [];
    const sectionIds = sectionItems.map(i => i.id);
    const allSelected = sectionIds.every(id => selectedItems.has(id));

    const newSelected = new Set(selectedItems);
    if (allSelected) {
      sectionIds.forEach(id => newSelected.delete(id));
    } else {
      sectionIds.forEach(id => newSelected.add(id));
    }
    setSelectedItems(newSelected);
  }, [groupedItems, selectedItems]);

  // Переключить выбор элемента
  const toggleItem = useCallback((id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  }, [selectedItems]);

  // Применить изменения
  const handleApply = useCallback(() => {
    if (previewUpdates.length === 0) return;

    const updates: Record<string, Partial<EstimateItem>> = {};
    previewUpdates.forEach(u => {
      updates[u.itemId] = { price: Math.round(u.newPrice * 100) / 100 };
    });

    onUpdate(updates);
    setSelectedItems(new Set());
    setValue('');
    setShowPreview(false);
    onClose?.();
  }, [previewUpdates, onUpdate, onClose]);

  // Сбросить выбор
  const handleReset = useCallback(() => {
    setSelectedItems(new Set());
    setValue('');
    setShowPreview(false);
  }, []);

  const content = (
    <div className={`batch-price-editor ${className}`}>
      {/* Header */}
      <div className="batch-header">
        <h2>Массовое редактирование цен</h2>
        {isModal && onClose && (
          <button onClick={onClose} className="batch-close-btn">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="batch-controls">
        <div className="batch-operation-row">
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value as BatchOperation)}
            className="batch-select"
          >
            <option value="increase">📈 Увеличить на</option>
            <option value="decrease">📉 Уменьшить на</option>
            <option value="set">🎯 Установить</option>
            <option value="round">🔢 Округлить до</option>
          </select>

          <div className="batch-input-group">
            <input
              type="text"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={operation === 'round' ? '100' : '0'}
              className="batch-input"
            />

            {operation !== 'set' && operation !== 'round' && (
              <div className="batch-unit-toggle">
                <button
                  onClick={() => setUnit('percent')}
                  className={`batch-unit-btn ${unit === 'percent' ? 'active' : ''}`}
                  title="Процент"
                >
                  <Percent size={16} />
                </button>
                <button
                  onClick={() => setUnit('absolute')}
                  className={`batch-unit-btn ${unit === 'absolute' ? 'active' : ''}`}
                  title="Рубли"
                >
                  ₽
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="batch-actions-row">
          <button
            onClick={handleSelectAll}
            className="batch-select-all-btn"
          >
            {selectedItems.size === filteredItems.length ? (
              <><CheckSquare size={16} /> Снять все</>
            ) : (
              <><Square size={16} /> Выбрать все ({filteredItems.length})</>
            )}
          </button>

          <span className="batch-selected-count">
            Выбрано: <strong>{selectedItems.size}</strong>
          </span>

          {selectedItems.size > 0 && value && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="batch-preview-btn"
            >
              {showPreview ? 'Скрыть' : 'Просмотр'}
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="batch-search">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск по названию..."
          className="batch-search-input"
        />
      </div>

      {/* Items List */}
      <div className="batch-items-list">
        {Object.entries(groupedItems).map(([section, sectionItems]) => (
          <div key={section} className="batch-section">
            <div
              className="batch-section-header"
              onClick={() => handleSelectSection(section)}
            >
              <span className="batch-section-name">{section}</span>
              <span className="batch-section-count">({sectionItems.length})</span>
            </div>

            {sectionItems.map(item => {
              const isSelected = selectedItems.has(item.id);
              const preview = previewUpdates.find(u => u.itemId === item.id);

              return (
                <div
                  key={item.id}
                  className={`batch-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="batch-item-checkbox">
                    {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                  </div>

                  <div className="batch-item-info">
                    <span className="batch-item-name">{item.name}</span>
                    <span className="batch-item-qty">
                      {item.quantity} {item.unit || 'шт.'}
                    </span>
                  </div>

                  <div className="batch-item-prices">
                    <span className={`batch-item-old-price ${preview ? 'strikethrough' : ''}`}>
                      {formatCurrency(item.price)}
                    </span>

                    {preview && showPreview && (
                      <span className={`batch-item-new-price ${preview.difference >= 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency(preview.newPrice)}
                        <span className="batch-item-diff">
                          {preview.difference >= 0 ? '+' : ''}
                          {preview.percentChange.toFixed(1)}%
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Preview Summary */}
      <AnimatePresence>
        {showPreview && previewUpdates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="batch-preview-summary"
          >
            <div className="preview-stats">
              <div className="preview-stat">
                <span>Изменяется позиций</span>
                <strong>{previewUpdates.length}</strong>
              </div>
              <div className={`preview-stat ${totalDifference >= 0 ? 'positive' : 'negative'}`}>
                <span>Изменение суммы</span>
                <strong>
                  {totalDifference >= 0 ? '+' : ''}
                  {formatCurrency(totalDifference)}
                </strong>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="batch-footer">
        <button onClick={handleReset} className="batch-reset-btn">
          Сбросить
        </button>

        <button
          onClick={handleApply}
          disabled={selectedItems.size === 0 || !value}
          className="batch-apply-btn"
        >
          <Check size={18} />
          Применить к {selectedItems.size} позиц.
        </button>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="batch-editor-overlay">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="batch-editor-modal"
        >
          {content}
        </motion.div>
      </div>
    );
  }

  return content;
});

// ============================================
// STYLES
// ============================================

export const batchPriceEditorStyles = `
.batch-editor-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.batch-editor-modal {
  background: var(--color-bg-secondary, #161b22);
  border-radius: 1rem;
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.batch-price-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.batch-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.batch-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary, #fff);
  margin: 0;
}

.batch-close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem;
  color: var(--color-text-secondary, #8b949e);
  cursor: pointer;
}

.batch-close-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: var(--color-text-primary, #fff);
}

.batch-controls {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.batch-operation-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.batch-select {
  flex: 1;
  padding: 0.625rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: var(--color-text-primary, #fff);
  font-size: 0.875rem;
}

.batch-input-group {
  display: flex;
  gap: 0.25rem;
}

.batch-input {
  width: 100px;
  padding: 0.625rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: var(--color-text-primary, #fff);
  font-size: 0.875rem;
  text-align: right;
}

.batch-input:focus {
  outline: none;
  border-color: var(--color-cyan-bright, #00D9FF);
}

.batch-unit-toggle {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  overflow: hidden;
}

.batch-unit-btn {
  padding: 0.625rem 0.75rem;
  background: transparent;
  border: none;
  color: var(--color-text-tertiary, #6e7781);
  cursor: pointer;
  transition: all 0.15s;
  font-size: 0.875rem;
}

.batch-unit-btn:hover {
  color: var(--color-text-primary, #fff);
}

.batch-unit-btn.active {
  background: var(--color-cyan-bright, #00D9FF);
  color: #000;
}

.batch-actions-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.batch-select-all-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
  color: var(--color-text-secondary, #8b949e);
  font-size: 0.8125rem;
  cursor: pointer;
}

.batch-select-all-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary, #fff);
}

.batch-selected-count {
  font-size: 0.8125rem;
  color: var(--color-text-tertiary, #6e7781);
}

.batch-selected-count strong {
  color: var(--color-cyan-bright, #00D9FF);
}

.batch-preview-btn {
  margin-left: auto;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 0.375rem;
  color: var(--color-gold, #FFD700);
  font-size: 0.8125rem;
  cursor: pointer;
}

.batch-search {
  padding: 0.75rem 1.5rem;
}

.batch-search-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
  color: var(--color-text-primary, #fff);
  font-size: 0.8125rem;
}

.batch-items-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.5rem;
  max-height: 35vh;
}

.batch-section {
  margin-bottom: 0.75rem;
}

.batch-section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  color: var(--color-text-secondary, #8b949e);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
}

.batch-section-header:hover {
  color: var(--color-text-primary, #fff);
}

.batch-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background 0.15s;
}

.batch-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.batch-item.selected {
  background: rgba(0, 217, 255, 0.08);
}

.batch-item-checkbox {
  color: var(--color-text-tertiary, #6e7781);
}

.batch-item.selected .batch-item-checkbox {
  color: var(--color-cyan-bright, #00D9FF);
}

.batch-item-info {
  flex: 1;
  min-width: 0;
}

.batch-item-name {
  display: block;
  font-size: 0.8125rem;
  color: var(--color-text-primary, #fff);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.batch-item-qty {
  font-size: 0.6875rem;
  color: var(--color-text-tertiary, #6e7781);
}

.batch-item-prices {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.125rem;
}

.batch-item-old-price {
  font-size: 0.8125rem;
  color: var(--color-text-secondary, #8b949e);
}

.batch-item-old-price.strikethrough {
  text-decoration: line-through;
  opacity: 0.6;
}

.batch-item-new-price {
  font-size: 0.8125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.batch-item-new-price.positive {
  color: var(--color-emerald, #10B981);
}

.batch-item-new-price.negative {
  color: var(--color-coral, #FF6B6B);
}

.batch-item-diff {
  font-size: 0.6875rem;
  font-weight: 400;
  opacity: 0.8;
}

.batch-preview-summary {
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-stats {
  display: flex;
  gap: 2rem;
}

.preview-stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.preview-stat span {
  font-size: 0.75rem;
  color: var(--color-text-tertiary, #6e7781);
}

.preview-stat strong {
  font-size: 1rem;
  color: var(--color-text-primary, #fff);
}

.preview-stat.positive strong {
  color: var(--color-emerald, #10B981);
}

.preview-stat.negative strong {
  color: var(--color-coral, #FF6B6B);
}

.batch-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.batch-reset-btn {
  padding: 0.75rem 1rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: var(--color-text-secondary, #8b949e);
  font-size: 0.875rem;
  cursor: pointer;
}

.batch-reset-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-primary, #fff);
}

.batch-apply-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--color-cyan-bright, #00D9FF);
  border: none;
  border-radius: 0.5rem;
  color: #000;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.batch-apply-btn:hover:not(:disabled) {
  background: #00c4e6;
}

.batch-apply-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
`;

export default BatchPriceEditor;
