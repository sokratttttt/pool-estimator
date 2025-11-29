'use client';
import { motion } from 'framer-motion';

export default function WorksHeader() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto mb-8"
        >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Строительные работы
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
                Выберите необходимые работы. Объемы рассчитываются автоматически
            </p>
        </motion.div>
    );
}
