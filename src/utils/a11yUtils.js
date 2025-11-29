/**
 * Focus visible styles for keyboard navigation
 * Add this to tailwind.config.js plugins or use as utility
 */

// Custom Tailwind plugin for focus-visible
export const focusVisiblePlugin = ({ addUtilities }) => {
    addUtilities({
        '.focus-ring': {
            '@apply focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900': {}
        },
        '.focus-ring-inset': {
            '@apply focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-500': {}
        }
    });
};

/**
 * Accessibility utilities
 */

// Visual hidden but accessible to screen readers
export const srOnly = 'sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0';

// Skip to main content link
export const skipLink = `
    fixed top-0 left-0 z-[9999] p-4 bg-cyan-500 text-white 
    transform -translate-y-full focus:translate-y-0 
    transition-transform duration-200
`;

/**
 * Helper function to get accessible button props
 */
export const getAccessibleButtonProps = (label, options = {}) => {
    const { disabled = false, pressed = undefined, expanded = undefined } = options;

    return {
        role: 'button',
        'aria-label': label,
        'aria-disabled': disabled,
        ...(pressed !== undefined && { 'aria-pressed': pressed }),
        ...(expanded !== undefined && { 'aria-expanded': expanded }),
        tabIndex: disabled ? -1 : 0
    };
};

/**
 * Helper function for form field accessibility
 */
export const getAccessibleFieldProps = (id, label, options = {}) => {
    const {
        required = false,
        invalid = false,
        describedBy = null,
        errorId = null
    } = options;

    return {
        id,
        'aria-label': label,
        'aria-required': required,
        'aria-invalid': invalid,
        ...(describedBy && { 'aria-describedby': describedBy }),
        ...(invalid && errorId && { 'aria-errormessage': errorId })
    };
};

/**
 * Helper for live regions (for dynamic content updates)
 */
export const getLiveRegionProps = (politeness = 'polite') => {
    return {
        'aria-live': politeness, // 'polite' | 'assertive' | 'off'
        'aria-atomic': 'true',
        role: 'status'
    };
};

/**
 * Check if element is focusable
 */
export const isFocusable = (element) => {
    if (!element) return false;

    const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
    ];

    return focusableSelectors.some(selector => element.matches(selector));
};

/**
 * Trap focus within a container (for modals)
 */
export const trapFocus = (container) => {
    const focusableElements = container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    };

    container.addEventListener('keydown', handleTabKey);

    // Return cleanup function
    return () => {
        container.removeEventListener('keydown', handleTabKey);
    };
};

/**
 * Announce to screen readers
 */
export const announceToScreenReader = (message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
};
