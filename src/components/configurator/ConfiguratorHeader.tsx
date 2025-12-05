import { useState, useEffect } from 'react';
import { Undo2, Redo2, Check } from 'lucide-react';
import ProgressBar from '../ProgressBar';

// Client-side only time ago component to avoid hydration mismatch
function TimeAgo({ date }: { date: Date }) {
    const [timeAgo, setTimeAgo] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
            if (seconds < 60) {
                setTimeAgo(`${seconds}с назад`);
            } else {
                setTimeAgo(`${Math.floor(seconds / 60)}м назад`);
            }
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [date]);

    if (!timeAgo) return null;
    return <>{timeAgo}</>;
}

interface ConfiguratorHeaderProps {
    currentStepIndex?: number;
    visibleSteps?: any[];
    steps?: any[];
    currentStepData?: any;
    undo?: () => void;
    redo?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
    lastSaved?: Date | null;
    total?: number;
    onStepClick?: (index: number) => void;
}

export default function ConfiguratorHeader({
    currentStepIndex = 0,
    visibleSteps = [],
    steps = [],
    currentStepData,
    undo,
    redo,
    canUndo,
    canRedo,
    lastSaved,
    total = 0,
    onStepClick
}: ConfiguratorHeaderProps) {
    return (
        <div className="bg-navy-deep/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-30 shadow-lg">
            <div className="max-w-[1600px] mx-auto px-6">
                <div className="py-4">
                    {/* Progress Bar */}
                    <ProgressBar
                        currentStep={currentStepIndex}
                        totalSteps={visibleSteps?.length || 0}
                        stepNames={visibleSteps?.map(id => steps?.find(s => s.id === id)?.label) || []}
                        onStepClick={(idx: number) => {
                            if (idx <= currentStepIndex) {
                                onStepClick?.(idx);
                            }
                        }}
                    />

                    {/* Current Step Info */}
                    <div className="flex items-center justify-between mt-4">
                        <div>
                            <h2 className="text-xl font-bold text-white">{currentStepData?.label}</h2>
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
                                            Сохранено <TimeAgo date={lastSaved} />
                                        </span>
                                    </div>
                                )}
                                <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                                    <p className="text-xs text-gray-400 mb-0.5">Итого</p>
                                    <p className="text-xl font-bold text-gold font-mono">
                                        {total?.toLocaleString('ru-RU')} ₽
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
