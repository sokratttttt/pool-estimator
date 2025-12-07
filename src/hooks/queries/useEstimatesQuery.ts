'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEstimates, updateEstimate, deleteEstimate } from '@/services/estimates';
import type { HistoryEstimate, EstimateStatus } from '@/types';
import { toast } from 'sonner';

// Query Keys
export const estimateKeys = {
    all: ['estimates'] as const,
    lists: () => [...estimateKeys.all, 'list'] as const,
    list: (filters: EstimateFilters) => [...estimateKeys.lists(), filters] as const,
    details: () => [...estimateKeys.all, 'detail'] as const,
    detail: (id: string) => [...estimateKeys.details(), id] as const,
};

interface EstimateFilters {
    status?: EstimateStatus | 'all';
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: 'date' | 'total' | 'name';
    sortOrder?: 'asc' | 'desc';
}

/**
 * Хук для получения списка смет с кешированием
 */
export function useEstimatesQuery(filters: EstimateFilters = {}) {
    return useQuery({
        queryKey: estimateKeys.list(filters),
        queryFn: async () => {
            const estimates = await getEstimates();
            // Применяем фильтры на клиенте (или можно на сервере)
            return filterEstimates(estimates as unknown as HistoryEstimate[], filters);
        },
        staleTime: 5 * 60 * 1000, // 5 минут
    });
}

/**
 * Хук для получения одной сметы
 */
export function useEstimateQuery(id: string) {
    return useQuery({
        queryKey: estimateKeys.detail(id),
        queryFn: async () => {
            const estimates = await getEstimates();
            return estimates.find(e => e.id === id) as unknown as HistoryEstimate | undefined;
        },
        enabled: !!id,
    });
}

/**
 * Хук для создания сметы с Optimistic Update
 */
export function useCreateEstimate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newEstimate: Partial<HistoryEstimate>) => {
            // Пока нет API для создания, используем заглушку
            console.log('Creating estimate:', newEstimate);
            return newEstimate as HistoryEstimate;
        },
        onMutate: async (newEstimate) => {
            // Отменяем исходящие запросы
            await queryClient.cancelQueries({ queryKey: estimateKeys.lists() });

            // Сохраняем предыдущее состояние
            const previousEstimates = queryClient.getQueryData(estimateKeys.lists());

            // Оптимистично добавляем новую смету
            queryClient.setQueryData(estimateKeys.lists(), (old: HistoryEstimate[] = []) => [
                { ...newEstimate, id: 'temp-' + Date.now(), status: 'draft' as EstimateStatus },
                ...old,
            ]);

            return { previousEstimates };
        },
        onError: (_err: unknown, _newEstimate, context) => {
            // Откатываем при ошибке
            if (context?.previousEstimates) {
                queryClient.setQueryData(estimateKeys.lists(), context.previousEstimates);
            }
            toast.error('Ошибка при создании сметы');
        },
        onSuccess: () => {
            toast.success('Смета создана');
        },
        onSettled: () => {
            // Инвалидируем кеш для получения актуальных данных
            queryClient.invalidateQueries({ queryKey: estimateKeys.lists() });
        },
    });
}

/**
 * Хук для обновления сметы с Optimistic Update
 */
export function useUpdateEstimate() {
    const queryClient = useQueryClient();

    return useMutation<
        unknown,
        unknown,
        { id: string; data: Partial<HistoryEstimate> },
        { previousEstimate: unknown }
    >({
        mutationFn: async ({ id, data }) => {
            return updateEstimate(id, data);
        },
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: estimateKeys.detail(id) });

            const previousEstimate = queryClient.getQueryData(estimateKeys.detail(id));

            // Оптимистично обновляем
            queryClient.setQueryData(estimateKeys.detail(id), (old: HistoryEstimate | undefined) =>
                old ? { ...old, ...data } : old
            );

            // Обновляем в списке тоже
            queryClient.setQueryData(estimateKeys.lists(), (old: HistoryEstimate[] = []) =>
                old.map((e) => (e.id === id ? { ...e, ...data } : e))
            );

            return { previousEstimate };
        },
        onError: (_err: unknown, { id }: { id: string }, context) => {
            if (context?.previousEstimate) {
                queryClient.setQueryData(estimateKeys.detail(id), context.previousEstimate);
            }
            toast.error('Ошибка при обновлении сметы');
        },
        onSuccess: () => {
            toast.success('Смета обновлена');
        },
        onSettled: (_data: unknown, _error: unknown, { id }: { id: string }) => {
            queryClient.invalidateQueries({ queryKey: estimateKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: estimateKeys.lists() });
        },
    });
}

/**
 * Хук для удаления сметы
 */
export function useDeleteEstimate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteEstimate(id),
        onMutate: async (id: string) => {
            await queryClient.cancelQueries({ queryKey: estimateKeys.lists() });

            const previousEstimates = queryClient.getQueryData(estimateKeys.lists());

            // Оптимистично удаляем
            queryClient.setQueryData(estimateKeys.lists(), (old: HistoryEstimate[] = []) =>
                old.filter((e) => e.id !== id)
            );

            return { previousEstimates };
        },
        onError: (_err: unknown, _id: string, context) => {
            if (context?.previousEstimates) {
                queryClient.setQueryData(estimateKeys.lists(), context.previousEstimates);
            }
            toast.error('Ошибка при удалении сметы');
        },
        onSuccess: () => {
            toast.success('Смета удалена');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: estimateKeys.lists() });
        },
    });
}

// Вспомогательная функция фильтрации
function filterEstimates(estimates: HistoryEstimate[], filters: EstimateFilters): HistoryEstimate[] {
    let result = [...estimates];

    if (filters.status && filters.status !== 'all') {
        result = result.filter((e) => e.status === filters.status);
    }

    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(
            (e) =>
                e.title?.toLowerCase().includes(searchLower) ||
                e.customer?.name?.toLowerCase().includes(searchLower)
        );
    }

    if (filters.sortBy) {
        result.sort((a, b) => {
            let aVal: string | number;
            let bVal: string | number;

            switch (filters.sortBy) {
                case 'date':
                    aVal = new Date(a.createdAt).getTime();
                    bVal = new Date(b.createdAt).getTime();
                    break;
                case 'total':
                    aVal = a.total || 0;
                    bVal = b.total || 0;
                    break;
                case 'name':
                    aVal = a.title || '';
                    bVal = b.title || '';
                    break;
                default:
                    return 0;
            }

            if (filters.sortOrder === 'asc') {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            }
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        });
    }

    return result;
}
