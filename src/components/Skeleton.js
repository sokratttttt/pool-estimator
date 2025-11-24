import { motion } from 'framer-motion';

// Base skeleton with animation
export function Skeleton({ className = '', width = '100%', height = '1rem', rounded = 'rounded-lg' }) {
    return (
        <motion.div
            className={`bg-gradient-to-r from-white/5 via-white/10 to-white/5 ${rounded} ${className}`}
            style={{ width, height }}
            animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
            }}
        />
    );
}

// Card skeleton
export function SkeletonCard() {
    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <Skeleton width="60%" height="1.5rem" className="mb-2" />
                    <Skeleton width="40%" height="0.875rem" />
                </div>
                <Skeleton width="2.5rem" height="2.5rem" rounded="rounded-full" />
            </div>
            <div className="space-y-2 mb-4">
                <Skeleton width="100%" height="0.875rem" />
                <Skeleton width="80%" height="0.875rem" />
                <Skeleton width="90%" height="0.875rem" />
            </div>
            <Skeleton width="100%" height="2.5rem" />
        </div>
    );
}

// List item skeleton
export function SkeletonListItem() {
    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-4">
                <Skeleton width="3rem" height="3rem" rounded="rounded-xl" />
                <div className="flex-1">
                    <Skeleton width="70%" height="1rem" className="mb-2" />
                    <Skeleton width="50%" height="0.75rem" />
                </div>
                <Skeleton width="6rem" height="1rem" />
            </div>
        </div>
    );
}

// Table row skeleton
export function SkeletonTableRow() {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-white/10">
            <Skeleton width="2rem" height="2rem" rounded="rounded-lg" />
            <Skeleton width="30%" height="1rem" />
            <Skeleton width="20%" height="1rem" />
            <Skeleton width="15%" height="1rem" />
            <Skeleton width="10%" height="1rem" />
        </div>
    );
}

// Chart skeleton
export function SkeletonChart({ type = 'bar' }) {
    if (type === 'donut') {
        return (
            <div className="flex items-center justify-center p-8">
                <Skeleton width="12rem" height="12rem" rounded="rounded-full" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-end justify-between gap-2 h-48">
                {[...Array(7)].map((_, i) => (
                    <Skeleton
                        key={i}
                        width="100%"
                        height={`${Math.random() * 60 + 40}%`}
                        rounded="rounded-t-lg"
                    />
                ))}
            </div>
            <div className="flex justify-between mt-4">
                {[...Array(7)].map((_, i) => (
                    <Skeleton key={i} width="2rem" height="0.75rem" />
                ))}
            </div>
        </div>
    );
}

// Grid skeleton
export function SkeletonGrid({ columns = 3, rows = 3, CardComponent = SkeletonCard }) {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
            {[...Array(rows * columns)].map((_, i) => (
                <CardComponent key={i} />
            ))}
        </div>
    );
}

// Dashboard stats skeleton
export function SkeletonStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <Skeleton width="3rem" height="3rem" rounded="rounded-xl" className="mb-4" />
                    <Skeleton width="60%" height="0.875rem" className="mb-2" />
                    <Skeleton width="80%" height="2rem" />
                </div>
            ))}
        </div>
    );
}
