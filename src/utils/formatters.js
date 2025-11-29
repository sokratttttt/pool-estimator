/**
 * Formatters utility functions
 * Centralized formatting logic
 */

/**
 * Format price with currency
 */
export const formatPrice = (price, currency = '₽') => {
    const num = parseFloat(price);
    if (isNaN(num)) return '0 ' + currency;

    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(num) + ' ' + currency;
};

/**
 * Format number with thousands separator
 */
export const formatNumber = (number, decimals = 0) => {
    const num = parseFloat(number);
    if (isNaN(num)) return '0';

    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
};

/**
 * Format phone number (Russian format)
 */
export const formatPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 11) {
        return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
    }

    return phone;
};

/**
 * Format date
 */
export const formatDate = (date, format = 'DD.MM.YYYY') => {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d)) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    const formats = {
        'DD.MM.YYYY': `${day}.${month}.${year}`,
        'MM/DD/YYYY': `${month}/${day}/${year}`,
        'YYYY-MM-DD': `${year}-${month}-${day}`
    };

    return formats[format] || formats['DD.MM.YYYY'];
};

/**
 * Format date and time
 */
export const formatDateTime = (date) => {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d)) return '';

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${formatDate(date)} ${hours}:${minutes}`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 0) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0%';

    return num.toFixed(decimals) + '%';
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength, suffix = '...') => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + suffix;
};

/**
 * Capitalize first letter
 */
export const capitalize = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Title case
 */
export const toTitleCase = (text) => {
    if (!text) return '';
    return text
        .toLowerCase()
        .split(' ')
        .map(word => capitalize(word))
        .join(' ');
};

/**
 * Format duration (seconds to human readable)
 */
export const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}с`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}м ${seconds % 60}с`;

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}ч ${minutes}м`;
};

/**
 * Format address (Russian format)
 */
export const formatAddress = (address) => {
    const { city, street, building, apartment } = address;
    const parts = [city, street, building];

    if (apartment) {
        parts.push(`кв. ${apartment}`);
    }

    return parts.filter(Boolean).join(', ');
};

/**
 * Format name (Last First Middle)
 */
export const formatFullName = (firstName, lastName, middleName) => {
    const parts = [lastName, firstName, middleName];
    return parts.filter(Boolean).join(' ');
};
