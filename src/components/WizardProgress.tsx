'use client';

import { motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';

interface WizardStep {
    id: string;
    title: string;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    isComplete: boolean;
    isValid: boolean;
    summary?: string;
}

interface WizardProgressProps {
    steps: WizardStep[];
    currentStep: number;
    onStepClick: (index: number) => void;
    className?: string;
}

/**
 * Улучшенный прогресс-бар для пошагового конструктора
 * Показывает статус каждого шага и краткое описание выбора
 */
export default function WizardProgress({
    steps,
    currentStep,
    onStepClick,
    className = '',
}: WizardProgressProps) {
    return (
        <div className={`
            flex items-center gap-1 p-2
            bg-white/80 dark:bg-slate-800/80
            backdrop-blur-xl rounded-2xl shadow-lg
            overflow-x-auto
            ${className}
        `}>
            {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === index;
                const isPast = index < currentStep;
                const isFuture = index > currentStep;

                return (
                    <div key={step.id} className="flex items-center">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onStepClick(index)}
                            disabled={isFuture && !steps[index - 1]?.isComplete}
                            className={`
                                flex items-center gap-2 px-3 py-2 rounded-xl
                                transition-all duration-200 min-w-max
                                ${isActive
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                                    : step.isComplete
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                        : isFuture
                                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                                            : 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300'
                                }
                                ${!step.isValid && !isActive ? 'ring-2 ring-red-300' : ''}
                                ${isFuture && !steps[index - 1]?.isComplete ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            {/* Icon */}
                            <div className={`
                                relative flex items-center justify-center
                                w-7 h-7 rounded-lg
                                ${isActive
                                    ? 'bg-white/20'
                                    : step.isComplete
                                        ? 'bg-green-200 dark:bg-green-800'
                                        : 'bg-slate-200 dark:bg-slate-600'
                                }
                            `}>
                                {step.isComplete && !isActive ? (
                                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                ) : (
                                    <Icon className="w-4 h-4" />
                                )}
                            </div>

                            {/* Text */}
                            <div className="flex flex-col text-left">
                                <span className="text-xs font-semibold leading-tight">
                                    {step.title}
                                </span>
                                {step.summary && isPast && (
                                    <motion.span
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="text-[10px] opacity-70 leading-tight max-w-[100px] truncate"
                                    >
                                        {step.summary}
                                    </motion.span>
                                )}
                            </div>
                        </motion.button>

                        {/* Connector */}
                        {index < steps.length - 1 && (
                            <ChevronRight className={`
                                w-4 h-4 mx-1 flex-shrink-0
                                ${isPast
                                    ? 'text-green-400'
                                    : 'text-slate-300 dark:text-slate-600'
                                }
                            `} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
