import { useEffect } from 'react';

/**
 * Custom hook to detect when a specific key is pressed
 * @param {string} targetKey - The key to listen for (e.g., 'Escape', 'Enter')
 * @param {Function} handler - Function to call when key is pressed
 * @param {Object} options - Options for the key press
 * @param {boolean} options.ctrl - Whether Ctrl key should be pressed
 * @param {boolean} options.shift - Whether Shift key should be pressed
 * @param {boolean} options.alt - Whether Alt key should be pressed
 * @param {boolean} options.meta - Whether Meta key should be pressed
 */
export function useKeyPress(targetKey, handler, options = {}) {
    useEffect(() => {
        const handleKeyPress = (event) => {
            // Check if the target key matches
            if (event.key !== targetKey) return;

            // Check modifier keys if specified
            if (options.ctrl && !event.ctrlKey) return;
            if (options.shift && !event.shiftKey) return;
            if (options.alt && !event.altKey) return;
            if (options.meta && !event.metaKey) return;

            handler(event);
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [targetKey, handler, options]);
}

/**
 * Hook to detect Escape key press
 * @param {Function} handler - Function to call when Escape is pressed
 */
export function useEscapeKey(handler) {
    return useKeyPress('Escape', handler);
}

/**
 * Hook to detect Enter key press
 * @param {Function} handler - Function to call when Enter is pressed
 */
export function useEnterKey(handler) {
    return useKeyPress('Enter', handler);
}
