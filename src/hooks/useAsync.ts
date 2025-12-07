import { useState, useEffect, useCallback, useRef } from 'react';

type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';

interface UseAsyncResult<T> {
    execute: (...params: unknown[]) => Promise<T>;
    reset: () => void;
    loading: boolean;
    data: T | null;
    error: Error | null;
    status: AsyncStatus;
    isIdle: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
}

/**
 * Hook for handling async operations with loading, error, and data states
 * @param asyncFunction - Async function to execute
 * @param immediate - Execute immediately on mount
 * @returns { execute, loading, data, error, reset }
 */
export function useAsync<T>(
    asyncFunction: (...args: unknown[]) => Promise<T>,
    immediate = false
): UseAsyncResult<T> {
    const [status, setStatus] = useState<AsyncStatus>('idle');
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const mountedRef = useRef(true);

    // Execute the async function
    const execute = useCallback(
        async (...params: unknown[]): Promise<T> => {
            setStatus('pending');
            setData(null);
            setError(null);

            try {
                const response = await asyncFunction(...params);

                // Only update state if component is still mounted
                if (mountedRef.current) {
                    setData(response);
                    setStatus('success');
                }

                return response;
            } catch (err) {
                if (mountedRef.current) {
                    setError(err instanceof Error ? err : new Error(String(err)));
                    setStatus('error');
                }
                throw err;
            }
        },
        [asyncFunction]
    );

    // Reset state
    const reset = useCallback(() => {
        setStatus('idle');
        setData(null);
        setError(null);
    }, []);

    // Execute on mount if immediate is true
    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    // Track if component is mounted
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    return {
        execute,
        reset,
        loading: status === 'pending',
        data,
        error,
        status,
        isIdle: status === 'idle',
        isLoading: status === 'pending',
        isSuccess: status === 'success',
        isError: status === 'error'
    };
}
