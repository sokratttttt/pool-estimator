'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const EquipmentCatalogContext = createContext();

export function EquipmentCatalogProvider({ children }) {
    const [catalog, setCatalog] = useState(null);
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
            const response = await fetch('/data/catalog.json');

            if (!response.ok) {
                throw new Error('Не удалось загрузить каталог');
            }

            const data = await response.json();
            setCatalog(data);
            setError(null);
        } catch (err) {
            console.error('Ошибка загрузки каталога:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Поиск с мемоизацией для производительности
    const filteredItems = useMemo(() => {
        if (!catalog || !catalog.items) return [];

        let items = catalog.items;

        // Фильтр по категории
        if (selectedCategory) {
            items = items.filter(item =>
                item.category === selectedCategory ||
                item.subcategory === selectedCategory
            );
        }

        // Поиск по запросу (артикул, название)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            items = items.filter(item =>
                item.article.toLowerCase().includes(query) ||
                item.name.toLowerCase().includes(query)
            );
        }

        return items;
    }, [catalog, searchQuery, selectedCategory]);

    // Функция поиска товара по ID
    const getItemById = (id) => {
        if (!catalog || !catalog.items) return null;
        return catalog.items.find(item => item.id === id);
    };

    // Функция поиска товара по артикулу
    const getItemByArticle = (article) => {
        if (!catalog || !catalog.items) return null;
        return catalog.items.find(item =>
            item.article.toLowerCase() === article.toLowerCase()
        );
    };

    // Получить все уникальные категории
    const categories = useMemo(() => {
        if (!catalog || !catalog.categories) return [];
        return catalog.categories;
    }, [catalog]);

    const value = {
        // Данные
        catalog,
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
        itemsCount: catalog?.items?.length || 0,
        filteredCount: filteredItems.length
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
