'use client';
import { motion } from 'framer-motion';

type MaterialHeaderProps = object;

export default function MaterialHeader({ }: MaterialHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto mb-10"
        >
            <h2 className="apple-heading-2 mb-4">
                Выберите тип бассейна
            </h2>
            <p className="apple-body-secondary">Основа вашего будущего проекта</p>
        </motion.div>
    );
}
