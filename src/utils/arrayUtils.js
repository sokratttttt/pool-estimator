/**
 * Array utilities
 * Helper functions for array operations
 */

/**
 * Remove duplicates from array
 */
export const unique = (array) => {
    return [...new Set(array)];
};

/**
 * Remove duplicates by property
 */
export const uniqueBy = (array, key) => {
    const seen = new Set();
    return array.filter(item => {
        const value = typeof key === 'function' ? key(item) : item[key];
        if (seen.has(value)) return false;
        seen.add(value);
        return true;
    });
};

/**
 * Group array by property
 */
export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
        const group = typeof key === 'function' ? key(item) : item[key];
        (result[group] = result[group] || []).push(item);
        return result;
    }, {});
};

/**
 * Sort array by property
 */
export const sortBy = (array, key, order = 'asc') => {
    return [...array].sort((a, b) => {
        const aVal = typeof key === 'function' ? key(a) : a[key];
        const bVal = typeof key === 'function' ? key(b) : b[key];

        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
    });
};

/**
 * Chunk array into smaller arrays
 */
export const chunk = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

/**
 * Flatten nested array
 */
export const flatten = (array, depth = Infinity) => {
    return array.flat(depth);
};

/**
 * Get random item from array
 */
export const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

/**
 * Get multiple random items from array
 */
export const sampleSize = (array, n) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
};

/**
 * Shuffle array
 */
export const shuffle = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
};

/**
 * Sum array values
 */
export const sum = (array, key) => {
    return array.reduce((total, item) => {
        const value = key ? (typeof key === 'function' ? key(item) : item[key]) : item;
        return total + (parseFloat(value) || 0);
    }, 0);
};

/**
 * Average of array values
 */
export const average = (array, key) => {
    if (array.length === 0) return 0;
    return sum(array, key) / array.length;
};

/**
 * Min value in array
 */
export const min = (array, key) => {
    return Math.min(...array.map(item =>
        key ? (typeof key === 'function' ? key(item) : item[key]) : item
    ));
};

/**
 * Max value in array
 */
export const max = (array, key) => {
    return Math.max(...array.map(item =>
        key ? (typeof key === 'function' ? key(item) : item[key]) : item
    ));
};

/**
 * Find differences between two arrays
 */
export const difference = (array1, array2) => {
    return array1.filter(item => !array2.includes(item));
};

/**
 * Find intersection of two arrays
 */
export const intersection = (array1, array2) => {
    return array1.filter(item => array2.includes(item));
};

/**
 * Check if arrays are equal
 */
export const isEqual = (array1, array2) => {
    if (array1.length !== array2.length) return false;
    return array1.every((item, index) => item === array2[index]);
};

/**
 * Paginate array
 */
export const paginate = (array, page, pageSize) => {
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
