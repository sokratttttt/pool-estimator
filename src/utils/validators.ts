/**
 * Validators utility functions
 * Centralized validation logic for forms and inputs
 * 
 * All validators use type guards where possible for TypeScript narrowing
 * No `any` types - all inputs properly typed
 */

import type {
    ValidatorFn,
    ValidationResult,
    FormValidationResult,
    PoolDimensions,
    FormValues,
    FormValidators
} from '@/types/validation';

// ============================================
// STRING VALIDATORS
// ============================================

/**
 * Email validation with type guard
 * @param email - Value to validate
 * @returns true if valid email string
 */
export const isValidEmail = (email: unknown): email is string => {
    if (typeof email !== 'string') return false;
    if (email.trim() === '') return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Phone validation (Russian format) with type guard
 * Supports: +7XXXXXXXXXX, 8XXXXXXXXXX, 7XXXXXXXXXX
 * @param phone - Value to validate
 * @returns true if valid Russian phone
 */
export const isValidPhone = (phone: unknown): phone is string => {
    if (typeof phone !== 'string') return false;
    if (phone.trim() === '') return false;

    // Remove all formatting characters for validation
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^(\+7|8|7)?[0-9]{10}$/;
    return phoneRegex.test(cleanPhone);
};

/**
 * URL validation with type guard
 * @param url - Value to validate
 * @returns true if valid URL string
 */
export const isValidUrl = (url: unknown): url is string => {
    if (typeof url !== 'string') return false;
    if (url.trim() === '') return false;

    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// ============================================
// REQUIRED / EMPTY VALIDATORS
// ============================================

/**
 * Required field validation
 * @param value - Value to check
 * @returns true if value is present and not empty
 */
export const isRequired = (value: unknown): boolean => {
    if (value === null || value === undefined) return false;

    if (typeof value === 'string') {
        return value.trim().length > 0;
    }

    if (Array.isArray(value)) {
        return value.length > 0;
    }

    return true;
};

// ============================================
// NUMBER VALIDATORS
// ============================================

/**
 * Number validation with type guard
 * @param value - Value to validate
 * @returns true if value is a valid finite number
 */
export const isNumber = (value: unknown): value is number => {
    if (typeof value === 'number') {
        return !isNaN(value) && isFinite(value);
    }

    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return !isNaN(parsed) && isFinite(parsed);
    }

    return false;
};

/**
 * Positive number validation
 * @param value - Value to validate
 * @returns true if value is a positive number
 */
export const isPositiveNumber = (value: unknown): boolean => {
    if (!isNumber(value)) return false;

    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num > 0;
};

/**
 * Range validation
 * @param value - Value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns true if value is within range [min, max]
 */
export const isInRange = (value: unknown, min: number, max: number): boolean => {
    if (!isNumber(value)) return false;

    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num >= min && num <= max;
};

// ============================================
// STRING LENGTH VALIDATORS
// ============================================

/**
 * Minimum length validation
 * @param value - String to validate
 * @param minLength - Minimum required length
 * @returns true if string meets minimum length
 */
export const hasMinLength = (value: unknown, minLength: number): boolean => {
    if (typeof value !== 'string') return false;
    return value.length >= minLength;
};

/**
 * Maximum length validation
 * @param value - String to validate
 * @param maxLength - Maximum allowed length
 * @returns true if string is within maximum length
 */
export const hasMaxLength = (value: unknown, maxLength: number): boolean => {
    if (typeof value !== 'string') return false;
    return value.length <= maxLength;
};

// ============================================
// DATE VALIDATORS
// ============================================

/**
 * Date validation with type guard
 * @param date - Value to validate
 * @returns true if valid Date object
 */
export const isValidDate = (date: unknown): date is Date => {
    if (!(date instanceof Date)) return false;
    return !isNaN(date.getTime());
};

/**
 * Future date validation
 * @param date - Date to validate
 * @returns true if date is in the future
 */
export const isFutureDate = (date: unknown): boolean => {
    if (!isValidDate(date)) return false;
    return date > new Date();
};

/**
 * Past date validation
 * @param date - Date to validate
 * @returns true if date is in the past
 */
export const isPastDate = (date: unknown): boolean => {
    if (!isValidDate(date)) return false;
    return date < new Date();
};

// ============================================
// FILE VALIDATORS
// ============================================

/**
 * File size validation
 * @param file - File or object with size property
 * @param maxSizeBytes - Maximum allowed size in bytes
 * @returns true if file size is within limit
 */
export const isValidFileSize = (file: unknown, maxSizeBytes: number): boolean => {
    if (!file || typeof file !== 'object') return false;

    const fileObj = file as Record<string, unknown>;
    if (typeof fileObj.size !== 'number') return false;

    return fileObj.size <= maxSizeBytes;
};

/**
 * File type validation
 * @param file - File or object with type property
 * @param allowedTypes - Array of allowed MIME types
 * @returns true if file type is in allowed list
 */
export const isValidFileType = (file: unknown, allowedTypes: readonly string[]): boolean => {
    if (!file || typeof file !== 'object') return false;

    const fileObj = file as Record<string, unknown>;
    if (typeof fileObj.type !== 'string') return false;

    return allowedTypes.includes(fileObj.type);
};

// ============================================
// PRICE / MONEY VALIDATORS
// ============================================

/**
 * Price validation (positive number with max 2 decimals)
 * @param price - Value to validate
 * @returns true if valid price format
 */
export const isValidPrice = (price: unknown): boolean => {
    // Handle number input
    if (typeof price === 'number') {
        if (isNaN(price) || !isFinite(price)) return false;
        if (price < 0) return false;

        // Check max 2 decimal places
        const decimals = (price.toString().split('.')[1] || '').length;
        return decimals <= 2;
    }

    // Handle string input
    if (typeof price === 'string') {
        const priceRegex = /^\d+(\.\d{1,2})?$/;
        if (!priceRegex.test(price)) return false;

        const parsed = parseFloat(price);
        return parsed >= 0;
    }

    return false;
};

// ============================================
// POOL-SPECIFIC VALIDATORS
// ============================================

/**
 * Pool dimensions validation with type guard
 * Validates against business rules for pool sizes
 * @param dimensions - Object with length, width, depth
 * @returns true if valid pool dimensions
 */
export const isValidDimensions = (dimensions: unknown): dimensions is PoolDimensions => {
    if (!dimensions || typeof dimensions !== 'object') return false;

    const dims = dimensions as Record<string, unknown>;

    // Check all required fields are numbers
    if (typeof dims.length !== 'number') return false;
    if (typeof dims.width !== 'number') return false;
    if (typeof dims.depth !== 'number') return false;

    // Business rules: min/max pool sizes
    const length = dims.length as number;
    const width = dims.width as number;
    const depth = dims.depth as number;

    if (length < 2 || length > 25) return false;
    if (width < 2 || width > 12) return false;
    if (depth < 1.2 || depth > 3) return false;

    return true;
};

/**
 * Water volume validation (in liters)
 * @param volume - Volume in liters
 * @returns true if within valid range (1,000 - 100,000 liters)
 */
export const isValidWaterVolume = (volume: unknown): volume is number => {
    if (typeof volume !== 'number') return false;
    if (isNaN(volume) || !isFinite(volume)) return false;

    // Business rule: 1m³ to 100m³
    return volume >= 1000 && volume <= 100000;
};

// ============================================
// VALIDATOR FACTORY
// ============================================

/**
 * Create a composite validator from multiple rules
 * @param rules - Array of validator functions
 * @returns Combined validator function
 */
export const createValidator = (rules: ValidatorFn[]): ValidatorFn => {
    return (value: unknown): boolean | string => {
        for (const rule of rules) {
            const result = rule(value);
            if (result !== true) {
                return result; // Return first error message
            }
        }
        return true;
    };
};

/**
 * Create a validator with configuration
 * @param config - Validator configuration object
 * @returns Configured validator function
 */
export const createConfiguredValidator = (config: {
    required?: boolean;
    requiredMessage?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    patternMessage?: string;
}): ValidatorFn => {
    return (value: unknown): boolean | string => {
        // Required check
        if (config.required) {
            if (!isRequired(value)) {
                return config.requiredMessage || 'This field is required';
            }
        } else if (!isRequired(value)) {
            // Not required and empty - valid
            return true;
        }

        // Number range checks
        if (typeof value === 'number' || (typeof value === 'string' && isNumber(value))) {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;

            if (config.min !== undefined && numValue < config.min) {
                return `Value must be at least ${config.min}`;
            }
            if (config.max !== undefined && numValue > config.max) {
                return `Value must be at most ${config.max}`;
            }
        }

        // String length checks
        if (typeof value === 'string') {
            if (config.minLength !== undefined && value.length < config.minLength) {
                return `Minimum length is ${config.minLength} characters`;
            }
            if (config.maxLength !== undefined && value.length > config.maxLength) {
                return `Maximum length is ${config.maxLength} characters`;
            }
            if (config.pattern && !config.pattern.test(value)) {
                return config.patternMessage || 'Invalid format';
            }
        }

        return true;
    };
};

// ============================================
// FORM VALIDATION HELPERS
// ============================================

/**
 * Validate entire form against validators
 * @param values - Form field values
 * @param validators - Validators for each field
 * @returns Validation result with isValid flag and errors object
 */
export const validateForm = (
    values: FormValues,
    validators: FormValidators
): FormValidationResult => {
    const errors: Record<string, string> = {};

    for (const [field, validator] of Object.entries(validators)) {
        const result = validator(values[field]);
        if (result !== true) {
            errors[field] = typeof result === 'string' ? result : 'Invalid value';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate a single field and return detailed result
 * @param value - Value to validate
 * @param validators - Array of validators to apply
 * @param fieldName - Optional field name for error context
 * @returns Detailed validation result
 */
export const validateField = (
    value: unknown,
    validators: ValidatorFn[],
    fieldName?: string
): ValidationResult => {
    const errors: string[] = [];

    for (const validator of validators) {
        const result = validator(value);
        if (result !== true) {
            errors.push(typeof result === 'string' ? result : 'Invalid value');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        field: fieldName
    };
};
