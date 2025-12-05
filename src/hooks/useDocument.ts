// TODO: Add proper TypeScript types for state
import { useState, useEffect } from 'react';

/**
 * useTitle hook
 * Update document title
 */
export function useTitle(title: string): any {
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
export function useFavicon(href: string): any {
    useEffect(() => {
        const link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
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
export function useMeta(name: string, content: string): any {
    useEffect(() => {
        let meta: HTMLMetaElement | null = document.querySelector(`meta[name="${name}"]`);

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
export function useDocumentVisibility(): any {
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
