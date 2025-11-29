/**
 * Validators utility functions
 * Centralized validation logic for forms and inputs
 */

/**
 * Email validation
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Phone validation (Russian format)
 */
export const isValidPhone = (phone) => {
    // Supports formats: +7XXXXXXXXXX, 8XXXXXXXXXX, 7XXXXXXXXXX
    const phoneRegex = /^(\+7|8|7)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/;
    return phoneRegex.test(phone);
};

/**
 * Required field validation
 */
export const isRequired = (value) => {
    if (typeof value === 'string') {
        return value.trim().length > 0;
    }
    return value != null && value !== '';
};

/**
 * Number validation
 */
export const isNumber = (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * Positive number validation
 */
export const isPositiveNumber = (value) => {
    return isNumber(value) && parseFloat(value) > 0;
};

/**
 * Range validation
 */
export const isInRange = (value, min, max) => {
    const num = parseFloat(value);
    return isNumber(value) && num >= min && num <= max;
};

/**
 * Min length validation
 */
export const hasMinLength = (value, minLength) => {
    return typeof value === 'string' && value.length >= minLength;
};

/**
 * Max length validation
 */
export const hasMaxLength = (value, maxLength) => {
    return typeof value === 'string' && value.length <= maxLength;
};

/**
 * URL validation
 */
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Date validation
 */
export const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date);
};

/**
 * Future date validation
 */
export const isFutureDate = (date) => {
    return isValidDate(date) && date > new Date();
};

/**
 * Past date validation
 */
export const isPastDate = (date) => {
    return isValidDate(date) && date < new Date();
};

/**
 * File size validation (in bytes)
 */
export const isValidFileSize = (file, maxSize) => {
    return file && file.size <= maxSize;
};

/**
 * File type validation
 */
export const isValidFileType = (file, allowedTypes) => {
    return file && allowedTypes.includes(file.type);
};

/**
 * Price validation (positive number with max 2 decimals)
 */
export const isValidPrice = (price) => {
    const priceRegex = /^\d+(\.\d{1,2})?$/;
    return priceRegex.test(price) && parseFloat(price) >= 0;
};

/**
 * Composite validator factory
 */
export const createValidator = (rules) => {
    return (value) => {
        for (const rule of rules) {
            const result = rule(value);
            if (result !== true) {
                return result; // Return error message
            }
        }
        return true;
    };
};

/**
 * Form validation helper
 */
export const validateForm = (values, validators) => {
    const errors = {};

    for (const [field, validator] of Object.entries(validators)) {
        const result = validator(values[field]);
        if (result !== true) {
            errors[field] = result;
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
