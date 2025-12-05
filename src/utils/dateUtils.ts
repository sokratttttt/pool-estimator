/**
 * Date utilities
 * Extended date manipulation functions
 */

import type { DateInput } from '@/types/utils';
import { formatDate, formatDateTime } from './formatters';

/**
 * Add days to date
 */
export const addDays = (date: DateInput, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

/**
 * Add months to date
 */
export const addMonths = (date: DateInput, months: number): Date => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
};

/**
 * Add years to date
 */
export const addYears = (date: DateInput, years: number): Date => {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
};

/**
 * Get difference in days between two dates
 */
export const diffInDays = (date1: DateInput, date2: DateInput): number => {
    const oneDay = 24 * 60 * 60 * 1000;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.round((d2.getTime() - d1.getTime()) / oneDay);
};

/**
 * Get difference in months
 */
export const diffInMonths = (date1: DateInput, date2: DateInput): number => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    return (d2.getFullYear() - d1.getFullYear()) * 12 +
        (d2.getMonth() - d1.getMonth());
};

/**
 * Check if date is today
 */
export const isToday = (date: DateInput): boolean => {
    const today = new Date();
    const d = new Date(date);

    return d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
};

/**
 * Check if date is weekend
 */
export const isWeekend = (date: DateInput): boolean => {
    const day = new Date(date).getDay();
    return day === 0 || day === 6;
};

/**
 * Get start of day
 */
export const startOfDay = (date: DateInput): Date => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
};

/**
 * Get end of day
 */
export const endOfDay = (date: DateInput): Date => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
};

/**
 * Get start of month
 */
export const startOfMonth = (date: DateInput): Date => {
    const result = new Date(date);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
};

/**
 * Get end of month
 */
export const endOfMonth = (date: DateInput): Date => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + 1, 0);
    result.setHours(23, 59, 59, 999);
    return result;
};

/**
 * Format date relative (e.g., "2 дня назад")
 */
export const formatRelative = (date: DateInput): string => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diff < 60) return 'только что';
    if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} дн назад`;

    return formatDate(date);
};

/**
 * Get day name in Russian
 */
export const getDayName = (date: DateInput, short: boolean = false): string => {
    const days = short
        ? ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
        : ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

    return days[new Date(date).getDay()];
};

/**
 * Get month name in Russian
 */
export const getMonthName = (date: DateInput, short: boolean = false): string => {
    const months = short
        ? ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
        : ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    return months[new Date(date).getMonth()];
};

/**
 * Get age from birthdate
 */
export const getAge = (birthdate: DateInput): number => {
    const today = new Date();
    const birth = new Date(birthdate);

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
};

/**
 * Check if date is in range
 */
export const isInRange = (date: DateInput, start: DateInput, end: DateInput): boolean => {
    const d = new Date(date);
    return d >= new Date(start) && d <= new Date(end);
};

// Re-export from formatters for convenience
export { formatDate, formatDateTime };
