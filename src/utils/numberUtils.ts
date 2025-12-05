/**
 * Number utilities
 * Number formatting and manipulation
 */

/**
 * Format currency
 */
export const formatCurrency = (
    amount: number,
    currency: string = 'RUB',
    locale: string = 'ru-RU'
): string => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency
    }).format(amount);
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
    return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format with separators
 */
export const formatNumber = (number: number, decimals: number = 0): string => {
    return number.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

/**
 * Clamp number between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
};

/**
 * Linear interpolation
 */
export const lerp = (start: number, end: number, progress: number): number => {
    return start + (end - start) * progress;
};

/**
 * Map value from one range to another
 */
export const mapRange = (
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

/**
 * Round to nearest multiple
 */
export const roundToNearest = (value: number, nearest: number): number => {
    return Math.round(value / nearest) * nearest;
};

/**
 * Random integer between min and max
 */
export const randomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Random float between min and max
 */
export const randomFloat = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
};

/**
 * Check if number is in range
 */
export const inRange = (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
};

/**
 * Convert degrees to radians
 */
export const degToRad = (degrees: number): number => {
    return degrees * (Math.PI / 180);
};

/**
 * Convert radians to degrees
 */
export const radToDeg = (radians: number): number => {
    return radians * (180 / Math.PI);
};
