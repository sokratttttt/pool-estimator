'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { CatalogContextType, CatalogData } from '@/types/catalog';
import localCatalogData from '@/data/catalog.json';

import type { Product } from '@/types/index';

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

// Load local catalog as fallback
const loadLocalCatalog = (): CatalogData => {
    const data = localCatalogData as Record<string, unknown[]>;
    return {
        bowls: (data.bowls || []) as Product[],
        heating: (data.heating || []) as Product[],
        filtration: (data.filtration || []) as Product[],
        parts: (data.parts || []) as Product[],
        additional: (data.additional || []) as Product[],
        accessories: (data.accessories || []) as Product[],
        chemicals: (data.chemicals || []) as Product[]
    };
};

export function CatalogProvider({ children }: { children: React.ReactNode }) {
    const [catalog, setCatalog] = useState<CatalogData>(initialCatalog);
    const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

    useEffect(() => {
        const loadCatalog = async () => {
            setIsLoadingCatalog(true);
            try {
                // Try Supabase first
                if (supabase) {
                    const { data: products, error } = await supabase
                        .from('products')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (!error && products && products.length > 0) {
                        const grouped: CatalogData = {
                            bowls: [],
                            heating: [],
                            filtration: [],
                            parts: [],
                            additional: [],
                            accessories: [],
                            chemicals: []
                        };

                        products.forEach((product: Product) => {
                            if (grouped[product.category]) {
                                grouped[product.category].push(product);
                            } else if (product.category === 'accessories') {
                                grouped.additional.push(product);
                            }
                        });

                        setCatalog(grouped);
                        setIsLoadingCatalog(false);
                        return;
                    }
                }

                // Fallback to local catalog
                const localCatalog = loadLocalCatalog();
                setCatalog(localCatalog);
                toast.info('Загружен локальный каталог');
            } catch (err) {
                console.error('Failed to load catalog from Supabase:', err);
                // Fallback to local catalog on error
                const localCatalog = loadLocalCatalog();
                setCatalog(localCatalog);
                toast.info('Загружен локальный каталог');
            } finally {
                setIsLoadingCatalog(false);
            }
        };

        loadCatalog();
    }, []);

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

    const getProductsByCategory = useCallback((category: string): Product[] => {
        if (category === 'all') {
            return Object.values(catalog).flat();
        }
        return catalog[category] || [];
    }, [catalog]);

    const products = useMemo<Product[]>(() => {
        return Object.values(catalog).flat();
    }, [catalog]);

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

    const deleteProduct = useCallback((productId: string) => {
        setCatalog(prev => {
            const newCatalog = { ...prev };
            Object.keys(newCatalog).forEach(category => {
                newCatalog[category] = newCatalog[category].filter(p => p.id !== productId);
            });
            return newCatalog;
        });
    }, []);

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
