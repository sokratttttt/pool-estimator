'use client';

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export interface ProButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    loading?: boolean;
    active?: boolean;
    fullWidth?: boolean;
}

export const ProButton: React.FC<ProButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    loading = false,
    active = false,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}) => {
    const sizeClass = `pro-btn-${size}`;
    const variantClass = `pro-btn-${variant}`;

    const classes = [
        'pro-btn',
        sizeClass,
        variantClass,
        fullWidth ? 'pro-btn-fullwidth' : '',
        active ? 'active' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <Loader2 size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} className="animate-spin" />
            ) : (
                <>
                    {icon && iconPosition === 'left' && (
                        <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
                    )}
                    {children && <span>{children}</span>}
                    {icon && iconPosition === 'right' && (
                        <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
                    )}
                </>
            )}
        </button>
    );
};

export default ProButton;
