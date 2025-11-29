/**
 * Performance utilities
 * Optimization and lazy loading helpers
 */

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
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
export const throttle = (func, limit) => {
    let inThrottle;

    return function executedFunction(...args) {
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
export const memoize = (func) => {
    const cache = new Map();

    return (...args) => {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = func(...args);
        cache.set(key, result);
        return result;
    };
};

/**
 * Lazy load image
 */
export const lazyLoadImage = (img, src) => {
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
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
export const preloadImages = (urls) => {
    return Promise.all(
        urls.map(url => {
            return new Promise((resolve, reject) => {
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
export const runWhenIdle = (callback) => {
    if ('requestIdleCallback' in window) {
        return requestIdleCallback(callback);
    }

    return setTimeout(callback, 1);
};

/**
 * Batch DOM updates
 */
export const batchDOMUpdates = (updates) => {
    requestAnimationFrame(() => {
        updates.forEach(update => update());
    });
};

/**
 * Measure performance
 */
export const measurePerformance = (name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    console.log(`${name} took ${(end - start).toFixed(2)}ms`);

    return result;
};

/**
 * Create virtual scroll helper
 */
export const createVirtualScroll = (totalItems, itemHeight, containerHeight) => {
    return (scrollTop) => {
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
export const raf = (callback) => {
    return requestAnimationFrame(callback);
};

/**
 * Cancel Animation Frame helper
 */
export const caf = (id) => {
    return cancelAnimationFrame(id);
};
