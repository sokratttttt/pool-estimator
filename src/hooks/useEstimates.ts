/**
 * React Query Hooks for Estimates
 * Server state management with automatic caching and refetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estimateApi } from '@/lib/supabase/api';
import type { Database } from '@/lib/supabase/types';

type Estimate = Database['public']['Tables']['estimates']['Row'];
type EstimateInsert = Database['public']['Tables']['estimates']['Insert'];
type EstimateUpdate = Database['public']['Tables']['estimates']['Update'];

// Query keys for cache management
const ESTIMATE_KEYS = {
    all: ['estimates'] as const,
    lists: () => [...ESTIMATE_KEYS.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...ESTIMATE_KEYS.lists(), { filters }] as const,
    details: () => [...ESTIMATE_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...ESTIMATE_KEYS.details(), id] as const,
};

/**
 * Fetch all estimates
 */
export const useEstimates = () => {
    return useQuery({
        queryKey: ESTIMATE_KEYS.lists(),
        queryFn: () => estimateApi.getAll(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    });
};

/**
 * Fetch single estimate by ID
 */
export const useEstimate = (id: string | undefined) => {
    return useQuery({
        queryKey: ESTIMATE_KEYS.detail(id || ''),
        queryFn: () => estimateApi.getById(id!),
        enabled: !!id, // Only run if ID is provided
        staleTime: 2 * 60 * 1000, // 2 minutes for frequently changing data
    });
};

/**
 * Create new estimate
 */
export const useCreateEstimate = () => {
    const queryClient = useQueryClient();

    return useMutation<Estimate, unknown, Omit<EstimateInsert, 'id' | 'created_at'>>({
        mutationFn: (estimate) => estimateApi.create(estimate),
        onSuccess: (newEstimate) => {
            // Add to cache
            queryClient.setQueryData<Estimate[]>(
                ESTIMATE_KEYS.lists(),
                (old) => old ? [newEstimate, ...old] : [newEstimate]
            );

            // Invalidate list to refetch
            queryClient.invalidateQueries({ queryKey: ESTIMATE_KEYS.lists() });
        },
    });
};

/**
 * Update existing estimate
 */
export const useUpdateEstimate = () => {
    const queryClient = useQueryClient();

    return useMutation<Estimate, unknown, { id: string; updates: EstimateUpdate }, { previousEstimate?: Estimate; id: string }>({
        mutationFn: ({ id, updates }) => estimateApi.update(id, updates),
        onMutate: async ({ id, updates }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ESTIMATE_KEYS.detail(id) });

            // Snapshot previous value
            const previousEstimate = queryClient.getQueryData<Estimate>(ESTIMATE_KEYS.detail(id));

            // Optimistically update cache
            queryClient.setQueryData<Estimate>(
                ESTIMATE_KEYS.detail(id),
                (old: Estimate | undefined) => old ? { ...old, ...updates } : undefined
            );

            return { previousEstimate, id };
        },
        onError: (_err, _variables, context) => {
            // Rollback on error
            if (context?.previousEstimate) {
                queryClient.setQueryData(
                    ESTIMATE_KEYS.detail(context.id),
                    context.previousEstimate
                );
            }
        },
        onSettled: (_data, _error, variables) => {
            // Refetch after error or success
            queryClient.invalidateQueries({ queryKey: ESTIMATE_KEYS.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: ESTIMATE_KEYS.lists() });
        },
    });
};

/**
 * Delete estimate
 */
export const useDeleteEstimate = () => {
    const queryClient = useQueryClient();

    return useMutation<void, unknown, string>({
        mutationFn: (id) => estimateApi.delete(id),
        onSuccess: (_data, id) => {
            // Remove from lists cache
            queryClient.setQueryData<Estimate[]>(
                ESTIMATE_KEYS.lists(),
                (old) => old ? old.filter((e) => e.id !== id) : []
            );

            // Remove detail cache
            queryClient.removeQueries({ queryKey: ESTIMATE_KEYS.detail(id) });
        },
    });
};
