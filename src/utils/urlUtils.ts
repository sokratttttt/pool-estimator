/**
 * URL utilities
 * URL parsing and manipulation
 */

import { QueryParams } from '@/types/utils';

/**
 * Parse query string
 */
export const parseQueryString = (queryString: string): Record<string, string> => {
    const params = new URLSearchParams(queryString);
    const result: Record<string, string> = {};

    for (const [key, value] of params.entries()) {
        result[key] = value;
    }

    return result;
};

/**
 * Build query string from object
 */
export const buildQueryString = (params: QueryParams): string => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            searchParams.append(key, String(value));
        }
    });

    return searchParams.toString();
};

/**
 * Get domain from URL
 */
export const getDomain = (url: string): string => {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch {
        return '';
    }
};

/**
 * Get path from URL
 */
export const getPath = (url: string): string => {
    try {
        const urlObj = new URL(url);
        return urlObj.pathname;
    } catch {
        return '';
    }
};

/**
 * Add query params to URL
 */
export const addQueryParams = (url: string, params: QueryParams): string => {
    try {
        const urlObj = new URL(url);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                urlObj.searchParams.set(key, String(value));
            }
        });
        return urlObj.toString();
    } catch {
        return url;
    }
};

/**
 * Remove query params from URL
 */
export const removeQueryParams = (url: string, params: string[]): string => {
    try {
        const urlObj = new URL(url);
        params.forEach(param => {
            urlObj.searchParams.delete(param);
        });
        return urlObj.toString();
    } catch {
        return url;
    }
};

/**
 * Check if URL is absolute
 */
export const isAbsoluteUrl = (url: string): boolean => {
    return /^https?:\/\//i.test(url);
};

/**
 * Join URL paths
 */
export const joinPaths = (...paths: string[]): string => {
    return paths
        .map((path: string, index: number) => {
            if (index === 0) {
                return path.replace(/\/$/, '');
            }
            return path.replace(/^\//, '').replace(/\/$/, '');
        })
        .filter(Boolean)
        .join('/');
};
