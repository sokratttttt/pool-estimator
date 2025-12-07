'use client';
import { motion } from 'framer-motion';

type ProgressSize = 'sm' | 'md' | 'lg';
type ProgressVariant = 'primary' | 'success' | 'warning' | 'error';

interface ProgressBarProps {
    value?: number;
    max?: number;
    size?: ProgressSize;
    variant?: ProgressVariant;
    showLabel?: boolean;
    label?: string;
    animated?: boolean;
    className?: string;
}

const sizes: Record<ProgressSize, string> = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
};

const variants: Record<ProgressVariant, string> = {
    primary: 'bg-cyan-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
};

/**
 * Progress bar component
 */
export default function ProgressBar({
    value = 0,
    max = 100,
    size = 'md',
    variant = 'primary',
    showLabel = false,
    label,
    animated = true,
    className = ''
}: ProgressBarProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
        <div className={className}>
            {(showLabel || label) && (
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/80">
                        {label || 'Прогресс'}
                    </span>
                    <span className="text-sm font-medium text-white">
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}

            <div className={`
                w-full ${sizes[size]} rounded-full
                bg-white/10 overflow-hidden
            `}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={animated ? {
                        duration: 0.5,
                        ease: 'easeOut'
                    } : { duration: 0 }}
                    className={`
                        h-full ${variants[variant]}
                        relative overflow-hidden
                    `}
                >
                    {/* Animated shine effect */}
                    {animated && (
                        <motion.div
                            animate={{
                                x: ['-100%', '200%']
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatDelay: 1
                            }}
                            className="
                                absolute inset-0
                                bg-gradient-to-r from-transparent via-white/30 to-transparent
                            "
                        />
                    )}
                </motion.div>
            </div>
        </div>
    );
}
