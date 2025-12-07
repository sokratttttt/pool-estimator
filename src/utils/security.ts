/**
 * Security utilities
 * Input sanitization and XSS protection
 */

/**
 * Sanitize HTML to prevent XSS
 */
export const sanitizeHTML = (html: string) => {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
};

/**
 * Escape HTML special characters
 */
export const escapeHTML = (text: string): string => {
    const htmlEscapes: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };

    return String(text).replace(/[&<>"'/]/g, (char: string) => htmlEscapes[char] || char);
};

/**
 * Sanitize string for SQL (basic - use parameterized queries in production!)
 */
export const sanitizeSQL = (input: unknown) => {
    if (typeof input !== 'string') return input;

    return input
        .replace(/'/g, "''")
        .replace(/;/g, '')
        .replace(/--/g, '')
        .replace(/\/\*/g, '')
        .replace(/\*\//g, '');
};

/**
 * Sanitize user input (remove dangerous characters)
 */
export const sanitizeInput = (input: unknown) => {
    if (typeof input !== 'string') return input;

    return input
        .trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
};

/**
 * Validate and sanitize URL
 */
export const sanitizeURL = (url: string) => {
    try {
        const urlObj = new URL(url);

        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            return '';
        }

        return urlObj.toString();
    } catch {
        return '';
    }
};

/**
 * Generate CSRF token
 */
export const generateCSRFToken = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Validate CSRF token
 */
export const validateCSRFToken = (token: string, storedToken: string) => {
    if (!token || !storedToken) return false;
    if (token.length !== storedToken.length) return false;

    // Constant-time comparison to prevent timing attacks
    let result = 0;
    for (let i = 0; i < token.length; i++) {
        result |= token.charCodeAt(i) ^ storedToken.charCodeAt(i);
    }

    return result === 0;
};

/**
 * Sanitize filename
 */
export const sanitizeFilename = (filename: string) => {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/\.+/g, '.')
        .replace(/^\./, '')
        .substring(0, 255);
};

/**
 * Check if string contains XSS patterns
 */
export const containsXSS = (input: string) => {
    const xssPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
        /eval\(/i,
        /expression\(/i
    ];

    return xssPatterns.some(pattern => pattern.test(input));
};

/**
 * Validate email format (basic)
 */
export const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && !containsXSS(email);
};

/**
 * Rate limiting helper (client-side)
 */
export const createRateLimiter = (maxAttempts: number, windowMs: number): ((key: string) => boolean) => {
    const attempts = new Map<string, number[]>();

    return (key: string): boolean => {
        const now = Date.now();
        const userAttempts = attempts.get(key) || [];

        // Remove old attempts outside the window
        const recentAttempts = userAttempts.filter((time: number) => now - time < windowMs);

        if (recentAttempts.length >= maxAttempts) {
            return false; // Rate limit exceeded
        }

        recentAttempts.push(now);
        attempts.set(key, recentAttempts);

        return true;
    };
};

/**
 * Content Security Policy helper
 */
export const getCSPHeader = (options: Record<string, string[] | string> = {}) => {
    const {
        defaultSrc = ["'self'"],
        scriptSrc = ["'self'"],
        styleSrc = ["'self'", "'unsafe-inline'"],
        imgSrc = ["'self'", 'data:', 'https:'],
        connectSrc = ["'self'"],
        fontSrc = ["'self'"],
        objectSrc = ["'none'"],
        mediaSrc = ["'self'"],
        frameSrc = ["'none'"]
    } = options;

    return {
        'Content-Security-Policy': [
            `default-src ${Array.isArray(defaultSrc) ? defaultSrc.join(' ') : defaultSrc}`,
            `script-src ${Array.isArray(scriptSrc) ? scriptSrc.join(' ') : scriptSrc}`,
            `style-src ${Array.isArray(styleSrc) ? styleSrc.join(' ') : styleSrc}`,
            `img-src ${Array.isArray(imgSrc) ? imgSrc.join(' ') : imgSrc}`,
            `connect-src ${Array.isArray(connectSrc) ? connectSrc.join(' ') : connectSrc}`,
            `font-src ${Array.isArray(fontSrc) ? fontSrc.join(' ') : fontSrc}`,
            `object-src ${Array.isArray(objectSrc) ? objectSrc.join(' ') : objectSrc}`,
            `media-src ${Array.isArray(mediaSrc) ? mediaSrc.join(' ') : mediaSrc}`,
            `frame-src ${Array.isArray(frameSrc) ? frameSrc.join(' ') : frameSrc}`
        ].join('; ')
    };
};

/**
 * Secure cookie options
 */
export const getSecureCookieOptions = () => {
    return {
        secure: true, // HTTPS only
        httpOnly: true, // Not accessible via JavaScript
        sameSite: 'strict', // CSRF protection
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
    };
};
