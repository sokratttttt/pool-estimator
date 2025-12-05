'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { CatalogContextType, CatalogData, Product } from '@/types/catalog';

const CatalogContext = createContext<CatalogContextType | null>(null);

const initialCatalog: CatalogData = {
    bowls: [],
    additional: [],
    filtration: [],
    heating: [],
    parts: [],
    accessories: [],
    chemicals: []
};

export function CatalogProvider({ children }: { children: React.ReactNode }) {
    const [catalog, setCatalog] = useState<CatalogData>(initialCatalog);
    const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

    // Загрузка каталога при монтировании
    useEffect(() => {
        const loadCatalog = async () => {
            setIsLoadingCatalog(true);
            try {
                if (!supabase) {
                    console.warn('Supabase not configured');
                    setIsLoadingCatalog(false);
                    return;
                }

                const { data: products, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Группировка продуктов по категориям
                const grouped: CatalogData = {
                    bowls: [],
                    heating: [],
                    filtration: [],
                    parts: [],
                    additional: [],
                    accessories: [],
                    chemicals: []
                };

                (products || []).forEach((product: Product) => {
                    if (grouped[product.category]) {
                        grouped[product.category].push(product);
                    } else if (product.category === 'accessories') {
                        grouped.additional.push(product);
                    }
                });

                setCatalog(grouped);
            } catch (err) {
                console.error('Failed to load catalog:', err);
                toast.error('Не удалось загрузить каталог. Попробуйте обновить страницу.');
            } finally {
                setIsLoadingCatalog(false);
            }
        };

        loadCatalog();
    }, []);

    // Обновление каталога
    const updateCatalog = useCallback((type: string, newItems: Product[]) => {
        setCatalog(prev => {
            const updated = { ...prev };
            const existingIds = new Set(updated[type]?.map(i => i.id));
            const uniqueNewItems = newItems.filter(i => !existingIds.has(i.id));

            updated[type] = [...(updated[type] || []), ...uniqueNewItems];
            return updated;
        });
        toast.success(`Каталог обновлен: добавлено ${newItems.length} позиций`);
    }, []);

    // Получение продуктов по категории
    const getProductsByCategory = useCallback((category: string): Product[] => {
        if (category === 'all') {
            return Object.values(catalog).flat();
        }
        return catalog[category] || [];
    }, [catalog]);

    // Получение всех продуктов как плоского массива
    const products = useMemo<Product[]>(() => {
        return Object.values(catalog).flat();
    }, [catalog]);

    // Обновление продукта
    const updateProduct = useCallback((productId: string, updates: Partial<Product>) => {
        setCatalog(prev => {
            const newCatalog = { ...prev };
            Object.keys(newCatalog).forEach(category => {
                const index = newCatalog[category].findIndex(p => p.id === productId);
                if (index !== -1) {
                    newCatalog[category][index] = {
                        ...newCatalog[category][index],
                        ...updates
                    };
                }
            });
            return newCatalog;
        });
    }, []);

    // Удаление продукта
    const deleteProduct = useCallback((productId: string) => {
        setCatalog(prev => {
            const newCatalog = { ...prev };
            Object.keys(newCatalog).forEach(category => {
                newCatalog[category] = newCatalog[category].filter(p => p.id !== productId);
            });
            return newCatalog;
        });
    }, []);
    // Добавление продукта
    const addProduct = useCallback((productData: Omit<Product, 'id'>) => {
        const newProduct: Product = {
            ...productData,
            id: Date.now().toString(),
            category: productData.category || 'additional'
        };

        setCatalog(prev => {
            const category = newProduct.category;
            const newCatalog = { ...prev };
            if (newCatalog[category]) {
                newCatalog[category] = [newProduct, ...newCatalog[category]];
            } else {
                newCatalog.additional = [newProduct, ...newCatalog.additional];
            }
            return newCatalog;
        });

        toast.success(`Товар "${newProduct.name}" добавлен`);
    }, []);

    // Мемоизированное значение контекста
    const value: CatalogContextType = useMemo(() => ({
        catalog,
        setCatalog,
        isLoadingCatalog,
        updateCatalog,
        products,
        getProductsByCategory,
        updateProduct,
        deleteProduct,
        addProduct
    }), [catalog, isLoadingCatalog, updateCatalog, products, getProductsByCategory, updateProduct, deleteProduct, addProduct]);

    return (
        <CatalogContext.Provider value={value}>
            {children}
        </CatalogContext.Provider>
    );
}

export function useCatalog() {
    const context = useContext(CatalogContext);
    if (!context) {
        throw new Error('useCatalog must be used within CatalogProvider');
    }
    return context;
}
