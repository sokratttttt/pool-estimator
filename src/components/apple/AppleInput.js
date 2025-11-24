'use client';
import { forwardRef } from 'react';

const AppleInput = forwardRef(({
    type = 'text',
    placeholder,
    value,
    onChange,
    label,
    error,
    icon,
    className = '',
    ...props
}, ref) => {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="apple-caption block mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-text-secondary">
                        {icon}
                    </div>
                )}
                <input
                    ref={ref}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`apple-input w-full ${icon ? 'pl-12' : ''} ${error ? 'border-red-500' : ''}`}
                    {...props}
                />
            </div>
            {error && (
                <p className="apple-caption text-red-500 mt-1">
                    {error}
                </p>
            )}
        </div>
    );
});

AppleInput.displayName = 'AppleInput';

export default AppleInput;
