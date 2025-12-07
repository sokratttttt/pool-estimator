/**
 * API utilities
 * Fetch helpers with retry, timeout, and error handling
 */

/**
 * Create fetch with timeout
 */
export const fetchWithTimeout = (
    url: string,
    options: RequestInit = {},
    timeout: number = 30000
): Promise<Response> => {
    return Promise.race([
        fetch(url, options),
        new Promise<Response>((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
    ]);
};

/**
 * Fetch with retry logic
 */
export const fetchWithRetry = async (
    url: string,
    options: RequestInit = {},
    retries: number = 3,
    delay: number = 1000
): Promise<Response> => {
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
    defaultOptions: RequestInit;
    interceptors: {
        request: ((url: string, options: RequestInit) => Promise<RequestInit | void>)[];
        response: ((response: Response) => Promise<Response | void>)[];
    };

    constructor(baseURL = '', defaultOptions: RequestInit = {}) {
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
    addRequestInterceptor(interceptor: (url: string, options: RequestInit) => Promise<RequestInit | void>) {
        this.interceptors.request.push(interceptor);
    }

    // Add response interceptor
    addResponseInterceptor(interceptor: (response: Response) => Promise<Response | void>) {
        this.interceptors.response.push(interceptor);
    }

    // Apply request interceptors
    async applyRequestInterceptors(url: string, options: RequestInit) {
        let modifiedOptions = { ...options };

        for (const interceptor of this.interceptors.request) {
            const result = await interceptor(url, modifiedOptions);
            if (result) modifiedOptions = result;
        }

        return modifiedOptions;
    }

    // Apply response interceptors
    async applyResponseInterceptors(response: Response) {
        let modifiedResponse = response;

        for (const interceptor of this.interceptors.response) {
            const result = await interceptor(modifiedResponse);
            if (result) modifiedResponse = result;
        }

        return modifiedResponse;
    }

    // Make request
    async request(endpoint: string, options: RequestInit = {}) {
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
    get(endpoint: string, options: RequestInit = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    // POST request
    post(endpoint: string, data: unknown, options: RequestInit = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    put(endpoint: string, data: unknown, options: RequestInit = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // PATCH request
    patch(endpoint: string, data: unknown, options: RequestInit = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    delete(endpoint: string, options: RequestInit = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }

    // Upload file
    async upload(endpoint: string, file: Blob, fieldName = 'file', additionalData: Record<string, string | Blob> = {}) {
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
export const createAPIClient = (baseURL: string, options: RequestInit) => {
    return new APIClient(baseURL, options);
};

/**
 * Query string builder
 */
export const buildQueryString = (params: Record<string, string | number | boolean | null | undefined>) => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            searchParams.append(key, String(value));
        }
    });

    return searchParams.toString();
};
