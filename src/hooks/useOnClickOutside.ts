import { useEffect, useRef } from 'react';

/**
 * Custom hook to detect clicks outside of a specified element
 * @param {Function} handler - Function to call when click outside occurs
 * @returns {RefObject} Ref to attach to the element
 */
export function useOnClickOutside(handler: (event: MouseEvent | TouchEvent) => void): any {
    const ref = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            // Do nothing if clicking ref's element or descendent elements
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [handler]);

    return ref;
}
