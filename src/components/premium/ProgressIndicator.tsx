'use client';
import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
    current: number;
    total: number;
    steps?: string[];
}

export default function ProgressIndicator({ current, total, steps: _steps }: ProgressIndicatorProps) {
    const percentage = (current / total) * 100;

    return (
        <div className="flex flex-col items-center gap-3 min-w-[200px]">
            {/* Step indicator */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Шаг {current} из {total}
                </span>
                <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                    {Math.round(percentage)}%
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                        background: 'linear-gradient(90deg, #00B4D8 0%, #0096C7 100%)',
                        boxShadow: '0 0 10px rgba(0, 180, 216, 0.5)',
                    }}
                />
            </div>

            {/* Step dots */}
            <div className="flex items-center gap-2">
                {Array.from({ length: total }).map((_, index: number) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < current;
                    const isCurrent = stepNumber === current;

                    return (
                        <motion.div
                            key={index}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`
                                w-2 h-2 rounded-full transition-all duration-300
                                ${isCurrent ? 'w-6 bg-gradient-to-r from-cyan-500 to-blue-600' : ''}
                                ${isCompleted ? 'bg-green-500' : ''}
                                ${!isCurrent && !isCompleted ? 'bg-slate-300 dark:bg-slate-600' : ''}
                            `}
                        />
                    );
                })}
            </div>
        </div>
    );
}
