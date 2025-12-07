'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Product } from '@/types';

// Query Keys
export const productKeys = {
    all: ['products'] as const,
    lists: () => [...productKeys.all, 'list'] as const,
    list: (category?: string) => [...productKeys.lists(), { category }] as const,
    details: () => [...productKeys.all, 'detail'] as const,
    detail: (id: string) => [...productKeys.details(), id] as const,
};

interface ProductFilters {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
}

/**
 * Хук для получения списка товаров с кешированием
 */
export function useProductsQuery(filters: ProductFilters = {}) {
    return useQuery({
        queryKey: productKeys.list(filters.category),
        queryFn: async () => {
            // Импортируем данные из localStorage или Supabase
            const storedProducts = localStorage.getItem('catalog_products');
            if (storedProducts) {
                return JSON.parse(storedProducts) as Product[];
            }
            return [];
        },
        staleTime: 10 * 60 * 1000, // 10 минут
        select: (data) => filterProducts(data, filters),
    });
}

/**
 * Хук для получения товаров по категории
 */
export function useProductsByCategory(category: string) {
    return useProductsQuery({ category });
}

/**
 * Хук для поиска товаров
 */
export function useProductSearch(search: string) {
    return useProductsQuery({ search });
}

/**
 * Хук для prefetch товаров (предзагрузка)
 */
export function usePrefetchProducts() {
    const queryClient = useQueryClient();

    return {
        prefetch: (category?: string) => {
            queryClient.prefetchQuery({
                queryKey: productKeys.list(category),
                queryFn: async () => {
                    const storedProducts = localStorage.getItem('catalog_products');
                    return storedProducts ? JSON.parse(storedProducts) : [];
                },
            });
        },
    };
}

// Вспомогательная функция фильтрации
function filterProducts(products: Product[], filters: ProductFilters): Product[] {
    let result = [...products];

    if (filters.category) {
        result = result.filter((p) => p.category === filters.category);
    }

    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(
            (p) =>
                p.name?.toLowerCase().includes(searchLower) ||
                p.description?.toLowerCase().includes(searchLower)
        );
    }

    if (filters.minPrice !== undefined) {
        result = result.filter((p) => (p.price || 0) >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
        result = result.filter((p) => (p.price || 0) <= filters.maxPrice!);
    }

    return result;
}
