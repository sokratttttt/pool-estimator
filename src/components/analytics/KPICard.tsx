'use client';
import { motion } from 'framer-motion';

/**
 * Карточка с ключевой метрикой (KPI)
 * @param {string} label - название метрики
 * @param {string} value - значение метрики
 * @param {ReactNode} icon - иконка
 * @param {string} trend - тренд (up/down/neutral)
 * @param {string} trendValue - значение тренда
 */
interface KPICardProps {
  label?: any;
  value?: any;
  icon?: any;
  trend?: any;
  trendValue?: any;
}

export default function KPICard({  label, value, icon, trend, trendValue  }: KPICardProps) {
    const trendColors = {
        up: 'text-green-500',
        down: 'text-red-500',
        neutral: 'text-apple-text-tertiary'
    };

    const trendIcons = {
        up: '↑',
        down: '↓',
        neutral: '→'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-apple-surface rounded-2xl p-6 border border-apple-border hover:border-apple-primary/30 transition-all relative overflow-hidden group"
        >
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-apple-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative z-10">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-apple-primary/10 to-apple-primary/5 flex items-center justify-center mb-4">
                    <div className="text-apple-primary">
                        {icon}
                    </div>
                </div>

                {/* Value */}
                <div className="mb-2">
                    <h3 className="text-3xl font-bold text-apple-text-primary mb-1">
                        {value}
                    </h3>
                    <p className="text-sm text-apple-text-secondary">
                        {label}
                    </p>
                </div>

                {/* Trend */}
                {trend && trendValue && (
                    <div className={`flex items-center gap-1 text-sm ${trendColors[trend]}`}>
                        <span className="font-medium">{trendIcons[trend]}</span>
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
