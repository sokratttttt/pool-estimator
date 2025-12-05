'use client';
import { motion } from 'framer-motion';

type BowlHeaderProps = object;

export default function BowlHeader({ }: BowlHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
        >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Выберите чашу бассейна
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
                Широкий выбор композитных чаш от ведущих производителей
            </p>
        </motion.div>
    );
}
