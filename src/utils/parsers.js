/**
 * Parsers utility functions
 * Data parsing and extraction
 */

/**
 * Parse price from string
 */
export const parsePrice = (priceString) => {
    if (typeof priceString === 'number') return priceString;

    // Remove all non-numeric characters except dot and comma
    const cleaned = priceString.replace(/[^\d.,]/g, '');
    // Replace comma with dot for decimal
    const normalized = cleaned.replace(',', '.');

    return parseFloat(normalized) || 0;
};

/**
 * Parse phone number
 */
export const parsePhone = (phoneString) => {
    // Remove all non-numeric characters
    const digits = phoneString.replace(/\D/g, '');

    // Handle different formats
    if (digits.length === 11 && digits.startsWith('8')) {
        return '+7' + digits.slice(1);
    }
    if (digits.length === 11 && digits.startsWith('7')) {
        return '+' + digits;
    }
    if (digits.length === 10) {
        return '+7' + digits;
    }

    return phoneString;
};

/**
 * Parse date from various formats
 */
export const parseDate = (dateString) => {
    if (!dateString) return null;

    // Try to parse as Date
    const date = new Date(dateString);
    if (!isNaN(date)) return date;

    // Try DD.MM.YYYY format
    const ddmmyyyy = dateString.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (ddmmyyyy) {
        const [, day, month, year] = ddmmyyyy;
        return new Date(year, month - 1, day);
    }

    return null;
};

/**
 * Parse dimensions from string (e.g., "8x4" or "8 x 4 m")
 */
export const parseDimensions = (dimensionsString) => {
    const match = dimensionsString.match(/(\d+\.?\d*)\s*[xх×]\s*(\d+\.?\d*)/i);

    if (match) {
        return {
            length: parseFloat(match[1]),
            width: parseFloat(match[2])
        };
    }

    return null;
};

/**
 * Parse measurement with unit
 */
export const parseMeasurement = (measurementString) => {
    const match = measurementString.match(/(\d+\.?\d*)\s*([a-zа-я]+)/i);

    if (match) {
        return {
            value: parseFloat(match[1]),
            unit: match[2]
        };
    }

    return {
        value: parseFloat(measurementString),
        unit: ''
    };
};

/**
 * Parse boolean from string
 */
export const parseBoolean = (value) => {
    if (typeof value === 'boolean') return value;

    const truthy = ['true', '1', 'yes', 'да', 'on'];
    const falsy = ['false', '0', 'no', 'нет', 'off'];

    const str = String(value).toLowerCase();

    if (truthy.includes(str)) return true;
    if (falsy.includes(str)) return false;

    return Boolean(value);
};

/**
 * Parse JSON safely
 */
export const parseJSON = (jsonString, fallback = null) => {
    try {
        return JSON.parse(jsonString);
    } catch {
        return fallback;
    }
};

/**
 * Parse query parameters from URL
 */
export const parseQueryParams = (url) => {
    const params = {};
    const urlObj = new URL(url, window.location.origin);

    urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
    });

    return params;
};

/**
 * Parse CSV line
 */
export const parseCSVLine = (line, delimiter = ',') => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
};

/**
 * Parse full name into parts
 */
export const parseFullName = (fullName) => {
    const parts = fullName.trim().split(/\s+/);

    return {
        lastName: parts[0] || '',
        firstName: parts[1] || '',
        middleName: parts[2] || ''
    };
};

/**
 * Parse email domain
 */
export const parseEmailDomain = (email) => {
    const match = email.match(/@(.+)$/);
    return match ? match[1] : '';
};

/**
 * Parse file extension
 */
export const parseFileExtension = (filename) => {
    const match = filename.match(/\.([^.]+)$/);
    return match ? match[1].toLowerCase() : '';
};

/**
 * Parse color hex to RGB
 */
export const parseHexToRGB = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

/**
 * Parse address string
 */
export const parseAddress = (addressString) => {
    // Simple Russian address parsing
    const parts = addressString.split(',').map(s => s.trim());

    return {
        city: parts[0] || '',
        street: parts[1] || '',
        building: parts[2] || '',
        apartment: parts[3] || ''
    };
};

/**
 * Parse duration string (e.g., "2h 30m" or "150m")
 */
export const parseDuration = (durationString) => {
    let totalMinutes = 0;

    const hours = durationString.match(/(\d+)\s*[hчч]/i);
    const minutes = durationString.match(/(\d+)\s*[mмm]/i);

    if (hours) totalMinutes += parseInt(hours[1]) * 60;
    if (minutes) totalMinutes += parseInt(minutes[1]);

    return totalMinutes;
};
