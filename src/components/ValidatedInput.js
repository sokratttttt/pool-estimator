'use client';
import { useState, useEffect } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ValidatedInput({
    label,
    value,
    onChange,
    onBlur,
    validator,
    type = 'text',
    placeholder = '',
    required = false,
    disabled = false,
    className = '',
    showValidIcon = true,
    validateOnChange = false,
    ...props
}) {
    const [error, setError] = useState(null);
    const [touched, setTouched] = useState(false);
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        if (validator && (touched || validateOnChange)) {
            const validationError = validator(value);
            setError(validationError);
            setIsValid(!validationError && value);
        }
    }, [value, validator, touched, validateOnChange]);

    const handleBlur = (e) => {
        setTouched(true);
        if (validator) {
            const validationError = validator(value);
            setError(validationError);
            setIsValid(!validationError && value);
        }
        if (onBlur) onBlur(e);
    };

    const handleChange = (e) => {
        onChange(e);
        if (validateOnChange && validator) {
            const validationError = validator(e.target.value);
            setError(validationError);
            setIsValid(!validationError && e.target.value);
        }
    };

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-apple-text-primary mb-2">
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    type={type}
                    value={value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
                        apple-input w-full
                        ${error && touched ? 'border-red-500 focus:border-red-500' : ''}
                        ${isValid && showValidIcon ? 'pr-10' : ''}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    {...props}
                />

                {/* Validation Icons */}
                <AnimatePresence>
                    {showValidIcon && isValid && !error && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            <Check size={18} className="text-emerald-400" />
                        </motion.div>
                    )}

                    {error && touched && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            <AlertCircle size={18} className="text-red-400" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && touched && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="mt-1 text-sm text-red-400 flex items-center gap-1"
                    >
                        <AlertCircle size={14} />
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
