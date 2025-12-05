'use client';
import { motion } from 'framer-motion';

interface PremiumButtonProps {
    children?: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    icon?: any;
    iconPosition?: 'left' | 'right';
    className?: string;
}

export default function PremiumButton({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    icon: Icon,
    iconPosition = 'left',
    className = '',
}: PremiumButtonProps) {
    const variants = {
        primary: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700',
        secondary: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400',
        outline: 'bg-transparent border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50',
        ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                relative overflow-hidden rounded-xl font-semibold
                transition-all duration-300
                ${variants[variant]}
                ${sizes[size]}
                ${fullWidth ? 'w-full' : ''}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-lg hover:shadow-xl'}
                flex items-center justify-center gap-2
                ${className}
            `}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
                <>
                    {Icon && iconPosition === 'left' && <Icon size={20} />}
                    {children}
                    {Icon && iconPosition === 'right' && <Icon size={20} />}
                </>
            )}

            {/* Ripple effect */}
            <span className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                <span className="absolute inset-0 bg-white opacity-0 hover:opacity-20 transition-opacity duration-300" />
            </span>
        </motion.button>
    );
}

