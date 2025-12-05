/**
 * API utilities
 * Fetch helpers with retry, timeout, and error handling
 */

/**
 * Create fetch with timeout
 */
export const fetchWithTimeout = (url, options = {}, timeout = 30000) => {
    return Promise.race([
        fetch(url, options),
        new Promise((_: any, reject: any) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
    ]);
};

/**
 * Fetch with retry logic
 */
export const fetchWithRetry = async (url, options = {}, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);

            if (!response.ok && i < retries - 1) {
                // Retry on server errors (5xx)
                if (response.status >= 500) {
                    await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
                    continue;
                }
            }

            return response;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
    throw new Error('All retries exhausted');
};

/**
 * API Client class
 */
export class APIClient {
    baseURL: string;
    defaultOptions: any;
    interceptors: { request: any[]; response: any[] };

    constructor(baseURL = '', defaultOptions: any = {}) {
        this.baseURL = baseURL;
        this.defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...defaultOptions
        };
        this.interceptors = {
            request: [],
            response: []
        };
    }

    // Add request interceptor
    addRequestInterceptor(interceptor) {
        this.interceptors.request.push(interceptor);
    }

    // Add response interceptor
    addResponseInterceptor(interceptor) {
        this.interceptors.response.push(interceptor);
    }

    // Apply request interceptors
    async applyRequestInterceptors(url, options) {
        let modifiedOptions = { ...options };

        for (const interceptor of this.interceptors.request) {
            const result = await interceptor(url, modifiedOptions);
            if (result) modifiedOptions = result;
        }

        return modifiedOptions;
    }

    // Apply response interceptors
    async applyResponseInterceptors(response) {
        let modifiedResponse = response;

        for (const interceptor of this.interceptors.response) {
            const result = await interceptor(modifiedResponse);
            if (result) modifiedResponse = result;
        }

        return modifiedResponse;
    }

    // Make request
    async request(endpoint: string, options: any = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const mergedOptions = {
            ...this.defaultOptions,
            ...options,
            headers: {
                ...this.defaultOptions.headers,
                ...options.headers
            }
        };

        // Apply request interceptors
        const finalOptions = await this.applyRequestInterceptors(url, mergedOptions);

        try {
            const response = await fetchWithRetry(url, finalOptions);

            // Apply response interceptors
            const finalResponse = await this.applyResponseInterceptors(response);

            if (!finalResponse.ok) {
                throw new Error(`HTTP ${finalResponse.status}: ${finalResponse.statusText}`);
            }

            const contentType = finalResponse.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await finalResponse.json();
            }

            return await finalResponse.text();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // GET request
    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    // POST request
    post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // PATCH request
    patch(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }

    // Upload file
    async upload(endpoint, file, fieldName = 'file', additionalData = {}) {
        const formData = new FormData();
        formData.append(fieldName, file);

        Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value as string | Blob);
        });

        return this.request(endpoint, {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set Content-Type with boundary
        });
    }
}

/**
 * Create API client instance
 */
export const createAPIClient = (baseURL: any, options: any) => {
    return new APIClient(baseURL, options);
};

/**
 * Query string builder
 */
export const buildQueryString = (params: any) => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            searchParams.append(key, String(value));
        }
    });

    return searchParams.toString();
};
