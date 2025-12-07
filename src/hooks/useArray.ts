import { useCallback, useState } from 'react';

/**
 * Hook for array operations with helpful utilities
 * 
 * @param {Array} initialValue - Initial array
 * @returns {Object} - Array with utility methods
 */
export function useArray<T>(initialValue: T[] = []) {
    const [array, setArray] = useState<T[]>(initialValue);

    const push = useCallback((element: T) => {
        setArray(arr => [...arr, element]);
    }, []);

    const filter = useCallback((callback: (item: T) => boolean) => {
        setArray(arr => arr.filter(callback));
    }, []);

    const update = useCallback((index: number, newElement: T) => {
        setArray(arr => [
            ...arr.slice(0, index),
            newElement,
            ...arr.slice(index + 1)
        ]);
    }, []);

    const remove = useCallback((index: number) => {
        setArray(arr => [
            ...arr.slice(0, index),
            ...arr.slice(index + 1)
        ]);
    }, []);

    const clear = useCallback(() => {
        setArray([]);
    }, []);

    const set = useCallback((newArray: T[]) => {
        setArray(newArray);
    }, []);

    const toggle = useCallback((element: T) => {
        setArray(arr =>
            arr.includes(element)
                ? arr.filter(item => item !== element)
                : [...arr, element]
        );
    }, []);

    const replace = useCallback((oldElement: T, newElement: T) => {
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
