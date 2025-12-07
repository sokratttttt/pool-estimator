'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Check, X } from 'lucide-react';

interface InlinePriceProps {
    value: number;
    onChange: (value: number) => void;
    currency?: string;
    disabled?: boolean;
    className?: string;
}

/**
 * Компонент инлайн-редактирования цены
 * Клик для редактирования, Enter/blur для сохранения
 */
export default function InlinePrice({
    value,
    onChange,
    currency = '₽',
    disabled = false,
    className = '',
}: InlinePriceProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value.toString());
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLocalValue(value.toString());
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        setIsEditing(false);
        const numValue = parseFloat(localValue) || 0;
        if (numValue !== value) {
            onChange(numValue);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setLocalValue(value.toString());
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    if (disabled) {
        return (
            <span className={`font-mono text-right ${className}`}>
                {value.toLocaleString('ru-RU')} {currency}
            </span>
        );
    }

    return (
        <AnimatePresence mode="wait">
            {isEditing ? (
                <motion.div
                    key="editing"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="flex items-center gap-1"
                >
                    <input
                        ref={inputRef}
                        type="number"
                        value={localValue}
                        onChange={(e) => setLocalValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        className="w-28 px-2 py-1 text-right font-mono text-sm 
                                   bg-cyan-50 dark:bg-cyan-900/30 
                                   border-2 border-cyan-500 
                                   rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-300"
                        step="1"
                        min="0"
                    />
                    <button
                        onClick={handleSave}
                        className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                    >
                        <Check size={14} />
                    </button>
                    <button
                        onClick={handleCancel}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                    >
                        <X size={14} />
                    </button>
                </motion.div>
            ) : (
                <motion.button
                    key="display"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 180, 216, 0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditing(true)}
                    className={`
                        px-3 py-1 font-mono text-right rounded-lg
                        cursor-pointer group flex items-center gap-2
                        transition-colors hover:bg-cyan-50 dark:hover:bg-cyan-900/20
                        ${className}
                    `}
                >
                    <span className="font-semibold">
                        {value.toLocaleString('ru-RU')} {currency}
                    </span>
                    <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
