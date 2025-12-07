// TODO: Add proper TypeScript types for state
import { useEffect, useRef, useState, RefObject } from 'react';

interface IntersectionObserverOptions {
    threshold?: number | number[];
    root?: Element | Document | null;
    rootMargin?: string;
    freezeOnceVisible?: boolean;
}

/**
 * Hook to detect when an element enters/exits the viewport
 * Useful for lazy loading and infinite scroll
 * 
 * @param {Object} options - IntersectionObserver options
 * @param {number} options.threshold - Visibility threshold (0-1)
 * @param {string} options.root - Root element selector
 * @param {string} options.rootMargin - Margin around root
 * @returns {[RefObject, boolean]} - [ref to attach, isIntersecting]
 */
export function useIntersectionObserver({
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false
}: IntersectionObserverOptions = {}): [RefObject<HTMLElement | null>, boolean, IntersectionObserverEntry | null] {
    const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
    const [isIntersecting, setIsIntersecting] = useState(false);
    const elementRef = useRef<HTMLElement | null>(null);
    const frozen = useRef(false);

    useEffect(() => {
        const element = elementRef.current;
        const hasIOSupport = !!window.IntersectionObserver;

        if (!hasIOSupport || !element) return;

        // If frozen and element was intersecting, don't update
        if (frozen.current) return;

        const observerParams = { threshold, root, rootMargin };
        const observer = new IntersectionObserver(
            ([entry]) => {
                setEntry(entry);
                setIsIntersecting(entry.isIntersecting);

                // Freeze if element is visible and freezeOnceVisible is true
                if (entry.isIntersecting && freezeOnceVisible) {
                    frozen.current = true;
                }
            },
            observerParams
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [threshold, root, rootMargin, freezeOnceVisible]);

    return [elementRef, isIntersecting, entry];
}
