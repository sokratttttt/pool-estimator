import { useState, useCallback } from 'react';

/**
 * useForm hook
 * Complete form management solution
 */
export function useForm({
    initialValues = {},
    validate,
    onSubmit
}) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle field change
    const handleChange = useCallback((name, value) => {
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
    const handleBlur = useCallback((name) => {
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        // Validate on blur if validator provided
        if (validate) {
            const fieldErrors = validate({ [name]: values[name] });
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
    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();

        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
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
    const setFieldValue = useCallback((name, value) => {
        setValues(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    // Set field error programmatically
    const setFieldError = useCallback((name, error) => {
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    }, []);

    // Get field props
    const getFieldProps = useCallback((name) => ({
        name,
        value: values[name] || '',
        onChange: (e) => handleChange(name, e.target.value),
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
