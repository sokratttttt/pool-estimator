'use client';
import { motion } from 'framer-motion';

export default function ProgressBar({ currentStep, steps }) {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    const progress = ((currentIndex + 1) / steps.length) * 100;

    return (
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <motion.div
                className="h-full bg-gradient-to-r from-[#00b4d8] to-[#0096c7] rounded-full shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            />
        </div>
    );
}
