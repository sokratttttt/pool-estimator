import { useState, useCallback, useEffect } from 'react';

/**
 * useLocalStorageState hook
 * Sync state with localStorage
 */
export function useLocalStorageState(key, initialValue) {
    const [state, setState] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return initialValue;
        }
    });

    const setValue = useCallback((value) => {
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
export function useSessionStorageState(key, initialValue) {
    const [state, setState] = useState(() => {
        try {
            const item = window.sessionStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Error loading from sessionStorage:', error);
            return initialValue;
        }
    });

    const setValue = useCallback((value) => {
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
export function useDebounceCallback(callback, delay = 500) {
    const [timeoutId, setTimeoutId] = useState(null);

    const debouncedCallback = useCallback((...args) => {
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
export function useThrottle(value, delay = 500) {
    const [throttledValue, setThrottledValue] = useState(value);
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
export function useQueue(initialQueue = []) {
    const [queue, setQueue] = useState(initialQueue);

    const enqueue = useCallback((item) => {
        setQueue(prev => [...prev, item]);
    }, []);

    const dequeue = useCallback(() => {
        let item;
        setQueue(prev => {
            [item, ...rest] = prev;
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
