'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';

/**
 * Card component with hover effects
 */
export default function Card({
    children,
    className = '',
    variant = 'default', // default, glass, gradient
    hover = true,
    onClick,
    ...props
}) {
    const [isHovered, setIsHovered] = useState(false);

    const variants = {
        default: 'bg-white/5 border border-white/10',
        glass: 'bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-lg',
        gradient: 'bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20'
    };

    return (
        <motion.div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={hover ? { y: -4, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)' } : {}}
            onClick={onClick}
            className={`
                ${variants[variant]}
                rounded-xl p-6
                transition-all duration-300
                ${onClick ? 'cursor-pointer' : ''}
                ${className}
            `}
            {...props}
        >
            {children}

            {/* Shine effect on hover */}
            {hover && isHovered && (
                <motion.div
                    initial={{ x: '-100%', y: '-100%' }}
                    animate={{ x: '200%', y: '200%' }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    className="
                        absolute inset-0 -z-10
                        bg-gradient-to-r from-transparent via-white/10 to-transparent
                        pointer-events-none
                    "
                    style={{ transform: 'skew(-15deg)' }}
                />
            )}
        </motion.div>
    );
}
