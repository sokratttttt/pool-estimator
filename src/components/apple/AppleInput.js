'use client';
import { forwardRef, memo, useId } from 'react';

// ✨ Memoized input component - prevents unnecessary re-renders
const AppleInput = memo(forwardRef(({
    type = 'text',
    placeholder,
    value,
    onChange,
    label,
    error,
    icon,
    className = '',
    required = false,
    disabled = false,
    ...props
}, ref) => {
    const inputId = useId();
    const errorId = useId();
    const descriptionId = useId();

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="apple-caption block mb-2"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1" aria-label="обязательное поле">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-text-secondary"
                        aria-hidden="true"
                    >
                        {icon}
                    </div>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    aria-required={required}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    className={`
                        apple-input w-full 
                        ${icon ? 'pl-12' : ''} 
                        ${error ? 'border-red-500' : ''
                        }
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep
                        disabled:opacity-50 disabled:cursor-not-allowed
                        hover:border-cyan-500/50
                        transition-all duration-200
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p
                    id={errorId}
                    className="apple-caption text-red-500 mt-1"
                    role="alert"
                    aria-live="polite"
                >
                    {error}
                </p>
            )}
        </div>
    );
}));

AppleInput.displayName = 'AppleInput';

export default AppleInput;
