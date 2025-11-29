'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function ProgressBar({ currentStep, totalSteps, stepNames, onStepClick }) {
    const progress = ((currentStep + 1) / totalSteps) * 100;

    return (
        <div className="bg-white border-b border-gray-200 px-8 py-4">
            {/* Step indicators */}
            <div className="flex items-center justify-between mb-3 relative">
                {/* Progress line background */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />

                {/* Animated progress line */}
                <motion.div
                    className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 -translate-y-1/2 z-0"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                />

                {stepNames?.map((name, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    const isClickable = index <= currentStep;

                    return (
                        <div key={index} className="relative z-10 flex flex-col items-center">
                            <motion.button
                                onClick={() => isClickable && onStepClick?.(index)}
                                disabled={!isClickable}
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300 ${isCompleted
                                        ? 'bg-green-500 text-white shadow-md'
                                        : isCurrent
                                            ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100'
                                            : 'bg-gray-200 text-gray-400'
                                    } ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}`}
                                whileHover={isClickable ? { scale: 1.1 } : {}}
                                whileTap={isClickable ? { scale: 0.95 } : {}}
                            >
                                {isCompleted ? (
                                    <Check size={20} className="animate-in fade-in zoom-in duration-300" />
                                ) : (
                                    <span className="text-sm">{index + 1}</span>
                                )}
                            </motion.button>

                            {/* Step name */}
                            <span className={`mt-2 text-xs font-medium text-center max-w-[80px] ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                                }`}>
                                {name}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Progress percentage */}
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                    Шаг <span className="font-semibold text-blue-600">{currentStep + 1}</span> из {totalSteps}
                </span>
                <span className="text-gray-500">
                    {Math.round(progress)}% завершено
                </span>
            </div>
        </div>
    );
}
