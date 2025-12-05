import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useLocalStorageState hook
 * Sync state with localStorage
 */
export function useLocalStorageState<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
    const [state, setState] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return initialValue;
        }
    });

    const setValue = useCallback((value: T | ((prev: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(state) : value;
            setState(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }, [key, state]);

    return [state, setValue];
}

/**
 * useSessionStorageState hook
 * Sync state with sessionStorage
 */
export function useSessionStorageState<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
    const [state, setState] = useState<T>(() => {
        try {
            const item = window.sessionStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Error loading from sessionStorage:', error);
            return initialValue;
        }
    });

    const setValue = useCallback((value: T | ((prev: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(state) : value;
            setState(valueToStore);
            window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error('Error saving to sessionStorage:', error);
        }
    }, [key, state]);

    return [state, setValue];
}

/**
 * useDebounceCallback hook
 * Debounce a callback function
 */
export function useDebounceCallback<T extends (...args: any[]) => void>(callback: T, delay = 500): (...args: Parameters<T>) => void {
    const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

    const debouncedCallback = useCallback((...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        const newTimeoutId = setTimeout(() => {
            callback(...args);
        }, delay);

        setTimeoutId(newTimeoutId);
    }, [callback, delay, timeoutId]);

    useEffect(() => {
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [timeoutId]);

    return debouncedCallback;
}

/**
 * useThrottle hook
 * Throttle a value
 */
export function useThrottle<T>(value: T, delay = 500): T {
    const [throttledValue, setThrottledValue] = useState<T>(value);
    const lastRan = useRef(Date.now());

    useEffect(() => {
        const handler = setTimeout(() => {
            if (Date.now() - lastRan.current >= delay) {
                setThrottledValue(value);
                lastRan.current = Date.now();
            }
        }, delay - (Date.now() - lastRan.current));

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return throttledValue;
}

/**
 * useQueue hook
 * Manage a queue data structure
 */
export function useQueue<T>(initialQueue: T[] = []): {
    queue: T[];
    enqueue: (item: T) => void;
    dequeue: () => T | undefined;
    peek: () => T | undefined;
    clear: () => void;
    size: number;
    isEmpty: boolean;
} {
    const [queue, setQueue] = useState<T[]>(initialQueue);

    const enqueue = useCallback((item: T) => {
        setQueue(prev => [...prev, item]);
    }, []);

    const dequeue = useCallback(() => {
        let item: T | undefined;
        setQueue(prev => {
            const [first, ...rest] = prev;
            item = first;
            return rest;
        });
        return item;
    }, []);

    const peek = useCallback(() => {
        return queue[0];
    }, [queue]);

    const clear = useCallback(() => {
        setQueue([]);
    }, []);

    return {
        queue,
        enqueue,
        dequeue,
        peek,
        clear,
        size: queue.length,
        isEmpty: queue.length === 0
    };
}
