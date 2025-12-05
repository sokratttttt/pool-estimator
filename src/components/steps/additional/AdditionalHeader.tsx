'use client';
import { motion } from 'framer-motion';

type AdditionalHeaderProps = object;

export default function AdditionalHeader({ }: AdditionalHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
        >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Дополнительные опции</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
                Выберите оборудование для комфорта и развлечений
            </p>
        </motion.div>
    );
}
