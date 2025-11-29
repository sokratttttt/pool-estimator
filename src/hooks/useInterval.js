import { useEffect, useRef } from 'react';

/**
 * Custom hook for setInterval with automatic cleanup
 * @param {Function} callback - Function to call on each interval
 * @param {number|null} delay - Delay in milliseconds (null to pause)
 */
export function useInterval(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest callback
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval
    useEffect(() => {
        if (delay === null) return;

        const tick = () => {
            savedCallback.current();
        };

        const id = setInterval(tick, delay);
        return () => clearInterval(id);
    }, [delay]);
}

/**
 * Custom hook for setTimeout with automatic cleanup
 * @param {Function} callback - Function to call after timeout
 * @param {number|null} delay - Delay in milliseconds (null to cancel)
 */
export function useTimeout(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest callback
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the timeout
    useEffect(() => {
        if (delay === null) return;

        const id = setTimeout(() => {
            savedCallback.current();
        }, delay);

        return () => clearTimeout(id);
    }, [delay]);
}
