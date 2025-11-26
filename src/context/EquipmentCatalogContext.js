'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

const EquipmentCatalogContext = createContext();

export function EquipmentCatalogProvider({ children }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // Загрузка каталога при монтировании
    useEffect(() => {
        loadCatalog();
    }, []);

    const loadCatalog = async () => {
        try {
            setLoading(true);

            if (!supabase) {
                throw new Error('Supabase client not initialized');
            }

            let allItems = [];
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
                    // Если получили меньше чем запрашивали, значит это конец
                    if (data.length < step) {
                        hasMore = false;
                    }
                } else {
                    hasMore = false;
                }
            }

            setItems(allItems);
            setError(null);
        } catch (err) {
            console.error('Ошибка загрузки каталога:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Получить все уникальные категории
    const categories = useMemo(() => {
        if (!items.length) return [];
        // Extract unique categories and sort them
        const uniqueCategories = [...new Set(items.map(item => item.category).filter(Boolean))];
        return uniqueCategories.sort();
    }, [items]);

    // Поиск с мемоизацией для производительности
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
    const getItemById = (id) => {
        return items.find(item => item.id === id);
    };

    // Функция поиска товара по артикулу
    const getItemByArticle = (article) => {
        return items.find(item =>
            item.article && item.article.toLowerCase() === article.toLowerCase()
        );
    };

    const value = {
        // Данные
        catalog: { items, categories }, // Keep structure for compatibility if needed, though we use items directly mostly
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
    };

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
