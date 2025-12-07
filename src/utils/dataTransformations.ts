/**
 * Data Transformation Utilities
 * Functions for filtering, sorting, and transforming data
 */

import type { Estimate, FilterOptions, SortOrder } from '@/types';

/**
 * Group estimates by status
 */
export const groupEstimatesByStatus = (
    estimates: Estimate[]
): Record<string, Estimate[]> => {
    return estimates.reduce((groups: Record<string, Estimate[]>, estimate: Estimate) => {
        const status = estimate.status || 'draft';
        if (!groups[status]) {
            groups[status] = [];
        }
        groups[status].push(estimate);
        return groups;
    }, {} as Record<string, Estimate[]>);
};

/**
 * Filter estimates based on various criteria
 */
export const filterEstimates = (
    estimates: Estimate[],
    filters: FilterOptions
): Estimate[] => {
    return estimates.filter((estimate: any) => {
        // Filter by status
        if (filters.status && estimate.status !== filters.status) {
            return false;
        }

        // Search in name and description
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            const matchesName = estimate.name.toLowerCase().includes(searchTerm);
            const matchesDescription =
                estimate.description?.toLowerCase().includes(searchTerm) || false;

            if (!matchesName && !matchesDescription) {
                return false;
            }
        }

        // Filter by date range
        if (filters.dateRange) {
            const estimateDate = new Date(estimate.created_at);
            if (
                estimateDate < filters.dateRange.start ||
                estimateDate > filters.dateRange.end
            ) {
                return false;
            }
        }

        return true;
    });
};

/**
 * Sort estimates by field
 */
export const sortEstimates = (
    estimates: Estimate[],
    sortBy: keyof Estimate,
    sortOrder: SortOrder = 'desc'
): Estimate[] => {
    return [...estimates].sort((a: Estimate, b: Estimate) => {
        let aValue: unknown = a[sortBy];
        let bValue: unknown = b[sortBy];

        // Handle dates
        if (sortBy === 'created_at' || sortBy === 'updated_at') {
            aValue = new Date(aValue as string | Date).getTime();
            bValue = new Date(bValue as string | Date).getTime();
        }

        // Handle strings - case insensitive
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        // Handle null/undefined
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        if (sortOrder === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
    });
};

/**
 * Calculate statistics for estimates
 */
export const calculateEstimateStats = (estimates: Estimate[]) => {
    const total = estimates.length;
    const totalValue = estimates.reduce((sum: number, estimate: Estimate) => sum + (estimate.total || 0), 0);
    const averageValue = total > 0 ? totalValue / total : 0;

    const statusCounts = estimates.reduce((counts: Record<string, number>, estimate: Estimate) => {
        counts[estimate.status] = (counts[estimate.status] || 0) + 1;
        return counts;
    }, {} as Record<string, number>);

    // Find min and max values
    const values = estimates.map((e: Estimate) => e.total).filter((v: number) => v > 0);
    const minValue = values.length > 0 ? Math.min(...values) : 0;
    const maxValue = values.length > 0 ? Math.max(...values) : 0;

    return {
        total,
        totalValue,
        averageValue,
        minValue,
        maxValue,
        statusCounts,
    };
};

/**
 * Paginate array of items
 */
export const paginate = <T>(items: T[], page: number, pageSize: number): T[] => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
};

/**
 * Calculate pagination info
 */
export const getPaginationInfo = (totalItems: number, page: number, pageSize: number) => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize,
        hasNextPage,
        hasPreviousPage,
        startIndex: (page - 1) * pageSize,
        endIndex: Math.min(page * pageSize, totalItems),
    };
};

/**
 * Group items by a key function
 */
export const groupBy = <T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> => {
    return items.reduce((groups: Record<string, T[]>, item: T) => {
        const key = keyFn(item);
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {} as Record<string, T[]>);
};

/**
 * Remove duplicates from array
 */
export const uniqueBy = <T>(items: T[], keyFn: (item: T) => unknown): T[] => {
    const seen = new Set();
    return items.filter((item: T) => {
        const key = keyFn(item);
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Merge objects deeply
 */
export const deepMerge = <T extends object>(target: T, source: Partial<T>): T => {
    const output = { ...target };

    Object.keys(source).forEach((key: unknown) => {
        const targetValue = target[key as keyof T];
        const sourceValue = source[key as keyof T];

        if (
            typeof targetValue === 'object' &&
            targetValue !== null &&
            !Array.isArray(targetValue) &&
            typeof sourceValue === 'object' &&
            sourceValue !== null &&
            !Array.isArray(sourceValue)
        ) {
            (output as Record<keyof T, unknown>)[key as keyof T] = deepMerge(targetValue as object, sourceValue as object);
        } else {
            (output as Record<keyof T, unknown>)[key as keyof T] = sourceValue;
        }
    });

    return output;
};
