'use client';

import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface ProInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    inputSize?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export const ProInput = forwardRef<HTMLInputElement, ProInputProps>(({
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    inputSize = 'md',
    fullWidth = true,
    className = '',
    id,
    ...props
}, ref) => {
    const inputId = id || `pro-input-${Math.random().toString(36).slice(2, 9)}`;
    const sizeClass = inputSize === 'sm' ? 'pro-input-sm' : inputSize === 'lg' ? 'pro-input-lg' : '';

    return (
        <div className={`pro-input-wrapper ${fullWidth ? 'full-width' : ''}`}>
            {label && (
                <label htmlFor={inputId} className="pro-input-label">
                    {label}
                </label>
            )}

            <div className="pro-input-container">
                {leftIcon && (
                    <span className="pro-input-icon-left">
                        {leftIcon}
                    </span>
                )}

                <input
                    ref={ref}
                    id={inputId}
                    className={`pro-input ${sizeClass} ${error ? 'pro-input-error' : ''} ${leftIcon ? 'with-left-icon' : ''} ${rightIcon ? 'with-right-icon' : ''} ${className}`}
                    {...props}
                />

                {rightIcon && (
                    <span className="pro-input-icon-right">
                        {rightIcon}
                    </span>
                )}
            </div>

            {error && <span className="pro-input-error-text">{error}</span>}
            {hint && !error && <span className="pro-input-hint">{hint}</span>}
        </div>
    );
});

ProInput.displayName = 'ProInput';

export default ProInput;
