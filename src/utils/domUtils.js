/**
 * DOM utilities
 * Helper functions for DOM manipulation
 */

/**
 * Scroll to element smoothly
 */
export const scrollToElement = (element, options = {}) => {
    const {
        offset = 0,
        behavior = 'smooth',
        block = 'start'
    } = options;

    if (typeof element === 'string') {
        element = document.querySelector(element);
    }

    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
        top: offsetPosition,
        behavior
    });
};

/**
 * Check if element is in viewport
 */
export const isInViewport = (element) => {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }

    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};

/**
 * Get element offset from top
 */
export const getElementOffset = (element) => {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }

    if (!element) return 0;

    const rect = element.getBoundingClientRect();
    return rect.top + window.pageYOffset;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        }
    } catch (error) {
        console.error('Failed to copy:', error);
        return false;
    }
};

/**
 * Download file from URL
 */
export const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Get scroll position
 */
export const getScrollPosition = () => {
    return {
        x: window.pageXOffset || document.documentElement.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop
    };
};

/**
 * Lock body scroll
 */
export const lockBodyScroll = () => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
};

/**
 * Unlock body scroll
 */
export const unlockBodyScroll = () => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
};

/**
 * Add class to element
 */
export const addClass = (element, className) => {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    element?.classList.add(className);
};

/**
 * Remove class from element
 */
export const removeClass = (element, className) => {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    element?.classList.remove(className);
};

/**
 * Toggle class on element
 */
export const toggleClass = (element, className) => {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    element?.classList.toggle(className);
};
