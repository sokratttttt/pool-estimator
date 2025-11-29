import AppleButton from '../apple/AppleButton';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function ConfiguratorFooter({
    currentStepIndex,
    visibleSteps,
    handleNext,
    handleBack,
    canGoNext,
    canGoBack,
    isLastStep
}) {
    return (
        <div className="fixed bottom-0 right-0 left-0 md:left-72 bg-navy-deep/90 backdrop-blur-xl border-t border-white/10 z-40 pb-safe transition-all duration-300">
            <div className="max-w-[1600px] mx-auto px-6 py-4">
                <div className="flex justify-between items-center gap-4">
                    <AppleButton
                        variant="secondary"
                        onClick={handleBack}
                        disabled={!canGoBack}
                        icon={<ArrowLeft size={20} />}
                        className={!canGoBack ? 'invisible' : ''}
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
                        disabled={!canGoNext}
                        icon={<ArrowRight size={20} />}
                        iconPosition="right"
                        className={!canGoNext ? 'invisible' : ''}
                    >
                        {currentStepIndex === visibleSteps.length - 2 ? 'К смете' : 'Далее'}
                    </AppleButton>
                </div>
            </div>
        </div>
    );
}
