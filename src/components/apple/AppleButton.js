'use client';
import { motion } from 'framer-motion';

export default function AppleButton({
    children,
    onClick,
    variant = 'primary', // primary, secondary, ghost, gold
    size = 'md', // sm, md, lg
    icon,
    iconPosition = 'left',
    disabled = false,
    loading = false,
    className = '',
    ...props
}) {
    const getVariantStyles = () => {
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
    };

    const getSizeClass = () => {
        switch (size) {
            case 'sm':
                return 'text-sm px-4 py-2';
            case 'lg':
                return 'text-lg px-8 py-4';
            default:
                return 'px-6 py-3';
        }
    };

    return (
        <motion.button
            whileHover={{ scale: disabled || loading ? 1 : 1.02, boxShadow: disabled || loading ? undefined : '0 8px 24px rgba(0, 217, 255, 0.3)' }}
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                inline-flex items-center justify-center gap-2
                ${getSizeClass()}
                font-semibold rounded-lg
                transition-all duration-200
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${className}
            `}
            style={getVariantStyles()}
            {...props}
        >
            {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
            ) : (
                <>
                    {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
                    <span className="relative z-10">{children}</span>
                    {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
                </>
            )}
        </motion.button>
    );
}
