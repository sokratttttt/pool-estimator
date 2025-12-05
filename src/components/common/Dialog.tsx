'use client';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import React from 'react';

/**
 * Dialog component (alternative Modal)
 */
interface DialogProps {
    isOpen?: boolean;
    onClose?: () => void;
    title?: string;
    description?: string;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closeOnBackdrop?: boolean;
}

export default function Dialog({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
    closeOnBackdrop = true
}: DialogProps) {
    if (!isOpen) return null;

    const sizes: Record<string, string> = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-full mx-4'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeOnBackdrop ? onClose : undefined}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Dialog */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`
                    relative ${sizes[size]} w-full
                    bg-gradient-to-br from-navy-deep/95 to-slate-900/95
                    backdrop-blur-xl
                    border border-white/10
                    rounded-xl shadow-2xl
                    overflow-hidden
                `}
                role="dialog"
                aria-modal="true"
                aria-labelledby="dialog-title"
                aria-describedby="dialog-description"
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-white/10">
                    <div>
                        {title && (
                            <h2 id="dialog-title" className="text-xl font-bold text-white">
                                {title}
                            </h2>
                        )}
                        {description && (
                            <p id="dialog-description" className="mt-1 text-sm text-white/60">
                                {description}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="
                            p-2 rounded-lg
                            text-white/60 hover:text-white
                            hover:bg-white/10
                            transition-colors
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500
                        "
                        aria-label="Close dialog"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
                        {footer}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
