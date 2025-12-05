'use client';
import { motion } from 'framer-motion';

/**
 * EmptyState - универсальный компонент для отображения пустых состояний
 * @param {object} props
 * @param {React.ReactNode} props.icon - Иконка (компонент lucide-react)
 * @param {string} props.title - Заголовок
 * @param {string} props.description - Описание (опционально)
 * @param {object} props.action - Кнопка действия (опционально)
 * @param {string} props.action.label - Текст кнопки
 * @param {function} props.action.onClick - Обработчик клика
 * @param {string} props.action.variant - Вариант кнопки ('primary' | 'secondary')
 * @param {string} props.className - Дополнительные CSS классы
 */
interface EmptyStateProps {
  icon?: any;
  title?: any;
  description?: any;
  action?: any;
  className?: string;
}

export default function EmptyState({ 
    icon,
    title,
    description,
    action,
    className = ''
 }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
        >
            {/* Иконка */}
            {icon && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700"
                >
                    <div className="text-slate-400 dark:text-slate-500">
                        {icon}
                    </div>
                </motion.div>
            )}

            {/* Заголовок */}
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {title}
            </h3>

            {/* Описание */}
            {description && (
                <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
                    {description}
                </p>
            )}

            {/* Кнопка действия */}
            {action && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={action.onClick}
                    className={`
                        px-6 py-3 rounded-xl font-medium transition-all duration-200
                        ${action.variant === 'primary'
                            ? 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }
                    `}
                >
                    {action.label}
                </motion.button>
            )}
        </motion.div>
    );
}
