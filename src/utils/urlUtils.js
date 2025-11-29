/**
 * URL utilities
 * URL parsing and manipulation
 */

/**
 * Parse query string
 */
export const parseQueryString = (queryString) => {
    const params = new URLSearchParams(queryString);
    const result = {};

    for (const [key, value] of params.entries()) {
        result[key] = value;
    }

    return result;
};

/**
 * Build query string from object
 */
export const buildQueryString = (params) => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            searchParams.append(key, value);
        }
    });

    return searchParams.toString();
};

/**
 * Get domain from URL
 */
export const getDomain = (url) => {
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
export const getPath = (url) => {
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
export const addQueryParams = (url, params) => {
    try {
        const urlObj = new URL(url);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                urlObj.searchParams.set(key, value);
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
export const removeQueryParams = (url, params) => {
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
export const isAbsoluteUrl = (url) => {
    return /^https?:\/\//i.test(url);
};

/**
 * Join URL paths
 */
export const joinPaths = (...paths) => {
    return paths
        .map((path, index) => {
            if (index === 0) {
                return path.replace(/\/$/, '');
            }
            return path.replace(/^\//, '').replace(/\/$/, '');
        })
        .filter(Boolean)
        .join('/');
};
