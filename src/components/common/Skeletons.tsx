'use client';
import { motion } from 'framer-motion';

/**
 * Skeleton component for loading states
 */
export function Skeleton({
    width = '100%',
    height = '20px',
    borderRadius = '4px',
    className = ''
}) {
    return (
        <motion.div
            animate={{
                opacity: [0.5, 1, 0.5]
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
            }}
            className={`bg-white/10 ${className}`}
            style={{
                width,
                height,
                borderRadius
            }}
        />
    );
}

/**
 * Card Skeleton
 */
export function CardSkeleton({ className = '' }) {
    return (
        <div className={`bg-white/5 rounded-lg p-6 ${className}`}>
            <Skeleton width="60%" height="24px" className="mb-4" />
            <Skeleton width="100%" height="16px" className="mb-2" />
            <Skeleton width="100%" height="16px" className="mb-2" />
            <Skeleton width="80%" height="16px" className="mb-4" />
            <div className="flex gap-2">
                <Skeleton width="80px" height="32px" />
                <Skeleton width="80px" height="32px" />
            </div>
        </div>
    );
}

/**
 * List Skeleton
 */
export function ListSkeleton({ count = 5, className = '' }) {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: count }).map((_: unknown, i: number) => (
                <div key={i} className="flex items-center gap-4">
                    <Skeleton width="40px" height="40px" borderRadius="50%" />
                    <div className="flex-1">
                        <Skeleton width="40%" height="16px" className="mb-2" />
                        <Skeleton width="60%" height="14px" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Table Skeleton
 */
export function TableSkeleton({ rows = 5, cols = 4, className = '' }) {
    return (
        <div className={`space-y-2 ${className}`}>
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {Array.from({ length: cols }).map((_: unknown, i: number) => (
                    <Skeleton key={i} height="24px" />
                ))}
            </div>
            {Array.from({ length: rows }).map((_: unknown, rowIndex: number) => (
                <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                    {Array.from({ length: cols }).map((_: unknown, colIndex: number) => (
                        <Skeleton key={colIndex} height="20px" />
                    ))}
                </div>
            ))}
        </div>
    );
}
