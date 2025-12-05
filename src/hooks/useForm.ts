
import { useState, useCallback, type ChangeEvent, type FormEvent } from 'react';

// ============================================
// TYPES
// ============================================

export type FieldType =
    | 'text' | 'email' | 'phone' | 'number' | 'password'
    | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date'
    | 'file' | 'color' | 'range' | 'switch';

export interface FieldConfig<T = unknown> {
    name: string;
    type: FieldType;
    label?: string;
    placeholder?: string;
    defaultValue?: T;
    required?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    validation?: {
        pattern?: RegExp;
        min?: number;
        max?: number;
        minLength?: number;
        maxLength?: number;
        custom?: (value: T) => boolean | string;
    };
    options?: Array<{ label: string; value: T }>;
    dependencies?: string[];
}

export interface FieldState<T = unknown> {
    value: T;
    error: string | null;
    touched: boolean;
    dirty: boolean;
    isValid: boolean;
    isRequired: boolean;
}

export interface UseFormProps<T> {
    initialValues: T;
    validate?: (values: T) => Partial<Record<keyof T, string>>;
    onSubmit: (values: T) => Promise<void> | void;
}

export interface UseFormReturn<T> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    touched: Partial<Record<keyof T, boolean>>;
    isSubmitting: boolean;
    handleChange: (name: keyof T, value: any) => void;
    handleBlur: (name: keyof T) => void;
    handleSubmit: (e?: FormEvent) => Promise<void>;
    reset: () => void;
    setFieldValue: (name: keyof T, value: any) => void;
    setFieldError: (name: keyof T, error: string | null) => void;
    getFieldProps: (name: keyof T) => {
        name: string;
        value: any;
        onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
        onBlur: () => void;
    };
    isValid: boolean;
}

/**
 * useForm hook
 * Complete form management solution
 */
export function useForm<T extends Record<string, any>>({
    initialValues,
    validate,
    onSubmit
}: UseFormProps<T>): UseFormReturn<T> {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle field change
    const handleChange = useCallback((name: keyof T, value: any) => {
        setValues(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [errors]);

    // Handle field blur
    const handleBlur = useCallback((name: keyof T) => {
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        // Validate on blur if validator provided
        if (validate) {
            const fieldErrors = validate({ ...values, [name]: values[name] }); // Validate with current values
            if (fieldErrors[name]) {
                setErrors(prev => ({
                    ...prev,
                    [name]: fieldErrors[name]
                }));
            }
        }
    }, [validate, values]);

    // Validate all fields
    const validateForm = useCallback(() => {
        if (!validate) return {};

        const validationErrors = validate(values);
        setErrors(validationErrors);
        return validationErrors;
    }, [validate, values]);

    // Handle submit
    const handleSubmit = useCallback(async (e?: FormEvent) => {
        if (e) e.preventDefault();

        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce((acc, key) => {
            acc[key as keyof T] = true;
            return acc;
        }, {} as Partial<Record<keyof T, boolean>>);
        setTouched(allTouched);

        // Validate
        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        // Submit
        setIsSubmitting(true);
        try {
            await onSubmit(values);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [values, validateForm, onSubmit]);

    // Reset form
    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    // Set field value programmatically
    const setFieldValue = useCallback((name: keyof T, value: any) => {
        setValues(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    // Set field error programmatically
    const setFieldError = useCallback((name: keyof T, error: string | null) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            if (error) {
                newErrors[name] = error;
            } else {
                delete newErrors[name];
            }
            return newErrors;
        });
    }, []);

    // Get field props
    const getFieldProps = useCallback((name: keyof T) => ({
        name: String(name),
        value: values[name] || '',
        onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
            handleChange(name, e.target.value),
        onBlur: () => handleBlur(name)
    }), [values, handleChange, handleBlur]);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
        setFieldValue,
        setFieldError,
        getFieldProps,
        isValid: Object.keys(errors).length === 0
    };
}

