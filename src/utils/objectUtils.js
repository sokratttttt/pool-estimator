/**
 * Object utilities
 * Helper functions for object manipulation
 */

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;

    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => deepClone(item));

    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
};

/**
 * Deep merge objects
 */
export const deepMerge = (...objects) => {
    const result = {};

    for (const obj of objects) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
                    result[key] = deepMerge(result[key] || {}, obj[key]);
                } else {
                    result[key] = obj[key];
                }
            }
        }
    }

    return result;
};

/**
 * Pick properties from object
 */
export const pick = (obj, keys) => {
    return keys.reduce((result, key) => {
        if (key in obj) {
            result[key] = obj[key];
        }
        return result;
    }, {});
};

/**
 * Omit properties from object
 */
export const omit = (obj, keys) => {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
};

/**
 * Get nested property safely
 */
export const get = (obj, path, defaultValue = undefined) => {
    const keys = Array.isArray(path) ? path : path.split('.');
    let result = obj;

    for (const key of keys) {
        if (result == null) return defaultValue;
        result = result[key];
    }

    return result !== undefined ? result : defaultValue;
};

/**
 * Set nested property
 */
export const set = (obj, path, value) => {
    const keys = Array.isArray(path) ? path : path.split('.');
    const lastKey = keys.pop();

    let current = obj;
    for (const key of keys) {
        if (!(key in current)) {
            current[key] = {};
        }
        current = current[key];
    }

    current[lastKey] = value;
    return obj;
};

/**
 * Flatten nested object
 */
export const flatten = (obj, prefix = '') => {
    return Object.keys(obj).reduce((acc, key) => {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
            Object.assign(acc, flatten(value, newKey));
        } else {
            acc[newKey] = value;
        }

        return acc;
    }, {});
};

/**
 * Invert object keys and values
 */
export const invert = (obj) => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        acc[value] = key;
        return acc;
    }, {});
};

/**
 * Map object values
 */
export const mapValues = (obj, fn) => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        acc[key] = fn(value, key, obj);
        return acc;
    }, {});
};

/**
 * Filter object entries
 */
export const filterEntries = (obj, fn) => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        if (fn(value, key, obj)) {
            acc[key] = value;
        }
        return acc;
    }, {});
};

/**
 * Compare two objects for equality
 */
export const isEqual = (obj1, obj2) => {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
};

/**
 * Deep freeze object
 */
export const deepFreeze = (obj) => {
    Object.freeze(obj);

    Object.getOwnPropertyNames(obj).forEach(prop => {
        if (obj[prop] !== null &&
            (typeof obj[prop] === 'object' || typeof obj[prop] === 'function') &&
            !Object.isFrozen(obj[prop])) {
            deepFreeze(obj[prop]);
        }
    });

    return obj;
};
