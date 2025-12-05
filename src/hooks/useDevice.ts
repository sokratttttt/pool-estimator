// TODO: Add proper TypeScript types for state
import { useState, useEffect } from 'react';

/**
 * Хук для определения типа устройства и ориентации
 * @returns {{isTablet: boolean, isMobile: boolean, isDesktop: boolean, orientation: string, width: number}}
 */
export const useDevice = () => {
    const [device, setDevice] = useState({
        isTablet: false,
        isMobile: false,
        isDesktop: false,
        orientation: 'portrait',
        width: 0
    });

    useEffect(() => {
        const checkDevice = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const isTablet = width >= 768 && width <= 1024;
            const isMobile = width < 768;
            const isDesktop = width > 1024;
            const orientation = height > width ? 'portrait' : 'landscape';

            setDevice({
                isTablet,
                isMobile,
                isDesktop,
                orientation,
                width
            });
        };

        // Проверить при монтировании
        checkDevice();

        // Слушать изменения размера и ориентации
        window.addEventListener('resize', checkDevice);
        window.addEventListener('orientationchange', checkDevice);

        return () => {
            window.removeEventListener('resize', checkDevice);
            window.removeEventListener('orientationchange', checkDevice);
        };
    }, []);

    return device;
};

/**
 * Хук для определения, является ли текущее устройство touch-устройством
 * @returns {boolean}
 */
export const useIsTouchDevice = () => {
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        const checkTouch = () => {
            const hasTouch =
                'ontouchstart' in window ||
                navigator.maxTouchPoints > 0 ||
                (navigator as any).msMaxTouchPoints > 0;
            setIsTouch(hasTouch);
        };

        checkTouch();
    }, []);

    return isTouch;
};
