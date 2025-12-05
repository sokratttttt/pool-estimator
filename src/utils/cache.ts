/**
 * Cache utilities
 * In-memory and localStorage caching
 */

class Cache {
    cache: Map<string, { value: any; expires: number }>;
    ttl: number;
    maxSize: number;

    constructor(options: any = {}) {
        this.cache = new Map();
        this.ttl = options.ttl || 3600000; // 1 hour default
        this.maxSize = options.maxSize || 100;
    }

    set(key, value, ttl = this.ttl) {
        if (this.cache.size >= this.maxSize) {
            // Remove oldest entry
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }

        this.cache.set(key, {
            value,
            expires: Date.now() + ttl
        });
    }

    get(key) {
        const item = this.cache.get(key);

        if (!item) return null;

        if (Date.now() > item.expires) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    has(key) {
        return this.get(key) !== null;
    }

    delete(key) {
        return this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    size() {
        return this.cache.size;
    }
}

/**
 * LocalStorage cache with TTL
 */
class LocalStorageCache {
    prefix: string;

    constructor(prefix = 'cache_') {
        this.prefix = prefix;
    }

    set(key, value, ttl = 3600000) {
        const item = {
            value,
            expires: Date.now() + ttl
        };

        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(item));
        } catch (error) {
            console.error('Failed to set cache:', error);
        }
    }

    get(key) {
        try {
            const itemStr = localStorage.getItem(this.prefix + key);
            if (!itemStr) return null;

            const item = JSON.parse(itemStr);

            if (Date.now() > item.expires) {
                localStorage.removeItem(this.prefix + key);
                return null;
            }

            return item.value;
        } catch (error) {
            console.error('Failed to get cache:', error);
            return null;
        }
    }

    has(key) {
        return this.get(key) !== null;
    }

    delete(key) {
        localStorage.removeItem(this.prefix + key);
    }

    clear() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }

    clearExpired() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                this.get(key.replace(this.prefix, ''));
            }
        });
    }
}

/**
 * Create cache instance
 */
export const createCache = (options: any) => new Cache(options);
export const createLocalStorageCache = (prefix: any) => new LocalStorageCache(prefix);

/**
 * Memoize function with cache
 */
export const memoizeWithCache = (fn: (...args: any[]) => any, cache = createCache({})) => {
    return (...args) => {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = fn(...args);
        cache.set(key, result);

        return result;
    };
};
