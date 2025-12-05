'use client';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEscapeKey } from '@/hooks';
import React from 'react';

/**
 * Drawer component - slide-in panel from side
 */
interface DrawerProps {
    isOpen?: boolean;
    onClose?: () => void;
    children?: React.ReactNode;
    title?: string;
    position?: 'left' | 'right';
    size?: 'sm' | 'md' | 'lg';
}

export default function Drawer({
    isOpen,
    onClose,
    children,
    title,
    position = 'right',
    size = 'md'
}: DrawerProps) {
    // Close on Escape key - wrap in function to handle undefined
    useEscapeKey(() => onClose?.());

    const sizeClasses: Record<string, string> = {
        sm: 'w-80',
        md: 'w-96',
        lg: 'w-[32rem]'
    };

    const slideVariants: Record<string, any> = {
        right: {
            initial: { x: '100%' },
            animate: { x: 0 },
            exit: { x: '100%' }
        },
        left: {
            initial: { x: '-100%' },
            animate: { x: 0 },
            exit: { x: '-100%' }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                aria-hidden="true"
            />

            {/* Drawer content */}
            <motion.div
                initial={slideVariants[position].initial}
                animate={slideVariants[position].animate}
                exit={slideVariants[position].exit}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`
                    relative ${sizeClasses[size]} h-full
                    bg-gradient-to-br from-navy-deep/95 to-slate-900/95
                    backdrop-blur-xl
                    border-l border-white/10
                    ${position === 'left' ? 'order-first border-r' : 'ml-auto border-l'}
                    flex flex-col
                    shadow-2xl
                `}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <h2 className="text-xl font-bold text-white">{title}</h2>
                        <button
                            onClick={onClose}
                            aria-label="Закрыть панель"
                            className="
                                p-2 rounded-lg
                                text-apple-text-secondary hover:text-white
                                bg-white/5 hover:bg-white/10
                                transition-all duration-200
                                focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500
                            "
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </motion.div>
        </div>
    );
}
