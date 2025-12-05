/**
 * Formatting Utilities
 * TypeScript utilities for formatting numbers, dates, and currency
 */

/**
 * Format number as currency
 */
export const formatCurrency = (amount: number, currency: string = 'RUB'): string => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Format date with optional configuration
 */
export const formatDate = (
    date: Date | string,
    options?: Intl.DateTimeFormatOptions
): string => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat('ru-RU', { ...defaultOptions, ...options }).format(dateObj);
};

/**
 * Format date to short format (DD.MM.YYYY)
 */
export const formatDateShort = (date: Date | string): string => {
    return formatDate(date, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export const formatRelativeTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Только что';
    if (diffMin < 60) return `${diffMin} мин назад`;
    if (diffHour < 24) return `${diffHour} ч назад`;
    if (diffDay < 7) return `${diffDay} дн назад`;

    return formatDateShort(dateObj);
};

/**
 * Format number with thousands separator
 */
export const formatNumber = (num: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
};

/**
 * Format phone number to Russian format
 */
export const formatPhone = (phone: string): string => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Format to +7 (XXX) XXX-XX-XX
    if (cleaned.length === 11 && cleaned.startsWith('7')) {
        return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
    }
    if (cleaned.length === 10) {
        return `+7 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 8)}-${cleaned.slice(8, 10)}`;
    }

    return phone;
};

/**
 * Format file size to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format percentage
 */
export const formatPercent = (value: number, decimals: number = 0): string => {
    return `${formatNumber(value, decimals)}%`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
};

/**
 * Format duration in milliseconds to human-readable string
 */
export const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}ч ${minutes % 60}м`;
    }
    if (minutes > 0) {
        return `${minutes}м ${seconds % 60}с`;
    }
    return `${seconds}с`;
};
