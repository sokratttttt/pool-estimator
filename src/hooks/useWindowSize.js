import { useState, useEffect } from 'react';

/**
 * Hook to get current window size
 * Useful for responsive design and conditional rendering
 * 
 * @returns {Object} - { width, height }
 */
export function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);

        // Call handler right away so state gets updated with initial window size
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
}

/**
 * Hook to check if window width matches a specific breakpoint
 */
export function useBreakpoint(breakpoint = 1024) {
    const { width } = useWindowSize();
    return width >= breakpoint;
}
