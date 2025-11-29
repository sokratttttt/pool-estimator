'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Toast notification component
 * Alternative to sonner for more control
 */
export function Toast({
    message,
    type = 'info',
    duration = 5000,
    onClose,
    action
}) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const variants = {
        info: 'bg-blue-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        error: 'bg-red-500'
    };

    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className={`
                ${variants[type]}
                px-6 py-4 rounded-lg shadow-xl
                flex items-center gap-3
                text-white min-w-[300px] max-w-md
            `}
        >
            <p className="flex-1 text-sm font-medium">{message}</p>

            {action && (
                <button
                    onClick={action.onClick}
                    className="text-sm underline hover:no-underline"
                >
                    {action.label}
                </button>
            )}

            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                className="p-1 hover:bg-white/20 rounded transition-colors"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
}

/**
 * Toast Container
 */
export function ToastContainer({ toasts, removeToast }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>,
        document.body
    );
}
