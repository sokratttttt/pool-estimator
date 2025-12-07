'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectProps {
    label?: string;
    value?: string | number;
    onChange?: (value: string | number) => void;
    options?: SelectOption[];
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    error?: string;
}

export default function Select({
    label,
    value,
    onChange,
    options = [],
    placeholder = 'Выберите...',
    className = '',
    disabled = false,
    error
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (option: SelectOption) => {
        if (disabled) return;
        onChange?.(option.value);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
                    w-full flex items-center justify-between
                    px-4 py-2.5 rounded-xl
                    bg-white dark:bg-slate-800
                    border transition-all duration-200
                    ${error
                        ? 'border-red-500 focus:ring-red-500/20'
                        : isOpen
                            ? 'border-cyan-500 ring-4 ring-cyan-500/10'
                            : 'border-slate-200 dark:border-slate-700 hover:border-cyan-500/50'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
            >
                <span className={`block truncate ${!selectedOption ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    size={16}
                    className={`
                        text-slate-400 transition-transform duration-200
                        ${isOpen ? 'rotate-180' : ''}
                    `}
                />
            </button>

            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}

            <AnimatePresence>
                {isOpen && !disabled && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="
                            absolute z-50 w-full mt-2
                            bg-white dark:bg-slate-800
                            border border-slate-100 dark:border-slate-700
                            rounded-xl shadow-xl
                            overflow-hidden
                            max-h-60 overflow-y-auto
                        "
                    >
                        <div className="p-1">
                            {options.map((option: SelectOption) => {
                                const isSelected = option.value === value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={`
                                            w-full flex items-center justify-between
                                            px-3 py-2 rounded-lg text-sm
                                            transition-colors
                                            ${isSelected
                                                ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }
                                        `}
                                    >
                                        <span className="truncate">{option.label}</span>
                                        {isSelected && <Check size={16} />}
                                    </button>
                                );
                            })}
                            {options.length === 0 && (
                                <div className="px-3 py-2 text-sm text-slate-400 text-center">
                                    Нет опций
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
