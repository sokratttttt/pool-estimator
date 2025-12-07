/**
 * Object utilities
 * Helper functions for object manipulation
 */

type AnyObject = Record<string, unknown>;

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;

    if (obj instanceof Date) return new Date(obj) as T;
    if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;

    const cloned: AnyObject = {};
    for (const key in obj as Record<string, unknown>) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepClone((obj as AnyObject)[key]);
        }
    }
    return cloned as T;
};

/**
 * Deep merge objects
 */
export const deepMerge = <T extends AnyObject>(...objects: T[]): T => {
    const result: AnyObject = {};

    for (const obj of objects) {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
                    result[key] = deepMerge((result[key] || {}) as AnyObject, obj[key] as AnyObject);
                } else {
                    result[key] = obj[key];
                }
            }
        }
    }

    return result as T;
};

/**
 * Pick properties from object
 */
export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    return keys.reduce((result, key) => {
        if (key in obj) {
            result[key] = obj[key];
        }
        return result;
    }, {} as Pick<T, K>);
};

/**
 * Omit properties from object
 */
export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj: object): boolean => {
    return Object.keys(obj).length === 0;
};

/**
 * Get nested property safely
 */
export const get = <T = unknown>(obj: unknown, path: string | string[], defaultValue?: T): T | undefined => {
    const keys = Array.isArray(path) ? path : path.split('.');
    let result: unknown = obj;

    for (const key of keys) {
        if (result == null) return defaultValue;
        result = (result as AnyObject)[key];
    }

    return (result !== undefined ? result : defaultValue) as T;
};

/**
 * Set nested property
 */
export const set = <T extends object>(obj: T, path: string | string[], value: unknown): T => {
    const keys = Array.isArray(path) ? [...path] : path.split('.');
    const lastKey = keys.pop();

    if (!lastKey) return obj;

    let current: AnyObject = obj as AnyObject;
    for (const key of keys) {
        if (!(key in current)) {
            current[key] = {};
        }
        current = current[key] as AnyObject;
    }

    current[lastKey] = value;
    return obj;
};

/**
 * Flatten nested object
 */
export const flatten = (obj: AnyObject, prefix: string = ''): AnyObject => {
    return Object.keys(obj).reduce((acc: AnyObject, key: string) => {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
            Object.assign(acc, flatten(value as AnyObject, newKey));
        } else {
            acc[newKey] = value;
        }

        return acc;
    }, {});
};

/**
 * Invert object keys and values
 */
export const invert = (obj: Record<string, string>): Record<string, string> => {
    return Object.entries(obj).reduce((acc: Record<string, string>, [key, value]) => {
        acc[value] = key;
        return acc;
    }, {});
};

/**
 * Map object values
 */
export const mapValues = <T, U>(
    obj: Record<string, T>,
    fn: (value: T, key: string, obj: Record<string, T>) => U
): Record<string, U> => {
    return Object.entries(obj).reduce((acc: Record<string, U>, [key, value]) => {
        acc[key] = fn(value, key, obj);
        return acc;
    }, {});
};

/**
 * Filter object entries
 */
export const filterEntries = <T>(
    obj: Record<string, T>,
    fn: (value: T, key: string, obj: Record<string, T>) => boolean
): Record<string, T> => {
    return Object.entries(obj).reduce((acc: Record<string, T>, [key, value]) => {
        if (fn(value, key, obj)) {
            acc[key] = value;
        }
        return acc;
    }, {});
};

/**
 * Compare two objects for equality
 */
export const isEqual = (obj1: unknown, obj2: unknown): boolean => {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
};

/**
 * Deep freeze object
 */
export const deepFreeze = <T extends object>(obj: T): Readonly<T> => {
    Object.freeze(obj);

    Object.getOwnPropertyNames(obj).forEach(prop => {
        const value = (obj as AnyObject)[prop];
        if (value !== null &&
            (typeof value === 'object' || typeof value === 'function') &&
            !Object.isFrozen(value)) {
            deepFreeze(value as object);
        }
    });

    return obj;
};
