'use client';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const CatalogContext = createContext();

export function CatalogProvider({ children }) {
    const [catalog, setCatalog] = useState({ bowls: [], additional: [], filtration: [], heating: [], parts: [] });
    const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

    // Load catalog on mount
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

                // Group products by category
                const grouped = {
                    bowls: [],
                    heating: [],
                    filtration: [],
                    parts: [],
                    additional: [],
                    accessories: [],
                    chemicals: []
                };

                (products || []).forEach(product => {
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

    // Update catalog
    const updateCatalog = useCallback((type, newItems) => {
        setCatalog(prev => {
            const updated = { ...prev };
            const existingIds = new Set(updated[type]?.map(i => i.id));
            const uniqueNewItems = newItems.filter(i => !existingIds.has(i.id));

            updated[type] = [...(updated[type] || []), ...uniqueNewItems];
            return updated;
        });
        toast.success(`Каталог обновлен: добавлено ${newItems.length} позиций`);
    }, []);

    // Get products by category
    const getProductsByCategory = useCallback((category) => {
        if (category === 'all') {
            return Object.values(catalog).flat();
        }
        return catalog[category] || [];
    }, [catalog]);

    // Get all products as flat array
    const products = useMemo(() => {
        return Object.values(catalog).flat();
    }, [catalog]);

    // Update product
    const updateProduct = useCallback((productId, updates) => {
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

    // Delete product
    const deleteProduct = useCallback((productId) => {
        setCatalog(prev => {
            const newCatalog = { ...prev };
            Object.keys(newCatalog).forEach(category => {
                newCatalog[category] = newCatalog[category].filter(p => p.id !== productId);
            });
            return newCatalog;
        });
    }, []);

    // Memoized context value
    const value = useMemo(() => ({
        catalog,
        setCatalog,
        isLoadingCatalog,
        updateCatalog,
        products,
        getProductsByCategory,
        updateProduct,
        deleteProduct
    }), [catalog, isLoadingCatalog, updateCatalog, products, getProductsByCategory, updateProduct, deleteProduct]);

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
