/**
 * Number utilities
 * Number formatting and manipulation
 */

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'RUB', locale = 'ru-RU') => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency
    }).format(amount);
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 0) => {
    return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format with separators
 */
export const formatNumber = (number, decimals = 0) => {
    return number.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

/**
 * Clamp number between min and max
 */
export const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
};

/**
 * Linear interpolation
 */
export const lerp = (start, end, progress) => {
    return start + (end - start) * progress;
};

/**
 * Map value from one range to another
 */
export const mapRange = (value, inMin, inMax, outMin, outMax) => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

/**
 * Round to nearest multiple
 */
export const roundToNearest = (value, nearest) => {
    return Math.round(value / nearest) * nearest;
};

/**
 * Random integer between min and max
 */
export const randomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Random float between min and max
 */
export const randomFloat = (min, max) => {
    return Math.random() * (max - min) + min;
};

/**
 * Check if number is in range
 */
export const inRange = (value, min, max) => {
    return value >= min && value <= max;
};

/**
 * Convert degrees to radians
 */
export const degToRad = (degrees) => {
    return degrees * (Math.PI / 180);
};

/**
 * Convert radians to degrees
 */
export const radToDeg = (radians) => {
    return radians * (180 / Math.PI);
};
