/**
 * String utilities
 * Helper functions for string manipulation
 */

import type { CharsetType, CyrillicMap } from '@/types/utils';

/**
 * Generate random string
 */
export const generateRandomString = (length: number = 10, charset: CharsetType = 'alphanumeric'): string => {
    const charsets: Record<CharsetType, string> = {
        alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        numeric: '0123456789',
        hex: '0123456789ABCDEF'
    };

    const chars = charsets[charset] || charsets.alphanumeric;
    let result = '';

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
};

/**
 * Generate UUID v4
 */
export const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * Slugify string (for URLs)
 */
export const slugify = (text: string): string => {
    const cyrillicMap: CyrillicMap = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
        'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
        'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
        'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
        'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch',
        'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '',
        'э': 'e', 'ю': 'yu', 'я': 'ya'
    };

    return text
        .toLowerCase()
        .split('')
        .map(char => cyrillicMap[char] || char)
        .join('')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

/**
 * Escape HTML
 */
export const escapeHTML = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

/**
 * Unescape HTML
 */
export const unescapeHTML = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText;
};

/**
 * Pluralize Russian words
 */
export const pluralize = (count: number, one: string, few: string, many: string): string => {
    const n = Math.abs(count) % 100;
    const n1 = n % 10;

    if (n > 10 && n < 20) return many;
    if (n1 > 1 && n1 < 5) return few;
    if (n1 === 1) return one;

    return many;
};

/**
 * Mask sensitive data
 */
export const maskString = (str: string, visibleChars: number = 4, maskChar: string = '*'): string => {
    if (str.length <= visibleChars) return str;

    const visible = str.slice(-visibleChars);
    const masked = maskChar.repeat(str.length - visibleChars);

    return masked + visible;
};

/**
 * Extract initials from name
 */
export const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('');
};

/**
 * Highlight search term in text
 */
export const highlightText = (text: string, searchTerm: string, className: string = 'highlight'): string => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, `<span class="${className}">$1</span>`);
};

/**
 * Word count
 */
export const countWords = (text: string): number => {
    return text.trim().split(/\s+/).length;
};

/**
 * Character count (excluding spaces)
 */
export const countCharacters = (text: string, includeSpaces: boolean = true): number => {
    return includeSpaces ? text.length : text.replace(/\s/g, '').length;
};
