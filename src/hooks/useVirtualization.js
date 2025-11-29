import { useEffect, useRef } from 'react';

/**
 * useVirtualization hook
 * For virtualizing long lists
 */
export function useVirtualization({
    itemCount,
    itemHeight,
    containerHeight,
    overscan = 3
}) {
    const scrollTop = useRef(0);
    const visibleStart = Math.floor(scrollTop.current / itemHeight);
    const visibleEnd = Math.ceil((scrollTop.current + containerHeight) / itemHeight);

    const startIndex = Math.max(0, visibleStart - overscan);
    const endIndex = Math.min(itemCount - 1, visibleEnd + overscan);

    const offsetY = startIndex * itemHeight;
    const totalHeight = itemCount * itemHeight;

    const handleScroll = (e) => {
        scrollTop.current = e.target.scrollTop;
    };

    return {
        virtualItems: {
            startIndex,
            endIndex,
            offsetY
        },
        totalHeight,
        handleScroll
    };
}

/**
 * useInfiniteScroll hook
 * Load more items on scroll
 */
export function useInfiniteScroll({
    loadMore,
    hasMore = true,
    threshold = 100
}) {
    const observerRef = useRef(null);
    const isLoading = useRef(false);

    const lastElementRef = (node) => {
        if (isLoading.current) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                isLoading.current = true;
                loadMore().finally(() => {
                    isLoading.current = false;
                });
            }
        }, {
            rootMargin: `${threshold}px`
        });

        if (node) observerRef.current.observe(node);
    };

    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    return { lastElementRef };
}
