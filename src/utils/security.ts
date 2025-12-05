/**
 * Security utilities
 * Input sanitization and XSS protection
 */

/**
 * Sanitize HTML to prevent XSS
 */
export const sanitizeHTML = (html: any) => {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
};

/**
 * Escape HTML special characters
 */
export const escapeHTML = (text: any) => {
    const htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };

    return String(text).replace(/[&<>"'/]/g, char => htmlEscapes[char]);
};

/**
 * Sanitize string for SQL (basic - use parameterized queries in production!)
 */
export const sanitizeSQL = (input: any) => {
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
export const sanitizeInput = (input: any) => {
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
export const sanitizeURL = (url: any) => {
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
export const validateCSRFToken = (token: any, storedToken: any) => {
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
export const sanitizeFilename = (filename: any) => {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/\.+/g, '.')
        .replace(/^\./, '')
        .substring(0, 255);
};

/**
 * Check if string contains XSS patterns
 */
export const containsXSS = (input: any) => {
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
export const isValidEmail = (email: any) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && !containsXSS(email);
};

/**
 * Rate limiting helper (client-side)
 */
export const createRateLimiter = (maxAttempts: any, windowMs: any) => {
    const attempts = new Map();

    return (key: any) => {
        const now = Date.now();
        const userAttempts = attempts.get(key) || [];

        // Remove old attempts outside the window
        const recentAttempts = userAttempts.filter(time => now - time < windowMs);

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
export const getCSPHeader = (options: any = {}) => {
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
            `default-src ${defaultSrc.join(' ')}`,
            `script-src ${scriptSrc.join(' ')}`,
            `style-src ${styleSrc.join(' ')}`,
            `img-src ${imgSrc.join(' ')}`,
            `connect-src ${connectSrc.join(' ')}`,
            `font-src ${fontSrc.join(' ')}`,
            `object-src ${objectSrc.join(' ')}`,
            `media-src ${mediaSrc.join(' ')}`,
            `frame-src ${frameSrc.join(' ')}`
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
