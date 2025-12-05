import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if a media query matches
 * @param {string} query - The media query string (e.g., '(max-width: 768px)')
 * @returns {boolean} Whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        // Ensure this only runs on the client
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia(query);

        // Set initial value
        setMatches(mediaQuery.matches);

        // Define listener
        const listener = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', listener);
            return () => mediaQuery.removeEventListener('change', listener);
        }
        // Fallback for older browsers
        else {
            mediaQuery.addListener(listener);
            return () => mediaQuery.removeListener(listener);
        }
    }, [query]);

    return matches;
}

// Convenience hooks for common breakpoints
export function useIsMobile(): boolean {
    return useMediaQuery('(max-width: 768px)');
}

export function useIsTablet(): boolean {
    return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

export function useIsDesktop(): boolean {
    return useMediaQuery('(min-width: 1025px)');
}
