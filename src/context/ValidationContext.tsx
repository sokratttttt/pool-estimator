'use client';
import { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react';
import { validators } from '@/utils';

// ============================================
// TYPES
// ============================================

/** Validation rule function - returns true if valid, or error message string */
type ValidationRuleFn = (value: unknown) => true | string;

/** Configuration for a single field's validation */
interface FieldValidationConfig {
    required?: boolean;
    requiredMessage?: string;
    email?: boolean;
    phone?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    patternMessage?: string;
    custom?: ValidationRuleFn;
}

/** Validation rules configuration object */
type ValidationRulesConfig = Record<string, FieldValidationConfig>;

/** Compiled validation rules */
type CompiledRules = Record<string, ValidationRuleFn[]>;

/** Validation errors keyed by field name */
type ValidationErrors = Record<string, string>;

/** Result of form validation */
interface ValidationResult {
    isValid: boolean;
    errors: ValidationErrors;
}

/** Values object for form validation */
type FormValues = Record<string, unknown>;

/** Context value type */
interface ValidationContextValue {
    validateForm: (values: FormValues, rules: CompiledRules) => ValidationResult;
    createRules: (config: ValidationRulesConfig) => CompiledRules;
    validators: typeof validators;
}

// ============================================
// CONTEXT
// ============================================

const ValidationContext = createContext<ValidationContextValue | null>(null);

interface ValidationProviderProps {
    children: ReactNode;
}

export function ValidationProvider({ children }: ValidationProviderProps) {
    /**
     * Validate form values against compiled rules
     */
    const validateForm = useCallback((values: FormValues, rules: CompiledRules): ValidationResult => {
        const errors: ValidationErrors = {};

        for (const [field, fieldRules] of Object.entries(rules)) {
            const value = values[field];

            for (const rule of fieldRules) {
                const result = rule(value);
                if (result !== true) {
                    errors[field] = result;
                    break; // Stop at first error for this field
                }
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }, []);

    /**
     * Create compiled validation rules from config
     */
    const createRules = useCallback((config: ValidationRulesConfig): CompiledRules => {
        const rules: CompiledRules = {};

        for (const [field, fieldConfig] of Object.entries(config)) {
            const fieldRules: ValidationRuleFn[] = [];

            // Required validation
            if (fieldConfig.required) {
                fieldRules.push((value: unknown): true | string =>
                    validators.isRequired(value) ||
                    fieldConfig.requiredMessage ||
                    'Поле обязательно для заполнения'
                );
            }

            // Email validation
            if (fieldConfig.email) {
                fieldRules.push((value: unknown): true | string => {
                    if (!value) return true;
                    return validators.isValidEmail(value) || 'Некорректный email';
                });
            }

            // Phone validation
            if (fieldConfig.phone) {
                fieldRules.push((value: unknown): true | string => {
                    if (!value) return true;
                    return validators.isValidPhone(value) || 'Некорректный телефон';
                });
            }

            // Minimum length validation
            if (fieldConfig.minLength !== undefined) {
                const minLen = fieldConfig.minLength;
                fieldRules.push((value: unknown): true | string => {
                    if (!value) return true;
                    return validators.hasMinLength(value, minLen) ||
                        `Минимальная длина: ${minLen} символов`;
                });
            }

            // Maximum length validation
            if (fieldConfig.maxLength !== undefined) {
                const maxLen = fieldConfig.maxLength;
                fieldRules.push((value: unknown): true | string => {
                    if (!value) return true;
                    return validators.hasMaxLength(value, maxLen) ||
                        `Максимальная длина: ${maxLen} символов`;
                });
            }

            // Minimum value validation
            if (fieldConfig.min !== undefined) {
                const minVal = fieldConfig.min;
                fieldRules.push((value: unknown): true | string => {
                    if (!value) return true;
                    const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
                    return (!isNaN(numValue) && numValue >= minVal) ||
                        `Минимальное значение: ${minVal}`;
                });
            }

            // Maximum value validation  
            if (fieldConfig.max !== undefined) {
                const maxVal = fieldConfig.max;
                fieldRules.push((value: unknown): true | string => {
                    if (!value) return true;
                    const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
                    return (!isNaN(numValue) && numValue <= maxVal) ||
                        `Максимальное значение: ${maxVal}`;
                });
            }

            // Pattern validation
            if (fieldConfig.pattern) {
                const pattern = fieldConfig.pattern;
                const patternMsg = fieldConfig.patternMessage || 'Некорректный формат';
                fieldRules.push((value: unknown): true | string => {
                    if (!value) return true;
                    const strValue = String(value);
                    return pattern.test(strValue) || patternMsg;
                });
            }

            // Custom validation
            if (fieldConfig.custom) {
                fieldRules.push(fieldConfig.custom);
            }

            rules[field] = fieldRules;
        }

        return rules;
    }, []);

    const value = useMemo<ValidationContextValue>(() => ({
        validateForm,
        createRules,
        validators
    }), [validateForm, createRules]);

    return (
        <ValidationContext.Provider value={value}>
            {children}
        </ValidationContext.Provider>
    );
}

export function useValidation(): ValidationContextValue {
    const context = useContext(ValidationContext);
    if (!context) {
        throw new Error('useValidation must be used within ValidationProvider');
    }
    return context;
}

// Export types for use in other files
export type {
    ValidationRuleFn,
    FieldValidationConfig,
    ValidationRulesConfig,
    CompiledRules,
    ValidationErrors,
    ValidationResult,
    FormValues,
    ValidationContextValue
};
