import { useCallback, useState } from 'react';

/**
 * Hook for array operations with helpful utilities
 * 
 * @param {Array} initialValue - Initial array
 * @returns {Object} - Array with utility methods
 */
export function useArray(initialValue = []) {
    const [array, setArray] = useState(initialValue);

    const push = useCallback((element) => {
        setArray(arr => [...arr, element]);
    }, []);

    const filter = useCallback((callback) => {
        setArray(arr => arr.filter(callback));
    }, []);

    const update = useCallback((index, newElement) => {
        setArray(arr => [
            ...arr.slice(0, index),
            newElement,
            ...arr.slice(index + 1)
        ]);
    }, []);

    const remove = useCallback((index) => {
        setArray(arr => [
            ...arr.slice(0, index),
            ...arr.slice(index + 1)
        ]);
    }, []);

    const clear = useCallback(() => {
        setArray([]);
    }, []);

    const set = useCallback((newArray) => {
        setArray(newArray);
    }, []);

    const toggle = useCallback((element) => {
        setArray(arr =>
            arr.includes(element)
                ? arr.filter(item => item !== element)
                : [...arr, element]
        );
    }, []);

    const replace = useCallback((oldElement, newElement) => {
        setArray(arr => arr.map(item => item === oldElement ? newElement : item));
    }, []);

    return {
        array,
        set,
        push,
        filter,
        update,
        remove,
        clear,
        toggle,
        replace,
        isEmpty: array.length === 0,
        length: array.length
    };
}
