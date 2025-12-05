'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { EquipmentCatalogContextType, EquipmentItem } from '@/types/equipment';

const EquipmentCatalogContext = createContext<EquipmentCatalogContextType | null>(null);

export function EquipmentCatalogProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<EquipmentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // Загрузка каталога
    const loadCatalog = useCallback(async () => {
        try {
            setLoading(true);

            if (!supabase) {
                throw new Error('Supabase client not initialized');
            }

            let allItems: EquipmentItem[] = [];
            let from = 0;
            const step = 1000;
            let hasMore = true;

            while (hasMore) {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .range(from, from + step - 1)
                    .order('name');

                if (error) throw error;

                if (data && data.length > 0) {
                    allItems = [...allItems, ...data];
                    from += step;
                    if (data.length < step) {
                        hasMore = false;
                    }
                } else {
                    hasMore = false;
                }
            }

            setItems(allItems);
            setError(null);
        } catch (err: any) {
            console.error('Ошибка загрузки каталога:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Загрузка каталога при монтировании
    useEffect(() => {
        loadCatalog();
    }, [loadCatalog]);

    // Получить все уникальные категории
    const categories = useMemo(() => {
        if (!items.length) return [];
        const uniqueCategories = [...new Set(items.map(item => item.category).filter(Boolean))];
        return uniqueCategories.sort();
    }, [items]);

    // Поиск с мемоизацией
    const filteredItems = useMemo(() => {
        if (!items) return [];

        let result = items;

        // Фильтр по категории
        if (selectedCategory) {
            result = result.filter(item =>
                item.category === selectedCategory ||
                item.subcategory === selectedCategory
            );
        }

        // Поиск по запросу (артикул, название)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter(item =>
                (item.article && item.article.toLowerCase().includes(query)) ||
                item.name.toLowerCase().includes(query)
            );
        }

        return result;
    }, [items, searchQuery, selectedCategory]);

    // Функция поиска товара по ID
    const getItemById = useCallback((id: string): EquipmentItem | undefined => {
        return items.find(item => item.id === id);
    }, [items]);

    // Функция поиска товара по артикулу
    const getItemByArticle = useCallback((article: string): EquipmentItem | undefined => {
        return items.find(item =>
            item.article && item.article.toLowerCase() === article.toLowerCase()
        );
    }, [items]);

    const value: EquipmentCatalogContextType = useMemo(() => ({
        // Данные
        catalog: { items, categories },
        items,
        categories,
        filteredItems,

        // Состояние
        loading,
        error,
        searchQuery,
        selectedCategory,

        // Функции поиска
        setSearchQuery,
        setSelectedCategory,
        getItemById,
        getItemByArticle,

        // Утилиты
        itemsCount: items.length,
        filteredCount: filteredItems.length,
        refreshCatalog: loadCatalog
    }), [items, categories, filteredItems, loading, error, searchQuery, selectedCategory, getItemById, getItemByArticle, loadCatalog]);

    return (
        <EquipmentCatalogContext.Provider value={value}>
            {children}
        </EquipmentCatalogContext.Provider>
    );
}

export function useEquipmentCatalog() {
    const context = useContext(EquipmentCatalogContext);
    if (!context) {
        throw new Error('useEquipmentCatalog must be used within EquipmentCatalogProvider');
    }
    return context;
}
