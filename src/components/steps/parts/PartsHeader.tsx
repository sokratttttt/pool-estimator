'use client';
import { motion } from 'framer-motion';

interface PartsHeaderProps {

}

export default function PartsHeader({  }: PartsHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Закладные элементы</h2>
            <p className="text-slate-500 dark:text-slate-400">Выберите материал закладных элементов чаши</p>
        </motion.div>
    );
}
