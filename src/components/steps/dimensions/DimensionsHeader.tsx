'use client';
import { motion } from 'framer-motion';

type DimensionsHeaderProps = object;

export default function DimensionsHeader({ }: DimensionsHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
        >
            <h2 className="apple-heading-2 mb-4">Размеры бассейна</h2>
            <p className="apple-body-secondary">
                Укажите желаемые размеры вашего бассейна
            </p>
        </motion.div>
    );
}
