'use client';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

/**
 * Checkbox component
 */
export default function Checkbox({
    checked,
    onChange,
    label,
    disabled = false,
    className = '',
    ...props
}) {
    return (
        <label className={`inline-flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
            <div className="relative">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className="sr-only peer"
                    {...props}
                />
                <motion.div
                    animate={{
                        backgroundColor: checked ? '#06b6d4' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: checked ? '#06b6d4' : 'rgba(255, 255, 255, 0.2)'
                    }}
                    className="
                        w-5 h-5 rounded
                        border-2
                        flex items-center justify-center
                        peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-navy-deep
                        transition-all duration-200
                    "
                >
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: checked ? 1 : 0,
                            opacity: checked ? 1 : 0
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                        <Check size={14} className="text-white" strokeWidth={3} />
                    </motion.div>
                </motion.div>
            </div>
            {label && (
                <span className="text-sm text-white select-none">
                    {label}
                </span>
            )}
        </label>
    );
}
