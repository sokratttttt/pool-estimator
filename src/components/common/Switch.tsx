'use client';
import { motion } from 'framer-motion';

/**
 * Switch component (toggle)
 */
interface SwitchProps {
  checked?: any;
  onChange?: () => void;
  label?: any;
  disabled?: any;
  size?: any;
  // sm?: any;
  md?: any;
  lg
    className?: any;
}

export default function Switch({ 
    checked,
    onChange,
    label,
    disabled = false,
    size = 'md', // sm, md, lg
    className = ''
 }: SwitchProps) {
    const sizes = {
        sm: { container: 'w-8 h-4', thumb: 'w-3 h-3' },
        md: { container: 'w-11 h-6', thumb: 'w-5 h-5' },
        lg: { container: 'w-14 h-7', thumb: 'w-6 h-6' }
    };

    return (
        <label className={`inline-flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
            <div className="relative">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className="sr-only peer"
                />
                <motion.div
                    animate={{
                        backgroundColor: checked ? '#06b6d4' : 'rgba(255, 255, 255, 0.1)'
                    }}
                    className={`
                        ${sizes[size].container}
                        rounded-full
                        peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-navy-deep
                        transition-all duration-200
                    `}
                >
                    <motion.div
                        animate={{
                            x: checked ?
                                (size === 'sm' ? 16 : size === 'md' ? 20 : 28) : 2
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className={`
                            ${sizes[size].thumb}
                            bg-white rounded-full
                            absolute top-1/2 -translate-y-1/2
                            shadow-lg
                        `}
                    />
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
