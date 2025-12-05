'use client';
import { motion } from 'framer-motion';

/**
 * Spinner/Loader component
 */
type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
type SpinnerVariant = 'primary' | 'white';

interface SpinnerProps {
    size?: SpinnerSize;
    variant?: SpinnerVariant;
    className?: string;
}

export default function Spinner({
    size = 'md',
    variant = 'primary',
    className = ''
}: SpinnerProps) {
    const sizes: Record<SpinnerSize, string> = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-2',
        lg: 'w-12 h-12 border-3',
        xl: 'w-16 h-16 border-4'
    };

    const variants: Record<SpinnerVariant, string> = {
        primary: 'border-cyan-500 border-t-transparent',
        white: 'border-white border-t-transparent'
    };

    return (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear'
            }}
            className={`
                ${sizes[size]}
                ${variants[variant]}
                rounded-full
                ${className}
            `}
            role="status"
            aria-label="Загрузка"
        >
            <span className="sr-only">Загрузка...</span>
        </motion.div>
    );
}

/**
 * Dots spinner variant
 */
interface DotsSpinnerProps {
    className?: string;
}

export function DotsSpinner({ className = '' }: DotsSpinnerProps) {
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {[0, 1, 2].map((i: number) => (
                <motion.div
                    key={i}
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2
                    }}
                    className="w-2 h-2 rounded-full bg-cyan-500"
                />
            ))}
        </div>
    );
}
