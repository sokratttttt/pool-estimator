'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface PriceDisplayProps {
    value?: number;
}

export default function PriceDisplay({ value = 0 }: PriceDisplayProps) {
    const [displayValue, setDisplayValue] = useState(0);

    // Animate price changes
    useEffect(() => {
        const safeValue = value ?? 0;
        const duration = 800;
        const steps = 60;
        const increment = (safeValue - displayValue) / steps;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            if (currentStep >= steps) {
                setDisplayValue(safeValue);
                clearInterval(timer);
            } else {
                setDisplayValue(prev => prev + increment);
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [value, displayValue]);

    return (
        <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: displayValue !== value ? 1.05 : 1 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-end"
        >
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">
                Итого
            </span>
            <motion.span
                key={Math.floor(displayValue)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-bold text-gradient-premium"
                style={{
                    background: 'linear-gradient(135deg, #0A2463 0%, #00B4D8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}
            >
                {Math.floor(displayValue).toLocaleString('ru-RU')} ₽
            </motion.span>
        </motion.div>
    );
}
