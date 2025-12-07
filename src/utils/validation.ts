// Validation utilities for form inputs

export const validators = {
    // Required field
    required: (value: unknown) => {
        if (!value || (typeof value === 'string' && !value.trim())) {
            return 'Это поле обязательно';
        }
        return null;
    },

    // Email validation
    email: (value: unknown) => {
        if (!value || typeof value !== 'string') return null;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return 'Некорректный email адрес';
        }
        return null;
    },

    // Russian phone number validation
    phone: (value: unknown) => {
        if (!value || typeof value !== 'string') return null;
        // Remove all non-digits
        const digits = value.replace(/\D/g, '');
        // Russian phone: 10 or 11 digits (with or without country code)
        if (digits.length !== 10 && digits.length !== 11) {
            return 'Некорректный номер телефона';
        }
        if (digits.length === 11 && digits[0] !== '7' && digits[0] !== '8') {
            return 'Номер должен начинаться с 7 или 8';
        }
        return null;
    },

    // Price validation (positive number)
    price: (value: unknown) => {
        if (!value && value !== 0) return null;
        const num = Number(value);
        if (isNaN(num)) {
            return 'Должно быть числом';
        }
        if (num < 0) {
            return 'Цена не может быть отрицательной';
        }
        if (num > 10000000) {
            return 'Цена слишком большая';
        }
        return null;
    },

    // Quantity validation (positive integer)
    quantity: (value: unknown) => {
        if (!value && value !== 0) return null;
        const num = Number(value);
        if (isNaN(num)) {
            return 'Должно быть числом';
        }
        if (num < 0) {
            return 'Количество не может быть отрицательным';
        }
        if (!Number.isInteger(num)) {
            return 'Количество должно быть целым числом';
        }
        if (num > 10000) {
            return 'Количество слишком большое';
        }
        return null;
    },

    // Min length
    minLength: (min: number) => (value: unknown) => {
        if (typeof value !== 'string' && !Array.isArray(value)) return null;
        if (!value) return null;
        if (value.length < min) {
            return `Минимум ${min} символов`;
        }
        return null;
    },

    // Max length
    maxLength: (max: number) => (value: unknown) => {
        if (typeof value !== 'string' && !Array.isArray(value)) return null;
        if (!value) return null;
        if (value.length > max) {
            return `Максимум ${max} символов`;
        }
        return null;
    },

    // Number range
    range: (min: number, max: number) => (value: unknown) => {
        if (!value && value !== 0) return null;
        const num = Number(value);
        if (isNaN(num)) {
            return 'Должно быть числом';
        }
        if (num < min || num > max) {
            return `Значение должно быть от ${min} до ${max}`;
        }
        return null;
    },

    // URL validation
    url: (value: unknown) => {
        if (!value) return null;
        try {
            new URL(String(value));
            return null;
        } catch {
            return 'Некорректный URL';
        }
    },

    // Pattern matching
    pattern: (regex: RegExp, message: string) => (value: unknown) => {
        if (!value) return null;
        if (!regex.test(String(value))) {
            return message || 'Некорректный формат';
        }
        return null;
    }
};

type ValidatorFn = (value: unknown) => string | null;

// Combine multiple validators
export const combineValidators = (...validatorFns: ValidatorFn[]) => (value: unknown): string | null => {
    for (const validator of validatorFns) {
        const error = validator(value);
        if (error) return error;
    }
    return null;
};

// Validate entire form
export const validateForm = (formData: Record<string, unknown>, validationRules: Record<string, ValidatorFn[]>) => {
    const errors: Record<string, string> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
        const rules = validationRules[field];
        const value = formData[field];

        for (const rule of rules) {
            const error = rule(value);
            if (error) {
                errors[field] = error;
                isValid = false;
                break;
            }
        }
    });

    return { isValid, errors };
};

// Format phone number for display
export const formatPhone = (value: string) => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');

    if (digits.length === 0) return '';
    if (digits.length <= 1) return `+7 (${digits}`;
    if (digits.length <= 4) return `+7 (${digits.slice(1, 4)}`;
    if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}`;
    if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}`;
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
};

// Sanitize input (remove dangerous characters)
export const sanitizeInput = (value: unknown) => {
    if (typeof value !== 'string') return value;
    return value
        .replace(/[<>]/g, '') // Remove < and >
        .trim();
};

// Validate and sanitize
export const validateAndSanitize = (value: string, validatorFn: (val: string) => string | null) => {
    const sanitized = sanitizeInput(value) as string;
    const error = validatorFn ? validatorFn(sanitized) : null;
    return { value: sanitized, error };
};
