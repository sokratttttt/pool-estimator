'use client';

import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

export default function ThemeSelector({ onClose }) {
    const { theme, setTheme, themes } = useTheme();

    return (
        <div className="p-4">
            <h3 className="apple-heading-3 mb-4">Выберите тему</h3>
            <div className="grid grid-cols-2 gap-4">
                {themes.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => {
                            setTheme(t.id);
                            if (onClose) onClose();
                        }}
                        className={`
                            relative p-4 rounded-xl border transition-all duration-300 group
                            ${theme === t.id
                                ? 'border-apple-accent bg-apple-bg-secondary shadow-glow'
                                : 'border-apple-border hover:border-apple-gray-500 bg-apple-bg-secondary/50'}
                        `}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex -space-x-2">
                                {t.colors.map((color, i) => (
                                    <div
                                        key={i}
                                        className="w-6 h-6 rounded-full border-2 border-apple-bg-secondary"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <span className={`text-sm font-medium ${theme === t.id ? 'text-apple-text-primary' : 'text-apple-text-secondary'}`}>
                                {t.name}
                            </span>
                        </div>

                        {theme === t.id && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2 w-5 h-5 bg-apple-accent rounded-full flex items-center justify-center"
                            >
                                <Check size={12} className="text-apple-bg-primary" />
                            </motion.div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
