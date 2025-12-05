'use client';
import { motion } from 'framer-motion';

interface FiltrationHeaderProps {

}

export default function FiltrationHeader({  }: FiltrationHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Фильтрация</h2>
            <p className="text-slate-500 dark:text-slate-400">Подбор оборудования очистки воды</p>
        </motion.div>
    );
}
