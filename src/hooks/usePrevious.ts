import { useEffect, useRef } from 'react';

/**
 * Custom hook to get the previous value of a state or prop
 * @param {any} value - The current value
 * @returns {any} The previous value
 */
export function usePrevious(value): any {
    const ref = useRef<any>(null);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}
