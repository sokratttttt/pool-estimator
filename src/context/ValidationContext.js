'use client';
import { createContext, useContext, useCallback, useMemo } from 'react';
import { validators } from '@/utils';

const ValidationContext = createContext();

export function ValidationProvider({ children }) {
    // Validate form
    const validateForm = useCallback((values, rules) => {
        const errors = {};

        for (const [field, fieldRules] of Object.entries(rules)) {
            const value = values[field];

            for (const rule of fieldRules) {
                const result = rule(value);
                if (result !== true) {
                    errors[field] = result;
                    break; // Stop at first error
                }
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }, []);

    // Create validation rules
    const createRules = useCallback((config) => {
        const rules = {};

        for (const [field, fieldConfig] of Object.entries(config)) {
            const fieldRules = [];

            if (fieldConfig.required) {
                fieldRules.push((value) =>
                    validators.isRequired(value) || fieldConfig.requiredMessage || 'Поле обязательно для заполнения'
                );
            }

            if (fieldConfig.email) {
                fieldRules.push((value) =>
                    !value || validators.isValidEmail(value) || 'Некорректный email'
                );
            }

            if (fieldConfig.phone) {
                fieldRules.push((value) =>
                    !value || validators.isValidPhone(value) || 'Некорректный телефон'
                );
            }

            if (fieldConfig.minLength) {
                fieldRules.push((value) =>
                    !value || validators.hasMinLength(value, fieldConfig.minLength) ||
                    `Минимальная длина: ${fieldConfig.minLength} символов`
                );
            }

            if (fieldConfig.maxLength) {
                fieldRules.push((value) =>
                    !value || validators.hasMaxLength(value, fieldConfig.maxLength) ||
                    `Максимальная длина: ${fieldConfig.maxLength} символов`
                );
            }

            if (fieldConfig.min) {
                fieldRules.push((value) =>
                    !value || parseFloat(value) >= fieldConfig.min ||
                    `Минимальное значение: ${fieldConfig.min}`
                );
            }

            if (fieldConfig.max) {
                fieldRules.push((value) =>
                    !value || parseFloat(value) <= fieldConfig.max ||
                    `Максимальное значение: ${fieldConfig.max}`
                );
            }

            if (fieldConfig.pattern) {
                fieldRules.push((value) =>
                    !value || fieldConfig.pattern.test(value) ||
                    fieldConfig.patternMessage || 'Некорректный формат'
                );
            }

            if (fieldConfig.custom) {
                fieldRules.push(fieldConfig.custom);
            }

            rules[field] = fieldRules;
        }

        return rules;
    }, []);

    const value = useMemo(() => ({
        validateForm,
        createRules,
        validators // Export all validators
    }), [validateForm, createRules]);

    return (
        <ValidationContext.Provider value={value}>
            {children}
        </ValidationContext.Provider>
    );
}

export function useValidation() {
    const context = useContext(ValidationContext);
    if (!context) {
        throw new Error('useValidation must be used within ValidationProvider');
    }
    return context;
}
