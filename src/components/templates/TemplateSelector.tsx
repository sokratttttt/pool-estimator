'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Clock, Ruler, X, Check, ChevronRight } from 'lucide-react';
import {
  type PoolTemplate,
  type PoolCategory,
  POOL_TEMPLATES,
  getPopularTemplates,
  getTemplatesByCategory,
  searchTemplates,
  calculatePoolVolume
} from '@/data/pool-templates';

// ============================================
// TYPES
// ============================================

export interface TemplateSelectorProps {
  onSelect: (template: PoolTemplate) => void;
  onClose?: () => void;
  isModal?: boolean;
  defaultCategory?: PoolCategory | 'all' | 'popular';
  className?: string;
}

type CategoryId = PoolCategory | 'all' | 'popular';

interface CategoryTab {
  id: CategoryId;
  label: string;
  icon: string;
}

// ============================================
// CONSTANTS
// ============================================

const CATEGORY_TABS: CategoryTab[] = [
  { id: 'popular', label: 'Популярные', icon: '⭐' },
  { id: 'all', label: 'Все', icon: '📋' },
  { id: 'residential', label: 'Частные', icon: '🏠' },
  { id: 'commercial', label: 'Коммерческие', icon: '🏢' },
  { id: 'premium', label: 'Премиум', icon: '✨' },
];

// ============================================
// UTILITIES
// ============================================

const formatPrice = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)} млн ₽`;
  return `${(value / 1000).toFixed(0)} тыс ₽`;
};

const formatDays = (days: number): string => {
  if (days === 1) return '1 день';
  if (days < 5) return `${days} дня`;
  return `${days} дней`;
};

// ============================================
// COMPONENT
// ============================================

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelect,
  onClose,
  isModal = true,
  defaultCategory = 'popular',
  className = ''
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryId>(defaultCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<PoolTemplate | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredTemplates = useMemo(() => {
    if (searchQuery.trim()) return searchTemplates(searchQuery);
    switch (activeCategory) {
      case 'popular': return getPopularTemplates();
      case 'all': return POOL_TEMPLATES;
      default: return getTemplatesByCategory(activeCategory);
    }
  }, [activeCategory, searchQuery]);

  const handleSelect = useCallback((template: PoolTemplate) => {
    setSelectedTemplate(template);
    setShowDetails(true);
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      onClose?.();
    }
  }, [selectedTemplate, onSelect, onClose]);

  const handleBackFromDetails = useCallback(() => {
    setShowDetails(false);
    setSelectedTemplate(null);
  }, []);

  const content = (
    <div className={`template-selector ${className}`}>
      <div className="template-selector-header">
        <div className="template-selector-title">
          {showDetails ? (
            <button onClick={handleBackFromDetails} className="template-back-btn">
              ← Назад к списку
            </button>
          ) : (
            <h2>Выберите шаблон бассейна</h2>
          )}
        </div>
        {isModal && onClose && (
          <button onClick={onClose} className="template-close-btn">
            <X size={20} />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showDetails && selectedTemplate ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="template-details"
          >
            <TemplateDetails template={selectedTemplate} onConfirm={handleConfirm} />
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Search */}
            <div className="template-search">
              <Search size={18} className="template-search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию или тегам..."
                className="template-search-input"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="template-search-clear">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category Tabs */}
            <div className="template-tabs">
              {CATEGORY_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`template-tab ${activeCategory === tab.id ? 'active' : ''}`}
                >
                  <span className="template-tab-icon">{tab.icon}</span>
                  <span className="template-tab-label">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Templates Grid */}
            <div className="template-grid">
              {filteredTemplates.length === 0 ? (
                <div className="template-empty">
                  <p>Шаблоны не найдены</p>
                  <button onClick={() => setSearchQuery('')}>Сбросить поиск</button>
                </div>
              ) : (
                filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TemplateCard template={template} onSelect={() => handleSelect(template)} />
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (isModal) {
    return (
      <div className="template-selector-overlay">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="template-selector-modal"
        >
          {content}
        </motion.div>
      </div>
    );
  }
  return content;
};

// ============================================
// SUB-COMPONENTS
// ============================================

interface TemplateCardProps { template: PoolTemplate; onSelect: () => void; }

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  const volume = calculatePoolVolume(template.defaults.dimensions);
  const { length, width, depth } = template.defaults.dimensions;

  return (
    <div className="template-card" onClick={onSelect}>
      <div className="template-card-header">
        <span className="template-card-icon">{template.icon || '🏊'}</span>
        <div className="template-card-badges">
          {template.popular && (
            <span className="template-badge popular"><Star size={12} /> Популярный</span>
          )}
          <span className={`template-badge category-${template.category}`}>
            {template.category === 'residential' && 'Частный'}
            {template.category === 'commercial' && 'Коммерческий'}
            {template.category === 'premium' && 'Премиум'}
          </span>
        </div>
      </div>
      <h3 className="template-card-title">{template.name}</h3>
      <p className="template-card-desc">{template.description}</p>
      <div className="template-card-specs">
        <div className="template-spec"><Ruler size={14} /><span>{length}×{width}×{depth}м</span></div>
        <div className="template-spec"><span>💧 {volume.toFixed(0)} м³</span></div>
        <div className="template-spec"><Clock size={14} /><span>{formatDays(template.recommendations.buildTime)}</span></div>
      </div>
      <div className="template-card-footer">
        <span className="template-price">~{formatPrice(template.recommendations.averageCost)}</span>
        <ChevronRight size={18} className="template-arrow" />
      </div>
    </div>
  );
};

interface TemplateDetailsProps { template: PoolTemplate; onConfirm: () => void; }

const TemplateDetails: React.FC<TemplateDetailsProps> = ({ template, onConfirm }) => {
  const volume = calculatePoolVolume(template.defaults.dimensions);
  const { length, width, depth, depthShallow, depthDeep } = template.defaults.dimensions;

  return (
    <div className="template-details-content">
      <div className="template-details-header">
        <span className="template-details-icon">{template.icon || '🏊'}</span>
        <div><h3>{template.name}</h3><p>{template.description}</p></div>
      </div>

      <div className="template-details-grid">
        <div className="detail-section">
          <h4>📐 Размеры</h4>
          <ul>
            <li>Длина: <strong>{length} м</strong></li>
            <li>Ширина: <strong>{width} м</strong></li>
            <li>Глубина: <strong>{depth} м</strong></li>
            {depthShallow && depthDeep && <li>Переменная: <strong>{depthShallow}–{depthDeep} м</strong></li>}
            <li>Объём: <strong>{volume.toFixed(1)} м³</strong></li>
          </ul>
        </div>
        <div className="detail-section">
          <h4>⚙️ Оборудование</h4>
          <ul>
            <li>Фильтр: {template.defaults.equipment.filter}</li>
            <li>Насос: {template.defaults.equipment.pump}</li>
            {template.defaults.equipment.heater && <li>Подогрев: {template.defaults.equipment.heater}</li>}
            {template.defaults.equipment.lights && <li>Освещение: {template.defaults.equipment.lights}</li>}
          </ul>
        </div>
        <div className="detail-section">
          <h4>🔧 Работы</h4>
          <ul>
            {template.defaults.works.excavation && <li>✓ Земляные работы</li>}
            {template.defaults.works.concrete && <li>✓ Бетонные работы</li>}
            {template.defaults.works.waterproofing && <li>✓ Гидроизоляция</li>}
            {template.defaults.works.plumbing && <li>✓ Закладные</li>}
            {template.defaults.works.electrical && <li>✓ Электрика</li>}
            {template.defaults.works.finishing && <li>✓ Отделка</li>}
          </ul>
        </div>
        <div className="detail-section">
          <h4>💡 Подходит для</h4>
          <ul>{template.recommendations.suitableFor.map((item, i) => <li key={i}>✓ {item}</li>)}</ul>
        </div>
      </div>

      <div className="template-details-summary">
        <div className="summary-item"><span>Стоимость</span><strong>{formatPrice(template.recommendations.averageCost)}</strong></div>
        <div className="summary-item"><span>Сроки</span><strong>{formatDays(template.recommendations.buildTime)}</strong></div>
        <div className="summary-item"><span>Обслуживание/год</span><strong>{formatPrice(template.recommendations.maintenanceCost)}</strong></div>
      </div>

      <div className="template-details-actions">
        <button onClick={onConfirm} className="template-confirm-btn">
          <Check size={18} /> Использовать шаблон
        </button>
      </div>

      <div className="template-tags">
        {template.tags.map(tag => <span key={tag} className="template-tag">#{tag}</span>)}
      </div>
    </div>
  );
};

export default TemplateSelector;
