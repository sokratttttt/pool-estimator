// TODO: Add proper TypeScript types for state
import { useState, useCallback } from 'react';

/**
 * Custom hook for boolean toggle state
 * @param {boolean} initialValue - Initial state value
 * @returns {[boolean, Function, Function, Function]} [state, toggle, setTrue, setFalse]
 */
export function useToggle(initialValue = false): any {
    const [value, setValue] = useState(initialValue);

    const toggle = useCallback(() => {
        setValue(v => !v);
    }, []);

    const setTrue = useCallback(() => {
        setValue(true);
    }, []);

    const setFalse = useCallback(() => {
        setValue(false);
    }, []);

    return [value, toggle, setTrue, setFalse];
}
