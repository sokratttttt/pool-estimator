// TODO: Add proper TypeScript types for state
/**
 * Lazy loading utilities
 * Component and image lazy loading helpers
 */

import { lazy, useState, useEffect, type ComponentType } from 'react';

/**
 * Lazy load component with retry logic
 */
/**
 * Lazy load component with retry logic
 */
export const lazyWithRetry = <P extends object>(componentImport: () => Promise<{ default: ComponentType<P> }>, retries = 3, interval = 1000) => {
    return lazy(() => {
        return new Promise<{ default: ComponentType<P> }>((resolve, reject) => {
            const attemptLoad = (attemptNumber: number) => {
                componentImport()
                    .then(resolve)
                    .catch((error: unknown) => {
                        if (attemptNumber >= retries) {
                            reject(error);
                        } else {
                            setTimeout(() => {
                                console.log(`Retry ${attemptNumber + 1}/${retries} loading component...`);
                                attemptLoad(attemptNumber + 1);
                            }, interval);
                        }
                    });
            };

            attemptLoad(0);
        });
    });
};

/**
 * Preload component
 */
export const preloadComponent = (componentImport: () => Promise<unknown>) => {
    componentImport();
};

/**
 * Lazy load image with loading and error states
 */
export const useLazyImage = (src: string) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        const img = new Image();
        img.src = src;

        img.onload = () => {
            setImageSrc(src);
            setLoading(false);
        };

        img.onerror = (err: any) => {
            setError(err);
            setLoading(false);
        };

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src]);

    return { imageSrc, loading, error };
};

/**
 * Create route-based code splitting
 */
export const createLazyRoute = <P extends object>(importFunc: () => Promise<{ default: ComponentType<P> }>) => {
    return lazyWithRetry(importFunc);
};

/**
 * Prefetch route
 */
export const prefetchRoute = (importFunc: () => Promise<unknown>) => {
    // Start loading the route in the background
    importFunc();
};
