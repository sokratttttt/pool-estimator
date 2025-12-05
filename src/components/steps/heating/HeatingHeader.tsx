'use client';
import { motion } from 'framer-motion';

interface HeatingHeaderProps {

}

export default function HeatingHeader({  }: HeatingHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Система подогрева</h2>
            <p className="text-slate-500 dark:text-slate-400">Комфортная температура воды в любое время года</p>
        </motion.div>
    );
}
