'use client';
import { motion } from 'framer-motion';

/**
 * Badge component for labels and status indicators
 */
export default function Badge({
    children,
    variant = 'default', // default, primary, success, warning, error
    size = 'md', // sm, md, lg
    className = '',
    ...props
}) {
    const variants = {
        default: 'bg-white/10 text-white',
        primary: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
        success: 'bg-green-500/20 text-green-300 border border-green-500/30',
        warning: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
        error: 'bg-red-500/20 text-red-300 border border-red-500/30'
    };

    const sizes = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5'
    };

    return (
        <motion.span
            whileHover={{ scale: 1.05 }}
            className={`
                inline-flex items-center
                ${sizes[size]}
                ${variants[variant]}
                rounded-full
                font-medium
                ${className}
            `}
            {...props}
        >
            {children}
        </motion.span>
    );
}
