import { useEffect, useRef } from 'react';

/**
 * Hook to create and manage AbortController for cancelling requests
 * Automatically aborts on unmount
 * 
 * @returns {Object} - { signal, abort, reset }
 */
export function useAbortController() {
    const controllerRef = useRef(null);

    const getController = () => {
        if (!controllerRef.current) {
            controllerRef.current = new AbortController();
        }
        return controllerRef.current;
    };

    const abort = (reason) => {
        if (controllerRef.current) {
            controllerRef.current.abort(reason);
            controllerRef.current = null;
        }
    };

    const reset = () => {
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

/**
 * Hook combining useAsync with abort controller
 */
export function useAbortableAsync(asyncFunction, immediate = false) {
    const { signal, abort, reset: resetController } = useAbortController();
    const { useAsync } = require('./useAsync');

    const wrappedFunction = async (...args) => {
        return asyncFunction(signal, ...args);
    };

    const asyncResult = useAsync(wrappedFunction, immediate);

    const reset = () => {
        resetController();
        asyncResult.reset();
    };

    return {
        ...asyncResult,
        abort,
        reset
    };
}
