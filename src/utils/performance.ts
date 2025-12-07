/**
 * Performance utilities
 * Optimization and lazy loading helpers
 */

type AnyFunction = (...args: unknown[]) => unknown;

/**
 * Debounce function
 */
export const debounce = <T extends AnyFunction>(func: T, wait: number): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    return function executedFunction(...args: Parameters<T>): void {
        const later = (): void => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function
 */
export const throttle = <T extends AnyFunction>(func: T, limit: number): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean = false;

    return function executedFunction(...args: Parameters<T>): void {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Memoize function results
 */
export const memoize = <T extends AnyFunction>(func: T): ((...args: Parameters<T>) => ReturnType<T>) => {
    const cache = new Map<string, ReturnType<T>>();

    return (...args: Parameters<T>): ReturnType<T> => {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key) as ReturnType<T>;
        }

        const result = func(...args) as ReturnType<T>;
        cache.set(key, result);
        return result;
    };
};

/**
 * Lazy load image
 */
export const lazyLoadImage = (img: HTMLImageElement, src: string): void => {
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry: IntersectionObserverEntry) => {
                if (entry.isIntersecting) {
                    img.src = src;
                    observer.unobserve(img);
                }
            });
        });

        observer.observe(img);
    } else {
        // Fallback for browsers without IntersectionObserver
        img.src = src;
    }
};

/**
 * Preload images
 */
export const preloadImages = (urls: string[]): Promise<string[]> => {
    return Promise.all(
        urls.map((url: string) => {
            return new Promise<string>((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(url);
                img.onerror = reject;
                img.src = url;
            });
        })
    );
};

/**
 * Request idle callback wrapper
 */
export const runWhenIdle = (callback: IdleRequestCallback): number | ReturnType<typeof setTimeout> => {
    if ('requestIdleCallback' in window) {
        return requestIdleCallback(callback);
    }

    return setTimeout(callback as () => void, 1);
};

/**
 * Batch DOM updates
 */
export const batchDOMUpdates = (updates: Array<() => void>): void => {
    requestAnimationFrame(() => {
        updates.forEach((update: () => void) => update());
    });
};

/**
 * Measure performance
 */
export const measurePerformance = <T>(name: string, fn: () => T): T => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    console.log(`${name} took ${(end - start).toFixed(2)}ms`);

    return result;
};

/**
 * Create virtual scroll helper
 */
export const createVirtualScroll = (
    totalItems: number,
    itemHeight: number,
    containerHeight: number
): ((scrollTop: number) => { startIndex: number; endIndex: number; offsetY: number }) => {
    return (scrollTop: number) => {
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);

        return {
            startIndex: Math.max(0, startIndex - 5), // Buffer
            endIndex: Math.min(totalItems, endIndex + 5),
            offsetY: startIndex * itemHeight
        };
    };
};

/**
 * Request Animation Frame helper
 */
export const raf = (callback: FrameRequestCallback): number => {
    return requestAnimationFrame(callback);
};

/**
 * Cancel Animation Frame helper
 */
export const caf = (id: number): void => {
    cancelAnimationFrame(id);
};
