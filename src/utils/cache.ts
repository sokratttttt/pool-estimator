/**
 * Cache utilities
 * In-memory and localStorage caching
 */

interface CacheItem<T> {
    value: T;
    expires: number;
}

interface CacheOptions {
    ttl?: number;
    maxSize?: number;
}

class Cache {
    cache: Map<string, CacheItem<unknown>>;
    ttl: number;
    maxSize: number;

    constructor(options: CacheOptions = {}) {
        this.cache = new Map();
        this.ttl = options.ttl || 3600000; // 1 hour default
        this.maxSize = options.maxSize || 100;
    }

    set<T>(key: string, value: T, ttl: number = this.ttl): void {
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

    get<T>(key: string): T | null {
        const item = this.cache.get(key);

        if (!item) return null;

        if (Date.now() > item.expires) {
            this.cache.delete(key);
            return null;
        }

        return item.value as T;
    }

    has(key: string): boolean {
        return this.get(key) !== null;
    }

    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    size(): number {
        return this.cache.size;
    }
}

/**
 * LocalStorage cache with TTL
 */
class LocalStorageCache {
    prefix: string;

    constructor(prefix: string = 'cache_') {
        this.prefix = prefix;
    }

    set<T>(key: string, value: T, ttl: number = 3600000): void {
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

    get<T>(key: string): T | null {
        try {
            const itemStr = localStorage.getItem(this.prefix + key);
            if (!itemStr) return null;

            const item = JSON.parse(itemStr);

            if (Date.now() > item.expires) {
                localStorage.removeItem(this.prefix + key);
                return null;
            }

            return item.value as T;
        } catch (error) {
            console.error('Failed to get cache:', error);
            return null;
        }
    }

    has(key: string): boolean {
        return this.get(key) !== null;
    }

    delete(key: string): void {
        localStorage.removeItem(this.prefix + key);
    }

    clear(): void {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }

    clearExpired(): void {
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
export const createCache = (options: CacheOptions): Cache => new Cache(options);
export const createLocalStorageCache = (prefix: string): LocalStorageCache => new LocalStorageCache(prefix);

/**
 * Memoize function with cache
 */
export const memoizeWithCache = <T extends unknown[], R>(
    fn: (...args: T) => R,
    cache: Cache = createCache({})
): ((...args: T) => R) => {
    return (...args: T): R => {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get<R>(key) as R;
        }

        const result = fn(...args);
        cache.set(key, result);

        return result;
    };
};
