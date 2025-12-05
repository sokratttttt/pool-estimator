'use client';
import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';

interface AppleCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'glass' | 'premium' | 'flat';
    hover?: boolean;
    children?: React.ReactNode;
}

const AppleCard = memo(function AppleCard({
    children,
    className = '',
    variant = 'glass',
    hover = true,
    onClick,
    ...props
}: AppleCardProps) {
    // ✨ Memoize variant styles - only recalculate when variant changes
    const variantStyles = useMemo(() => {
        if (variant === 'premium') {
            return {
                background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.8) 0%, rgba(10, 25, 41, 0.9) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
            };
        }
        if (variant === 'flat') {
            return {
                background: 'rgba(30, 58, 95, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
            };
        }
        return {
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
        };
    }, [variant]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={hover ? { y: -2, boxShadow: '0 16px 48px rgba(0, 0, 0, 0.3)' } : {}}
            onClick={onClick}
            className={`rounded-xl p-6 transition-all duration-300 ${className}`}
            style={variantStyles}
            {...(props as any)}
        >
            {children}
        </motion.div>
    );
});

AppleCard.displayName = 'AppleCard';

export default AppleCard;
