'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Filter, X, Plus } from 'lucide-react';
// @ts-ignore
// @ts-ignore
import * as ReactWindow from 'react-window';
const FixedSizeList = (ReactWindow as any).FixedSizeList || (ReactWindow as any).default?.FixedSizeList;
import { useEquipmentCatalog } from '@/context/EquipmentCatalogContext';
import { useEstimate } from '@/context/EstimateContext';
import { toast } from 'sonner';

// Компонент одного товара в списке
interface CatalogItemProps {
    item: any;
    onAdd: (item: any) => void;
    style?: React.CSSProperties;
}

const CatalogItem = ({ item, onAdd, style }: CatalogItemProps) => {
    return (
        <div style={style} className="px-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-bright/30 transition-all"
            >
                {/* Артикул */}
                <div className="min-w-[120px]">
                    <span className="text-xs text-slate-400">Артикул</span>
                    <p className="font-mono text-sm text-cyan-bright">{item.article}</p>
                </div>

                {/* Название */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">{item.category}</span>
                        {item.subcategory && (
                            <>
                                <span className="text-slate-600">•</span>
                                <span className="text-xs text-slate-500">{item.subcategory}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Цена */}
                <div className="text-right min-w-[120px]">
                    <span className="text-xs text-slate-400">Цена</span>
                    <p className="text-lg font-bold text-white">
                        {item.price.toLocaleString('ru-RU')} ₽
                    </p>
                </div>

                {/* Кнопка добавления */}
                <button
                    onClick={() => onAdd(item)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-bright/20 hover:bg-cyan-bright/30 text-cyan-bright transition-all"
                >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Добавить</span>
                </button>
            </motion.div>
        </div>
    );
};

// Рендер строки виртуализированного списка
interface RowProps {
    index: number;
    style: React.CSSProperties;
    data: {
        items: any[];
        onAdd: (item: any) => void;
    };
}

const Row = ({ index, style, data }: RowProps) => {
    const { items, onAdd } = data;
    const item = items[index];
    return <CatalogItem item={item} onAdd={onAdd} style={style} />;
};

// Главный компонент каталога
interface EquipmentCatalogSearchProps { }

export default function EquipmentCatalogSearch({ }: EquipmentCatalogSearchProps) {
    const {
        categories,
        filteredItems,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        itemsCount,
        filteredCount
    } = useEquipmentCatalog();

    const { addItem } = useEstimate();

    const [showFilters, setShowFilters] = useState(false);

    // Debounced поиск
    const handleSearch = useCallback((e: React.ChangeEvent<any>) => {
        setSearchQuery(e.target.value);
    }, [setSearchQuery]);

    // Добавление товара в смету
    const handleAddItem = useCallback((catalogItem: any) => {
        const newItem = {
            id: `catalog_${catalogItem.id}_${Date.now()}`,
            name: catalogItem.name,
            category: catalogItem.category,
            section: catalogItem.subcategory || catalogItem.category,
            quantity: 1,
            unit: 'шт',
            price: catalogItem.price,
            total: catalogItem.price,
            source: 'catalog',
            catalogArticle: catalogItem.article
        };

        addItem(newItem);
        toast.success(`${catalogItem.name} добавлен в смету`);
    }, [addItem]);

    // Высота одного элемента списка


    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-bright border-t-transparent mx-auto mb-4" />
                    <p className="text-slate-400">Загрузка каталога...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center text-red-400">
                    <p className="text-lg font-semibold mb-2">Ошибка загрузки каталога</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Заголовок */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Package className="w-8 h-8 text-cyan-bright" />
                        Каталог оборудования
                    </h1>
                    <p className="text-slate-400 mt-2">
                        {itemsCount.toLocaleString('ru-RU')} товаров в каталоге
                    </p>
                </div>
            </div>

            {/* Поиск и фильтры */}
            <div className="space-y-4">
                {/* Поиск */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Поиск по артикулу или названию..."
                        className="w-full pl-12 pr-12 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-bright/50 focus:ring-2 focus:ring-cyan-bright/20 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-all"
                        >
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    )}
                </div>

                {/* Кнопка фильтров */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
                    >
                        <Filter className="w-4 h-4" />
                        <span>Фильтры</span>
                        {selectedCategory && (
                            <span className="px-2 py-1 rounded-full bg-cyan-bright/20 text-cyan-bright text-xs">
                                1
                            </span>
                        )}
                    </button>

                    <p className="text-sm text-slate-400">
                        Найдено: <span className="text-white font-semibold">{filteredCount}</span> товаров
                    </p>
                </div>

                {/* Панель фильтров */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-white">Категории</h3>
                                    {selectedCategory && (
                                        <button
                                            onClick={() => setSelectedCategory('')}
                                            className="text-xs text-cyan-bright hover:text-cyan-400"
                                        >
                                            Сбросить
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto premium-scrollbar">
                                    {categories.map((category: any) => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category === selectedCategory ? '' : category)}
                                            className={`px-3 py-2 rounded-lg text-sm text-left transition-all ${selectedCategory === category
                                                ? 'bg-cyan-bright/20 border-cyan-bright/50 text-cyan-bright'
                                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                                                } border`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Список товаров (виртуализированный) */}
            <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10">
                {filteredItems.length === 0 ? (
                    <div className="p-12 text-center">
                        <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-lg text-slate-400">Товары не найдены</p>
                        <p className="text-sm text-slate-500 mt-2">
                            Попробуйте изменить параметры поиска
                        </p>
                    </div>
                ) : (
                    <FixedSizeList
                        height={400}
                        itemCount={filteredItems.length}
                        itemSize={80}
                        width="100%"
                        itemData={{ items: filteredItems, onAdd: handleAddItem }}
                    >
                        {Row as any}
                    </FixedSizeList>
                )}
            </div>
        </div>
    );
}
