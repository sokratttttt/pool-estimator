import { useEffect, useRef } from 'react';
import { useAsync } from './useAsync';

interface UseAbortControllerResult {
    signal: AbortSignal;
    abort: (reason?: string) => void;
    reset: () => void;
    controller: AbortController;
}

/**
 * Hook to create and manage AbortController for cancelling requests
 * Automatically aborts on unmount
 */
export function useAbortController(): UseAbortControllerResult {
    const controllerRef = useRef<AbortController | null>(null);

    const getController = (): AbortController => {
        if (!controllerRef.current) {
            controllerRef.current = new AbortController();
        }
        return controllerRef.current;
    };

    const abort = (reason?: string): void => {
        if (controllerRef.current) {
            controllerRef.current.abort(reason);
            controllerRef.current = null;
        }
    };

    const reset = (): void => {
        abort();
        controllerRef.current = new AbortController();
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            abort('Component unmounted');
        };
    }, []);

    return {
        signal: getController().signal,
        abort,
        reset,
        controller: getController()
    };
}

type AsyncFunction<T> = (signal: AbortSignal, ...args: unknown[]) => Promise<T>;

/**
 * Hook combining useAsync with abort controller
 */
export function useAbortableAsync<T>(asyncFunction: AsyncFunction<T>, immediate: boolean = false) {
    const { signal, abort, reset: resetController } = useAbortController();

    const wrappedFunction = async (...args: unknown[]): Promise<T> => {
        return asyncFunction(signal, ...args);
    };

    const asyncResult = useAsync(wrappedFunction, immediate);

    const reset = (): void => {
        resetController();
        asyncResult.reset();
    };

    return {
        ...asyncResult,
        abort,
        reset
    };
}
