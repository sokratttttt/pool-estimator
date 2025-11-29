/**
 * Lazy loading utilities
 * Component and image lazy loading helpers
 */

import { lazy } from 'react';

/**
 * Lazy load component with retry logic
 */
export const lazyWithRetry = (componentImport, retries = 3, interval = 1000) => {
    return lazy(() => {
        return new Promise((resolve, reject) => {
            const attemptLoad = (attemptNumber) => {
                componentImport()
                    .then(resolve)
                    .catch((error) => {
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
export const preloadComponent = (componentImport) => {
    componentImport();
};

/**
 * Lazy load image with loading and error states
 */
export const useLazyImage = (src) => {
    const [imageSrc, setImageSrc] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        const img = new Image();
        img.src = src;

        img.onload = () => {
            setImageSrc(src);
            setLoading(false);
        };

        img.onerror = (err) => {
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
export const createLazyRoute = (importFunc) => {
    return lazyWithRetry(importFunc);
};

/**
 * Prefetch route
 */
export const prefetchRoute = (importFunc) => {
    // Start loading the route in the background
    importFunc();
};
