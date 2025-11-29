'use client';
import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';
import { useRipple } from '../effects/Ripple';

const AppleButton = memo(function AppleButton({
    children,
    onClick,
    variant = 'primary', // primary, secondary, ghost, gold
    size = 'md', // sm, md, lg
    icon,
    iconPosition = 'left',
    disabled = false,
    loading = false,
    className = '',
    ariaLabel,
    type = 'button',
    ...props
}) {
    // ✨ Ripple effect
    const { RippleContainer } = useRipple(
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
        <RippleContainer
            className="inline-block rounded-lg"
        >
            <motion.button
                whileHover={{ scale: disabled || loading ? 1 : 1.02, boxShadow: disabled || loading ? undefined : '0 8px 24px rgba(0, 217, 255, 0.3)' }}
                whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
                onClick={onClick}
                disabled={disabled || loading}
                type={type}
                aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
                aria-disabled={disabled || loading}
                aria-busy={loading}
                className={`
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
                        {icon && iconPosition === 'left' && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>}
                        <span className="relative z-10">{children}</span>
                        {icon && iconPosition === 'right' && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>}
                    </>
                )}
            </motion.button>
        </RippleContainer>
    );
});

AppleButton.displayName = 'AppleButton';

export default AppleButton;
