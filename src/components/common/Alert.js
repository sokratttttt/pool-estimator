'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Alert component with different variants
 */
export default function Alert({
    variant = 'info', // info, success, warning, error
    title,
    message,
    onClose,
    autoClose = false,
    autoCloseDuration = 5000,
    action,
    className = ''
}) {
    // Auto close after duration
    useEffect(() => {
        if (autoClose && onClose) {
            const timer = setTimeout(onClose, autoCloseDuration);
            return () => clearTimeout(timer);
        }
    }, [autoClose, autoCloseDuration, onClose]);

    const variants = {
        info: {
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/30',
            icon: <Info size={20} className="text-blue-400" />,
            text: 'text-blue-300'
        },
        success: {
            bg: 'bg-green-500/10',
            border: 'border-green-500/30',
            icon: <CheckCircle2 size={20} className="text-green-400" />,
            text: 'text-green-300'
        },
        warning: {
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/30',
            icon: <AlertTriangle size={20} className="text-yellow-400" />,
            text: 'text-yellow-300'
        },
        error: {
            bg: 'bg-red-500/10',
            border: 'border-red-500/30',
            icon: <AlertCircle size={20} className="text-red-400" />,
            text: 'text-red-300'
        }
    };

    const config = variants[variant];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`
                ${config.bg} ${config.border}
                border rounded-lg p-4
                ${className}
            `}
            role="alert"
            aria-live="polite"
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5" aria-hidden="true">
                    {config.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {title && (
                        <h3 className={`text-sm font-semibold ${config.text} mb-1`}>
                            {title}
                        </h3>
                    )}
                    {message && (
                        <p className="text-sm text-white/80">
                            {message}
                        </p>
                    )}
                    {action && (
                        <div className="mt-3">
                            {action}
                        </div>
                    )}
                </div>

                {/* Close button */}
                {onClose && (
                    <button
                        onClick={onClose}
                        aria-label="Закрыть уведомление"
                        className="
                            flex-shrink-0 p-1 rounded
                            text-white/60 hover:text-white
                            hover:bg-white/10
                            transition-colors
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50
                        "
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        </motion.div>
    );
}
