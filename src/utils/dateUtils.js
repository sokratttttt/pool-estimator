/**
 * Date utilities
 * Extended date manipulation functions
 */

/**
 * Add days to date
 */
export const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

/**
 * Add months to date
 */
export const addMonths = (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
};

/**
 * Add years to date
 */
export const addYears = (date, years) => {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
};

/**
 * Get difference in days between two dates
 */
export const diffInDays = (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((date2 - date1) / oneDay);
};

/**
 * Get difference in months
 */
export const diffInMonths = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    return (d2.getFullYear() - d1.getFullYear()) * 12 +
        (d2.getMonth() - d1.getMonth());
};

/**
 * Check if date is today
 */
export const isToday = (date) => {
    const today = new Date();
    const d = new Date(date);

    return d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
};

/**
 * Check if date is weekend
 */
export const isWeekend = (date) => {
    const day = new Date(date).getDay();
    return day === 0 || day === 6;
};

/**
 * Get start of day
 */
export const startOfDay = (date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
};

/**
 * Get end of day
 */
export const endOfDay = (date) => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
};

/**
 * Get start of month
 */
export const startOfMonth = (date) => {
    const result = new Date(date);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
};

/**
 * Get end of month
 */
export const endOfMonth = (date) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + 1, 0);
    result.setHours(23, 59, 59, 999);
    return result;
};

/**
 * Format date relative (e.g., "2 дня назад")
 */
export const formatRelative = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);

    if (diff < 60) return 'только что';
    if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} дн назад`;

    return formatDate(date);
};

/**
 * Get day name in Russian
 */
export const getDayName = (date, short = false) => {
    const days = short
        ? ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
        : ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

    return days[new Date(date).getDay()];
};

/**
 * Get month name in Russian
 */
export const getMonthName = (date, short = false) => {
    const months = short
        ? ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
        : ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    return months[new Date(date).getMonth()];
};

/**
 * Get age from birthdate
 */
export const getAge = (birthdate) => {
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
export const isInRange = (date, start, end) => {
    const d = new Date(date);
    return d >= new Date(start) && d <= new Date(end);
};

// Re-export from formatters for convenience
import { formatDate, formatDateTime } from './formatters';
export { formatDate, formatDateTime };
