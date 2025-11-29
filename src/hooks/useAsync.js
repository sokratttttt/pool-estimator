import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for handling async operations with loading, error, and data states
 * 
 * @param {Function} asyncFunction - Async function to execute
 * @param {boolean} immediate - Execute immediately on mount
 * @returns {Object} - { execute, loading, data, error, reset }
 */
export function useAsync(asyncFunction, immediate = false) {
    const [status, setStatus] = useState('idle'); // idle | pending | success | error
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const mountedRef = useRef(true);

    // Execute the async function
    const execute = useCallback(
        async (...params) => {
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
            } catch (error) {
                if (mountedRef.current) {
                    setError(error);
                    setStatus('error');
                }
                throw error;
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
