'use client';
import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';
import { useRipple, type RippleItem } from '../effects/Ripple';

import type { HTMLMotionProps } from 'framer-motion';

interface AppleButtonProps extends Omit<HTMLMotionProps<"button">, "ref" | "children"> {
    children?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'gold';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    loading?: boolean;
    ariaLabel?: string;
}

const AppleButton = memo(function AppleButton({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    disabled = false,
    loading = false,
    className = '',
    ariaLabel,
    type = 'button',
    ...props
}: AppleButtonProps) {
    const { ripples, addRipple } = useRipple(
        variant === 'primary' || variant === 'gold'
            ? 'rgba(255, 255, 255, 0.4)'
            : 'rgba(0, 217, 255, 0.3)'
    );

    // ✨ Memoize variant styles - only recalculate when variant or disabled changes
    const variantStyles = useMemo(() => {
        switch (variant) {
            case 'primary':
                return {
                    background: 'linear-gradient(135deg, #00D9FF 0%, #0099FF 100%)',
                    color: '#FFFFFF',
                    boxShadow: disabled ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.15)'
                };
            case 'gold':
                return {
                    background: 'linear-gradient(135deg, #FFB800 0%, #E6A600 100%)',
                    color: '#0A1929',
                    boxShadow: disabled ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.15)'
                };
            case 'secondary':
                return {
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                };
            default:
                return {
                    background: 'linear-gradient(135deg, #00D9FF 0%, #0099FF 100%)',
                    color: '#FFFFFF'
                };
        }
    }, [variant, disabled]);

    // ✨ Memoize size classes
    const sizeClass = useMemo(() => {
        switch (size) {
            case 'sm':
                return 'text-sm px-4 py-2';
            case 'lg':
                return 'text-lg px-8 py-4';
            default:
                return 'px-6 py-3';
        }
    }, [size]);

    return (
        <motion.button
            whileHover={{ scale: disabled || loading ? 1 : 1.02, boxShadow: disabled || loading ? undefined : '0 8px 24px rgba(0, 217, 255, 0.3)' }}
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            onClick={onClick}
            onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => addRipple({ event: e })}
            disabled={disabled || loading}
            type={type}
            aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
            aria-disabled={disabled || loading}
            aria-busy={loading}
            className={`
                relative overflow-hidden
                inline-flex items-center justify-center gap-2
                ${sizeClass}
                font-semibold rounded-lg
                transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${className}
            `}
            style={variantStyles}
            {...props}
        >
            {loading ? (
                <div
                    className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"
                    role="status"
                    aria-label="Загрузка"
                />
            ) : (
                <>
                    {icon && iconPosition === 'left' && <span className="flex-shrink-0 relative z-10" aria-hidden="true">{icon}</span>}
                    <span className="relative z-10">{children}</span>
                    {icon && iconPosition === 'right' && <span className="flex-shrink-0 relative z-10" aria-hidden="true">{icon}</span>}

                    {/* Ripples */}
                    <div className="absolute inset-0 pointer-events-none z-0">
                        {ripples.map((ripple: RippleItem) => (
                            <motion.span
                                key={ripple.key}
                                className="absolute rounded-full"
                                style={{
                                    left: ripple.x,
                                    top: ripple.y,
                                    width: ripple.size,
                                    height: ripple.size,
                                    backgroundColor: variant === 'primary' || variant === 'gold'
                                        ? 'rgba(255, 255, 255, 0.4)'
                                        : 'rgba(0, 217, 255, 0.3)'
                                }}
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{ scale: 2, opacity: 0 }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                            />
                        ))}
                    </div>
                </>
            )}
        </motion.button>
    );
});

AppleButton.displayName = 'AppleButton';

export default AppleButton;
