import { useCallback, useState } from 'react';

/**
 * Hook for array operations with helpful utilities
 * 
 * @param {Array} initialValue - Initial array
 * @returns {Object} - Array with utility methods
 */
export function useArray(initialValue: any[] = []): any {
    const [array, setArray] = useState<any[]>(initialValue);

    const push = useCallback((element: any) => {
        setArray((arr: any[]) => [...arr, element]);
    }, []);

    const filter = useCallback((callback: (item: any) => boolean) => {
        setArray((arr: any[]) => arr.filter(callback));
    }, []);

    const update = useCallback((index: number, newElement: any) => {
        setArray((arr: any[]) => [
            ...arr.slice(0, index),
            newElement,
            ...arr.slice(index + 1)
        ]);
    }, []);

    const remove = useCallback((index: number) => {
        setArray((arr: any[]) => [
            ...arr.slice(0, index),
            ...arr.slice(index + 1)
        ]);
    }, []);

    const clear = useCallback(() => {
        setArray([]);
    }, []);

    const set = useCallback((newArray: any[]) => {
        setArray(newArray);
    }, []);

    const toggle = useCallback((element: any) => {
        setArray((arr: any[]) =>
            arr.includes(element)
                ? arr.filter(item => item !== element)
                : [...arr, element]
        );
    }, []);

    const replace = useCallback((oldElement: any, newElement: any) => {
        setArray((arr: any[]) => arr.map(item => item === oldElement ? newElement : item));
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
