'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useEstimate } from '@/context/EstimateContext';
import MaterialStep from './steps/MaterialStep';
import DimensionsStep from './steps/DimensionsStep';
import BowlStep from './steps/BowlStep';
import FiltrationStep from './steps/FiltrationStep';
import HeatingStep from './steps/HeatingStep';
import PartsStep from './steps/PartsStep';
import WorksStep from './steps/WorksStep';
import AdditionalStep from './steps/AdditionalStep';
import SummaryStep from './steps/SummaryStep';
import AppleButton from './apple/AppleButton';
import { ArrowRight, ArrowLeft, Check, Undo2, Redo2 } from 'lucide-react';
import { generateEstimateItems, calculateTotal } from '@/utils/estimateUtils';

const steps = [
    { id: 'material', label: 'Тип' },
    { id: 'dimensions', label: 'Размеры' },
    { id: 'bowl', label: 'Чаша' },
    { id: 'filtration', label: 'Фильтрация' },
    { id: 'heating', label: 'Подогрев' },
    { id: 'parts', label: 'Закладные' },
    { id: 'works', label: 'Работы' },
    { id: 'additional', label: 'Опции' },
    { id: 'summary', label: 'Смета' },
];

export default function Configurator() {
    const { selection, undo, redo, canUndo, canRedo, lastSaved } = useEstimate();
    const searchParams = useSearchParams();
    const [currentStep, setCurrentStep] = useState('material');
    const [, forceUpdate] = useState(0);

    // Update timestamp display every second
    useEffect(() => {
        if (!lastSaved) return;
        const interval = setInterval(() => {
            forceUpdate(n => n + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [lastSaved]);

    // Handle step query parameter
    useEffect(() => {
        const stepParam = searchParams.get('step');
        if (stepParam && steps.find(s => s.id === stepParam)) {
            setCurrentStep(stepParam);
        }
    }, [searchParams]);

    const getVisibleSteps = () => {
        let visible = ['material'];
        if (selection.material?.id === 'composite') {
            visible.push('bowl');
        } else {
            visible.push('dimensions');
        }
        visible.push('filtration', 'heating', 'parts', 'works', 'additional', 'summary');
        return visible;
    };

    const visibleSteps = getVisibleSteps();
    const currentStepIndex = visibleSteps.indexOf(currentStep);
    const currentStepData = steps.find(s => s.id === currentStep);

    const handleNext = () => {
        if (currentStepIndex < visibleSteps.length - 1) {
            setCurrentStep(visibleSteps[currentStepIndex + 1]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setCurrentStep(visibleSteps[currentStepIndex - 1]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Keyboard navigation including Undo/Redo
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Undo/Redo shortcuts
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (canUndo) undo();
                return;
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                if (canRedo) redo();
                return;
            }

            // Navigation shortcuts
            if (e.key === 'Enter' && !e.shiftKey && currentStepIndex < visibleSteps.length - 1 && !e.target.matches('input, textarea, select')) {
                handleNext();
            }

            if (e.key === 'Enter' && e.shiftKey && currentStepIndex > 0) {
                handleBack();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentStep, visibleSteps]);

    // Ensure we don't get stuck on a hidden step
    useEffect(() => {
        if (!visibleSteps.includes(currentStep)) {
            setCurrentStep('material');
        }
    }, [selection.material, currentStep, visibleSteps]);

    const renderStep = () => {
        switch (currentStep) {
            case 'material': return <MaterialStep />;
            case 'dimensions': return <DimensionsStep />;
            case 'bowl': return <BowlStep />;
            case 'filtration': return <FiltrationStep />;
            case 'heating': return <HeatingStep />;
            case 'parts': return <PartsStep />;
            case 'works': return <WorksStep />;
            case 'additional': return <AdditionalStep />;
            case 'summary': return <SummaryStep />;
            default: return null;
        }
    };

    // Calculate total
    const items = generateEstimateItems(selection);
    const total = calculateTotal(items);

    return (
        <div className="min-h-screen bg-apple-bg-primary">
            {/* Simple Header */}
            <div className="bg-navy-deep/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-30 shadow-lg">
                <div className="max-w-[1600px] mx-auto px-6">
                    <div className="py-4">
                        {/* Progress Steps */}
                        <div className="flex items-center justify-between mb-4 md:mb-8 overflow-x-auto pb-2 scrollbar-hide">
                            {visibleSteps.map((stepId, idx) => {
                                const step = steps.find(s => s.id === stepId);
                                const isActive = idx === currentStepIndex;
                                const isCompleted = idx < currentStepIndex;

                                return (
                                    <div key={stepId} className="flex items-center flex-shrink-0">
                                        <div className="flex flex-col items-center group cursor-pointer" onClick={() => {
                                            if (isCompleted) setCurrentStep(stepId);
                                        }}>
                                            <div className={`
                                                w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                                                ${isActive ? 'bg-gradient-primary text-white scale-110 shadow-glow' :
                                                    isCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' :
                                                        'bg-white/5 text-gray-500 border border-white/10'}
                                            `}>
                                                {isCompleted ? (
                                                    <Check size={16} />
                                                ) : (
                                                    <span className="font-semibold text-sm">{idx + 1}</span>
                                                )}
                                            </div>
                                            <span className={`text-xs whitespace-nowrap transition-colors ${isActive ? 'text-cyan-bright font-medium' : 'text-gray-500 group-hover:text-gray-300'
                                                }`}>
                                                {step?.label}
                                            </span>
                                        </div>
                                        {idx < visibleSteps.length - 1 && (
                                            <div className={`h-0.5 w-6 mx-2 transition-colors duration-500 ${idx < currentStepIndex ? 'bg-emerald-500/50' : 'bg-white/10'
                                                }`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Current Step Info */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">{currentStepData?.label}</h2>
                                <p className="text-sm text-gray-400">
                                    Шаг {currentStepIndex + 1} из {visibleSteps.length}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* Undo/Redo buttons */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={undo}
                                        disabled={!canUndo}
                                        className={`p-2 rounded-lg transition-colors ${canUndo
                                            ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                                            : 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed opacity-50'
                                            }`}
                                        title="Отменить (Ctrl+Z)"
                                    >
                                        <Undo2 size={16} />
                                    </button>
                                    <button
                                        onClick={redo}
                                        disabled={!canRedo}
                                        className={`p-2 rounded-lg transition-colors ${canRedo
                                            ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                                            : 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed opacity-50'
                                            }`}
                                        title="Вернуть (Ctrl+Y)"
                                    >
                                        <Redo2 size={16} />
                                    </button>
                                </div>

                                {/* Total Price */}
                                <div className="text-right">
                                    {lastSaved && (
                                        <div className="flex items-center justify-end gap-1.5 text-xs text-emerald-400 mb-2 opacity-80">
                                            <Check size={12} />
                                            <span>
                                                Сохранено {
                                                    Math.floor((new Date() - lastSaved) / 1000) < 60
                                                        ? `${Math.floor((new Date() - lastSaved) / 1000)}с назад`
                                                        : `${Math.floor((new Date() - lastSaved) / 60000)}м назад`
                                                }
                                            </span>
                                        </div>
                                    )}
                                    <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                                        <p className="text-xs text-gray-400 mb-0.5">Итого</p>
                                        <p className="text-xl font-bold text-gold font-mono">
                                            {total.toLocaleString('ru-RU')} ₽
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-[1600px] mx-auto px-6 py-8 pb-32">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Navigation Footer */}
            <div className="fixed bottom-0 right-0 left-0 md:left-72 bg-navy-deep/90 backdrop-blur-xl border-t border-white/10 z-40 pb-safe transition-all duration-300">
                <div className="max-w-[1600px] mx-auto px-6 py-4">
                    <div className="flex justify-between items-center gap-4">
                        <AppleButton
                            variant="secondary"
                            onClick={handleBack}
                            disabled={currentStepIndex === 0}
                            icon={<ArrowLeft size={20} />}
                            className={currentStepIndex === 0 ? 'invisible' : ''}
                        >
                            Назад
                        </AppleButton>

                        {/* Progress Dots */}
                        <div className="hidden md:flex gap-2">
                            {visibleSteps.map((step, idx) => (
                                <div
                                    key={step}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentStepIndex ? 'bg-gradient-primary w-12 shadow-glow' :
                                        idx < currentStepIndex ? 'bg-emerald-500 w-2' :
                                            'bg-white/10 w-2'
                                        }`}
                                />
                            ))}
                        </div>

                        <AppleButton
                            variant="primary"
                            onClick={handleNext}
                            disabled={currentStepIndex === visibleSteps.length - 1}
                            icon={<ArrowRight size={20} />}
                            iconPosition="right"
                            className={currentStepIndex === visibleSteps.length - 1 ? 'invisible' : ''}
                        >
                            {currentStepIndex === visibleSteps.length - 2 ? 'К смете' : 'Далее'}
                        </AppleButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
