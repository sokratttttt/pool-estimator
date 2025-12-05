/**
 * Array utilities
 * Helper functions for array operations
 */

type KeySelector<T> = keyof T | ((item: T) => unknown);
type SortOrder = 'asc' | 'desc';

interface PaginationResult<T> {
    data: T[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

/**
 * Remove duplicates from array
 */
export const unique = <T>(array: T[]): T[] => {
    return [...new Set(array)];
};

/**
 * Remove duplicates by property
 */
export const uniqueBy = <T>(array: T[], key: KeySelector<T>): T[] => {
    const seen = new Set<unknown>();
    return array.filter(item => {
        const value = typeof key === 'function' ? key(item) : item[key as keyof T];
        if (seen.has(value)) return false;
        seen.add(value);
        return true;
    });
};

/**
 * Group array by property
 */
export const groupBy = <T>(array: T[], key: KeySelector<T>): Record<string, T[]> => {
    return array.reduce((result: Record<string, T[]>, item: T) => {
        const group = String(typeof key === 'function' ? key(item) : item[key as keyof T]);
        (result[group] = result[group] || []).push(item);
        return result;
    }, {});
};

/**
 * Sort array by property
 */
export const sortBy = <T>(array: T[], key: KeySelector<T>, order: SortOrder = 'asc'): T[] => {
    return [...array].sort((a: T, b: T) => {
        const aVal = typeof key === 'function' ? key(a) : a[key as keyof T];
        const bVal = typeof key === 'function' ? key(b) : b[key as keyof T];

        // Convert to comparable values
        const aCompare = aVal as string | number;
        const bCompare = bVal as string | number;

        if (aCompare < bCompare) return order === 'asc' ? -1 : 1;
        if (aCompare > bCompare) return order === 'asc' ? 1 : -1;
        return 0;
    });
};

/**
 * Chunk array into smaller arrays
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

/**
 * Flatten nested array
 */
export const flatten = <T>(array: (T | T[])[], depth: number = Infinity): T[] => {
    return array.flat(depth) as T[];
};

/**
 * Get random item from array
 */
export const sample = <T>(array: T[]): T | undefined => {
    return array[Math.floor(Math.random() * array.length)];
};

/**
 * Get multiple random items from array
 */
export const sampleSize = <T>(array: T[], n: number): T[] => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
};

/**
 * Shuffle array
 */
export const shuffle = <T>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

/**
 * Sum array values
 */
export const sum = <T>(array: T[], key?: KeySelector<T>): number => {
    return array.reduce((total: number, item: T) => {
        const value = key
            ? (typeof key === 'function' ? key(item) : item[key as keyof T])
            : item;
        return total + (parseFloat(String(value)) || 0);
    }, 0);
};

/**
 * Average of array values
 */
export const average = <T>(array: T[], key?: KeySelector<T>): number => {
    if (array.length === 0) return 0;
    return sum(array, key) / array.length;
};

/**
 * Min value in array
 */
export const min = <T>(array: T[], key?: KeySelector<T>): number => {
    return Math.min(...array.map(item =>
        key
            ? Number(typeof key === 'function' ? key(item) : item[key as keyof T])
            : Number(item)
    ));
};

/**
 * Max value in array
 */
export const max = <T>(array: T[], key?: KeySelector<T>): number => {
    return Math.max(...array.map(item =>
        key
            ? Number(typeof key === 'function' ? key(item) : item[key as keyof T])
            : Number(item)
    ));
};

/**
 * Find differences between two arrays
 */
export const difference = <T>(array1: T[], array2: T[]): T[] => {
    return array1.filter(item => !array2.includes(item));
};

/**
 * Find intersection of two arrays
 */
export const intersection = <T>(array1: T[], array2: T[]): T[] => {
    return array1.filter(item => array2.includes(item));
};

/**
 * Check if arrays are equal
 */
export const isEqual = <T>(array1: T[], array2: T[]): boolean => {
    if (array1.length !== array2.length) return false;
    return array1.every((item: T, index: number) => item === array2[index]);
};

/**
 * Paginate array
 */
export const paginate = <T>(array: T[], page: number, pageSize: number): PaginationResult<T> => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
        data: array.slice(start, end),
        page,
        pageSize,
        total: array.length,
        totalPages: Math.ceil(array.length / pageSize)
    };
};
