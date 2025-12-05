/**
 * Validation Types
 * Centralized type definitions for validation system
 */

// ============================================
// BASE VALIDATOR TYPES
// ============================================

/**
 * Validator function that returns true if valid, or error message string
 */
export type ValidatorFn<T = unknown> = (value: T) => boolean | string;

/**
 * Async validator function for server-side validation
 */
export type AsyncValidatorFn<T = unknown> = (value: T) => Promise<boolean | string>;

/**
 * Type guard validator that narrows the type
 */
export type TypeGuardValidator<T> = (value: unknown) => value is T;

// ============================================
// VALIDATION RESULT TYPES
// ============================================

/**
 * Result of a single field validation
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    field?: string;
}

/**
 * Result of form validation
 */
export interface FormValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

// ============================================
// VALIDATOR CONFIGURATION
// ============================================

/**
 * Configuration for creating validators
 */
export interface ValidatorConfig {
    required?: boolean;
    requiredMessage?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    patternMessage?: string;
    custom?: ValidatorFn;
}

/**
 * Field-level validation configuration
 */
export interface FieldConfig extends ValidatorConfig {
    email?: boolean;
    phone?: boolean;
    url?: boolean;
    date?: boolean;
    price?: boolean;
}

// ============================================
// DOMAIN-SPECIFIC TYPES (Pool Estimator)
// ============================================

/**
 * Pool dimensions for validation
 */
export interface PoolDimensions {
    length: number;
    width: number;
    depth: number;
}

/**
 * File-like object for validation
 */
export interface FileInfo {
    size: number;
    type: string;
    name?: string;
}

/**
 * Form values object
 */
export type FormValues = Record<string, unknown>;

/**
 * Validators object for form
 */
export type FormValidators = Record<string, ValidatorFn>;

// ============================================
// BUSINESS RULE CONSTANTS
// ============================================

/**
 * Pool dimension limits for validation
 */
export const POOL_DIMENSION_LIMITS = {
    length: { min: 2, max: 25 },
    width: { min: 2, max: 12 },
    depth: { min: 1.2, max: 3 }
} as const;

/**
 * Price limits in rubles
 */
export const PRICE_LIMITS = {
    minPoolPrice: 100000,
    maxPoolPrice: 50000000
} as const;

/**
 * Volume limits in liters
 */
export const VOLUME_LIMITS = {
    min: 1000,    // 1 m³
    max: 100000   // 100 m³
} as const;
