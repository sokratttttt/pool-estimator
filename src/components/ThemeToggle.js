'use client';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors hover:bg-slate-300 dark:hover:bg-slate-600"
            aria-label="Toggle Theme"
        >
            <div className="relative w-6 h-6">
                <motion.div
                    initial={false}
                    animate={{ rotate: isDark ? 180 : 0, opacity: isDark ? 0 : 1, scale: isDark ? 0.5 : 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <Sun size={20} />
                </motion.div>
                <motion.div
                    initial={false}
                    animate={{ rotate: isDark ? 0 : -180, opacity: isDark ? 1 : 0, scale: isDark ? 1 : 0.5 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <Moon size={20} />
                </motion.div>
            </div>
        </button>
    );
}
