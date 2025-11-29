import { useState, useEffect } from 'react';

/**
 * useTitle hook
 * Update document title
 */
export function useTitle(title) {
    useEffect(() => {
        const prevTitle = document.title;
        document.title = title;

        return () => {
            document.title = prevTitle;
        };
    }, [title]);
}

/**
 * useFavicon hook
 * Update favicon dynamically
 */
export function useFavicon(href) {
    useEffect(() => {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = href;
        document.getElementsByTagName('head')[0].appendChild(link);
    }, [href]);
}

/**
 * useMeta hook
 * Update meta tags
 */
export function useMeta(name, content) {
    useEffect(() => {
        let meta = document.querySelector(`meta[name="${name}"]`);

        if (!meta) {
            meta = document.createElement('meta');
            meta.name = name;
            document.head.appendChild(meta);
        }

        meta.content = content;
    }, [name, content]);
}

/**
 * useDocumentVisibility hook
 * Track document visibility
 */
export function useDocumentVisibility() {
    const [isVisible, setIsVisible] = useState(!document.hidden);

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return isVisible;
}
