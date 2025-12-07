'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useEscapeKey, useOnClickOutside } from '@/hooks';
import { trapFocus } from '@/utils/a11yUtils';

/**
 * Enhanced Modal component with animations and accessibility
 */
interface ModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    title?: string;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    showCloseButton?: boolean;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md', // sm, md, lg, xl
    closeOnClickOutside = true,
    closeOnEscape = true,
    showCloseButton = true
}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    const outsideClickRef = useOnClickOutside(() => {
        if (closeOnClickOutside && isOpen) {
            onClose?.();
        }
    });

    // Close on Escape key
    useEscapeKey(() => {
        if (closeOnEscape && isOpen) {
            onClose?.();
        }
    });

    // Trap focus when modal is open
    useEffect(() => {
        if (isOpen && modalRef.current) {
            const cleanup = trapFocus(modalRef.current);

            // Focus first focusable element
            setTimeout(() => {
                const firstFocusable = modalRef.current?.querySelector(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                ) as HTMLElement;
                if (firstFocusable) {
                    firstFocusable.focus();
                }
            }, 100);

            return cleanup;
        }
        return undefined;
    }, [isOpen]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';

            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
        return undefined;
    }, [isOpen]);

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        aria-hidden="true"
                    />

                    {/* Modal content */}
                    <motion.div
                        ref={(node: HTMLDivElement | null) => {
                            modalRef.current = node;
                            outsideClickRef.current = node;
                        }}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className={`
                            relative w-full ${sizeClasses[size]}
                            bg-gradient-to-br from-navy-deep/95 to-slate-900/95
                            backdrop-blur-xl
                            border border-white/10
                            rounded-2xl shadow-2xl
                            max-h-[90vh] overflow-hidden
                            flex flex-col
                        `}
                    >
                        {/* Header */}
                        {(title || showCloseButton) && (
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                {title && (
                                    <h2
                                        id="modal-title"
                                        className="text-2xl font-bold text-white"
                                    >
                                        {title}
                                    </h2>
                                )}
                                {showCloseButton && (
                                    <button
                                        onClick={onClose}
                                        aria-label="Закрыть модальное окно"
                                        className="
                                            p-2 rounded-lg
                                            text-apple-text-secondary hover:text-white
                                            bg-white/5 hover:bg-white/10
                                            transition-all duration-200
                                            focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500
                                        "
                                    >
                                        <X size={24} />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="p-6 border-t border-white/10 bg-white/5">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
