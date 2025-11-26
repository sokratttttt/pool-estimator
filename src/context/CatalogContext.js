'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const CatalogContext = createContext();

export function CatalogProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load products from Supabase on mount
    useEffect(() => {
        fetchCatalog();
    }, []);

    const fetchCatalog = async () => {
        try {
            if (!supabase) {
                console.warn('Supabase not configured');
                return;
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
                    .order('created_at', { ascending: false });

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

            setProducts(allItems);
        } catch (error) {
            console.error('Error loading catalog:', error);
            toast.error('Не удалось загрузить каталог');
        } finally {
            setIsLoading(false);
        }
    };

    const addProduct = async (product) => {
        try {
            if (!supabase) {
                toast.error('Supabase не настроен');
                return;
            }

            // Determine type based on category
            const type = product.category === 'bowls' ? 'bowls' :
                product.category === 'heating' ? 'heating' :
                    product.category === 'filtration' ? 'filtration' :
                        product.category === 'parts' ? 'parts' : 'additional';

            const newProduct = {
                id: product.id || `${type}_${Date.now()}`,
                name: product.name,
                category: type,
                subcategory: product.subcategory || null,
                article: product.article || null,
                price: product.price,
                unit: product.unit || 'шт',
                image: product.image || null,
                description: product.description || null,
                specifications: product.specifications || null,
            };

            const { data, error } = await supabase
                .from('products')
                .insert([newProduct])
                .select()
                .single();

            if (error) throw error;

            await fetchCatalog(); // Reload to get fresh data
            toast.success('Товар добавлен');
        } catch (error) {
            console.error('Error adding product:', error);
            toast.error(error.message || 'Не удалось добавить товар');
        }
    };

    const updateProduct = async (id, updates) => {
        try {
            if (!supabase) {
                toast.error('Supabase не настроен');
                return;
            }

            // Check image size if present
            if (updates.image) {
                const sizeInMB = (updates.image.length * 0.75) / (1024 * 1024);
                if (sizeInMB > 2) {
                    toast.error(`Изображение слишком большое: ${sizeInMB.toFixed(2)} MB. Максимум 2MB.`);
                    return;
                }
            }

            const updateData = {
                ...updates,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('products')
                .update(updateData)
                .eq('id', id);

            if (error) throw error;

            // Update local state
            setProducts(prev =>
                prev.map(p =>
                    p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
                )
            );

            toast.success('Товар обновлен');
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error(error.message || 'Не удалось обновить товар');
        }
    };

    const deleteProduct = async (id) => {
        try {
            if (!supabase) {
                toast.error('Supabase не настроен');
                return;
            }

            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setProducts(prev => prev.filter(p => p.id !== id));
            toast.success('Товар удален');
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error(error.message || 'Не удалось удалить товар');
        }
    };

    const getProduct = (id) => {
        return products.find(product => product.id === id);
    };

    const getProductsByCategory = (category) => {
        if (category === 'all') return products;
        if (category === 'accessories') {
            return products.filter(p => p.category === 'accessories' || p.category === 'additional');
        }
        return products.filter(product => product.category === category);
    };

    return (
        <CatalogContext.Provider
            value={{
                products,
                isLoading,
                addProduct,
                updateProduct,
                deleteProduct,
                getProduct,
                getProductsByCategory,
                refreshCatalog: fetchCatalog
            }}
        >
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
